import express from "express";
import { createRequestHandler } from "@react-router/express";

const app = express();

app.use(
  createRequestHandler({
    build: () => import("../build/server/index.js"),
  })
);

export default app;
