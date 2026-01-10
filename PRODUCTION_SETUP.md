# Production Setup Guide (Without Docker)

## Production URLs
- **Frontend**: https://sbeamp.ampcustech.info
- **Backend API**: https://sbeamp.ampcustech.info/api
- **Admin Login**: https://sbeamp.ampcustech.info/login

## Database Configuration
- **Host**: localhost
- **Database**: sbeampdb
- **Username**: postgres
- **Password**: admin

## Setup Steps

### 1. Database Setup

Make sure PostgreSQL is installed and running on your server:

```bash
# Create database
psql -U postgres -c "CREATE DATABASE sbeampdb;"

# Verify database exists
psql -U postgres -l | grep sbeampdb
```

### 2. Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create production environment file** (`backend/.env`):
   ```env
   PORT=5000
   NODE_ENV=production
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=sbeampdb
   DB_USER=postgres
   DB_PASSWORD=admin
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRES_IN=7d
   FRONTEND_URL=https://sbeamp.ampcustech.info
   ADMIN_EMAIL=admin@ampcus.com
   ADMIN_PASSWORD=Admin#456789
   ADMIN_NAME=Admin User
   ```
   
   **Quick command to create .env:**
   ```bash
   cp .env.production .env
   # Then edit .env if needed
   ```

4. **Run database migrations:**
   ```bash
   npm run migrate
   ```

5. **Create admin user:**
   ```bash
   npm run create-admin
   ```

6. **Start backend server:**
   ```bash
   npm start
   ```

   Or use PM2 for process management:
   ```bash
   npm install -g pm2
   pm2 start server.js --name sbeamp-backend
   pm2 save
   pm2 startup
   ```

### 3. Frontend Setup

1. **Navigate to project root:**
   ```bash
   cd ..
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create production environment file** (`.env.production`):
   ```env
   VITE_API_URL=https://sbeamp.ampcustech.info/api
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

5. **Deploy the `dist` folder** to your web server

### 4. Web Server Configuration (Nginx Example)

```nginx
server {
    listen 80;
    server_name sbeamp.ampcustech.info;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name sbeamp.ampcustech.info;

    # SSL Configuration
    ssl_certificate /path/to/ssl/cert.pem;
    ssl_certificate_key /path/to/ssl/key.pem;

    # Frontend - Serve React App
    location / {
        root /path/to/dist;
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache";
    }

    # Backend API Proxy
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 5. Start Services

**Backend (using PM2):**
```bash
cd backend
pm2 start server.js --name sbeamp-backend
pm2 save
```

**Or using systemd service:**

Create `/etc/systemd/system/sbeamp-backend.service`:
```ini
[Unit]
Description=SBEAMP Backend API
After=network.target postgresql.service

[Service]
Type=simple
User=your-user
WorkingDirectory=/path/to/AIForm/backend
Environment=NODE_ENV=production
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Then:
```bash
sudo systemctl enable sbeamp-backend
sudo systemctl start sbeamp-backend
sudo systemctl status sbeamp-backend
```

## Verification

1. **Check backend is running:**
   ```bash
   curl https://sbeamp.ampcustech.info/api/health
   ```

2. **Check frontend is accessible:**
   - Visit: https://sbeamp.ampcustech.info

3. **Test admin login:**
   - Visit: https://sbeamp.ampcustech.info/login
   - Email: admin@ampcus.com
   - Password: Admin#456789

## Important Security Notes

1. **Change JWT_SECRET** in production - use a strong, random secret
2. **Change admin password** - update `ADMIN_PASSWORD` in backend `.env`
3. **Use HTTPS** - SSL certificates are required
4. **Database security** - Ensure PostgreSQL is properly secured
5. **Firewall** - Only expose necessary ports (80, 443)

## Troubleshooting

### Backend not starting
- Check PostgreSQL is running: `sudo systemctl status postgresql`
- Verify database connection: `psql -U postgres -d sbeampdb -c "SELECT 1;"`
- Check backend logs: `pm2 logs sbeamp-backend` or `journalctl -u sbeamp-backend`

### Database connection errors
- Verify database credentials in `backend/.env`
- Check PostgreSQL is listening: `sudo netstat -tlnp | grep 5432`
- Verify database exists: `psql -U postgres -l`

### CORS errors
- Ensure `FRONTEND_URL=https://sbeamp.ampcustech.info` in backend `.env`
- Check backend logs for CORS configuration
