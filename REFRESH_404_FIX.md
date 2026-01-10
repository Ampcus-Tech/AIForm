# Fix: 404 Error on Page Refresh

## Problem
When you refresh the page on routes like `/admin` or `/login`, you get a 404 error. This happens because the web server is trying to find a file at that path instead of serving `index.html`.

## Root Cause
React Router uses client-side routing. When you navigate to `/admin`, React handles it. But when you refresh, the browser requests `/admin` from the server, which doesn't exist as a file.

## Solutions by Web Server

### Solution 1: IIS (Windows Server) - Use web.config

The `web.config` file should already be in your `dist` folder. Make sure:

1. **Verify web.config is deployed:**
   - Check that `dist/web.config` exists
   - It should be in the same folder as `index.html` on your server

2. **Install URL Rewrite Module:**
   - Download: https://www.iis.net/downloads/microsoft/url-rewrite
   - Install on your IIS server
   - Restart IIS

3. **Verify web.config content:**
   ```xml
   <rule name="React Routes" stopProcessing="true">
     <match url=".*" />
     <conditions>
       <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
       <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
       <add input="{REQUEST_URI}" pattern="^/(api)" negate="true" />
     </conditions>
     <action type="Rewrite" url="/index.html" />
   </rule>
   ```

### Solution 2: Nginx

Add this to your Nginx configuration:

```nginx
location / {
    root /path/to/dist;
    try_files $uri $uri/ /index.html;
}
```

**Important:** The `try_files $uri $uri/ /index.html;` line is CRITICAL.

### Solution 3: Apache

1. **Copy `.htaccess` to your dist folder:**
   ```bash
   cp .htaccess dist/
   ```

2. **Enable mod_rewrite:**
   ```bash
   sudo a2enmod rewrite
   sudo systemctl restart apache2
   ```

3. **Verify .htaccess is in dist folder on server**

### Solution 4: Node.js/Express (server.js)

If using the `server.js` file, it already handles this:

```javascript
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});
```

## Quick Test

After configuring, test:
1. Navigate to: https://sbeamp.ampcustech.info/admin
2. Refresh the page (F5 or Ctrl+R)
3. Should NOT get 404 ✅

## Troubleshooting

### Still getting 404?

1. **Check file exists:**
   - Verify `web.config` (IIS) or `.htaccess` (Apache) is in the dist folder
   - Check it's in the same directory as `index.html`

2. **Check server configuration:**
   - IIS: URL Rewrite module installed?
   - Apache: mod_rewrite enabled?
   - Nginx: `try_files` directive present?

3. **Check file permissions:**
   - Web server can read the files?
   - `.htaccess` or `web.config` not blocked?

4. **Clear browser cache:**
   - Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

5. **Check server logs:**
   - Look for errors in IIS logs, Apache error.log, or Nginx error.log

## Verification Checklist

- [ ] `web.config` (IIS) or `.htaccess` (Apache) is in dist folder
- [ ] File is deployed to server in same directory as index.html
- [ ] URL Rewrite module installed (IIS) or mod_rewrite enabled (Apache)
- [ ] Server restarted after configuration changes
- [ ] Tested refresh on `/admin` route
- [ ] Tested refresh on `/login` route
