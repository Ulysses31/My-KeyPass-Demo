const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const port = process.env.API_PORT || 3000;
const dataDir = path.join(__dirname, "..", "data");

const resourceMap = {
  rows: "rows.json",
  categories: "categories.json",
};

const idFieldMap = {
  rows: "RecordID",
  categories: "CategoryID",
};

app.use(cors());
app.use(express.json());

const readJsonFile = (fileName) => {
  const filePath = path.join(dataDir, fileName);

  if (!fs.existsSync(filePath)) {
    return [];
  }

  const raw = fs.readFileSync(filePath, "utf8");

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    throw new Error(`Invalid JSON in ${fileName}: ${error.message}`);
  }
};

const writeJsonFile = (fileName, data) => {
  const filePath = path.join(dataDir, fileName);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
};

const getResourceFile = (resource) => {
  const fileName = resourceMap[resource];

  if (!fileName) {
    throw new Error("Unsupported resource");
  }

  return fileName;
};

const resolveNextId = (items, fieldName) => {
  const ids = items
    .map((item) => Number(item[fieldName]))
    .filter((value) => !Number.isNaN(value));

  return ids.length ? String(Math.max(...ids) + 1) : "1";
};

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "api", message: "Express API is running" });
});

app.get("/api/data", (_req, res) => {
  try {
    const data = {
      rows: readJsonFile(resourceMap.rows),
      categories: readJsonFile(resourceMap.categories),
    };

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/:resource", (req, res) => {
  try {
    const fileName = getResourceFile(req.params.resource);
    const items = readJsonFile(fileName);
    res.json(items);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get("/api/:resource/:id", (req, res) => {
  try {
    const fileName = getResourceFile(req.params.resource);
    const idField = idFieldMap[req.params.resource];
    const items = readJsonFile(fileName);
    const item = items.find(
      (entry) => String(entry[idField]) === String(req.params.id),
    );

    if (!item) {
      return res
        .status(404)
        .json({ error: `${req.params.resource} not found` });
    }

    return res.json(item);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

app.post("/api/:resource", (req, res) => {
  try {
    const fileName = getResourceFile(req.params.resource);
    const idField = idFieldMap[req.params.resource];
    const items = readJsonFile(fileName);
    const payload = req.body || {};

    if (!payload || typeof payload !== "object") {
      return res.status(400).json({ error: "Request body must be an object" });
    }

    const nextId = payload[idField] ?? resolveNextId(items, idField);
    const newItem = { ...payload, [idField]: nextId };

    items.push(newItem);
    writeJsonFile(fileName, items);

    return res.status(201).json(newItem);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

app.put("/api/:resource/:id", (req, res) => {
  try {
    const fileName = getResourceFile(req.params.resource);
    const idField = idFieldMap[req.params.resource];
    const items = readJsonFile(fileName);
    const itemIndex = items.findIndex(
      (entry) => String(entry[idField]) === String(req.params.id),
    );

    if (itemIndex === -1) {
      return res
        .status(404)
        .json({ error: `${req.params.resource} not found` });
    }

    const payload = req.body || {};
    const updatedItem = { ...payload, [idField]: String(req.params.id) };
    items[itemIndex] = updatedItem;
    writeJsonFile(fileName, items);

    return res.json(updatedItem);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

app.patch("/api/:resource/:id", (req, res) => {
  try {
    const fileName = getResourceFile(req.params.resource);
    const idField = idFieldMap[req.params.resource];
    const items = readJsonFile(fileName);
    const itemIndex = items.findIndex(
      (entry) => String(entry[idField]) === String(req.params.id),
    );

    if (itemIndex === -1) {
      return res
        .status(404)
        .json({ error: `${req.params.resource} not found` });
    }

    const payload = req.body || {};
    const updatedItem = {
      ...items[itemIndex],
      ...payload,
      [idField]: String(req.params.id),
    };
    items[itemIndex] = updatedItem;
    writeJsonFile(fileName, items);

    return res.json(updatedItem);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

app.delete("/api/:resource/:id", (req, res) => {
  try {
    const fileName = getResourceFile(req.params.resource);
    const idField = idFieldMap[req.params.resource];
    const items = readJsonFile(fileName);
    const itemIndex = items.findIndex(
      (entry) => String(entry[idField]) === String(req.params.id),
    );

    if (itemIndex === -1) {
      return res
        .status(404)
        .json({ error: `${req.params.resource} not found` });
    }

    const [deletedItem] = items.splice(itemIndex, 1);
    writeJsonFile(fileName, items);

    return res.json({ deleted: true, item: deletedItem });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`API running on http://localhost:${port}`);
});
