// Email Sending API Route
import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { anyApi } from "convex/server";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
const api = anyApi;

// Email provider configuration - supports Resend or SendGrid
const EMAIL_PROVIDER = process.env.EMAIL_PROVIDER || "resend"; // "resend" | "sendgrid" | "console"

interface EmailPayload {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  templateName?: string;
  templateVariables?: Record<string, string | number>;
  tenantId?: string;
}

async function sendWithResend(payload: {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  
  if (!RESEND_API_KEY) {
    return { success: false, error: "RESEND_API_KEY not configured" };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || "notifications@scorrstudio.com",
        to: Array.isArray(payload.to) ? payload.to : [payload.to],
        subject: payload.subject,
        html: payload.html,
        text: payload.text,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      return { success: false, error: data.message || "Failed to send email" };
    }

    return { success: true, messageId: data.id };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

async function sendWithSendGrid(payload: {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
  
  if (!SENDGRID_API_KEY) {
    return { success: false, error: "SENDGRID_API_KEY not configured" };
  }

  try {
    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${SENDGRID_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [{
          to: Array.isArray(payload.to) 
            ? payload.to.map(email => ({ email })) 
            : [{ email: payload.to }],
        }],
        from: { email: process.env.EMAIL_FROM || "notifications@scorrstudio.com" },
        subject: payload.subject,
        content: [
          ...(payload.text ? [{ type: "text/plain", value: payload.text }] : []),
          ...(payload.html ? [{ type: "text/html", value: payload.html }] : []),
        ],
      }),
    });

    if (!response.ok) {
      const data = await response.json();
      return { success: false, error: data.errors?.[0]?.message || "Failed to send email" };
    }

    const messageId = response.headers.get("X-Message-Id");
    return { success: true, messageId: messageId || undefined };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

function sendToConsole(payload: {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
}): { success: boolean; messageId?: string; error?: string } {
  console.log("📧 Email (Console Mode):");
  console.log(`  To: ${Array.isArray(payload.to) ? payload.to.join(", ") : payload.to}`);
  console.log(`  Subject: ${payload.subject}`);
  console.log(`  Text: ${payload.text || "(HTML only)"}`);
  console.log(`  HTML: ${payload.html ? `${payload.html.substring(0, 200)}...` : "(Text only)"}`);
  
  return { success: true, messageId: `console-${Date.now()}` };
}

export async function POST(request: NextRequest) {
  try {
    const body: EmailPayload = await request.json();
    
    // Validate required fields
    if (!body.to || (!body.subject && !body.templateName)) {
      return NextResponse.json(
        { error: "Missing required fields: to, and either subject or templateName" },
        { status: 400 }
      );
    }

    let emailContent = {
      to: body.to,
      subject: body.subject || "",
      html: body.html,
      text: body.text,
    };

    // If template is specified, render it
    if (body.templateName && body.tenantId && body.templateVariables) {
      try {
        const rendered = await convex.query(api.emailTemplates.renderTemplate, {
          tenantId: body.tenantId,
          name: body.templateName,
          variables: body.templateVariables,
        });
        
        emailContent.subject = rendered.subject;
        emailContent.html = rendered.htmlContent;
        emailContent.text = rendered.textContent || body.text;
      } catch (templateError) {
        console.error("Template rendering error:", templateError);
        return NextResponse.json(
          { error: `Template "${body.templateName}" not found or rendering failed` },
          { status: 400 }
        );
      }
    }

    // Send email based on provider
    let result;
    
    switch (EMAIL_PROVIDER) {
      case "resend":
        result = await sendWithResend(emailContent);
        break;
      case "sendgrid":
        result = await sendWithSendGrid(emailContent);
        break;
      case "console":
      default:
        result = sendToConsole(emailContent);
        break;
    }

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to send email" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
      provider: EMAIL_PROVIDER,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Email sending failed";
    console.error("Email sending error:", error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

// GET endpoint to check email configuration status
export async function GET() {
  const hasResend = !!process.env.RESEND_API_KEY;
  const hasSendGrid = !!process.env.SENDGRID_API_KEY;
  const configuredProvider = EMAIL_PROVIDER;
  
  let configured = false;
  if (configuredProvider === "resend" && hasResend) configured = true;
  if (configuredProvider === "sendgrid" && hasSendGrid) configured = true;
  if (configuredProvider === "console") configured = true;
  
  return NextResponse.json({
    provider: configuredProvider,
    configured,
    availableProviders: {
      resend: hasResend,
      sendgrid: hasSendGrid,
      console: true,
    },
    fromEmail: process.env.EMAIL_FROM || "notifications@scorrstudio.com",
  });
}
