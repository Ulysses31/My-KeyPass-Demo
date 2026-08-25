const express = require("express");
const cors = require("cors");

const app = express();
const port = process.env.API_PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "api", message: "Express API is running" });
});

app.get("/api/data", (_req, res) => {
  res.json({
    records: [
      { id: 1, name: "Alpha", value: "A1" },
      { id: 2, name: "Beta", value: "B2" },
    ],
  });
});

app.listen(port, () => {
  console.log(`API running on http://localhost:${port}`);
});
