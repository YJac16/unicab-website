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

// Review API endpoint
app.post("/api/review", (req, res) => {
  const payload = req.body || {};
  console.log("New review submission:", payload);
  
  // Format email content
  const emailSubject = `New ${payload.type === 'driver' ? 'Driver' : 'Tour'} Review - ${payload.targetName}`;
  const emailBody = `
New Review Submission

Review Type: ${payload.type === 'driver' ? 'Driver Review' : 'Tour Review'}
${payload.type === 'driver' ? 'Driver' : 'Tour'}: ${payload.targetName}
Reviewer Name: ${payload.name}
Rating: ${payload.rating}/5
Review Text:
${payload.text}

Submitted: ${new Date(payload.date).toLocaleString()}

---
This is an automated notification from UNICAB Travel & Tours website.
  `.trim();

  // TODO: Add email service integration here (e.g., SendGrid, Nodemailer, etc.)
  // Example:
  // const nodemailer = require('nodemailer');
  // const transporter = nodemailer.createTransport({...});
  // await transporter.sendMail({
  //   from: 'noreply@unicabtraveltours.com',
  //   to: 'info@unicabtravel.co.za',
  //   subject: emailSubject,
  //   text: emailBody
  // });

  // For now, log the email content (in production, this would send the email)
  console.log("Email would be sent to: info@unicabtravel.co.za");
  console.log("Subject:", emailSubject);
  console.log("Body:", emailBody);

  return res.json({
    ok: true,
    message: "Review submitted successfully"
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

