import express from "express";
import { createServer as createViteServer } from "vite";
import { WebSocketServer, WebSocket } from "ws";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Active clients
  const clients = new Set<WebSocket>();
  let agentConnected = false;

  // Vite server integration
  let vite: any;
  if (process.env.NODE_ENV !== "production") {
    vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
  }

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`[BRIDGE] Core synchronized at http://localhost:${PORT}`);
  });

  // WebSocket Bridge
  const wss = new WebSocketServer({ server });

  wss.on("connection", (ws) => {
    clients.add(ws);
    console.log(`[BRIDGE] New node connected. Active threads: ${clients.size}`);

    ws.on("message", (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        // Handle Agent status updates
        if (data.type === 'status' && data.data === 'online') {
          agentConnected = true;
          console.log("[AGENT] Local JARVIS Engine detected.");
        }

        // Broadcast to all other nodes
        const broadcastData = JSON.stringify(data);
        clients.forEach((client) => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(broadcastData);
          }
        });
      } catch (e) {
        console.error("[BRIDGE] Signal corruption:", e);
      }
    });

    ws.on("close", () => {
      clients.delete(ws);
      // We don't know for sure which one closed without IDs, but we can assume
      // the frontend will check status again
      console.log(`[BRIDGE] node detached. Remaining threads: ${clients.size}`);
    });
  });

  // SPA Fallback
  app.get('*', (req, res) => {
    if (process.env.NODE_ENV !== "production") {
      res.sendFile(path.join(__dirname, 'index.html'));
    } else {
      res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
    }
  });
}

startServer();
