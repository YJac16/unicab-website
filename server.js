const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || "development";

const distPath = path.join(__dirname, "dist");
const serveDist = express.static(distPath, {
  maxAge: NODE_ENV === "production" ? "1y" : "0",
  etag: true
});

// CORS for production (adjust allowed origins as needed)
if (NODE_ENV === "production") {
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    const allowedOrigins = [
      "https://unicabtraveltours.com",
      "https://www.unicabtraveltours.com"
    ];
    if (allowedOrigins.includes(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
    }
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") return res.sendStatus(200);
    next();
  });
}

app.use(bodyParser.json({ limit: "1mb" }));

// Contact API endpoint
app.post("/api/contact", (req, res) => {
  const payload = req.body || {};
  console.log("New contact enquiry:", payload);
  // TODO: Add email service integration here (e.g., SendGrid, Nodemailer, etc.)
  return res.json({
    ok: true,
    message:
      "Thank you. Your request has been received. Our team will respond with a detailed proposal shortly."
  });
});

// Serve built assets if they exist; otherwise advise to run npm run dev
app.use(serveDist);

app.use((req, res, next) => {
  if (req.path.startsWith("/api")) return next();
  // SPA fallback to index in dist if present
  return res.sendFile(path.join(distPath, "index.html"), (err) => {
    if (err) {
      res
        .status(200)
        .send(
          "Build not found. Run `npm run dev` for the Vite dev server or `npm run build` then `node server.js` to serve the built app."
        );
    }
  });
});

app.listen(PORT, () => {
  console.log(`UNICAB Travel & Tours site running on port ${PORT}`);
  if (NODE_ENV === "production") {
    console.log(`Production mode - serving from ${distPath}`);
  }
});

