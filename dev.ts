import { startServer } from "./server.js";
import { createServer as createViteServer } from "vite";
import express from "express";

async function dev() {
  const app = await startServer(true);
  
  const vite = await createViteServer({
    server: { 
      middlewareMode: true,
      hmr: { port: 0 },
      watch: null
    },
    appType: "spa",
  });
  
  app.use(vite.middlewares);

  const PORT = 3000;
  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`Dev server running on http://localhost:${PORT}`);
  });
  
  server.on('error', (e: any) => {
    if (e.code === 'EADDRINUSE') {
      console.log('Address in use, retrying...');
      setTimeout(() => {
        server.close();
        server.listen(PORT, "0.0.0.0");
      }, 1000);
    }
  });
}

dev();
