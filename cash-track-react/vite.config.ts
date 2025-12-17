import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Plugin personnalisé pour résoudre les imports avec extensions dans Docker
const resolveExtensionsPlugin = () => {
  return {
    name: "resolve-extensions",
    enforce: "pre",
    resolveId(id: string) {
      // Si l'ID est un chemin absolu sans extension (comme /app/src/lib/format)
      if (id.startsWith("/app/src/") && !id.match(/\.[^./]+$/)) {
        const extensions = [".ts", ".tsx", ".js", ".jsx", ".mjs", ".mts"];
        for (const ext of extensions) {
          const fullPath = id + ext;
          try {
            if (fs.existsSync(fullPath)) {
              return fullPath;
            }
          } catch (e) {
            // Ignorer les erreurs
          }
        }
      }
      return null;
    },
    load(id: string) {
      // Intercepter les tentatives de chargement de fichiers sans extension
      if (id.startsWith("/app/src/") && !id.match(/\.[^./]+$/)) {
        const extensions = [".ts", ".tsx", ".js", ".jsx", ".mjs", ".mts"];
        for (const ext of extensions) {
          const fullPath = id + ext;
          try {
            if (fs.existsSync(fullPath)) {
              return {
                code: fs.readFileSync(fullPath, "utf-8"),
                map: null,
              };
            }
          } catch (e) {
            // Ignorer les erreurs
          }
        }
      }
      return null;
    },
  };
};

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tsconfigPaths(),
    resolveExtensionsPlugin(),
    react({
      jsxRuntime: "automatic",
    }),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    extensions: [".ts", ".tsx", ".js", ".jsx", ".mjs", ".mts", ".json"],
  },
  optimizeDeps: {
    include: ["react", "react-dom"],
  },
});

