# Fixing 404 Errors on React Router Routes

## Problem
When navigating to routes like `/admin`, `/login`, etc., you get a 404 error. This happens because the web server is trying to find a file at that path instead of serving the React app.

**Common Issue**: If you're using `http-server`, `serve`, or `python -m http.server`, they don't handle SPA routing by default.

## Solution
Configure your web server to serve `index.html` for all routes (except API calls). This is called "fallback routing" for Single Page Applications (SPAs).

## Nginx Configuration

### Option 1: Update Existing Nginx Config

Add this to your Nginx configuration file (usually in `/etc/nginx/sites-available/sbeamp.ampcustech.info`):

```nginx
server {
    listen 443 ssl http2;
    server_name sbeamp.ampcustech.info;

    root /path/to/your/dist;
    index index.html;

    # CRITICAL: This line makes React Router work
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

### Option 2: Use the Provided nginx.conf

1. Copy `nginx.conf` to your Nginx sites-available:
   ```bash
   sudo cp nginx.conf /etc/nginx/sites-available/sbeamp.ampcustech.info
   ```

2. Update the paths in the file:
   - Change `/path/to/dist` to your actual dist folder path
   - Update SSL certificate paths if using HTTPS

3. Enable the site:
   ```bash
   sudo ln -s /etc/nginx/sites-available/sbeamp.ampcustech.info /etc/nginx/sites-enabled/
   ```

4. Test configuration:
   ```bash
   sudo nginx -t
   ```

5. Reload Nginx:
   ```bash
   sudo systemctl reload nginx
   ```

## Apache Configuration

### Option 1: Use .htaccess File

1. Copy the `.htaccess` file to your `dist` folder:
   ```bash
   cp .htaccess dist/
   ```

2. Make sure Apache has `mod_rewrite` enabled:
   ```bash
   sudo a2enmod rewrite
   sudo systemctl restart apache2
   ```

### Option 2: Update Apache Virtual Host

Add this to your Apache virtual host configuration:

```apache
<VirtualHost *:80>
    ServerName sbeamp.ampcustech.info
    DocumentRoot /path/to/dist

    <Directory /path/to/dist>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
        
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>

    # Proxy API requests
    ProxyPass /api http://localhost:5000/api
    ProxyPassReverse /api http://localhost:5000/api
</VirtualHost>
```

## Other Web Servers

### Caddy
```
sbeamp.ampcustech.info {
    root * /path/to/dist
    try_files {path} /index.html
    reverse_proxy /api localhost:5000
}
```

### Express.js (if serving from Node.js)
```javascript
const express = require('express');
const path = require('path');
const app = express();

// Serve static files
app.use(express.static(path.join(__dirname, 'dist')));

// API routes
app.use('/api', require('./backend/routes'));

// Fallback to index.html for all routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});
```

## Using Simple Static File Servers

### Option 1: Using `serve` package (Recommended)

1. Install serve globally:
   ```bash
   npm install -g serve
   ```

2. Serve with SPA routing support:
   ```bash
   serve -s dist -l 3000
   ```

   The `-s` flag enables SPA routing (serves index.html for all routes).

### Option 2: Using `http-server` with custom script

1. Install http-server:
   ```bash
   npm install -g http-server
   ```

2. Use this command (note: http-server doesn't support SPA routing well):
   ```bash
   http-server dist -p 3000 --proxy http://localhost:3000?
   ```

   **Better option**: Use `serve` instead (see Option 1).

### Option 3: Using Node.js Express server

Create a simple server file `server.js` in your project root:

```javascript
const express = require('express');
const path = require('path');
const app = express();

// Serve static files from dist
app.use(express.static(path.join(__dirname, 'dist')));

// API proxy (if backend is on different port)
app.use('/api', (req, res) => {
  // Proxy to your backend
  // Or configure your backend to handle /api routes
});

// Fallback to index.html for all routes (SPA routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

Then run:
```bash
node server.js
```

### Option 4: Using Python http.server (Limited)

Python's http.server doesn't support SPA routing well. Use one of the options above instead.

## Quick Test

After configuring, test these URLs:
- http://192.168.0.105:3000/ (should work)
- http://192.168.0.105:3000/admin (should work, not 404)
- http://192.168.0.105:3000/login (should work, not 404)
- http://192.168.0.105:3000/api/health (should return JSON)

## Common Issues

1. **Still getting 404**: Make sure you reloaded/restarted the web server after changes
2. **API calls failing**: Check that `/api` proxy is configured correctly
3. **Static assets not loading**: Check that the `root` or `DocumentRoot` points to the `dist` folder
