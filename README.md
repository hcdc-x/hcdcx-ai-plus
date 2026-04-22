# HCDC-X AI+ Platform

[![Netlify](https://img.shields.io/badge/Netlify-Deployed-success?logo=netlify&style=flat-square)](https://hcdcx-ai.netlify.app)
[![Railway](https://img.shields.io/badge/Railway-Deployed-success)](https://hcdcx-api.railway.app)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

**HCDC-X AI+** is a production‑grade intelligent encoding ecosystem featuring a multi‑layer hybrid code system (QR + Barcode + RGB color layers), AI‑powered scanning, adaptive encoding, zero‑trust security, and real‑time analytics — all wrapped in a futuristic, glassmorphism UI.

---

## 🚀 Features

### 🔐 Hybrid Code System
- **Multi‑Layer Encoding** – Combines QR matrix, 1D barcode, and RGB color channels to store up to 3× more data.
- **Dynamic Time‑Based Codes** – Codes refresh every 5–30 seconds for enhanced security.
- **Adaptive Engine** – Automatically adjusts layers, color depth, and density based on data size, device capability, lighting, and network conditions.

### 🤖 AI Vision Engine
- Real‑time image enhancement (denoise, contrast, brightness correction).
- Lighting adaptation and color correction for robust scanning.
- Pattern recognition for QR + barcode using **zxing‑wasm**.
- Smart decoding with Reed‑Solomon error recovery.

### 🛡️ Zero‑Trust Security
- JWT authentication with refresh token rotation.
- Time‑based OTP (TOTP) support (RFC 6238).
- AI‑driven risk scoring (0–100) and behavior analysis.
- Anti‑counterfeit detection for modified/fake codes.
- Real‑time security alerts via WebSocket.

### 📊 Real‑Time Analytics
- Live scan feed with device, location, and timestamp.
- Geographic heatmap (Mapbox GL JS).
- Device distribution charts, time‑based trends.
- Security risk analytics dashboard.

### 📱 Cross‑Platform Mobile App (Flutter)
- Scan hybrid codes with native camera.
- Real‑time sync via WebSocket.
- Login and analytics view on the go.

### 🎨 Futuristic UI/UX
- Dark mode default with neon accents (cyan, blue, purple).
- Glassmorphism cards and hover glow effects.
- Three.js 3D code visualizations.
- Smooth Framer Motion animations.

---

## 🏗️ Tech Stack

| Layer        | Technology                                      |
|--------------|-------------------------------------------------|
| **Frontend** | React 18 + Next.js 14, Tailwind CSS, Three.js, Framer Motion |
| **Backend**  | Node.js + Express, Socket.IO, JWT, OTPLib       |
| **Database** | MongoDB Atlas (primary), Supabase (file storage) |
| **Cache**    | Redis (Railway built‑in)                        |
| **AI/ML**    | TensorFlow.js / OpenCV.js, Hugging Face Spaces  |
| **Storage**  | Cloudinary (image optimization)                 |
| **Monitoring** | Sentry, Winston                                |
| **Mobile**   | Flutter + Firebase                              |
| **Deployment** | Netlify (frontend), Railway (backend), GitHub Actions |

---

## 📁 Repository Structure

```
hcdcx-ai-plus/
├── .env.example
├── .gitignore
├── LICENSE
├── README.md
├── CODE_OF_CONDUCT.md
├── CONTRIBUTING.md
├── DEPLOYMENT.md
├── package.json
├── turbo.json
├── pnpm-workspace.yaml
├── frontend/
│   ├── .env.local.example
│   ├── .eslintrc.json
│   ├── .prettierrc
│   ├── next.config.js
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   ├── public/
│   │   ├── favicon.ico
│   │   └── robots.txt
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── globals.css
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── register/
│   │   │       └── page.tsx
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── generator/
│   │   │   └── page.tsx
│   │   ├── scanner/
│   │   │   └── page.tsx
│   │   └── analytics/
│   │       └── page.tsx
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   └── GlassCard.tsx
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Footer.tsx
│   │   ├── dashboard/
│   │   │   ├── CodeManager.tsx
│   │   │   ├── LiveScanFeed.tsx
│   │   │   └── SecurityPanel.tsx
│   │   ├── generator/
│   │   │   ├── CodeGeneratorForm.tsx
│   │   │   └── HybridCodePreview.tsx
│   │   ├── scanner/
│   │   │   └── CameraScanner.tsx
│   │   └── analytics/
│   │       ├── ScanChart.tsx
│   │       └── GeoHeatmap.tsx
│   └── lib/
│       ├── api/
│       │   ├── client.ts
│       │   ├── auth.ts
│       │   ├── codes.ts
│       │   └── scans.ts
│       ├── hooks/
│       │   ├── useAuth.ts
│       │   ├── useSocket.ts
│       │   └── useScanFeed.ts
│       └── utils/
│           └── cn.ts
├── backend/
│   ├── .env.example
│   ├── .eslintrc.json
│   ├── .prettierrc
│   ├── Dockerfile
│   ├── package.json
│   ├── railway.json
│   ├── server.js
│   └── src/
│       ├── config/
│       │   ├── database.js
│       │   ├── redis.js
│       │   └── cloudinary.js
│       ├── controllers/
│       │   ├── authController.js
│       │   ├── codeController.js
│       │   ├── scanController.js
│       │   └── analyticsController.js
│       ├── models/
│       │   ├── User.js
│       │   ├── Code.js
│       │   ├── ScanLog.js
│       │   ├── Token.js
│       │   └── RiskLog.js
│       ├── services/
│       │   ├── hybridEncoder.js
│       │   ├── securityService.js
│       │   ├── aiVisionService.js
│       │   └── analyticsService.js
│       ├── middleware/
│       │   ├── auth.js
│       │   ├── rateLimit.js
│       │   ├── errorHandler.js
│       │   └── validation.js
│       ├── websocket/
│       │   └── socketHandler.js
│       ├── routes/
│       │   ├── authRoutes.js
│       │   ├── codeRoutes.js
│       │   ├── scanRoutes.js
│       │   └── analyticsRoutes.js
│       └── utils/
│           ├── jwt.js
│           ├── otp.js
│           ├── ipGeolocation.js
│           └── logger.js
├── mobile/
│   ├── .gitignore
│   ├── pubspec.yaml
│   ├── analysis_options.yaml
│   └── lib/
│       ├── main.dart
│       ├── screens/
│       │   ├── login_screen.dart
│       │   ├── dashboard_screen.dart
│       │   ├── scanner_screen.dart
│       │   └── analytics_screen.dart
│       ├── services/
│       │   ├── api_service.dart
│       │   ├── auth_service.dart
│       │   └── socket_service.dart
│       ├── widgets/
│       │   ├── glass_card.dart
│       │   └── scan_overlay.dart
│       └── utils/
│           └── constants.dart
├── ai-vision/
│   ├── app.py
│   ├── requirements.txt
│   ├── Dockerfile
│   └── README.md
├── .github/
│   └── workflows/
│       ├── deploy-backend.yml
│       └── deploy-frontend.yml
├── docs/
│   ├── API.md
│   ├── ARCHITECTURE.md
│   └── SECURITY.md
└── scripts/
    ├── seed-db.js
    └── generate-secret.js
```

## 🛠️ Local Development

### Prerequisites

- Node.js 20+ and npm / yarn / pnpm
- MongoDB (local or Atlas URI)
- Redis (optional for local; Railway includes it)
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/hcdc-x/hcdcx-ai-plus.git
cd hcdcx-ai-plus
```

### 2. Backend Setup

```bash
cd backend
cp .env.example .env
# Fill in your MongoDB URI, JWT secrets, Cloudinary keys, etc.
npm install
npm run dev
```

The API will run at `http://localhost:8080`.

### 3. Frontend Setup

```bash
cd ../frontend
cp .env.example .env.local
# Set NEXT_PUBLIC_API_URL=http://localhost:8080
npm install
npm run dev
```

The web app will be available at `http://localhost:3000`.

### 4. Mobile Setup (Optional)

```bash
cd ../mobile
flutter pub get
flutter run
```

### 5. AI Vision Service (Optional)

```bash
cd ../ai-vision
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

---

## 🌍 Deployment (Free Tier)

All services are hosted **for free** using the following platforms:

| Component      | Platform           | URL / Notes                                      |
|----------------|--------------------|--------------------------------------------------|
| Frontend       | Netlify            | `https://hcdcx-ai.netlify.app`                   |
| Backend        | Railway            | `https://hcdcx-api.railway.app`                  |
| Database       | MongoDB Atlas      | M0 free cluster (512 MB)                         |
| File Storage   | Supabase Storage   | 1 GB free                                        |
| Image CDN      | Cloudinary         | 25 GB free monthly                               |
| AI Inference   | Hugging Face Spaces| CPU‑only free tier                               |
| Monitoring     | Sentry             | 5k errors/month free                             |
| Maps           | Mapbox GL JS       | 50k loads/month free                             |
| Email          | Resend             | 100 emails/day free                              |
| IP Geolocation | ip‑api.com         | No‑key required, free for non‑commercial         |

> Detailed deployment guide: [DEPLOYMENT.md](docs/DEPLOYMENT.md)

---

## 🔑 Environment Variables

### Backend (`.env`)

```env
NODE_ENV=development
PORT=8080
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-64-char-secret
JWT_REFRESH_SECRET=your-64-char-secret
TOTP_ISSUER=HCDCX-AI
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxx
RESEND_API_KEY=re_xxx
HF_SPACE_URL=https://username-space-name.hf.space
SENTRY_DSN=https://xxx@sentry.io/xxx
```

### Frontend (`.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_WS_URL=ws://localhost:8080
NEXT_PUBLIC_MAPBOX_TOKEN=pk.xxx
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=xxx
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
```

---

## 📖 API Documentation

Interactive API documentation is available at `/api-docs` when running the backend.  
Key endpoints:

- `POST /api/auth/register` – User registration  
- `POST /api/auth/login` – JWT login  
- `POST /api/auth/otp/generate` – Generate TOTP secret  
- `POST /api/codes/generate` – Generate hybrid code (QR/Barcode/Hybrid)  
- `GET /api/codes/:id` – Retrieve code details  
- `POST /api/scan/verify` – Verify scanned code (returns risk score)  
- `WS /socket.io` – Real‑time scan feed and security alerts  

---

## 🧪 Testing

```bash
# Backend unit tests
cd backend && npm test

# Frontend unit tests
cd frontend && npm test

# E2E tests (Playwright)
npm run test:e2e
```

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request.

---

## 📄 License

This project is licensed under the MIT License – see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgements

- [QRGB Technology](https://www.qrgb.org/) – inspiration for multi‑channel encoding  
- [zxing-wasm](https://github.com/zxing-wasm/zxing-wasm) – high‑performance barcode scanning  
- [shadcn/ui](https://ui.shadcn.com/) – beautiful, customizable components  
- [Framer Motion](https://www.framer.com/motion/) – production‑ready animations  
- All the amazing open‑source projects that made this possible.

---

## 📬 Contact

- **GitHub Issues**: [https://github.com/hcdc-x/hcdcx-ai-plus/issues](https://github.com/hcdc-x/hcdcx-ai-plus/issues)  
- **Email**: [admin.hcdcx@gmail.com](mailto:admin.hcdcx@gmail.com)  

---

⭐ **Star this repo** if you find it useful!  
Built with ❤️ by the HCDC-X team.
