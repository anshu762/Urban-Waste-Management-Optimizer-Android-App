# Urban Waste Management Optimizer

## Phase 1 Complete

The Phase 1 of the application is now complete. It includes the foundational backend setup (Express, Prisma, PostgreSQL, JWT Auth) and mobile app configuration (React Native, NativeWind, Zustand, API config). 

We have successfully implemented:
- Authentication Module (Register, Login, getMe)
- Role-based Profile Management
- Zone API integration
- Mobile Auth UI & Onboarding flow

### cURL Examples

#### Register a new user
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "RESIDENT"
  }'
```

#### Login
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```
