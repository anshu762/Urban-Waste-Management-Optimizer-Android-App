# Urban Waste Management Optimizer

Phase 5 complete - App is MVP ready.

Urban Waste Management Optimizer is a full-stack pilot-ready MVP for resident waste logging, missed pickup complaints, admin dashboards, route planning, push notifications, and mock IoT bin monitoring.

## Tech Stack

- Backend: Node.js, Express, TypeScript, Prisma, NeonDB
- Mobile: React Native, Expo, NativeWind, Zustand, React Query
- Push notifications: Expo Push Notifications HTTP API
- AI/model integration: Gemini Flash

## Setup

### 1. Clone and install

```bash
git clone <repo-url>
cd waste-optimizer-workspace
cd backend
npm install
cd ../mobile
pnpm install
```

### 2. Backend environment

Create `backend/.env`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST/neondb?sslmode=require"
JWT_SECRET="replace-with-a-strong-secret"
PORT=3000
NODE_ENV=development
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""
```

### 3. Prisma

```bash
cd backend
npx prisma generate
npx prisma migrate dev
```

If your NeonDB already has schema drift from a prior demo database, resolve the drift first or use a safe non-destructive sync for local pilot testing:

```bash
npx prisma db push
```

### 4. Run backend

```bash
cd backend
npm run dev
```

The API runs at `http://localhost:3000/api/v1`.

### 5. Mobile environment

Update `mobile/src/config/api.config.ts` so native devices point at your machine's LAN IP:

```ts
export const API_URL = Platform.OS === 'web'
  ? 'http://localhost:3000/api/v1'
  : 'http://YOUR_LAN_IP:3000/api/v1';
```

### 6. Run mobile

```bash
cd mobile
pnpm start
```

Use Expo Go or a development build. Push notification testing requires a physical device.

## Phase 5 Features

- Expo push token registration via `PUT /me/push-token`
- Dedicated server-side Expo push service with 100-token batching
- Resident, admin, driver notification flows
- Daily pickup reminder scheduling at 8 PM
- Mock IoT sensor ingest and admin demo generation
- Admin IoT dashboard with 30-second refresh
- Resident bin status card
- Loading, empty, and error states for API-driven screens
- Resident and admin bottom tab navigation
- Admin dashboard CSV export and sharing
- Logout clears auth storage and React Query cache

## Useful Endpoints

- `PUT /api/v1/me/push-token`
- `POST /api/v1/iot/sensor-readings`
- `GET /api/v1/admin/iot/zone/:zoneId`
- `POST /api/v1/admin/iot/mock/:zoneId`
- `GET /api/v1/admin/dashboard/export`
