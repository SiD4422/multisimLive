import http.server
import socketserver
import os

class NetlifyHandler(http.server.SimpleHTTPRequestHandler):
    def translate_path(self, path):
        # Handle Netlify-style URL rewrites
        
        # 1. Strip the /circuit prefix since the files are in the root directory
        if path.startswith('/circuit/'):
            path = path[8:] # Strip /circuit, keep the trailing slash
            if path == '':
                path = '/'
                
        # Get the standard path resolution
        translated_path = super().translate_path(path)
        
        # 2. Emulate clean URLs (if path doesn't exist, try adding .html)
        if not os.path.exists(translated_path) and not translated_path.endswith('.html'):
            translated_path_html = translated_path + '.html'
            if os.path.exists(translated_path_html):
                return translated_path_html
                
        return translated_path

    def do_POST(self):
        if self.path == '/dump':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            with open('dom_dump.txt', 'wb') as f:
                f.write(post_data)
            self.send_response(200)
            self.end_headers()
            return
        self.send_error(404)

class ThreadingTCPServer(socketserver.ThreadingMixIn, socketserver.TCPServer):
    daemon_threads = True

if __name__ == '__main__':
    PORT = 8080
    with ThreadingTCPServer(("", PORT), NetlifyHandler) as httpd:
        print(f"Serving with Netlify rewrites (Multi-threaded) on port {PORT}...")
        httpd.serve_forever()
