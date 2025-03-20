import http.server
import socketserver
import urllib.request
import urllib.error
import re
import json
import os
from urllib.parse import urlparse, urljoin

class ReverseProxyHandler(http.server.BaseHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        # Load routing configuration
        self.routes = {
            '/api': 'http://127.0.0.1:3000',
            '': 'http://localhost:5173'
        }
        super().__init__(*args, **kwargs)
    
    def do_GET(self):
        self.proxy_request('GET')
    
    def do_POST(self):
        self.proxy_request('POST')
    
    def do_PUT(self):
        self.proxy_request('PUT')
    
    def do_DELETE(self):
        self.proxy_request('DELETE')
    
    def proxy_request(self, method):
        # Find the matching route
        target_url = None
        for route_prefix, target_base in self.routes.items():
            if self.path.startswith(route_prefix):
                target_url = urljoin(target_base, self.path)
                break
        
        if not target_url:
            self.send_error(404, "Route not found")
            return
        
        # Create the request
        headers = {key: val for key, val in self.headers.items()}
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length) if content_length > 0 else None
        
        try:
            # Create the request to the target server
            req = urllib.request.Request(
                url=target_url,
                data=body,
                headers=headers,
                method=method
            )
            
            # Forward the request and get the response
            with urllib.request.urlopen(req) as response:
                # Set response status code
                self.send_response(response.status)
                
                # Copy response headers
                for header, value in response.getheaders():
                    if header.lower() != 'transfer-encoding':  # Skip chunked encoding
                        self.send_header(header, value)
                self.end_headers()
                
                # Copy response body
                self.wfile.write(response.read())
                
        except urllib.error.HTTPError as e:
            self.send_response(e.code)
            for header, value in e.headers.items():
                self.send_header(header, value)
            self.end_headers()
            self.wfile.write(e.read())
        
        except Exception as e:
            self.send_error(500, str(e))


class ConfigurableReverseProxy:
    def __init__(self, port=80, routes=None):
        self.port = port
        
        # Define default routes if none provided
        if routes is None:
            self.routes = {
                '/api': 'http://127.0.0.1:3000',
                '': 'http://localhost:5173'
            }
        else:
            self.routes = routes
        
        # Create a custom handler with the routes
        handler = type('CustomProxyHandler', (ReverseProxyHandler,), {'routes': self.routes})
        self.httpd = socketserver.ThreadingTCPServer(("", self.port), handler)
    
    def start(self):
        print(f"Starting reverse proxy on port {self.port}")
        print(f"Routing configuration:")
        for route, target in self.routes.items():
            print(f"  {route} -> {target}")
        
        try:
            self.httpd.serve_forever()
        except KeyboardInterrupt:
            print("Shutting down the server...")
            self.httpd.shutdown()


def load_routes_from_file(filename):
    """Load routing configuration from a JSON file"""
    if os.path.exists(filename):
        with open(filename, 'r') as f:
            return json.load(f)
    return None


if __name__ == "__main__":
    ConfigurableReverseProxy(   ).start()
    # import argparse
    
    # parser = argparse.ArgumentParser(description='Simple Reverse Proxy Server')
    # parser.add_argument('-p', '--port', type=int, default=8000, help='Port to run the proxy on')
    # parser.add_argument('-c', '--config', type=str, help='Path to JSON config file')
    
    # args = parser.parse_args()
    
    # # Load routes from config file if specified
    # routes = None
    # if args.config:
    #     routes = load_routes_from_file(args.config)
    
    # # Start the proxy
    # proxy = ConfigurableReverseProxy(port=args.port, routes=routes)
    # proxy.start()