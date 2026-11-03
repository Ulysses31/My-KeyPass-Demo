/**
 * KeyPass API server.
 *
 * Provides a lightweight JSON-backed REST API for the application vault data.
 * The service reads and writes arrays from the project's data directory and exposes
 * CRUD-style endpoints for the rows and categories resources.
 *
 * @module api/index
 */
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.API_PORT || 3000;
const apiDelayMs = 1500;
const dataDir = path.join(__dirname, '..', 'data');

/**
 * Maps the public resource names to their backing JSON files.
 *
 * @type {{ rows: string, categories: string }}
 */
const resourceMap = {
  rows: 'rows.json',
  categories: 'categories.json'
};

/**
 * Maps resource names to their primary identifier field used in JSON records.
 *
 * @type {{ rows: string, categories: string }}
 */
const idFieldMap = {
  rows: 'RecordID',
  categories: 'CategoryID'
};

app.use(cors());
app.use(express.json());

// Simulate network latency for all API endpoints.
app.use('/api', (_req, _res, next) => {
  setTimeout(next, apiDelayMs);
});

/**
 * Reads a JSON array from disk and returns it as a JavaScript array.
 *
 * If the file does not exist, an empty array is returned. If the file contains
 * malformed JSON, an error is raised to be handled by the route layer.
 *
 * @param {string} fileName - The JSON file name stored in the data directory.
 * @returns {Array<any>} The parsed JSON array or an empty array.
 * @throws {Error} When the JSON file content cannot be parsed.
 */
const readJsonFile = (fileName) => {
  const filePath = path.join(dataDir, fileName);

  if (!fs.existsSync(filePath)) {
    return [];
  }

  const raw = fs.readFileSync(filePath, 'utf8');

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    throw new Error(`Invalid JSON in ${fileName}: ${error.message}`);
  }
};

/**
 * Writes the provided data object to a JSON file in the data directory.
 *
 * @param {string} fileName - The target file name in the data directory.
 * @param {any} data - Data to be persisted as formatted JSON.
 */
const writeJsonFile = (fileName, data) => {
  const filePath = path.join(dataDir, fileName);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
};

/**
 * Resolves the backing JSON file name for a named resource.
 *
 * @param {string} resource - Resource key such as "rows" or "categories".
 * @returns {string} The mapped JSON file name.
 * @throws {Error} When the resource is not supported.
 */
const getResourceFile = (resource) => {
  const fileName = resourceMap[resource];

  if (!fileName) {
    throw new Error('Unsupported resource');
  }

  return fileName;
};

/**
 * Calculates the next numeric identifier for a collection.
 *
 * The function inspects the current items, extracts numeric identifier values,
 * and returns the next value as a string.
 *
 * @param {Array<Record<string, any>>} items - Current resource collection.
 * @param {string} fieldName - Identifier field name, such as RecordID or CategoryID.
 * @returns {string} The next identifier value as a string.
 */
const resolveNextId = (items, fieldName) => {
  const ids = items
    .map((item) => Number(item[fieldName]))
    .filter((value) => !Number.isNaN(value));

  return ids.length ? String(Math.max(...ids) + 1) : '1';
};

/**
 * Returns service health status.
 *
 * @route GET /api/health
 * @returns {object} JSON payload with service metadata.
 */
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'api', message: 'Express API is running' });
});

/**
 * Returns the complete application dataset for both supported resources.
 *
 * @route GET /api/data
 * @returns {object} Object containing the rows and categories arrays.
 */
app.get('/api/data', (_req, res) => {
  try {
    const data = {
      rows: readJsonFile(resourceMap.rows),
      categories: readJsonFile(resourceMap.categories)
    };

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Lists every item in a supported resource collection.
 *
 * @route GET /api/:resource
 * @param {string} req.params.resource - Resource name (rows or categories).
 * @returns {Array<any>} The resource array as JSON.
 */
app.get('/api/:resource', (req, res) => {
  try {
    const fileName = getResourceFile(req.params.resource);
    const items = readJsonFile(fileName);
    res.json(items);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * Reads a single item by identifier.
 *
 * For rows, the category metadata for the matched CategoryID is also attached to
 * the response under the Category property.
 *
 * @route GET /api/:resource/:id
 * @param {string} req.params.resource - Resource name.
 * @param {string} req.params.id - Unique record identifier.
 * @returns {object} The matched resource object.
 */
app.get('/api/:resource/:id', (req, res) => {
  try {
    let categories = null;
    const fileName = getResourceFile(req.params.resource);
    const idField = idFieldMap[req.params.resource];
    const items = readJsonFile(fileName);

    const item = items.find((entry) => String(entry[idField]) === String(req.params.id));

    if (fileName == 'rows.json') {
      categories = readJsonFile(resourceMap.categories);
      item.Category = categories.find(
        (category) => String(category.CategoryID) === String(item.CategoryID)
      );
    }

    if (!item) {
      return res.status(404).json({ error: `${req.params.resource} not found` });
    }

    return res.json(item);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

/**
 * Creates a new resource item and persists it to disk.
 *
 * The API assigns the next available identifier automatically based on the
 * highest existing numeric identifier in the resource collection.
 *
 * @route POST /api/:resource
 * @param {string} req.params.resource - Resource name.
 * @param {object} req.body - New item payload.
 * @returns {object} The created object including the generated ID.
 */
app.post('/api/:resource', (req, res) => {
  try {
    const fileName = getResourceFile(req.params.resource);
    const idField = idFieldMap[req.params.resource];
    const items = readJsonFile(fileName);
    const payload = req.body || {};

    if (!payload || typeof payload !== 'object') {
      return res.status(400).json({ error: 'Request body must be an object' });
    }

    const nextId = resolveNextId(items, idField);
    const newItem = { ...payload, [idField]: nextId };

    items.push(newItem);
    writeJsonFile(fileName, items);

    return res.status(201).json(newItem);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

/**
 * Replaces a resource item completely using the PUT method.
 *
 * The identifier in the URL is preserved and used as the resource ID.
 *
 * @route PUT /api/:resource/:id
 * @param {string} req.params.resource - Resource name.
 * @param {string} req.params.id - Existing item identifier.
 * @param {object} req.body - Full replacement payload.
 * @returns {object} The updated resource object.
 */
app.put('/api/:resource/:id', (req, res) => {
  try {
    const fileName = getResourceFile(req.params.resource);
    const idField = idFieldMap[req.params.resource];
    const items = readJsonFile(fileName);
    const itemIndex = items.findIndex(
      (entry) => String(entry[idField]) === String(req.params.id)
    );

    if (itemIndex === -1) {
      return res.status(404).json({ error: `${req.params.resource} not found` });
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

/**
 * Updates a single item using a partial payload.
 *
 * This method merges the payload into the existing resource entry while keeping
 * the original identifier fixed to the route ID.
 *
 * @route PATCH /api/:resource/:id
 * @param {string} req.params.resource - Resource name.
 * @param {string} req.params.id - Existing item identifier.
 * @param {object} req.body - Partial fields to merge into the current record.
 * @returns {object} The modified resource object.
 */
app.patch('/api/:resource/:id', (req, res) => {
  try {
    const fileName = getResourceFile(req.params.resource);
    const idField = idFieldMap[req.params.resource];
    const items = readJsonFile(fileName);
    const itemIndex = items.findIndex(
      (entry) => String(entry[idField]) === String(req.params.id)
    );

    if (itemIndex === -1) {
      return res.status(404).json({ error: `${req.params.resource} not found` });
    }

    const payload = req.body || {};
    const updatedItem = {
      ...items[itemIndex],
      ...payload,
      [idField]: String(req.params.id)
    };
    items[itemIndex] = updatedItem;
    writeJsonFile(fileName, items);

    return res.json(updatedItem);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

/**
 * Deletes a single item from a resource collection.
 *
 * @route DELETE /api/:resource/:id
 * @param {string} req.params.resource - Resource name.
 * @param {string} req.params.id - Existing item identifier.
 * @returns {object} Confirmation payload containing the deleted item.
 */
app.delete('/api/:resource/:id', (req, res) => {
  try {
    const fileName = getResourceFile(req.params.resource);
    const idField = idFieldMap[req.params.resource];
    const items = readJsonFile(fileName);
    const itemIndex = items.findIndex(
      (entry) => String(entry[idField]) === String(req.params.id)
    );

    if (itemIndex === -1) {
      return res.status(404).json({ error: `${req.params.resource} not found` });
    }

    const [deletedItem] = items.splice(itemIndex, 1);
    writeJsonFile(fileName, items);

    return res.json({ deleted: true, item: deletedItem });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

/**
 * Starts the API server and binds it to the configured port.
 */
app.listen(port, () => {
  console.log(`API running on http://localhost:${port}`);
});
