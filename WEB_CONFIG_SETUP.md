# Web.config Setup for IIS (Windows Server)

## Problem
When deploying React Router app to IIS (Internet Information Services), routes like `/admin` and `/login` return 404 errors.

## Solution
Use `web.config` file to configure URL rewriting in IIS.

## Files Created

1. **`public/web.config`** - IIS configuration file
2. **Updated `vite.config.js`** - Automatically copies web.config to dist folder during build

## How It Works

The `web.config` file tells IIS to:
- Rewrite all requests to `index.html` (except API calls and actual files)
- This allows React Router to handle routing on the client side

## Build and Deploy

1. **Build the app:**
   ```bash
   npm run build
   ```

2. **Verify web.config is in dist folder:**
   ```bash
   ls dist/web.config
   ```

3. **Deploy the `dist` folder** to your IIS server

4. **Configure IIS:**
   - Make sure URL Rewrite module is installed
   - If not installed, download from: https://www.iis.net/downloads/microsoft/url-rewrite

## IIS URL Rewrite Module

The web.config requires the URL Rewrite module. To install:

1. Download from: https://www.iis.net/downloads/microsoft/url-rewrite
2. Install on your IIS server
3. Restart IIS

## Testing

After deployment, test these URLs:
- https://sbeamp.ampcustech.info/ ✅
- https://sbeamp.ampcustech.info/admin ✅
- https://sbeamp.ampcustech.info/login ✅

## Alternative: For Other Web Servers

### Nginx
Use the `nginx.conf` file provided in the project.

### Apache
Use the `.htaccess` file provided in the project.

### Node.js/Express
Use the `server.js` file provided in the project.

## Troubleshooting

1. **404 still happening:**
   - Verify `web.config` is in the dist folder
   - Check that URL Rewrite module is installed in IIS
   - Restart IIS after deploying

2. **API calls not working:**
   - The web.config excludes `/api` routes from rewriting
   - Make sure your backend is properly configured

3. **Static assets not loading:**
   - Check that MIME types are configured correctly
   - Verify file permissions in IIS
