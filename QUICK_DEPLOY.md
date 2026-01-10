# Quick Production Deployment Checklist

## Database Details
- **Host**: localhost
- **Database**: sbeampdb
- **Username**: postgres
- **Password**: admin

## URLs
- **Frontend**: https://sbeamp.ampcustech.info
- **Backend**: https://sbeamp.ampcustech.info/api

## Quick Setup Steps

### 1. Backend Setup

```bash
cd backend

# Create .env file with these values:
cat > .env << EOF
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
EOF

# Install dependencies
npm install

# Run migrations
npm run migrate

# Create admin user
npm run create-admin

# Start server (or use PM2)
npm start
```

### 2. Frontend Setup

```bash
# From project root
cd ..

# Create .env.production file
cat > .env.production << EOF
VITE_API_URL=https://sbeamp.ampcustech.info/api
EOF

# Install dependencies
npm install

# Build for production
npm run build

# Deploy the 'dist' folder to your web server
```

### 3. Start Backend with PM2 (Recommended)

```bash
cd backend
npm install -g pm2
pm2 start server.js --name sbeamp-backend
pm2 save
pm2 startup  # Follow instructions to enable on boot
```

### 4. Configure Web Server for SPA Routing

**CRITICAL**: Your web server must be configured to serve `index.html` for all routes.

**Nginx** - Add this to your location block:
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

**Apache** - Add `.htaccess` to your dist folder (see `.htaccess` file in project root)

See `SPA_ROUTING_FIX.md` for complete instructions.

### 5. Verify

- Backend: `curl https://sbeamp.ampcustech.info/api/health`
- Frontend: Visit https://sbeamp.ampcustech.info
- Admin Login: https://sbeamp.ampcustech.info/login (should NOT return 404)

## Admin Credentials
- Email: admin@ampcus.com
- Password: Admin#456789
