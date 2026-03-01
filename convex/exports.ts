import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { nanoid } from "nanoid";

// Create an export job
export const createExportJob = mutation({
  args: {
    tenantId: v.string(),
    type: v.string(), // "pdf_bracket" | "csv_data" | "json_export" | "excel" | "report"
    params: v.any(), // Export parameters (competitionId, filters, etc.)
    createdBy: v.string(),
  },
  handler: async (ctx, args) => {
    const jobId = nanoid();

    await ctx.db.insert("exportJobs", {
      jobId,
      tenantId: args.tenantId,
      type: args.type,
      status: "pending",
      params: args.params,
      createdBy: args.createdBy,
      createdAt: new Date().toISOString(),
    });

    // In a real implementation, this would trigger a background job
    // For now, we'll mark it as processing and return the job ID
    // The actual export would be handled by an API route or background worker

    return { jobId };
  },
});

// Update export job status
export const updateExportJob = mutation({
  args: {
    jobId: v.string(),
    status: v.string(),
    downloadUrl: v.optional(v.string()),
    error: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const job = await ctx.db
      .query("exportJobs")
      .withIndex("by_jobId", (q) => q.eq("jobId", args.jobId))
      .first();

    if (!job) {
      throw new Error("Export job not found");
    }

    const updates: Record<string, unknown> = {
      status: args.status,
    };

    if (args.downloadUrl) {
      updates.downloadUrl = args.downloadUrl;
      updates.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours
    }

    if (args.error) {
      updates.error = args.error;
    }

    if (args.status === "completed" || args.status === "failed") {
      updates.completedAt = new Date().toISOString();
    }

    await ctx.db.patch(job._id, updates);

    return { success: true };
  },
});

// Get export job status
export const getExportJob = query({
  args: {
    jobId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("exportJobs")
      .withIndex("by_jobId", (q) => q.eq("jobId", args.jobId))
      .first();
  },
});

// List export jobs for a tenant
export const listExportJobs = query({
  args: {
    tenantId: v.string(),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let jobs = await ctx.db
      .query("exportJobs")
      .withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId))
      .collect();

    if (args.status) {
      jobs = jobs.filter(j => j.status === args.status);
    }

    return jobs.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },
});

// Delete old export jobs (cleanup)
export const cleanupExportJobs = mutation({
  args: {
    tenantId: v.string(),
    olderThanDays: v.number(),
  },
  handler: async (ctx, args) => {
    const cutoff = new Date(Date.now() - args.olderThanDays * 24 * 60 * 60 * 1000).toISOString();
    
    const oldJobs = await ctx.db
      .query("exportJobs")
      .withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId))
      .filter((q) => q.lt(q.field("createdAt"), cutoff))
      .collect();

    for (const job of oldJobs) {
      await ctx.db.delete(job._id);
    }

    return { deletedCount: oldJobs.length };
  },
});
