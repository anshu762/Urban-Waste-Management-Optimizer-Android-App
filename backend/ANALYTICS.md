# Smart Insights & Analytics Module

This document explains the Simplified AI and Analytics logic implemented in the Urban Waste Management Optimizer. 

The current implementation relies on a **rules-based approach** using pure TypeScript and raw SQL queries (via Prisma) to generate insights from existing operational data. This avoids the complexity and overhead of dedicated ML models for the MVP stage, while still providing valuable actionable intelligence.

## 1. Pickup Demand Estimation
**Goal:** Predict the volume of waste logs that will be generated tomorrow.
**Logic:**
- Calculates the average number of logs per weekday over the last 30 days.
- Finds the historical average for tomorrow's weekday.
- Adds a 10% buffer and rounds up to the nearest integer.
- Assigns a confidence score based on the volume of data available from the last 14 days (HIGH if >10 days have data, MEDIUM if 5-10 days, LOW if <5).

## 2. Zone Priority Ranking
**Goal:** Rank zones by urgency to help dispatchers allocate resources efficiently.
**Logic:**
Each zone is assigned a `priorityScore` based on the following weighted factors:
- **Open Complaints (weight: 5):** Unresolved missed pickup reports indicate high resident dissatisfaction.
- **Ready Logs (weight: 2):** High volume of pending waste logs waiting for collection.
- **Wet Waste Volume (weight: 3):** Organic waste degrades quickly and poses a health/odor risk if left uncollected.

`Total Score = (Open Complaints × 5) + (Ready Logs × 2) + (Wet Waste × 3)`
Zones are sorted descending by this score.

## 3. Segregation Compliance Trend
**Goal:** Track whether residents are correctly segregating waste.
**Logic:**
- Calculates the compliance rate (% of logs marked as `CORRECT` segregation) for the current week (last 7 days).
- Calculates the rate for the previous week (days 8-14).
- Compares the two to determine the trend:
  - `IMPROVING`: Compliance increased by >5%
  - `DECLINING`: Compliance dropped by >5%
  - `STABLE`: Change is within ±5%

## 4. Inactive Resident Alerts
**Goal:** Identify residents who haven't used the app recently to trigger re-engagement.
**Logic:**
- Scans all active `ResidentProfile` accounts in a zone.
- Checks their most recent `WasteLog`.
- Flags users whose last log is older than 7 days, or who have never logged waste.
- Allows admins to send bulk push notifications to these specific users.

## Future ML Integration

The analytics module is designed to be easily swappable. All heavy lifting is isolated in `analytics.service.ts`. 

To replace the rules-based demand estimation with a real Machine Learning model (e.g., using TensorFlow or an external Python service) in the future:
1. Update `estimateTomorrowDemand()` in `analytics.service.ts` to call your ML inference API.
2. Keep the existing TypeScript interface (returning `zoneId`, `estimatedLogs`, etc.) so the mobile app requires zero changes.
3. The cache mechanism in `analytics-cache.ts` will continue to protect your ML service from being overwhelmed by concurrent dashboard views.
