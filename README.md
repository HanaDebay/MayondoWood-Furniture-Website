# Mayondo Wood & Furniture Website

This repository contains a separated frontend and backend application for a furniture inventory and sales system.

## About The System

Mayondo Wood & Furniture (MWF) is a B2B business; this repository provides a web application split into a Vue 3/Vite frontend and a Node.js/Express API backed by MongoDB. The system is designed for role-based access so staff and managers can work from a single source of truth for inventory, sales, and reporting.

## Project Structure

- `backend/` — Node.js + Express + MongoDB API
- `frontend/` — Vue 3 + Vite frontend app

## What The System Does

The application centralizes stock and sales data for timber and finished furniture, enables staff to record purchases and sales (including optional transport charges), captures receipt and payment details, and provides managers with aggregated reports and oversight to support business decisions.

## Setup

### 1. Install dependencies

```bash
cd backend
npm install

cd ../frontend
npm install
```

### 2. Configure environment variables

Copy the sample env file in the backend folder:

```bash
cd backend
copy .env.example .env
```

Then update `.env` with your actual values:

- `DATABASE` — MongoDB connection string
- `SESSION_SECRET` — random secret for sessions
- `FRONTEND_URL` — frontend origin (e.g. `http://localhost:5173`)
- `NODE_ENV` — `development` or `production`

## Running Locally

### Backend

```bash
cd backend
npm run dev
```

The backend server should start on the port configured in `server.js`.

### Frontend

```bash
cd frontend
npm run dev
```

The frontend dev server should start and connect to the backend API.

## Build

### Frontend production build

```bash
cd frontend
npm run build
```

The built site is generated in `frontend/dist/`.

## Deployment Plan

This repository is already structured correctly for deployment in one repo with two apps.

### Recommended deployment setup

#### Frontend
- Deploy `frontend/` as a static/Vite app on platforms like:
  - Vercel
  - Netlify
  - Cloudflare Pages
- Build command: `npm install && npm run build`
- Publish directory: `dist`

#### Backend
- Deploy `backend/` as a Node API on platforms like:
  - Render
  - Railway
  - Fly.io
  - Heroku
- Build command: `npm install`
- Start command: `npm start` or `node server.js`
- Set environment variables in the deployment dashboard.

### Environment variables for deployment

- `DATABASE`
- `SESSION_SECRET`
- `FRONTEND_URL`
- Any additional secrets used by the app

The frontend uses Vercel rewrites to forward `/api` requests to the Render backend, so no separate frontend API base URL is required in production.

## Git

A `.gitignore` file has been created in the root to exclude:

- `node_modules/`
- `frontend/dist/`
- `.env`
- `backend/uploads/`
- editor files and logs

