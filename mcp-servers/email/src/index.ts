import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import nodemailer from "nodemailer";

const server = new McpServer({
  name: "email",
  version: "1.0.0"
});

const templates: Record<string, string> = {
  welcome: `Welcome {{name}}!

We're excited to have you on board. Your account is ready and you can now access all our features.

If you have any questions, feel free to reach out to our support team.

Best regards,
The Team`,
  
  notification: `Hello {{name}},

{{message}}

Best regards,
The Team`,
  
  invoice: `Dear {{name}},

Please find your invoice attached for {{amount}}.

Due date: {{due_date}}

Thank you for your business!

Best regards,
The Team`,
  
  reminder: `Hi {{name}},

This is a friendly reminder about {{subject}}.

Due date: {{due_date}}

Best regards,
The Team`
};

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.example.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || ""
  }
});

const FROM = () => process.env.SMTP_FROM || "noreply@example.com";
const recipient = z.string().email().max(254);
const templateName = z.string().regex(/^[a-z][a-z0-9_-]{0,31}$/);
const sentOutput = {
  messageId: z.string().describe("SMTP message ID assigned by the server"),
  accepted: z.array(z.string()).describe("Recipients the SMTP server accepted"),
  rejected: z.array(z.string()).describe("Recipients the SMTP server rejected")
};
const sendAnnotations = { readOnlyHint: false, destructiveHint: true, idempotentHint: false, openWorldHint: true };

function ok<T extends Record<string, unknown>>(data: T) {
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }], structuredContent: data };
}

function fail(message: string) {
  return { content: [{ type: "text" as const, text: message }], isError: true };
}

function fill(template: string, values: Record<string, string>): string {
  return template.replace(/{{(\w+)}}/g, (match, key: string) => values[key] ?? match);
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function asHtml(text: string): string {
  return `<html><body><p>${escapeHtml(text).replace(/\n/g, "<br>")}</p></body></html>`;
}

function addresses(list: unknown): string[] {
  return Array.isArray(list) ? list.map((entry) => (typeof entry === "string" ? entry : String((entry as { address?: string }).address ?? entry))) : [];
}

async function deliver(options: { to: string | string[]; subject: string; text?: string; html?: string; from?: string }) {
  const info = await transporter.sendMail({ from: options.from || FROM(), ...options });
  return { messageId: String(info.messageId), accepted: addresses(info.accepted), rejected: addresses(info.rejected) };
}

server.registerTool(
  "email_send_email",
  {
    title: "Send email",
    description: "Send one email through the configured SMTP server (SMTP_HOST/PORT/USER/PASS) to up to 50 recipients. Irreversible: the message leaves immediately, so confirm recipients and content first. Returns the SMTP message ID with accepted and rejected recipients.",
    inputSchema: {
      to: z.array(recipient).min(1).max(50).describe("Recipient email addresses"),
      subject: z.string().min(1).max(500).describe("Subject line"),
      text: z.string().max(100_000).optional().describe("Plain-text body; send text, html or both"),
      html: z.string().max(200_000).optional().describe("HTML body"),
      from: z.string().max(320).optional().describe("Sender, e.g. 'Name <me@example.com>'; defaults to SMTP_FROM")
    },
    outputSchema: sentOutput,
    annotations: sendAnnotations
  },
  async ({ to, subject, text, html, from }) => {
    if (!text && !html) return fail("Provide text, html or both; an empty email was not sent");
    try {
      return ok(await deliver({ to, subject, text, html, from }));
    } catch (error) {
      return fail(`Error sending email: ${error}`);
    }
  }
);

server.registerTool(
  "email_send_template_email",
  {
    title: "Send template email",
    description: "Send an email built from a named template (see email_list_templates), filling {{variable}} placeholders from variables. Irreversible SMTP send to one recipient. Returns the SMTP message ID and the accepted and rejected recipients.",
    inputSchema: {
      template: templateName.describe("Template name, e.g. welcome, notification, invoice, reminder, or one added with email_add_template"),
      to: recipient.describe("Recipient email address"),
      variables: z.array(z.object({
        name: z.string().regex(/^[a-z_][a-z0-9_]{0,31}$/).describe("Placeholder name without braces, e.g. name"),
        value: z.string().max(5000).describe("Text substituted for {{name}}")
      })).max(30).default([]).describe("Values for the template's {{placeholders}}; unfilled placeholders are left as-is"),
      subject: z.string().min(1).max(500).optional().describe("Subject line; defaults to 'Notification from <template>'")
    },
    outputSchema: { template: z.string().describe("Template used"), ...sentOutput },
    annotations: sendAnnotations
  },
  async ({ template, to, variables, subject }) => {
    const source = templates[template];
    if (!source) return fail(`Unknown template '${template}'. Available: ${Object.keys(templates).join(", ")}`);
    const text = fill(source, Object.fromEntries(variables.map(({ name, value }) => [name, value])));
    try {
      return ok({ template, ...(await deliver({ to, subject: subject || `Notification from ${template}`, text, html: asHtml(text) })) });
    } catch (error) {
      return fail(`Error sending template email: ${error}`);
    }
  }
);

server.registerTool(
  "email_send_welcome_email",
  {
    title: "Send welcome email",
    description: "Send the built-in welcome template to one new user, personalised with their name, through the configured SMTP server. Irreversible send; use once per signup. Returns the SMTP message ID with accepted and rejected recipients.",
    inputSchema: {
      email: recipient.describe("New user's email address"),
      name: z.string().min(1).max(200).describe("Name used in the greeting")
    },
    outputSchema: sentOutput,
    annotations: sendAnnotations
  },
  async ({ email, name }) => {
    const text = fill(templates.welcome, { name });
    try {
      return ok(await deliver({ to: email, subject: "Welcome!", text, html: asHtml(text) }));
    } catch (error) {
      return fail(`Error sending welcome email: ${error}`);
    }
  }
);

server.registerTool(
  "email_send_notification",
  {
    title: "Send notification email",
    description: "Send the built-in notification template (greeting, your message, sign-off) to one recipient through the configured SMTP server. Irreversible send. Returns the SMTP message ID with accepted and rejected recipients.",
    inputSchema: {
      email: recipient.describe("Recipient email address"),
      name: z.string().min(1).max(200).describe("Recipient name used in the greeting"),
      message: z.string().min(1).max(20_000).describe("Notification body text"),
      subject: z.string().min(1).max(500).optional().describe("Subject line; defaults to 'Notification'")
    },
    outputSchema: sentOutput,
    annotations: sendAnnotations
  },
  async ({ email, name, message, subject }) => {
    const text = fill(templates.notification, { name, message });
    try {
      return ok(await deliver({ to: email, subject: subject || "Notification", text, html: asHtml(text) }));
    } catch (error) {
      return fail(`Error sending notification: ${error}`);
    }
  }
);

server.registerTool(
  "email_verify_connection",
  {
    title: "Verify SMTP connection",
    description: "Check that the configured SMTP server accepts a connection and the credentials, without sending mail. Use it before a batch of sends or when a send fails. Returns connected true, or an error with the SMTP reason; one network round trip.",
    inputSchema: z.object({}).strict(),
    outputSchema: {
      connected: z.boolean().describe("True when the SMTP handshake and login succeeded"),
      host: z.string().describe("SMTP host that was checked")
    },
    annotations: { readOnlyHint: true, openWorldHint: true }
  },
  async () => {
    try {
      await transporter.verify();
      return ok({ connected: true, host: process.env.SMTP_HOST || "smtp.example.com" });
    } catch (error) {
      return fail(`SMTP connection failed: ${error}`);
    }
  }
);

server.registerTool(
  "email_add_template",
  {
    title: "Add email template",
    description: "Add a template, or replace one with the same name, for email_send_template_email. Use {{variable}} placeholders. Templates live in this server's memory only and are lost on restart. Returns the name and the placeholders found.",
    inputSchema: {
      name: templateName.describe("Template name: lowercase letters, digits, '_' or '-'"),
      content: z.string().min(1).max(20_000).describe("Template body with {{variable}} placeholders")
    },
    outputSchema: {
      name: z.string().describe("Saved template name"),
      placeholders: z.array(z.string()).describe("Placeholder names found in the content"),
      replaced: z.boolean().describe("True when an existing template was overwritten")
    },
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: false }
  },
  async ({ name, content }) => {
    const replaced = name in templates;
    templates[name] = content;
    const placeholders = [...new Set([...content.matchAll(/{{(\w+)}}/g)].map((match) => match[1]))];
    return ok({ name, placeholders, replaced });
  }
);

server.registerTool(
  "email_list_templates",
  {
    title: "List email templates",
    description: "List the email templates available to email_send_template_email, built-in and added this session, with the {{placeholders}} each expects. Use it to pick a template and its variables. Returns up to limit entries; in-memory, instant.",
    inputSchema: {
      limit: z.number().int().min(1).max(200).default(50).describe("Maximum templates to return")
    },
    outputSchema: {
      templates: z.array(z.object({
        name: z.string().describe("Template name"),
        placeholders: z.array(z.string()).describe("Placeholder names the template uses")
      })).describe("Templates in this page"),
      total: z.number().describe("Number of templates available")
    },
    annotations: { readOnlyHint: true, openWorldHint: false }
  },
  async ({ limit }) => {
    const all = Object.entries(templates).map(([name, content]) => ({
      name,
      placeholders: [...new Set([...content.matchAll(/{{(\w+)}}/g)].map((match) => match[1]))]
    }));
    return ok({ templates: all.slice(0, limit), total: all.length });
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
