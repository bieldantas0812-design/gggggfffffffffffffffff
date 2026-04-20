import express from "express";
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { createServer as createViteServer } from "vite";
import path from "path";

async function startServer() {
  const app = express();
  const server = createServer(app);
  const PORT = 3000;

  // WebSocket Server for JARVIS Bridge
  const wss = new WebSocketServer({ server });

  // Connected clients: either the Web HUD or the Local Python Agent
  const clients = new Set<WebSocket>();

  wss.on("connection", (ws) => {
    clients.add(ws);
    console.log("Client connected to JARVIS Bridge");

    ws.on("message", (data) => {
      // Broadcast messages between HUD and Python Agent
      const message = data.toString();
      clients.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    });

    ws.on("close", () => {
      clients.delete(ws);
      console.log("Client disconnected from JARVIS Bridge");
    });
  });

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "online", systems: "stable" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`JARVIS Bridge Server Running on http://localhost:${PORT}`);
  });
}

startServer();
