# Docker Setup with Local PostgreSQL Database

## Overview
This guide shows how to run the backend in Docker while connecting to your local PostgreSQL database (sbeampdb, postgres, admin).

## Prerequisites

1. **PostgreSQL installed and running locally:**
   ```bash
   # Verify PostgreSQL is running
   psql -U postgres -d sbeampdb -c "SELECT 1;"
   ```

2. **Docker and Docker Compose installed**

## Option 1: Use docker-compose.local-db.yml (Recommended)

This file is configured to connect to your local database:

```bash
# Start backend only (connects to local PostgreSQL)
docker-compose -f docker-compose.local-db.yml up --build
```

## Option 2: Modify docker-compose.yml

The main `docker-compose.yml` has been updated to connect to local database by default.

### For Mac/Windows:
Uses `host.docker.internal` to connect to localhost.

```bash
docker-compose up --build
```

### For Linux:
You need to use `network_mode: "host"` instead:

1. Edit `docker-compose.yml`
2. Change `DB_HOST: host.docker.internal` to use `network_mode: "host"`
3. Or use your machine's IP address

## Database Connection Details

- **Host:** `host.docker.internal` (Mac/Windows) or your machine IP (Linux)
- **Port:** `5432`
- **Database:** `sbeampdb`
- **User:** `postgres`
- **Password:** `admin`

## Steps to Run

1. **Make sure PostgreSQL is running locally:**
   ```bash
   # Check if PostgreSQL is running
   pg_isready -U postgres
   ```

2. **Create database if it doesn't exist:**
   ```bash
   psql -U postgres -c "CREATE DATABASE sbeampdb;"
   ```

3. **Start Docker backend:**
   ```bash
   # Using the local-db compose file
   docker-compose -f docker-compose.local-db.yml up --build
   
   # OR using main compose file (updated)
   docker-compose up --build
   ```

4. **The backend will:**
   - Connect to your local PostgreSQL
   - Run migrations automatically
   - Create admin user
   - Start on port 5000

## Verify Connection

1. **Check backend logs:**
   ```bash
   docker logs sbeamp_backend
   ```
   Should see: "Connected to PostgreSQL database"

2. **Test API:**
   ```bash
   curl http://localhost:5000/api/health
   ```

## Troubleshooting

### Connection Refused Error

**Mac/Windows:**
- Make sure PostgreSQL is running: `pg_isready -U postgres`
- Check PostgreSQL is listening on 0.0.0.0, not just 127.0.0.1
- Edit `postgresql.conf`: `listen_addresses = '*'`
- Edit `pg_hba.conf`: Add `host all all 0.0.0.0/0 md5`

**Linux:**
- Use `network_mode: "host"` in docker-compose.yml
- Or use your machine's actual IP address instead of `host.docker.internal`

### Database Doesn't Exist

```bash
# Create the database
psql -U postgres -c "CREATE DATABASE sbeampdb;"
```

### Permission Denied

Make sure PostgreSQL allows connections:
```bash
# Edit pg_hba.conf
# Add line: host all all 0.0.0.0/0 md5
# Then restart PostgreSQL
```

## Alternative: Use Docker PostgreSQL

If you prefer to use Docker PostgreSQL instead:

1. Use the original `docker-compose.yml` (with postgres service)
2. Comment out the `DB_HOST: host.docker.internal` line
3. Change `DB_HOST: postgres` (Docker service name)
4. Uncomment `depends_on` section

## Environment Variables

The backend will use these from docker-compose:
- `DB_HOST: host.docker.internal` (connects to local machine)
- `DB_PORT: 5432`
- `DB_NAME: sbeampdb`
- `DB_USER: postgres`
- `DB_PASSWORD: admin`

These match your production database credentials.
