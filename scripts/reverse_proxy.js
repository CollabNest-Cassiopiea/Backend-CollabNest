// SCRIPT TO BY PASS CORS ERROR 

const http = require('http');
const httpProxy = require('http-proxy');
const url = require('url');

// Create a proxy server
const proxy = httpProxy.createProxyServer({});

// Define your routes and corresponding target URLs
const routes = {
  '/api': 'http://127.0.0.1:3000', // BACKEND RUNNING ON PORT 3000
  '/': 'http://localhost:5173', // FRONTEND RUNNING ON PORT 3000
};

// Create an HTTP server that listens for requests
const server = http.createServer((req, res) => {
  // Check the requested path and select the appropriate target
  const target = getTarget(req.url);

  if (target) {
    // Proxy the request to the target server
    proxy.web(req, res, { target }, (error) => {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end(`Proxy error: ${error.message}`);
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Route not found');
  }
});

// Function to get the target URL based on the request URL
function getTarget(reqUrl) {
  const pathname = url.parse(reqUrl).pathname;

  // Find the matching route
  for (const [route, target] of Object.entries(routes)) {
    if (pathname.startsWith(route)) {
      return target;
    }
  }
  
  return null;
}

// Start the server
const PORT = 80;
server.listen(PORT, () => {
  console.log(`Reverse proxy is running on port ${PORT}`);
});
