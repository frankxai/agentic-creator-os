import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import * as fs from "fs/promises";
import * as path from "path";
const server = new McpServer({
    name: "website",
    version: "1.0.0"
});
server.registerTool("create_nextjs_project", {
    title: "Create Next.js Project",
    description: "Create a new Next.js project with TypeScript and Tailwind",
    inputSchema: {
        name: z.string().describe("Project name"),
        directory: z.string().describe("Directory to create project in")
    },
    annotations: {
        destructiveHint: false
    }
}, async ({ name, directory }) => {
    try {
        const projectDir = path.join(directory, name);
        await fs.mkdir(projectDir, { recursive: true });
        const packageJson = {
            name,
            version: "0.1.0",
            private: true,
            scripts: {
                dev: "next dev",
                build: "next build",
                start: "next start",
                lint: "next lint"
            },
            dependencies: {
                next: "^14.0.0",
                react: "^18.2.0",
                "react-dom": "^18.2.0",
                "@radix-ui/react-slot": "^1.0.0",
                "class-variance-authority": "^0.7.0",
                clsx: "^2.0.0",
                tailwind
            } - merge, "^2.0.0": ,
            lucide
        } - react;
        "^0.294.0";
    }
    finally { }
    devDependencies: {
        "@types/node";
        "^20.0.0",
            "@types/react";
        "^18.2.0",
            "@types/react-dom";
        "^18.2.0",
            autoprefixer;
        "^10.0.0",
            postcss;
        "^8.0.0",
            tailwindcss;
        "^3.3.0",
            typescript;
        "^5.0.0",
            eslint;
        "^8.0.0",
            "eslint-config-next";
        "^14.0.0";
    }
});
await fs.writeFile(path.join(projectDir, "package.json"), JSON.stringify(packageJson, null, 2));
const tsconfig = {
    compilerOptions: {
        target: "es5",
        lib: ["dom", "dom.iterable", "esnext"],
        allowJs: true,
        skipLibCheck: true,
        strict: true,
        noEmit: true,
        esModuleInterop: true,
        module: "esnext",
        moduleResolution: "bundler",
        resolveJsonModule: true,
        isolatedModules: true,
        jsx: "preserve",
        incremental: true,
        plugins: [{ name: "next" }],
        paths: { "@/*": ["./*"] }
    },
    include: ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
    exclude: ["node_modules"]
};
await fs.writeFile(path.join(projectDir, "tsconfig.json"), JSON.stringify(tsconfig, null, 2));
const tailwindConfig = {
    content: ["./src/**/*.{js,ts,jsx,tsx,mdx}", "./app/**/*.{js,ts,jsx,tsx,mdx}"],
    theme: { extend: {} },
    plugins: []
};
await fs.writeFile(path.join(projectDir, "tailwind.config.js"), `/** @type {import('tailwindcss').Config} */\nmodule.exports = ${JSON.stringify(tailwindConfig, null, 2)}`);
const postcssConfig = {
    plugins: { tailwindcss: {}, autoprefixer: {} }
};
await fs.writeFile(path.join(projectDir, "postcss.config.js"), `module.exports = ${JSON.stringify(postcssConfig, null, 2)}`);
await fs.mkdir(path.join(projectDir, "src/app"), { recursive: true });
const layoutContent = `import type { Metadata } from 'next'\nimport { Inter } from 'next/font/google'\nimport './globals.css'\n\nconst inter = Inter({ subsets: ['latin'] })\n\nexport const metadata: Metadata = {\n  title: '${name}',\n  description: 'Created with Agentic Creator OS',\n}\n\nexport default function RootLayout({\n  children,\n}: {\n  children: React.ReactNode\n}) {\n  return (\n    <html lang="en">\n      <body className={inter.className}>{children}</body>\n    </html>\n  )\n}\n`;
await fs.writeFile(path.join(projectDir, "src/app/layout.tsx"), layoutContent);
const globalsCss = `@tailwind base;\n@tailwind components;\n@tailwind utilities;\n\n:root {\n  --foreground-rgb: 0, 0, 0;\n  --background-start-rgb: 214, 219, 220;\n  --background-end-rgb: 255, 255, 255;\n}\n\n@media (prefers-color-scheme: dark) {\n  :root {\n    --foreground-rgb: 255, 255, 255;\n    --background-start-rgb: 0, 0, 0;\n    --background-end-rgb: 0, 0, 0;\n  }\n}\n\nbody {\n  color: rgb(var(--foreground-rgb));\n  background: linear-gradient(\n      to bottom,\n      transparent,\n      rgb(var(--background-end-rgb))\n    ) rgb(var(--background-start-rgb));\n}\n`;
await fs.writeFile(path.join(projectDir, "src/app/globals.css"), globalsCss);
const pageContent = `export default function Home() {\n  return (\n    <main className="flex min-h-screen flex-col items-center justify-between p-24">\n      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">\n        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl lg:static lg:w-auto lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4">\n          Get started by editing&nbsp;\n          <code className="font-mono font-bold">src/app/page.tsx</code>\n        </p>\n      </div>\n    </main>\n  )\n}\n`;
await fs.writeFile(path.join(projectDir, "src/app/page.tsx"), pageContent);
await fs.writeFile(path.join(projectDir, "next-env.d.ts"), "/// <reference types=\"next\" />\n/// <reference types=\"next/image-types/global\" />\n");
return {
    content: [{ type: "text", text: `Created Next.js project: ${projectDir}` }],
    structuredContent: { projectDir, name }
};
try { }
catch (error) {
    return {
        content: [{ type: "text", text: `Error creating project: ${error}` }],
        isError: true
    };
}
;
server.registerTool("add_page", {
    title: "Add Page",
    description: "Add a new page to a Next.js project",
    inputSchema: {
        projectPath: z.string().describe("Path to the Next.js project"),
        pageName: z.string().describe("Name of the page (e.g., 'about' creates /about)"),
        content: z.string().describe("React component content")
    },
    annotations: {
        destructiveHint: false
    }
}, async ({ projectPath, pageName, content }) => {
    try {
        const appDir = path.join(projectPath, "src/app");
        const pagePath = path.join(appDir, pageName);
        await fs.mkdir(pagePath, { recursive: true });
        const pageContent = `export default function ${pageName.charAt(0).toUpperCase() + pageName.slice(1)}Page() {\n  return (\n    <div className=\"p-24\">\n      ${content}\n    </div>\n  )\n}\n`;
        await fs.writeFile(path.join(pagePath, "page.tsx"), pageContent);
        return {
            content: [{ type: "text", text: `Created page: /${pageName}` }],
            structuredContent: { pageName, path: pagePath }
        };
    }
    catch (error) {
        return {
            content: [{ type: "text", text: `Error creating page: ${error}` }],
            isError: true
        };
    }
});
server.registerTool("add_api_route", {
    title: "Add API Route",
    description: "Add a new API route to a Next.js project",
    inputSchema: {
        projectPath: z.string().describe("Path to the Next.js project"),
        route: z.string().describe("Route path (e.g., 'users' creates /api/users)"),
        method: z.enum(["GET", "POST", "PUT", "DELETE"]).default("GET").describe("HTTP method"),
        handler: z.string().describe("Handler code")
    },
    annotations: {
        destructiveHint: false
    }
}, async ({ projectPath, route, method, handler }) => {
    try {
        const appDir = path.join(projectPath, "src/app");
        const apiDir = path.join(appDir, "api", route);
        await fs.mkdir(apiDir, { recursive: true });
        const routeContent = `import { NextResponse } from 'next/server'\n\nexport async function ${method}(request: Request) {\n  ${handler}\n}\n`;
        await fs.writeFile(path.join(apiDir, "route.ts"), routeContent);
        return {
            content: [{ type: "text", text: `Created API route: /api/${route}` }],
            structuredContent: { route, method, path: apiDir }
        };
    }
    catch (error) {
        return {
            content: [{ type: "text", text: `Error creating API route: ${error}` }],
            isError: true
        };
    }
});
server.registerTool("get_project_structure", {
    title: "Get Project Structure",
    description: "Get the file structure of a project",
    inputSchema: {
        path: z.string().describe("Path to the project")
    },
    annotations: {
        readOnlyHint: true
    }
}, async ({ path: projectPath }) => {
    try {
        async function getTree(dir, prefix = "") {
            const entries = await fs.readdir(dir, { withFileTypes: true });
            const result = [];
            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                const relativePath = path.relative(projectPath, fullPath);
                if (entry.isDirectory()) {
                    result.push(`${prefix}${entry.name}/`);
                    result.push(...(await getTree(fullPath, prefix + "  ")));
                }
                else {
                    result.push(`${prefix}${entry.name}`);
                }
            }
            return result;
        }
        const tree = await getTree(projectPath);
        return {
            content: [{ type: "text", text: tree.join("\n") }],
            structuredContent: { structure: tree }
        };
    }
    catch (error) {
        return {
            content: [{ type: "text", text: `Error: ${error}` }],
            isError: true
        };
    }
});
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
}
main().catch(console.error);
//# sourceMappingURL=index.js.map