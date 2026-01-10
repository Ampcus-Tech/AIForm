# Quick Fix: 404 Error on /admin Route

## Problem
You're getting 404 when accessing `/admin` after serving the dist folder. This happens because simple static file servers don't handle React Router (SPA) routing.

## Solution 1: Use `serve` package (Easiest)

1. **Install serve:**
   ```bash
   npm install -g serve
   ```

2. **Serve with SPA support:**
   ```bash
   serve -s dist -l 3000
   ```
   
   The `-s` flag enables SPA routing (serves index.html for all routes).

3. **Test:**
   - http://192.168.0.105:3000/ ✅
   - http://192.168.0.105:3000/admin ✅ (should work now!)
   - http://192.168.0.105:3000/login ✅

## Solution 2: Use Express Server (Recommended for Production)

1. **Install dependencies:**
   ```bash
   npm install express http-proxy-middleware
   ```

2. **Start the server:**
   ```bash
   npm run serve
   ```
   
   Or manually:
   ```bash
   node server.js
   ```

   This will:
   - Serve your React app from `dist` folder
   - Handle SPA routing (all routes serve index.html)
   - Proxy `/api` requests to your backend on port 5000

3. **Access:**
   - Frontend: http://192.168.0.105:3000
   - Admin: http://192.168.0.105:3000/admin ✅

## Solution 3: Quick Test with Vite Preview

```bash
npm run build
npm run preview
```

This uses Vite's preview server which handles SPA routing correctly.

## Why This Happens

React Router uses client-side routing. When you navigate to `/admin`, the browser requests that path from the server. Without proper configuration, the server looks for a file at `/admin` and returns 404.

The fix is to configure the server to serve `index.html` for all routes, letting React Router handle the routing on the client side.

## For Production Deployment

Use a proper web server (Nginx/Apache) with the configuration in `SPA_ROUTING_FIX.md`.
