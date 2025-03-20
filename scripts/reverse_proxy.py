from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse
import http.client

# Define your routes and corresponding target URLs
routes = {
    '/api': 'http://127.0.0.1:3000',  # BACKEND RUNNING ON PORT 3000
    '/': 'http://localhost:5173',      # FRONTEND RUNNING ON PORT 5173
}

class ReverseProxyHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.proxy_request('GET')

    def do_POST(self):
        self.proxy_request('POST')

    def do_PUT(self):
        self.proxy_request('PUT')

    def do_DELETE(self):
        self.proxy_request('DELETE')

    def proxy_request(self, method):
        target = self.get_target(self.path)

        if target:
            # Parse the target URL
            target_url = urlparse(target)
            headers = dict(self.headers)

            # Forward the request to the target server
            conn = http.client.HTTPConnection(target_url.hostname, target_url.port)
            conn.request(method, self.path, headers=headers)

            # Get the response from the target server
            res = conn.getresponse()

            # Send the response back to the client
            self.send_response(res.status)
            for header, value in res.getheaders():
                self.send_header(header, value)
            self.end_headers()
            self.wfile.write(res.read())
        else:
            self.send_response(404)
            self.end_headers()
            self.wfile.write(b'Route not found')

    def get_target(self, req_url):
        # Parse the requested URL
        pathname = urlparse(req_url).path

        # Find the matching route
        for route, target in routes.items():
            if pathname.startswith(route):
                return target

        return None

def run(server_class=HTTPServer, handler_class=ReverseProxyHandler, port=80):
    server_address = ('', port)
    httpd = server_class(server_address, handler_class)
    print(f'Reverse proxy is running on port {port}...')
    httpd.serve_forever()

if __name__ == "__main__":
    run()