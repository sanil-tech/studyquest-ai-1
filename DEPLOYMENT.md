# StudyQuest Deployment Guide (RC1)

StudyQuest utilizes a bifurcated architecture:
- **Frontend**: A React SPA built with Vite.
- **Backend**: Serverless edge functions and database persistence managed by Base44.

## Pre-Deployment Checklist
1. **Secrets**: Ensure no sensitive data exists in the source code. All secrets MUST be injected via environment variables.
2. **Environment Variables**: Verify `.env.production` is populated on your build server (refer to `.env.example`).
3. **Type Check**: Run `npm run typecheck` to ensure no fatal TypeScript/React errors will break the build.

## Backend Deployment (Base44)
The Base44 schema and edge functions must be deployed *before* the frontend to ensure API compatibility.

1. Authenticate the CLI:
   ```bash
   npx base44 login
   ```
2. Deploy the database schema, configuration, and all edge functions in `base44/functions/`:
   ```bash
   npx base44 deploy --production
   ```
3. Verify that the production URLs provided by the CLI match your frontend's environment variables.

## Frontend Deployment (Vite)
The frontend compiles down to static assets that can be hosted on Vercel, Netlify, or standard Nginx servers.

1. Build the production bundle:
   ```bash
   npm run build
   ```
2. If hosting on a static server, copy the contents of the `dist/` directory to your web root.
3. If using Vercel/Netlify, connect the GitHub repository and set the Build Command to `npm run build` and the Output Directory to `dist`.
4. Ensure you have configured rewrite rules for client-side routing (e.g., redirecting all 404s to `index.html`).

## Post-Deployment Validation
Run the **Pilot Onboarding Drill** (`PilotOnboardingSimulator.jsx`) on the production URL to verify that all systems are successfully communicating.
