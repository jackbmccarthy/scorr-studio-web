// Email Templates Convex Functions

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
// Create a new email template
export const createTemplate = mutation({
  args: {
    tenantId: v.string(),
    name: v.string(), // "welcome" | "registration_confirm" | "match_reminder" | etc.
    subject: v.string(),
    htmlContent: v.string(),
    textContent: v.optional(v.string()),
    variables: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const templateId = crypto.randomUUID();
    const now = new Date().toISOString();

    // Check if template with this name already exists for the tenant
    const existing = await ctx.db
      .query("emailTemplates")
      .withIndex("by_tenant_name", (q) => 
        q.eq("tenantId", args.tenantId).eq("name", args.name)
      )
      .first();

    if (existing) {
      throw new Error(`Template with name "${args.name}" already exists for this tenant`);
    }

    const templateId_result = await ctx.db.insert("emailTemplates", {
      templateId,
      tenantId: args.tenantId,
      name: args.name,
      subject: args.subject,
      htmlContent: args.htmlContent,
      textContent: args.textContent,
      variables: args.variables,
      createdAt: now,
    });

    return { templateId, _id: templateId_result };
  },
});

// Update an email template
export const updateTemplate = mutation({
  args: {
    templateId: v.id("emailTemplates"),
    subject: v.optional(v.string()),
    htmlContent: v.optional(v.string()),
    textContent: v.optional(v.string()),
    variables: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    
    const update: Record<string, unknown> = {
      updatedAt: now,
    };

    if (args.subject !== undefined) update.subject = args.subject;
    if (args.htmlContent !== undefined) update.htmlContent = args.htmlContent;
    if (args.textContent !== undefined) update.textContent = args.textContent;
    if (args.variables !== undefined) update.variables = args.variables;

    await ctx.db.patch(args.templateId, update);

    return { success: true };
  },
});

// Get template by name
export const getTemplate = query({
  args: {
    tenantId: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const template = await ctx.db
      .query("emailTemplates")
      .withIndex("by_tenant_name", (q) => 
        q.eq("tenantId", args.tenantId).eq("name", args.name)
      )
      .first();

    return template;
  },
});

// Get template by ID
export const getTemplateById = query({
  args: {
    templateId: v.id("emailTemplates"),
  },
  handler: async (ctx, args) => {
    const template = await ctx.db.get(args.templateId);
    return template;
  },
});

// List all templates for a tenant
export const listTemplates = query({
  args: {
    tenantId: v.string(),
  },
  handler: async (ctx, args) => {
    const templates = await ctx.db
      .query("emailTemplates")
      .withIndex("by_tenant", (q) => q.eq("tenantId", args.tenantId))
      .collect();

    return templates;
  },
});

// Delete a template
export const deleteTemplate = mutation({
  args: {
    templateId: v.id("emailTemplates"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.templateId);
    return { success: true };
  },
});

// Render template with variables (returns rendered content)
export const renderTemplate = query({
  args: {
    tenantId: v.string(),
    name: v.string(),
    variables: v.any(), // Record<string, string | number>
  },
  handler: async (ctx, args) => {
    const template = await ctx.db
      .query("emailTemplates")
      .withIndex("by_tenant_name", (q) => 
        q.eq("tenantId", args.tenantId).eq("name", args.name)
      )
      .first();

    if (!template) {
      throw new Error(`Template "${args.name}" not found`);
    }

    // Simple variable replacement - {{variableName}}
    const renderContent = (content: string, vars: Record<string, string | number>) => {
      let rendered = content;
      for (const [key, value] of Object.entries(vars)) {
        const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, "g");
        rendered = rendered.replace(regex, String(value));
      }
      return rendered;
    };

    return {
      subject: renderContent(template.subject, args.variables),
      htmlContent: renderContent(template.htmlContent, args.variables),
      textContent: template.textContent 
        ? renderContent(template.textContent, args.variables) 
        : undefined,
    };
  },
});

// Create default templates for a new tenant
export const createDefaultTemplates = mutation({
  args: {
    tenantId: v.string(),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    
    const defaultTemplates = [
      {
        name: "welcome",
        subject: "Welcome to {{organizationName}}!",
        htmlContent: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #3b82f6;">Welcome to {{organizationName}}!</h1>
            <p>Hi {{playerName}},</p>
            <p>Welcome to {{organizationName}}! We're excited to have you join our community.</p>
            <p>You can now register for events, view schedules, and track your matches.</p>
            <p style="margin-top: 24px;">
              <a href="{{loginUrl}}" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Get Started</a>
            </p>
            <p style="margin-top: 24px; color: #666;">Best regards,<br>{{organizationName}} Team</p>
          </div>
        `,
        textContent: `Welcome to {{organizationName}}!\n\nHi {{playerName}},\n\nWelcome to {{organizationName}}! We're excited to have you join our community.\n\nYou can now register for events, view schedules, and track your matches.\n\nGet started: {{loginUrl}}\n\nBest regards,\n{{organizationName}} Team`,
        variables: ["organizationName", "playerName", "loginUrl"],
      },
      {
        name: "registration_confirm",
        subject: "Registration Confirmed for {{eventName}}",
        htmlContent: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #3b82f6;">Registration Confirmed!</h1>
            <p>Hi {{playerName}},</p>
            <p>Your registration for <strong>{{eventName}}</strong> has been confirmed.</p>
            <div style="background: #f4f4f5; padding: 16px; border-radius: 8px; margin: 16px 0;">
              <p style="margin: 0;"><strong>Event:</strong> {{eventName}}</p>
              <p style="margin: 8px 0 0;"><strong>Date:</strong> {{eventDate}}</p>
              <p style="margin: 8px 0 0;"><strong>Location:</strong> {{eventLocation}}</p>
            </div>
            <p style="margin-top: 24px;">
              <a href="{{eventUrl}}" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">View Event Details</a>
            </p>
          </div>
        `,
        textContent: `Registration Confirmed!\n\nHi {{playerName}},\n\nYour registration for {{eventName}} has been confirmed.\n\nEvent: {{eventName}}\nDate: {{eventDate}}\nLocation: {{eventLocation}}\n\nView details: {{eventUrl}}`,
        variables: ["playerName", "eventName", "eventDate", "eventLocation", "eventUrl"],
      },
      {
        name: "match_reminder",
        subject: "Match Reminder: {{matchName}} in 1 hour",
        htmlContent: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #ef4444;">⏰ Match Reminder</h1>
            <p>Hi {{playerName}},</p>
            <p>Your match is starting in <strong>1 hour</strong>!</p>
            <div style="background: #f4f4f5; padding: 16px; border-radius: 8px; margin: 16px 0;">
              <p style="margin: 0;"><strong>Match:</strong> {{team1}} vs {{team2}}</p>
              <p style="margin: 8px 0 0;"><strong>Time:</strong> {{matchTime}}</p>
              <p style="margin: 8px 0 0;"><strong>Court:</strong> {{courtName}}</p>
            </div>
            <p>Please arrive at least 10 minutes early.</p>
            <p style="margin-top: 24px;">
              <a href="{{matchUrl}}" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">View Match Details</a>
            </p>
          </div>
        `,
        textContent: `Match Reminder!\n\nHi {{playerName}},\n\nYour match is starting in 1 hour!\n\nMatch: {{team1}} vs {{team2}}\nTime: {{matchTime}}\nCourt: {{courtName}}\n\nPlease arrive at least 10 minutes early.\n\nView details: {{matchUrl}}`,
        variables: ["playerName", "matchName", "team1", "team2", "matchTime", "courtName", "matchUrl"],
      },
      {
        name: "schedule_change",
        subject: "Schedule Change: {{matchName}}",
        htmlContent: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #f59e0b;">📅 Schedule Change</h1>
            <p>Hi {{playerName}},</p>
            <p>The schedule for your match has been updated.</p>
            <div style="background: #fef3c7; padding: 16px; border-radius: 8px; margin: 16px 0;">
              <p style="margin: 0;"><strong>Match:</strong> {{team1}} vs {{team2}}</p>
              <p style="margin: 8px 0 0;"><strong>Old Time:</strong> <s>{{oldTime}}</s></p>
              <p style="margin: 8px 0 0;"><strong>New Time:</strong> {{newTime}}</p>
              <p style="margin: 8px 0 0;"><strong>Court:</strong> {{courtName}}</p>
            </div>
            <p style="margin-top: 24px;">
              <a href="{{matchUrl}}" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">View Updated Schedule</a>
            </p>
          </div>
        `,
        textContent: `Schedule Change!\n\nHi {{playerName}},\n\nThe schedule for your match has been updated.\n\nMatch: {{team1}} vs {{team2}}\nOld Time: {{oldTime}}\nNew Time: {{newTime}}\nCourt: {{courtName}}\n\nView updated schedule: {{matchUrl}}`,
        variables: ["playerName", "matchName", "team1", "team2", "oldTime", "newTime", "courtName", "matchUrl"],
      },
      {
        name: "match_result",
        subject: "Match Result: {{team1}} vs {{team2}}",
        htmlContent: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #22c55e;">🏆 Match Result</h1>
            <p>Hi {{playerName}},</p>
            <p>Your match has been completed!</p>
            <div style="background: #f4f4f5; padding: 16px; border-radius: 8px; margin: 16px 0; text-align: center;">
              <p style="margin: 0; font-size: 18px;"><strong>{{team1}}</strong> vs <strong>{{team2}}</strong></p>
              <p style="margin: 8px 0 0; font-size: 32px; font-weight: bold;">{{score}}</p>
              <p style="margin: 8px 0 0; color: #22c55e;"><strong>Winner: {{winner}}</strong></p>
            </div>
            <p style="margin-top: 24px;">
              <a href="{{matchUrl}}" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">View Full Results</a>
            </p>
          </div>
        `,
        textContent: `Match Result!\n\nHi {{playerName}},\n\nYour match has been completed!\n\n{{team1}} vs {{team2}}\nScore: {{score}}\nWinner: {{winner}}\n\nView full results: {{matchUrl}}`,
        variables: ["playerName", "team1", "team2", "score", "winner", "matchUrl"],
      },
      {
        name: "password_reset",
        subject: "Reset Your Password",
        htmlContent: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #3b82f6;">Reset Your Password</h1>
            <p>Hi {{playerName}},</p>
            <p>We received a request to reset your password. Click the button below to create a new password:</p>
            <p style="margin-top: 24px;">
              <a href="{{resetUrl}}" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Reset Password</a>
            </p>
            <p style="margin-top: 16px; color: #666;">This link will expire in 1 hour. If you didn't request this, you can safely ignore this email.</p>
            <p style="margin-top: 24px; color: #666;">Best regards,<br>{{organizationName}} Team</p>
          </div>
        `,
        textContent: `Reset Your Password\n\nHi {{playerName}},\n\nWe received a request to reset your password. Use this link to create a new password:\n\n{{resetUrl}}\n\nThis link will expire in 1 hour. If you didn't request this, you can safely ignore this email.\n\nBest regards,\n{{organizationName}} Team`,
        variables: ["playerName", "resetUrl", "organizationName"],
      },
    ];

    const createdTemplates = [];
    
    for (const template of defaultTemplates) {
      const templateId = crypto.randomUUID();
      const result = await ctx.db.insert("emailTemplates", {
        templateId,
        tenantId: args.tenantId,
        name: template.name,
        subject: template.subject,
        htmlContent: template.htmlContent,
        textContent: template.textContent,
        variables: template.variables,
        createdAt: now,
      });
      createdTemplates.push({ templateId, name: template.name, _id: result });
    }

    return { success: true, templates: createdTemplates };
  },
});
