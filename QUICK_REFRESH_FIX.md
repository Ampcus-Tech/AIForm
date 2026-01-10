# Quick Fix: 404 on Page Refresh

## The Problem
When you refresh the page on routes like `/admin` or `/login`, you get a 404 error.

## The Solution
Your web server needs to be configured to serve `index.html` for all routes.

## For IIS (Windows Server)

1. **Verify `web.config` is in your dist folder:**
   ```bash
   ls dist/web.config
   ```

2. **Make sure URL Rewrite module is installed:**
   - Download: https://www.iis.net/downloads/microsoft/url-rewrite
   - Install it
   - Restart IIS

3. **Deploy the dist folder** with `web.config` included

4. **Test:** Refresh https://sbeamp.ampcustech.info/admin

## For Apache

1. **Copy `.htaccess` to dist:**
   ```bash
   cp .htaccess dist/
   ```

2. **Enable mod_rewrite:**
   ```bash
   sudo a2enmod rewrite
   sudo systemctl restart apache2
   ```

3. **Deploy dist folder** with `.htaccess` included

## For Nginx

Add this to your server block:
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

## Verification

After deploying:
1. Go to: https://sbeamp.ampcustech.info/admin
2. Press F5 (refresh)
3. Should NOT get 404 ✅

## Common Issues

- **web.config/.htaccess not in dist folder** → Rebuild and redeploy
- **URL Rewrite not installed (IIS)** → Install it
- **mod_rewrite not enabled (Apache)** → Enable it
- **Server not restarted** → Restart after changes
