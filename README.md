# SBEAMP

A React-based assessment form for evaluating an organization's readiness for AI transformation.

## Production URLs

- **Frontend**: https://sbeamp.ampcustech.info
- **Backend API**: https://sbeamp.ampcustech.info/api
- **Admin Login**: https://sbeamp.ampcustech.info/login

## Production Database

- **Host**: localhost
- **Database**: sbeampdb
- **Username**: postgres
- **Password**: admin

**Note**: See `PRODUCTION_SETUP.md` for complete deployment instructions without Docker.

## Features

- **User Authentication**: Login and signup pages with protected routes
- **Role-Based Access Control**: Two user roles - Normal User and Admin
- **Admin Dashboard**: Admins can view all users and all assessments
- **User Dashboard**: Users can submit and view their own assessments
- **Comprehensive multi-section assessment form**: 25 questions across 5 sections
- **Conditional field display**: Dynamic fields based on user responses
- **Form validation**: Required field validation and error handling
- **Responsive design**: Works on desktop, tablet, and mobile devices
- **Modern UI**: Beautiful gradient styling with smooth transitions
- **Backend API**: Node.js/Express backend with PostgreSQL database
- **Docker Support**: Easy setup with Docker Compose

## Tech Stack

### Frontend
- React 18
- React Router DOM 6
- Vite
- CSS3

### Backend
- Node.js
- Express.js
- PostgreSQL
- JWT Authentication
- Docker

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Docker and Docker Compose

### Installation

1. **Clone the repository** (if applicable)

2. **Set up the backend:**
   ```bash
   cd backend
   npm install
   ```

3. **Set up the frontend:**
   ```bash
   npm install
   ```

4. **Start the database and backend with Docker:**
   ```bash
   docker-compose up -d
   ```

   This will:
   - Start PostgreSQL database
   - Start the backend server
   - Run database migrations

5. **Set up environment variables:**

   For backend, create `backend/.env`:
   ```env
   PORT=5000
   NODE_ENV=development
   DB_HOST=postgres
   DB_PORT=5432
   DB_NAME=sbeamp_db
   DB_USER=sbeamp_user
   DB_PASSWORD=sbeamp_password
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRES_IN=7d
   FRONTEND_URL=http://localhost:5173
   ADMIN_EMAIL=admin@ampcus.com
   ADMIN_PASSWORD=Admin#456789
   ADMIN_NAME=Admin User
   ```

   For frontend, create `.env` (development) or `.env.production`:
   
   **Development (.env):**
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```
   
   **Production (.env.production):**
   ```env
   VITE_API_URL=https://sbeamp.ampcustech.info/api
   ```

6. **Run database migrations** (if not done automatically):
   ```bash
   cd backend
   npm run migrate
   ```

7. **Start the frontend development server:**
   ```bash
   npm run dev
   ```

8. Open your browser and navigate to `http://localhost:5173`

### Docker Commands

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# Restart services
docker-compose restart

# Stop and remove volumes (clears database)
docker-compose down -v
```

### Manual Setup (Without Docker)

If you prefer to run without Docker:

1. **Install and start PostgreSQL** locally
2. **Create database:**
   ```sql
   CREATE DATABASE sbeamp_db;
   CREATE USER sbeamp_user WITH PASSWORD 'sbeamp_password';
   GRANT ALL PRIVILEGES ON DATABASE sbeamp_db TO sbeamp_user;
   ```

3. **Update backend/.env** with local database credentials:
   ```env
   DB_HOST=localhost
   ```

4. **Run migrations:**
   ```bash
   cd backend
   npm run migrate
   ```

5. **Start backend:**
   ```bash
   cd backend
   npm run dev
   ```

6. **Start frontend:**
   ```bash
   npm run dev
   ```

## Project Structure

```
AIForm/
├── backend/
│   ├── config/
│   │   └── database.js          # Database connection
│   ├── middleware/
│   │   └── auth.js              # JWT authentication middleware
│   ├── migrations/
│   │   ├── init.sql             # Database schema
│   │   └── migrate.js           # Migration script
│   ├── routes/
│   │   ├── auth.js              # Authentication routes
│   │   └── assessment.js         # Assessment routes
│   ├── server.js                # Express server
│   ├── package.json
│   └── Dockerfile
├── src/
│   ├── components/
│   │   ├── Login.jsx            # Login page
│   │   ├── Signup.jsx           # Signup page
│   │   ├── Assessment.jsx       # Assessment form
│   │   ├── ProtectedRoute.jsx   # Route protection
│   │   └── Auth.css             # Auth page styles
│   ├── contexts/
│   │   └── AuthContext.jsx      # Authentication context
│   ├── services/
│   │   └── api.js                # API service functions
│   ├── config/
│   │   └── api.js                # API configuration
│   ├── App.jsx                   # Main app with routing
│   ├── main.jsx                  # React entry point
│   └── styles.css                # Application styles
├── docker-compose.yml             # Docker Compose configuration
├── index.html                    # HTML template
├── package.json                  # Frontend dependencies
├── vite.config.js                # Vite configuration
└── README.md                     # This file
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user (defaults to 'user' role)
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Assessment (User)
- `POST /api/assessment/submit` - Submit assessment (protected, user/admin)
- `GET /api/assessment/my-assessment` - Get user's own assessment (protected, user/admin)

### Admin (Admin Only)
- `GET /api/admin/users` - Get all registered users
- `GET /api/admin/users/:id` - Get user by ID with their assessment
- `GET /api/admin/assessments` - Get all assessments
- `GET /api/admin/assessments/:id` - Get assessment by ID
- `GET /api/admin/stats` - Get dashboard statistics

## Default Routes

- `/` - Redirects to login page
- `/login` - Login page
- `/signup` - Signup page
- `/assessment` - Assessment form (protected, requires authentication)
- `/admin` - Admin dashboard (protected, requires admin role)

## User Roles

### Normal User
- Can sign up and create an account
- Can submit assessment form
- Can view their own submitted assessment
- Cannot access admin dashboard

### Admin
- Can do everything a normal user can do
- Can view all registered users
- Can view all submitted assessments
- Can access admin dashboard with statistics
- Default admin credentials (created on first run):
  - Email: `admin@ampcus.com`
  - Password: `Admin#456789`

**Note**: Change the default admin password in production! Update `ADMIN_PASSWORD` in `docker-compose.yml` or backend `.env` file.

## Build for Production

### Frontend
```bash
npm run build
```

The built files will be in the `dist` directory.

### Backend
The backend runs in production mode when `NODE_ENV=production` is set.

## Production Deployment

### Production URLs
- **Frontend**: https://sbeamp.ampcustech.info
- **Backend API**: https://sbeamp.ampcustech.info/api
- **Admin Login**: https://sbeamp.ampcustech.info/login

### Production Environment Variables

**Frontend (.env.production):**
```env
VITE_API_URL=https://sbeamp.ampcustech.info/api
```

**Backend (.env.production):**
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

See `DEPLOYMENT.md` for detailed deployment instructions.

## Environment Variables

### Backend
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)
- `DB_HOST` - Database host
- `DB_PORT` - Database port (default: 5432)
- `DB_NAME` - Database name
- `DB_USER` - Database user
- `DB_PASSWORD` - Database password
- `JWT_SECRET` - Secret key for JWT tokens
- `JWT_EXPIRES_IN` - Token expiration time
- `FRONTEND_URL` - Frontend URL for CORS
  - Development: `*` (allows all)
  - Production: `https://sbeamp.ampcustech.info`

### Frontend
- `VITE_API_URL` - Backend API URL
  - Development: `http://localhost:5000/api`
  - Production: `https://sbeamp.ampcustech.info/api`

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Check database credentials in `.env`
- Verify Docker containers are running: `docker-compose ps`

### CORS Errors
- Ensure `FRONTEND_URL` in backend `.env` matches your frontend URL
- Check that backend CORS middleware is configured correctly

### Authentication Issues
- Clear browser localStorage
- Check JWT_SECRET is set in backend `.env`
- Verify token is being sent in Authorization header

## License

ISC
