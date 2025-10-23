# Course Compass - MERN Full-Stack Technical Assessment

## Project Overview

This project implements a comprehensive MERN stack application with microservices architecture, featuring:

- **Authentication Microservice**: Admin-only authentication with JWT
- **AI Recommendations Microservice**: Gemini AI-powered course recommendations
- **Course Management Microservice**: CSV upload, Elasticsearch search, Redis caching
- **Frontend**: Next.js application with state management and client-side caching

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Frontend      │    │   Frontend      │
│   (Next.js)     │    │   (Next.js)    │    │   (Next.js)    │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          │                      │                      │
┌─────────▼───────┐    ┌─────────▼───────┐    ┌─────────▼───────┐
│   Auth MS      │    │   AI MS         │    │   Courses MS   │
│   Port: 4000   │    │   Port: 4001    │    │   Port: 4002   │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          │                      │                      │
┌─────────▼───────┐    ┌─────────▼───────┐    ┌─────────▼───────┐
│   MongoDB      │    │   Gemini AI     │    │   MongoDB       │
│   (Auth DB)    │    │   API           │    │   (Courses DB) │
└─────────────────┘    └─────────────────┘    └─────────┬───────┘
                                                        │
                                              ┌─────────▼───────┐
                                              │   Elasticsearch │
                                              │   (Search)      │
                                              └─────────┬───────┘
                                                        │
                                              ┌─────────▼───────┐
                                              │   Redis         │
                                              │   (Cache)       │
                                              └─────────────────┘
```

## Setup Instructions

## Prerequisites

- Node.js 18+
- MongoDB (running locally on port 27017)
- Redis (optional - falls back to simulation)
- Elasticsearch (optional - falls back to simulation)
- Docker & Docker Compose
- Docker (optional)

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone <repository-url>
cd course-compass

# Install frontend dependencies
npm install

# Install microservice dependencies
cd microservices/auth && npm install
cd ../ai && npm install
cd ../courses && npm install
cd ../..
```

### 2. Environment Setup

Create environment files for each microservice:

**microservices/auth/.env**
```env
PORT=4000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/auth-service
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRY=4h
CORS_ORIGIN=http://localhost:9002
```

**microservices/ai/.env**
```env
PORT=4001
NODE_ENV=development
GEMINI_API_KEY=your-gemini-api-key-here
CORS_ORIGIN=http://localhost:9002
```

**microservices/courses/.env**
```env
PORT=4002
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/course-management
ELASTICSEARCH_URL=http://localhost:9200
REDIS_URL=redis://localhost:6379
CORS_ORIGIN=http://localhost:9002
```

### 3. Start Services

```bash
# Start MongoDB (if not running)
mongod

# Start Redis (optional)
redis-server

# Start Elasticsearch (optional)
elasticsearch

# Start microservices
cd microservices/auth && npm run dev &
cd microservices/ai && npm run dev &
cd microservices/courses && npm run dev &

# Start frontend
npm run dev
```

### 4. Access the Application

- Frontend: http://localhost:9002
- Auth Service: http://localhost:4000
- AI Service: http://localhost:4001
- Course Service: http://localhost:4002

## Docker Setup

### Build and Run with Docker

```bash
# Build all microservices
cd microservices/auth && docker build -t auth-ms .
cd ../ai && docker build -t ai-ms .
cd ../courses && docker build -t courses-ms .

# Run with Docker Compose (create docker-compose.yml)
docker-compose up -d
```

### Docker Compose Example

```yaml
version: '3.8'
services:
  mongodb:
    image: mongo:latest
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db

  redis:
    image: redis:alpine
    ports:
      - "6379:6379"

  elasticsearch:
    image: elasticsearch:8.11.0
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
    ports:
      - "9200:9200"

  auth-ms:
    build: ./microservices/auth
    ports:
      - "4000:4000"
    environment:
      - MONGODB_URI=mongodb://mongodb:27017/auth-service
    depends_on:
      - mongodb

  ai-ms:
    build: ./microservices/ai
    ports:
      - "4001:4001"
    environment:
      - GEMINI_API_KEY=${GEMINI_API_KEY}

  courses-ms:
    build: ./microservices/courses
    ports:
      - "4002:4002"
    environment:
      - MONGODB_URI=mongodb://mongodb:27017/course-management
      - ELASTICSEARCH_URL=http://elasticsearch:9200
      - REDIS_URL=redis://redis:6379
    depends_on:
      - mongodb
      - redis
      - elasticsearch

volumes:
  mongodb_data:
```

## CI/CD Pipeline

### GitHub Actions Workflow

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          npm ci
          cd microservices/auth && npm ci
          cd ../ai && npm ci
          cd ../courses && npm ci
      
      - name: Run tests
        run: |
          npm run test
          cd microservices/auth && npm test
          cd ../ai && npm test
          cd ../courses && npm test
      
      - name: Type check
        run: npm run typecheck

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Build frontend
        run: npm run build
      
      - name: Build microservices
        run: |
          cd microservices/auth && npm run build
          cd ../ai && npm run build
          cd ../courses && npm run build

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Deploy to production
        run: |
          # Deploy to your hosting platform
          # Example: AWS, Google Cloud, Azure, etc.
```

### Pipeline Stages

1. **Code Commit**: Developer pushes code to repository
2. **Build**: Compile TypeScript, install dependencies
3. **Test**: Run unit tests, integration tests, linting
4. **Deploy**: Deploy to staging/production environments
5. **Monitor**: Health checks, performance monitoring

## Linux Hosting Considerations

### Process Management with PM2

```bash
# Install PM2
npm install -g pm2

# Create ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [
    {
      name: 'auth-ms',
      script: './microservices/auth/dist/index.js',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 4000
      }
    },
    {
      name: 'ai-ms',
      script: './microservices/ai/dist/index.js',
      instances: 1,
      env: {
        NODE_ENV: 'production',
        PORT: 4001
      }
    },
    {
      name: 'courses-ms',
      script: './microservices/courses/dist/index.js',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 4002
      }
    }
  ]
};
EOF

# Start applications
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Nginx Reverse Proxy Configuration

```nginx
upstream auth_backend {
    server localhost:4000;
}

upstream ai_backend {
    server localhost:4001;
}

upstream courses_backend {
    server localhost:4002;
}

server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:9002;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Auth microservice
    location /auth/ {
        proxy_pass http://auth_backend/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # AI microservice
    location /ai/ {
        proxy_pass http://ai_backend/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Courses microservice
    location /courses/ {
        proxy_pass http://courses_backend/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Environment Variables for Production

```bash
# Production environment variables
export NODE_ENV=production
export REDIS_URL=redis://your-redis-host:6379
export ELASTICSEARCH_URL=http://your-elasticsearch-host:9200
export GEMINI_API_KEY=your-production-gemini-api-key
export JWT_SECRET=your-super-secure-jwt-secret
```

## API Documentation

### Authentication Microservice (Port 4000)

- `POST /auth/register` - Admin registration
- `POST /auth/login` - Admin login
- `GET /auth/admin-only` - Protected route (requires JWT)

### AI Recommendations Microservice (Port 4001)

- `POST /api/recommendations` - Get AI course recommendations

### Course Management Microservice (Port 4002)

- `POST /api/courses/upload` - Upload CSV file
- `GET /api/courses/search` - Search courses
- `GET /api/courses` - Get all courses
- `GET /api/courses/:id` - Get course by ID

## Testing

```bash
# Run all tests
npm test

# Run specific microservice tests
cd microservices/auth && npm test
cd ../ai && npm test
cd ../courses && npm test

# Run frontend tests
npm run test:frontend
```

## Monitoring and Logging

### Health Checks

```javascript
// Health check endpoints for each microservice
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});
```

### Logging Strategy

- Use structured logging (JSON format)
- Centralized logging with ELK stack
- Error tracking with Sentry
- Performance monitoring with New Relic

## Security Considerations

1. **JWT Security**: Use strong secrets, implement refresh tokens
2. **CORS Configuration**: Restrict origins in production
3. **Rate Limiting**: Implement rate limiting for API endpoints
4. **Input Validation**: Validate all inputs with Zod schemas
5. **Environment Variables**: Never commit secrets to version control
6. **HTTPS**: Use SSL/TLS in production
7. **Database Security**: Use connection strings with authentication

## Performance Optimization

1. **Caching Strategy**: Redis for server-side, Zustand for client-side
2. **Database Indexing**: Proper MongoDB indexes for queries
3. **Elasticsearch**: Full-text search optimization
4. **CDN**: Use CDN for static assets
5. **Compression**: Enable gzip compression
6. **Connection Pooling**: Optimize database connections

## Troubleshooting

### Common Issues

1. **Microservice Connection Issues**: Check environment variables and network connectivity
2. **MongoDB Connection**: Verify MongoDB is running and accessible
3. **Redis/Elasticsearch**: Check if services are running (optional services)
4. **CORS Errors**: Verify CORS configuration matches frontend URL
5. **JWT Issues**: Check JWT secret and expiry settings

### Debug Commands

```bash
# Check microservice status
curl http://localhost:4000/
curl http://localhost:4001/
curl http://localhost:4002/

# Check database connections
mongo --eval "db.adminCommand('ismaster')"

# Check Redis
redis-cli ping

# Check Elasticsearch
curl http://localhost:9200/_cluster/health
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

This project is licensed under the MIT License.