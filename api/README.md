# API Documentation

This folder contains the backend service implemented in [index.js](./index.js). It is a small Express API that serves JSON data from the project's `data` folder and supports CRUD-style operations for a limited set of resources.

## Overview

The API:

- starts an Express server on port `3000` by default
- enables CORS for browser-based clients
- parses JSON request bodies
- simulates a 1.5 second latency delay on all `/api/*` routes
- reads and writes JSON files stored under `../data`

The server uses the following resource mapping:

- `rows` -> `rows.json`
- `categories` -> `categories.json`

The ID fields are:

- `rows`: `RecordID`
- `categories`: `CategoryID`

## Runtime configuration

The server reads the port from the environment variable `API_PORT`:

```bash
API_PORT=4000 node api/index.js
```

If `API_PORT` is not defined, it falls back to `3000`.

## Data files

The application reads JSON arrays from the `data` directory. If a file does not exist, it treats it as an empty array (`[]`). If the file exists but contains invalid JSON, the API responds with a `500` error when reading the data set and a `400` error for resource-level operations.

The files are located relative to the API directory:

- `../data/rows.json`
- `../data/categories.json`

## Middleware behavior

The API applies two key pieces of middleware:

1. `app.use(cors())` — allows requests from different origins.
2. `app.use(express.json())` — parses incoming JSON request bodies.
3. `app.use('/api', ...)` — adds a simulated network delay of `1500ms` before every API request.

## Endpoints

All API routes are prefixed with `/api`.

### Health check

#### `GET /api/health`

Returns a simple service status payload.

Example response:

```json
{
  "ok": true,
  "service": "api",
  "message": "Express API is running"
}
```

### Load all data

#### `GET /api/data`

Returns both resource collections in a single object.

Example response:

```json
{
  "rows": [
    {
      "RecordID": "1",
      "Title": "Example row"
    }
  ],
  "categories": [
    {
      "CategoryID": "1",
      "Name": "General"
    }
  ]
}
```

### List a resource

#### `GET /api/:resource`

Returns the full array for a supported resource.

Supported values:

- `/api/rows`
- `/api/categories`

Example:

```http
GET /api/rows
```

Example response:

```json
[
  { "RecordID": "1", "Name": "Row 1" }
]
```

### Fetch a single item

#### `GET /api/:resource/:id`

Reads the resource array, finds the item whose ID matches the URL parameter, and returns it.

For rows, the API also looks up the related category and injects it into the returned object as `Category` when the row has a matching `CategoryID`.

Example:

```http
GET /api/rows/1
```

Example response:

```json
{
  "RecordID": "1",
  "CategoryID": "2",
  "Category": {
    "CategoryID": "2",
    "Name": "Archive"
  }
}
```

### Create a new item

#### `POST /api/:resource`

Creates a new item in the selected resource file.

The API:

- validates that the request body is an object
- computes the next numeric ID using the highest existing ID for that resource
- appends the new item to the array
- saves the updated JSON file
- returns the created object with HTTP `201`

Example:

```http
POST /api/categories
Content-Type: application/json

{
  "Name": "Finance"
}
```

Example response:

```json
{
  "Name": "Finance",
  "CategoryID": "3"
}
```

### Update an item entirely

#### `PUT /api/:resource/:id`

Replaces the target item with the body payload while forcing the item ID to the URL value.

Example:

```http
PUT /api/rows/1
Content-Type: application/json

{
  "Title": "Updated title",
  "CategoryID": "5"
}
```

### Update part of an item

#### `PATCH /api/:resource/:id`

Merges the incoming payload into the existing item while preserving the original ID and updating the record in the JSON file.

Example:

```http
PATCH /api/categories/2
Content-Type: application/json

{
  "Name": "Updated category"
}
```

### Delete an item

#### `DELETE /api/:resource/:id`

Deletes the first matching item from the resource file and responds with a confirmation payload.

Example response:

```json
{
  "deleted": true,
  "item": {
    "RecordID": "1",
    "Title": "Example"
  }
}
```

## Error handling

The API uses standard HTTP responses for validation and not-found scenarios:

- `400` for bad requests or invalid resource names
- `404` when the requested item is not found
- `500` when a JSON file cannot be parsed

Typical error payload:

```json
{
  "error": "rows not found"
}
```

## Implementation notes

The backend logic is intentionally simple and file-based. It is designed for local development and mock data rather than production-grade persistence.

Key implementation helpers:

- `readJsonFile(fileName)` — loads a JSON array from disk
- `writeJsonFile(fileName, data)` — writes the updated array back to disk
- `getResourceFile(resource)` — validates the resource name and resolves the file
- `resolveNextId(items, fieldName)` — calculates the next numeric ID

This makes it easy to prototype CRUD-style client apps without introducing a database layer.

## Starting the API

From the project root:

```bash
node api/index.js
```

Then open the server at:

```text
http://localhost:3000
```

If you want to change the default port:

```bash
API_PORT=5000 node api/index.js
```
