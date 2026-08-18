# CVForge Frontend

A modern, high-performance web application frontend for **CVForge**, built using **React 18**, **Vite**, **TypeScript**, and **Tailwind CSS**.

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Prerequisites](#-prerequisites)
- [Step-by-Step Installation & Setup](#-step-by-step-installation--setup)
  - [1. Navigate to Project Directory](#1-navigate-to-project-directory)
  - [2. Install Dependencies](#2-install-dependencies)
  - [3. Configure Environment Variables](#3-configure-environment-variables)
  - [4. Start Development Server](#4-start-development-server)
- [Available Scripts](#-available-scripts)
- [Project Architecture & Directory Structure](#-project-architecture--directory-structure)
- [Environment Configuration](#-environment-configuration)
- [Building for Production](#-building-for-production)
- [Troubleshooting](#-troubleshooting)

---

## 🚀 Overview

CVForge Frontend provides a responsive user interface with role-based navigation, dashboard views, dynamic data management, and seamless backend integration.

### Core Tech Stack
- **Framework**: React 18
- **Build Tool**: Vite 5
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS v4 & Lucide Icons
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Routing**: React Router v7

---

## 🛠 Prerequisites

Ensure you have the following installed on your machine before getting started:

- **Node.js**: `v18.0.0` or higher (Recommended: `v20.x` LTS)
  - Verify installation: `node -v`
- **Package Manager**: `npm` (v9+ included with Node.js) or `yarn` / `pnpm` / `bun`
  - Verify installation: `npm -v`

---

## ⚙️ Step-by-Step Installation & Setup

Follow these steps to set up and run the project on your local environment:

### 1. Navigate to Project Directory

Open your terminal and navigate to the project directory:

```bash
cd CVForge_frontend
```

### 2. Install Dependencies

Install all necessary node modules using `npm`:

```bash
npm install
```

*(Optional)* If using yarn or pnpm:
```bash
yarn install
# or
pnpm install
```

### 3. Configure Environment Variables

Create a local environment file `.env` by copying the `.env.example` file:

```bash
cp .env.example .env
```

Open `.env` in your code editor and update the API base URL to point to your running backend service:

```env
VITE_API_URL=http://localhost:8001/api/v1
```

### 4. Start Development Server

Run the development server with Hot Module Replacement (HMR):

```bash
npm run dev
```

The application will start and output the local URL:
```text
  VITE v5.3.4  ready in 250 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.x.x:5173/
```

Open your browser and navigate to **`http://localhost:5173`**.

---

## 📜 Available Scripts

In the project directory, you can run:

| Command | Description |
| :--- | :--- |
| `npm run dev` | Runs the Vite development server locally at `http://localhost:5173`. |
| `npm run build` | Compiles TypeScript and builds production-ready static assets in `dist/`. |
| `npm run typecheck` | Runs `tsc --noEmit` to validate TypeScript types across the project. |
| `npm run preview` | Runs a local web server to preview the production build in `dist/`. |

---

## 📂 Project Architecture & Directory Structure

```text
CVForge_frontend/
├── public/                 # Static assets (favicons, images, public resources)
├── src/
│   ├── app/                # Application layer setup
│   │   ├── api/            # API client configuration & endpoints
│   │   ├── layouts/        # Page layouts (Main layout, Auth layout)
│   │   ├── menu/           # Navigation menu definitions & permissions
│   │   ├── providers/      # React context providers & application wrappers
│   │   └── routes/         # Router configuration & route guards
│   ├── features/           # Feature-specific modules (Dashboards, Excel, etc.)
│   ├── shared/             # Shared & reusable application assets
│   │   ├── lib/            # Utilities, storage handlers, and helpers
│   │   ├── nav/            # Navigation components (Sidebar, TopNav)
│   │   ├── pages/          # Shared generic pages (NotFound, Unauthorized)
│   │   ├── theme/          # Design system & theme configurations
│   │   └── ui/             # Reusable UI component library (Buttons, Modals, Toasts)
│   ├── index.css           # Global Tailwind CSS styles
│   └── main.tsx            # Application entry point
├── .env.example            # Template for environment variables
├── .gitignore              # Git ignored paths
├── index.html              # Main HTML entry file
├── package.json            # Dependencies and scripts configuration
├── tsconfig.json           # TypeScript configuration
└── vite.config.ts          # Vite build configuration
```

---

## 🌐 Environment Configuration

The application relies on environment variables defined in `.env` (or `.env.local`):

| Variable Name | Required | Default Value | Description |
| :--- | :--- | :--- | :--- |
| `VITE_API_URL` | No | `http://localhost:8001/api/v1` | Base URL of the backend API server. |

> **Note:** Vite exposes environment variables prefixed with `VITE_` to your client-side code via `import.meta.env`.

---

## 📦 Building for Production

To create an optimized production build:

1. **Verify TypeScript Types**:
   ```bash
   npm run typecheck
   ```

2. **Generate Build Artifacts**:
   ```bash
   npm run build
   ```
   This will bundle your files and output static assets to the `dist/` directory.

3. **Preview the Production Build Locally**:
   ```bash
   npm run preview
   ```

---

## ❓ Troubleshooting

### Port 5173 is already in use
If port `5173` is occupied, Vite will automatically select the next available port (e.g. `5174`). You can force a custom port by editing `vite.config.ts` or running:
```bash
npx vite --port 3000
```

### API calls failing / CORS errors
- Ensure your backend API server is running on `http://localhost:8001` (or update `VITE_API_URL` in `.env`).
- Verify that your backend allows CORS requests from your frontend origin (`http://localhost:5173`).

### Dependency issues after pulling changes
If you encounter missing module or package errors after pulling updates:
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## 📄 License

Internal project for **CVForge**. All rights reserved.


#test 
