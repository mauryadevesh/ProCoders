# Frontend - SmartPrep AI

This folder contains the React + Vite frontend for SmartPrep AI.

For full project documentation (features, architecture, APIs, setup, and PRD/PDR), see the root README:

- `../README.md`

## Quick Start

```powershell
npm install
npm run dev
```

## Available Scripts

- `npm run dev` - start Vite development server.
- `npm run lint` - run ESLint checks.
- `npm run build` - generate production build.
- `npm run preview` - preview the production build locally.

## Frontend Notes

- Calls backend at `http://localhost:8000` via `src/api.js`.
- Main UI logic is in `src/App.jsx` and `src/quiz.jsx`.
- Styling and animation layers are in `src/App.css` and `src/index.css`.
