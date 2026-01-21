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

server.registerTool(
  "send_email",
  {
    title: "Send Email",
    description: "Send an email to one or more recipients",
    inputSchema: {
      to: z.array(z.string().email()).min(1).describe("Recipient email addresses"),
      subject: z.string().min(1).describe("Email subject"),
      text: z.string().optional().describe("Plain text body"),
      html: z.string().optional().describe("HTML body"),
      from: z.string().optional().describe("Sender name/email")
    },
    annotations: {
      destructiveHint: true
    }
  },
  async ({ to, subject, text, html, from }) => {
    try {
      const mailOptions = {
        from: from || process.env.SMTP_FROM || "noreply@example.com",
        to: to.join(", "),
        subject,
        text,
        html
      };
      
      const info = await transporter.sendMail(mailOptions);
      return {
        content: [{ type: "text", text: `Email sent: ${info.messageId}` }],
        structuredContent: { messageId: info.messageId, accepted: to }
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Error sending email: ${error}` }],
        isError: true
      };
    }
  }
);

server.registerTool(
  "send_template_email",
  {
    title: "Send Template Email",
    description: "Send an email using a template",
    inputSchema: {
      template: z.enum(["welcome", "notification", "invoice", "reminder"]).describe("Template name"),
      to: z.string().email().describe("Recipient email"),
      data: z.record(z.string()).describe("Template variables"),
      subject: z.string().optional().describe("Override subject")
    },
    annotations: {
      destructiveHint: true
    }
  },
  async ({ template, to, data, subject }) => {
    try {
      let templateText = templates[template];
      let html = `<html><body><pre>${templateText}</pre></body></html>`;
      
      for (const [key, value] of Object.entries(data)) {
        const regex = new RegExp(`{{${key}}}`, "g");
        templateText = templateText.replace(regex, value);
        html = html.replace(regex, value);
      }
      
      const mailOptions = {
        from: process.env.SMTP_FROM || "noreply@example.com",
        to,
        subject: subject || `Notification from ${template}`,
        text: templateText,
        html
      };
      
      const info = await transporter.sendMail(mailOptions);
      return {
        content: [{ type: "text", text: `Template email sent: ${info.messageId}` }],
        structuredContent: { template, messageId: info.messageId }
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Error sending template email: ${error}` }],
        isError: true
      };
    }
  }
);

server.registerTool(
  "send_welcome_email",
  {
    title: "Send Welcome Email",
    description: "Send a welcome email to a new user",
    inputSchema: {
      email: z.string().email().describe("User email"),
      name: z.string().describe("User name")
    },
    annotations: {
      destructiveHint: true
    }
  },
  async ({ email, name }) => {
    try {
      const templateText = templates.welcome.replace(/{{name}}/g, name);
      const html = `<html><body><p>${templateText.replace(/\n/g, "<br>")}</p></body></html>`;
      
      const info = await transporter.sendMail({
        from: process.env.SMTP_FROM || "noreply@example.com",
        to: email,
        subject: "Welcome!",
        text: templateText,
        html
      });
      
      return {
        content: [{ type: "text", text: `Welcome email sent to ${email}` }],
        structuredContent: { email, messageId: info.messageId }
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Error: ${error}` }],
        isError: true
      };
    }
  }
);

server.registerTool(
  "send_notification",
  {
    title: "Send Notification Email",
    description: "Send a notification email",
    inputSchema: {
      email: z.string().email().describe("Recipient email"),
      name: z.string().describe("Recipient name"),
      message: z.string().describe("Notification message"),
      subject: z.string().optional().describe("Subject line")
    },
    annotations: {
      destructiveHint: true
    }
  },
  async ({ email, name, message, subject }) => {
    try {
      const templateText = templates.notification
        .replace(/{{name}}/g, name)
        .replace(/{{message}}/g, message);
      const html = `<html><body><p>${templateText.replace(/\n/g, "<br>")}</p></body></html>`;
      
      const info = await transporter.sendMail({
        from: process.env.SMTP_FROM || "noreply@example.com",
        to: email,
        subject: subject || "Notification",
        text: templateText,
        html
      });
      
      return {
        content: [{ type: "text", text: `Notification sent to ${email}` }],
        structuredContent: { email, messageId: info.messageId }
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Error: ${error}` }],
        isError: true
      };
    }
  }
);

server.registerTool(
  "verify_connection",
  {
    title: "Verify SMTP Connection",
    description: "Verify the SMTP connection is working",
    inputSchema: {},
    annotations: {
      readOnlyHint: true
    }
  },
  async () => {
    try {
      await transporter.verify();
      return {
        content: [{ type: "text", text: "SMTP connection verified successfully" }],
        structuredContent: { status: "connected" }
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `SMTP connection failed: ${error}` }],
        isError: true
      };
    }
  }
);

server.registerTool(
  "add_template",
  {
    title: "Add Email Template",
    description: "Add or update an email template",
    inputSchema: {
      name: z.string().describe("Template name"),
      content: z.string().describe("Template content with {{variable}} placeholders")
    },
    annotations: {
      destructiveHint: false
    }
  },
  async ({ name, content }) => {
    templates[name] = content;
    return {
      content: [{ type: "text", text: `Template '${name}' saved` }],
      structuredContent: { name }
    };
  }
);

server.registerTool(
  "list_templates",
  {
    title: "List Email Templates",
    description: "List all available email templates",
    inputSchema: {},
    annotations: {
      readOnlyHint: true
    }
  },
  async () => {
    return {
      content: [{ type: "text", text: Object.keys(templates).join(", ") }],
      structuredContent: { templates: Object.keys(templates) }
    };
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
