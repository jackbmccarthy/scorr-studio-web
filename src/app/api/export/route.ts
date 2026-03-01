import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Create export job
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tenantId, type, params, createdBy } = body;

    if (!tenantId || !type || !createdBy) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create export job
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await (convex as any).mutation(api.exports.createExportJob, {
      tenantId,
      type,
      params,
      createdBy,
    });

    // Process export based on type
    let downloadUrl: string | null = null;
    let error: string | null = null;

    try {
      switch (type) {
        case "pdf_bracket":
          downloadUrl = await generatePDFBracket(params);
          break;
        case "csv_data":
          downloadUrl = await generateCSVExport(params);
          break;
        case "json_export":
          downloadUrl = await generateJSONExport(params);
          break;
        case "report":
          downloadUrl = await generateReport(params);
          break;
        default:
          throw new Error(`Unknown export type: ${type}`);
      }

      // Mark as completed
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (convex as any).mutation(api.exports.updateExportJob, {
        jobId: result.jobId,
        status: "completed",
        downloadUrl,
      });
    } catch (e) {
      error = e instanceof Error ? e.message : "Export failed";
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (convex as any).mutation(api.exports.updateExportJob, {
        jobId: result.jobId,
        status: "failed",
        error,
      });
    }

    return NextResponse.json({
      jobId: result.jobId,
      status: error ? "failed" : "completed",
      downloadUrl,
      error,
    });
  } catch (error) {
    console.error("Error creating export:", error);
    return NextResponse.json(
      { error: "Failed to create export" },
      { status: 500 }
    );
  }
}

// Get export job status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get("jobId");

    if (!jobId) {
      return NextResponse.json(
        { error: "jobId is required" },
        { status: 400 }
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const job = await (convex as any).query(api.exports.getExportJob, { jobId });

    return NextResponse.json(job);
  } catch (error) {
    console.error("Error getting export job:", error);
    return NextResponse.json(
      { error: "Failed to get export job" },
      { status: 500 }
    );
  }
}

// Helper functions for generating exports
async function generatePDFBracket(params: { competitionId: string }): Promise<string> {
  // In production, this would use a PDF library (puppeteer, pdfkit, etc.)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const bracket = await (convex as any).query(api.brackets.getBracket, {
    competitionId: params.competitionId,
  });
  
  if (!bracket) {
    throw new Error("Bracket not found");
  }

  // Placeholder - would generate actual PDF
  return `/exports/bracket-${params.competitionId}.pdf`;
}

async function generateCSVExport(params: { competitionId?: string; type: string }): Promise<string> {
  // In production, generate CSV from match/team data
  // For now, return a placeholder URL
  return `/exports/data-${Date.now()}.csv`;
}

async function generateJSONExport(params: { competitionId?: string; include?: string[] }): Promise<string> {
  // In production, generate JSON export
  // For now, return a placeholder URL
  return `/exports/data-${Date.now()}.json`;
}

async function generateReport(params: { competitionId: string; type: string }): Promise<string> {
  // In production, generate PDF report
  // For now, return a placeholder URL
  return `/exports/report-${params.competitionId}-${params.type}.pdf`;
}
