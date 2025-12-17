import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcPath = path.resolve(__dirname, "./src");

// Plugin personnalisé pour résoudre les imports avec extensions
const resolveExtensionsPlugin = () => {
  return {
    name: "resolve-extensions",
    enforce: "pre",
    resolveId(id: string, importer?: string) {
      // Résoudre les imports @/ vers le chemin src avec extensions
      if (id.startsWith("@/")) {
        const relativePath = id.replace("@/", "");
        const fullPath = path.resolve(srcPath, relativePath);
        const extensions = [".ts", ".tsx", ".js", ".jsx", ".mjs", ".mts"];
        
        // Essayer avec extensions
        for (const ext of extensions) {
          const filePath = fullPath + ext;
          try {
            if (fs.existsSync(filePath)) {
              return filePath;
            }
          } catch (e) {
            // Ignorer les erreurs
          }
        }
        
        // Essayer avec index si c'est un dossier
        try {
          if (fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory()) {
            for (const ext of extensions) {
              const indexPath = path.resolve(fullPath, `index${ext}`);
              if (fs.existsSync(indexPath)) {
                return indexPath;
              }
            }
          }
        } catch (e) {
          // Ignorer les erreurs
        }
      }
      
      // Résoudre les chemins absolus sans extension (fallback de Vite)
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
      "@": srcPath,
    },
    extensions: [".ts", ".tsx", ".js", ".jsx", ".mjs", ".mts", ".json"],
  },
  optimizeDeps: {
    include: ["react", "react-dom"],
  },
});

