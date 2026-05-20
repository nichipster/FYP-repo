// Production server: wraps react-router-serve and proxies /api to the backend.
// Used by the frontend Docker container so browser requests to /api are forwarded
// server-side to API_URL without CORS issues.
import { createRequestHandler } from "@react-router/express";
import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";

const API_URL = process.env.API_URL ?? "http://localhost:8000";

const app = express();

// Proxy all /api/* requests to the FastAPI backend
app.use(
  "/api",
  createProxyMiddleware({
    target: API_URL,
    changeOrigin: true,
  })
);

// Serve hashed assets with long-lived cache (immutable)
app.use(
  "/assets",
  express.static("build/client/assets", { immutable: true, maxAge: "1y" })
);

// Serve other static files (favicon, manifest, etc.)
app.use(express.static("build/client", { maxAge: "1h" }));

// Serve the React Router SSR app
app.use(
  createRequestHandler({
    build: await import("./build/server/index.js"),
  })
);

const port = process.env.PORT ?? 3000;
app.listen(port, () => {
  console.log(`NutriTrack frontend listening on port ${port}`);
  console.log(`Proxying /api → ${API_URL}`);
});
