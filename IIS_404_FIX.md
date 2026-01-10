# Fix: 404 Error on Page Refresh (IIS)

## Problem
When you refresh the page on routes like `/login` or `/admin`, you get a 404 error on IIS.

## Solution Steps

### Step 1: Verify web.config is Deployed

1. **Check that `web.config` is in your dist folder:**
   ```bash
   ls dist/web.config
   ```

2. **Verify it's deployed to your server:**
   - The `web.config` file must be in the same directory as `index.html`
   - Usually: `C:\inetpub\wwwroot\sbeamp\` or your website root

### Step 2: Install URL Rewrite Module

**CRITICAL:** The web.config requires the URL Rewrite module.

1. **Download URL Rewrite Module:**
   - Go to: https://www.iis.net/downloads/microsoft/url-rewrite
   - Download and install `rewrite_amd64_en-US.msi` (or appropriate version)

2. **Install on your IIS server:**
   - Run the installer
   - Restart IIS after installation

3. **Verify installation:**
   - Open IIS Manager
   - Select your server
   - Look for "URL Rewrite" in the Features View
   - If you see it, it's installed ✅

### Step 3: Configure IIS Application

1. **Open IIS Manager**

2. **Select your website** (sbeamp.ampcustech.info)

3. **Verify Application Pool:**
   - Right-click your site → Manage Application → Advanced Settings
   - Make sure it's using a .NET Framework version (not required, but helps)

4. **Check Handler Mappings:**
   - Double-click "Handler Mappings"
   - Make sure static files are handled correctly

### Step 4: Test web.config

1. **Verify web.config syntax:**
   - Open IIS Manager
   - Select your website
   - Double-click "URL Rewrite"
   - You should see the "React Routes" rule
   - If you see an error, the web.config has a syntax issue

2. **Test the rule:**
   - Click "View Server Variables" (if available)
   - The rule should be active

### Step 5: Restart IIS

After making changes:

```powershell
# Run as Administrator
iisreset
```

Or restart from IIS Manager:
- Right-click server → Restart

### Step 6: Test

1. Navigate to: https://sbeamp.ampcustech.info/login
2. Press F5 (refresh)
3. Should NOT get 404 ✅

## Alternative: If URL Rewrite Module Can't Be Installed

If you cannot install URL Rewrite module, you can use a different approach:

### Option 1: Use HTTP Redirect Module

Create a simpler web.config:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
  <system.webServer>
    <httpRedirect enabled="false" />
    <defaultDocument>
      <files>
        <clear />
        <add value="index.html" />
      </files>
    </defaultDocument>
  </system.webServer>
</configuration>
```

**Note:** This won't work for SPA routing. You MUST install URL Rewrite module.

### Option 2: Use Node.js Server

Instead of IIS, use the Express server (`server.js`):

```bash
cd backend
npm install
npm start
```

Then configure IIS to reverse proxy to Node.js (port 5000).

## Troubleshooting

### Still Getting 404?

1. **Check web.config location:**
   - Must be in root of website (same folder as index.html)
   - Not in a subfolder

2. **Check file permissions:**
   - IIS_IUSRS needs read access
   - Right-click web.config → Properties → Security → Add IIS_IUSRS with Read permission

3. **Check IIS logs:**
   - Location: `C:\inetpub\logs\LogFiles\`
   - Look for 404 errors and see what URL was requested

4. **Test web.config syntax:**
   ```powershell
   # Run in PowerShell as Administrator
   C:\Windows\System32\inetsrv\appcmd.exe list config -section:system.webServer/rewrite/rules
   ```

5. **Verify URL Rewrite is working:**
   - Create a test rule in IIS Manager
   - If test rule doesn't work, URL Rewrite module isn't installed correctly

### Common Errors

- **500.19 - Configuration Error:** web.config syntax error or URL Rewrite not installed
- **404.0 - Not Found:** web.config not in correct location or rule not matching
- **403 - Forbidden:** File permissions issue

## Quick Verification Checklist

- [ ] `web.config` exists in dist folder
- [ ] `web.config` is deployed to server root (same as index.html)
- [ ] URL Rewrite module is installed
- [ ] IIS has been restarted after installation
- [ ] File permissions are correct
- [ ] Tested refresh on `/login` route
- [ ] Tested refresh on `/admin` route

## Still Not Working?

If none of the above works, you may need to:
1. Check with your hosting provider about URL Rewrite module
2. Consider using a different web server (Nginx, Apache)
3. Use the Node.js Express server instead of IIS
