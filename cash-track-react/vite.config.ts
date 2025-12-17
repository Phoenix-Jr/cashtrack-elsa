import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Plugin personnalisé pour résoudre les imports avec extensions
const resolveExtensionsPlugin = () => {
  return {
    name: "resolve-extensions",
    resolveId(id: string, importer?: string) {
      // Si l'ID commence par @/, essayer de résoudre avec les extensions
      if (id.startsWith("@/")) {
        const relativePath = id.replace("@/", "");
        const srcPath = path.resolve(__dirname, "./src");
        const extensions = [".ts", ".tsx", ".js", ".jsx", ".mjs", ".mts"];
        
        for (const ext of extensions) {
          const fullPath = path.resolve(srcPath, relativePath + ext);
          if (fs.existsSync(fullPath)) {
            return fullPath;
          }
        }
        
        // Essayer aussi sans extension (pour les dossiers avec index)
        const dirPath = path.resolve(srcPath, relativePath);
        if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
          for (const ext of extensions) {
            const indexPath = path.resolve(dirPath, `index${ext}`);
            if (fs.existsSync(indexPath)) {
              return indexPath;
            }
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

