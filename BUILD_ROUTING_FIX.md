# Fix: Build File Routing Not Working

## Problem
After building with `npm run build`, only the root route (`/`) works. Routes like `/admin`, `/login` return 404 errors.

## Root Cause
This happens because:
1. The web server doesn't know to serve `index.html` for all routes
2. React Router uses client-side routing, but the server tries to find actual files

## Solutions

### Solution 1: Use the Express Server (Recommended)

The `server.js` file I created handles SPA routing correctly:

```bash
# Install dependencies
npm install express http-proxy-middleware

# Build the app
npm run build

# Start the server
npm run serve
```

This will serve on port 3000 with proper SPA routing support.

### Solution 2: Use `serve` Package

```bash
# Install serve globally
npm install -g serve

# Build the app
npm run build

# Serve with SPA support
serve -s dist -l 3000
```

The `-s` flag is CRITICAL - it enables SPA routing.

### Solution 3: Use Vite Preview

```bash
npm run build
npm run preview
```

Vite's preview server handles SPA routing correctly.

### Solution 4: Copy .htaccess to dist (Apache)

If using Apache:

```bash
npm run build
cp .htaccess dist/
```

Then serve the dist folder with Apache.

### Solution 5: Configure Your Web Server

**For Nginx:**
```nginx
location / {
    root /path/to/dist;
    try_files $uri $uri/ /index.html;
}
```

**For Apache:**
Copy `.htaccess` to your dist folder.

## Testing After Build

1. **Build:**
   ```bash
   npm run build
   ```

2. **Serve using one of the methods above**

3. **Test these URLs:**
   - http://localhost:3000/ ✅
   - http://localhost:3000/admin ✅ (should work!)
   - http://localhost:3000/login ✅ (should work!)

## Important Notes

- **Never use simple HTTP servers** like `python -m http.server` or basic `http-server` without SPA support
- **Always use `serve -s`** or the Express server for proper routing
- The `-s` flag in `serve` stands for "single-page application" mode

## Quick Command Reference

```bash
# Build
npm run build

# Option 1: Express server
npm install express http-proxy-middleware
npm run serve

# Option 2: serve package
npm install -g serve
serve -s dist -l 3000

# Option 3: Vite preview
npm run preview
```
