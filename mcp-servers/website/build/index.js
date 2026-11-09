import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import * as fs from "fs/promises";
import * as path from "path";
const server = new McpServer({
    name: "website",
    version: "1.1.0"
});
const SKIPPED_DIRS = new Set(["node_modules", ".git", ".next"]);
function ok(data) {
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }], structuredContent: data };
}
function fail(message) {
    return { content: [{ type: "text", text: message }], isError: true };
}
server.registerTool("website_create_nextjs_project", {
    title: "Create Next.js project",
    description: "Scaffold a Next.js 14 app (TypeScript, Tailwind, App Router) as plain files in directory/name; it writes files only and does not run npm install. Overwrites same-named files. Returns the project path and the files written; local and fast.",
    inputSchema: {
        name: z.string().regex(/^[a-z0-9][a-z0-9._-]{0,213}$/).describe("Project folder and package name: lowercase letters, digits, '.', '_' or '-'"),
        directory: z.string().min(1).max(4096).describe("Existing parent directory the project folder is created in")
    },
    outputSchema: {
        projectDir: z.string().describe("Absolute path of the created project"),
        name: z.string().describe("Project name"),
        files: z.array(z.string()).describe("Files written, relative to projectDir")
    },
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: false }
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
                "tailwind-merge": "^2.0.0",
                "lucide-react": "^0.294.0"
            },
            devDependencies: {
                "@types/node": "^20.0.0",
                "@types/react": "^18.2.0",
                "@types/react-dom": "^18.2.0",
                autoprefixer: "^10.0.0",
                postcss: "^8.0.0",
                tailwindcss: "^3.3.0",
                typescript: "^5.0.0",
                eslint: "^8.0.0",
                "eslint-config-next": "^14.0.0"
            }
        };
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
        return ok({
            projectDir: path.resolve(projectDir),
            name,
            files: ["package.json", "tsconfig.json", "tailwind.config.js", "postcss.config.js", "src/app/layout.tsx", "src/app/globals.css", "src/app/page.tsx", "next-env.d.ts"]
        });
    }
    catch (error) {
        return fail(`Error creating project: ${error}`);
    }
});
server.registerTool("website_add_page", {
    title: "Add page",
    description: "Add an App Router page at src/app/<pageName>/page.tsx in an existing Next.js project, wrapping the given JSX in a default component. Overwrites an existing page at that route. Returns the route and file path; local file write only.",
    inputSchema: {
        projectPath: z.string().min(1).max(4096).describe("Root folder of the Next.js project (the one holding package.json)"),
        pageName: z.string().regex(/^[a-z0-9][a-z0-9_/-]{0,127}$/).describe("Route segment(s), e.g. 'about' creates /about and 'blog/archive' creates /blog/archive"),
        content: z.string().max(100000).describe("JSX placed inside the page's wrapping <div>")
    },
    outputSchema: {
        route: z.string().describe("URL path of the page, e.g. /about"),
        path: z.string().describe("Absolute path of the written page.tsx")
    },
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: false }
}, async ({ projectPath, pageName, content }) => {
    try {
        const pageDir = path.join(projectPath, "src/app", pageName);
        await fs.mkdir(pageDir, { recursive: true });
        const componentName = pageName.split(/[/_-]/).filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join("");
        const pageContent = `export default function ${componentName}Page() {\n  return (\n    <div className=\"p-24\">\n      ${content}\n    </div>\n  )\n}\n`;
        const pageFile = path.resolve(pageDir, "page.tsx");
        await fs.writeFile(pageFile, pageContent);
        return ok({ route: `/${pageName}`, path: pageFile });
    }
    catch (error) {
        return fail(`Error creating page: ${error}`);
    }
});
server.registerTool("website_add_api_route", {
    title: "Add API route",
    description: "Add a Route Handler at src/app/api/<route>/route.ts in an existing Next.js project, exporting one HTTP method with the given handler body. Overwrites an existing route.ts. Returns the route, method and file path; local file write only.",
    inputSchema: {
        projectPath: z.string().min(1).max(4096).describe("Root folder of the Next.js project (the one holding package.json)"),
        route: z.string().regex(/^[a-z0-9][a-z0-9_/-]{0,127}$/).describe("Route segment(s) under /api, e.g. 'users' creates /api/users"),
        method: z.enum(["GET", "POST", "PUT", "DELETE"]).default("GET").describe("HTTP method the handler exports"),
        handler: z.string().max(50000).describe("TypeScript body of the handler function; NextResponse is imported for you")
    },
    outputSchema: {
        route: z.string().describe("URL path, e.g. /api/users"),
        method: z.string().describe("Exported HTTP method"),
        path: z.string().describe("Absolute path of the written route.ts")
    },
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: false }
}, async ({ projectPath, route, method, handler }) => {
    try {
        const apiDir = path.join(projectPath, "src/app/api", route);
        await fs.mkdir(apiDir, { recursive: true });
        const routeContent = `import { NextResponse } from 'next/server'\n\nexport async function ${method}(request: Request) {\n  ${handler}\n}\n`;
        const routeFile = path.resolve(apiDir, "route.ts");
        await fs.writeFile(routeFile, routeContent);
        return ok({ route: `/api/${route}`, method, path: routeFile });
    }
    catch (error) {
        return fail(`Error creating API route: ${error}`);
    }
});
server.registerTool("website_get_project_structure", {
    title: "Get project structure",
    description: "Walk a project folder and return its file tree as indented lines, skipping node_modules, .git and .next. Use it to orient before adding pages or routes. Stops at maxEntries (default 500, max 5000) and sets truncated, so large repos stay cheap.",
    inputSchema: {
        path: z.string().min(1).max(4096).describe("Folder to walk, absolute or relative to the server's working directory"),
        maxEntries: z.number().int().min(1).max(5000).default(500).describe("Stop after this many files and folders")
    },
    outputSchema: {
        root: z.string().describe("Absolute path that was walked"),
        structure: z.array(z.string()).describe("Tree lines; folders end with '/', two spaces per depth level"),
        truncated: z.boolean().describe("True when the walk stopped at maxEntries")
    },
    annotations: { readOnlyHint: true, openWorldHint: false }
}, async ({ path: projectPath, maxEntries }) => {
    try {
        const structure = [];
        let truncated = false;
        async function walk(dir, prefix) {
            const entries = (await fs.readdir(dir, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name));
            for (const entry of entries) {
                if (structure.length >= maxEntries) {
                    truncated = true;
                    return;
                }
                if (entry.isDirectory()) {
                    if (SKIPPED_DIRS.has(entry.name))
                        continue;
                    structure.push(`${prefix}${entry.name}/`);
                    await walk(path.join(dir, entry.name), prefix + "  ");
                }
                else {
                    structure.push(`${prefix}${entry.name}`);
                }
            }
        }
        const root = path.resolve(projectPath);
        await walk(root, "");
        return ok({ root, structure, truncated });
    }
    catch (error) {
        return fail(`Error: ${error}`);
    }
});
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
}
main().catch(console.error);
//# sourceMappingURL=index.js.map