import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { handleAiImproveStep } from "./server/openai-ai.js";

export default defineConfig({
  plugins: [
    react(),
    {
      name: "openai-api-middleware",
      configureServer(server) {
        server.middlewares.use("/api/ai/improve-step", async (request, response) => {
          await handleAiImproveStep(request, response);
        });
      }
    }
  ],
  server: {
    host: "0.0.0.0"
  }
});
