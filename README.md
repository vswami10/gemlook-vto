# GemLook Pro - Virtual Jewelry Try-On

Production-ready React + Vite scaffold for an on-device jewelry virtual try-on application.

## Features

- React + Vite frontend
- Webcam-based virtual try-on
- MediaPipe FaceMesh earrings placement
- MediaPipe BlazePose shoulder-based necklace draping
- Auto-scaling necklace based on shoulder width
- Manual fit sliders
- Cart and wishlist using browser local storage
- Shareable look URL
- Snapshot download
- PWA manifest and service worker
- Azure Static Web Apps configuration

## Run locally

```bash
npm install
npm run dev
```

Open the local URL in Chrome or Edge and allow camera permission.

## Production build

```bash
npm run build
npm run preview
```

## Azure Static Web Apps deployment

1. Push this folder to GitHub.
2. Create Azure Static Web App.
3. Select framework: React.
4. App location: `/`
5. Output location: `dist`
6. Build command: `npm run build`

## Notes

- Camera access requires HTTPS in production.
- MediaPipe scripts are loaded from jsDelivr CDN in `index.html`.
- For production commerce, replace the static catalog in `src/services/catalog.js` with APIs backed by Azure Functions, Azure Blob Storage and PostgreSQL.
- Use transparent PNG jewelry assets for best results.
