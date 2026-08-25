const path = require("path");
const httpServer = require("http-server");

const port = process.env.PORT || 4000;
const dataDir = path.join(__dirname, "data");

const server = httpServer.createServer({
  root: dataDir,
  cache: -1,
  open: false,
  logFn: (_req, _res, err) => {
    if (err) {
      console.error(err);
    }
  },
});

server.listen(port, () => {
  console.log(`Static file server running on http://localhost:${port}`);
  console.log(`Serving files from ${dataDir}`);
});
