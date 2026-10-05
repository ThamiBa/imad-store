#!/usr/bin/env node
/**
 * Hostinger Node.js Application Entrypoint
 * ─────────────────────────────────────────
 * Boots the Next.js standalone server produced by `output: 'standalone'`.
 * Hostinger sets process.env.PORT automatically; we fall back to 3000 locally.
 *
 * Usage (Hostinger Entry File field): server.js
 */

const path = require("path");

// Point to the compiled standalone server inside .next/standalone
const standaloneServer = path.join(
  __dirname,
  "apps",
  "web",
  ".next",
  "standalone",
  "apps",
  "web",
  "server.js"
);

process.env.PORT = process.env.PORT || "3000";
process.env.NODE_ENV = process.env.NODE_ENV || "production";

// Dynamically require the built standalone server
require(standaloneServer);
