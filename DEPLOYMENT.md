# Deployment Guide

## Production URLs

- **Frontend**: https://sbeamp.ampcustech.info
- **Backend API**: https://sbeamp.ampcustech.info/api

## Environment Configuration

### Frontend Production Build

1. Create `.env.production` file in the root directory:
   ```env
   VITE_API_URL=https://sbeamp.ampcustech.info/api
   ```

2. Build for production:
   ```bash
   npm run build
   ```

3. The built files will be in the `dist` directory, ready to deploy.

### Backend Production Configuration

1. Create `backend/.env.production` file:
   ```env
   PORT=5000
   NODE_ENV=production
   DB_HOST=postgres
   DB_PORT=5432
   DB_NAME=sbeamp_db
   DB_USER=sbeamp_user
   DB_PASSWORD=sbeamp_password
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRES_IN=7d
   FRONTEND_URL=https://sbeamp.ampcustech.info
   ADMIN_EMAIL=admin@ampcus.com
   ADMIN_PASSWORD=Admin#456789
   ADMIN_NAME=Admin User
   ```

2. Update `docker-compose.yml` for production:
   - Set `FRONTEND_URL=https://sbeamp.ampcustech.info`
   - Update `NODE_ENV=production`
   - Use production `.env.production` file

## Deployment Steps

### Option 1: Using Docker Compose

1. Update `docker-compose.yml` with production environment variables
2. Build and start:
   ```bash
   docker-compose -f docker-compose.yml up -d --build
   ```

### Option 2: Manual Deployment

1. **Backend:**
   - Deploy backend to your server
   - Set environment variables from `backend/.env.production`
   - Run database migrations: `npm run migrate`
   - Start server: `npm start`

2. **Frontend:**
   - Build: `npm run build`
   - Deploy `dist` folder to your web server
   - Configure web server to serve the frontend and proxy `/api` to backend

## Nginx Configuration Example

If using Nginx as a reverse proxy:

```nginx
server {
    listen 80;
    server_name sbeamp.ampcustech.info;

    # Frontend
    location / {
        root /path/to/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

## SSL/HTTPS

Make sure to configure SSL certificates (Let's Encrypt, etc.) for HTTPS support.

## Admin Access

- **URL**: https://sbeamp.ampcustech.info/login
- **Email**: admin@ampcus.com
- **Password**: Admin#456789

**Important**: Change the admin password in production!
