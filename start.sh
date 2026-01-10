#!/bin/bash

echo "Starting SBEAMP Application..."
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "Error: Docker is not running. Please start Docker and try again."
    exit 1
fi

# Start Docker containers
echo "Starting Docker containers (PostgreSQL + Backend)..."
docker-compose up -d

# Wait for backend to be ready
echo "Waiting for backend to be ready..."
sleep 5

# Check if backend is running
if curl -s http://localhost:5000/api/health > /dev/null; then
    echo "✓ Backend is running on http://localhost:5000"
else
    echo "⚠ Backend might still be starting. Check logs with: docker-compose logs -f backend"
fi

echo ""
echo "✓ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Start the frontend: npm run dev"
echo "2. Open http://localhost:5173 in your browser"
echo ""
echo "Useful commands:"
echo "  - View logs: docker-compose logs -f"
echo "  - Stop services: docker-compose down"
echo "  - Restart services: docker-compose restart"
