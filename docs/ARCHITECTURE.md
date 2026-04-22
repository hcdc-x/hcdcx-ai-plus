# HCDC-X AI+ Architecture

## System Overview

HCDC-X AI+ is a full-stack platform designed for generating, scanning, and analyzing hybrid codes (QR + Barcode + RGB layers) with AI-powered security and real-time analytics.

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Applications                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────────────┐  │
│  │ Next.js  │  │ Flutter  │  │ Third-party Integrations │  │
│  │   Web    │  │  Mobile  │  │   (REST API consumers)    │  │
│  └────┬─────┘  └────┬─────┘  └────────────┬─────────────┘  │
└───────┼────────────┼──────────────────────┼────────────────┘
        │            │                      │
        ▼            ▼                      ▼
┌─────────────────────────────────────────────────────────────┐
│                       API Gateway                            │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Express.js + Socket.IO (WebSocket) + Rate Limiting    │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────┬───────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌───────────────┐   ┌─────────────────┐   ┌─────────────────┐
│   MongoDB     │   │   Cloudinary    │   │  Supabase       │
│   (Atlas)     │   │  (Image CDN)    │   │  (File Storage) │
└───────────────┘   └─────────────────┘   └─────────────────┘
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  External APIs  │
                    │  - ip-api.com   │
                    │  - Hugging Face │
                    │  - Resend       │
                    └─────────────────┘
```

## Core Components

### 1. Frontend (Next.js)
- **Pages**: Landing, Auth, Dashboard, Generator, Scanner, Analytics
- **State Management**: React Context + Custom Hooks
- **Real-time**: Socket.IO client
- **UI**: Tailwind CSS + Framer Motion + Three.js
- **Deployment**: Netlify

### 2. Backend (Node.js + Express)
- **Authentication**: JWT with refresh tokens, TOTP 2FA
- **Hybrid Encoder**: QR + Barcode + RGB color layers
- **Security Service**: Risk scoring (0-100), anomaly detection
- **Analytics Service**: Aggregation pipelines for scan data
- **WebSocket**: Real-time scan feed and alerts
- **Deployment**: Railway

### 3. Mobile App (Flutter)
- **Platforms**: iOS, Android
- **Features**: Camera scanning, Dashboard, Analytics view
- **State**: Provider pattern
- **Real-time**: socket_io_client

### 4. AI Vision Service (Python)
- **Framework**: Gradio (Hugging Face Spaces)
- **Processing**: OpenCV denoising, CLAHE, sharpening
- **Integration**: REST API called by backend before decoding

### 5. Database (MongoDB)
- **Collections**: Users, Codes, ScanLogs, Tokens, RiskLogs
- **Indexes**: Optimized for time-series and user-based queries
- **TTL**: Automatic cleanup of expired tokens/dynamic codes

## Data Flow

### Code Generation
1. User submits form → Frontend → POST `/api/codes/generate`
2. Backend `hybridEncoder` creates multi-layer image
3. Image uploaded to Cloudinary
4. Metadata stored in MongoDB
5. Response returned to frontend

### Code Scanning
1. Camera captures frame → Frontend extracts raw data
2. POST `/api/scans/verify` with decoded string
3. Backend `securityService` calculates risk score
4. Scan logged, WebSocket event emitted
5. Response includes validation result and data

### Real-time Updates
- Socket.IO rooms per user/code
- New scans broadcast to dashboard subscribers
- Security alerts pushed immediately

## Security Model
- **Zero-trust**: Every request authenticated and risk-assessed
- **Risk scoring**: Location, velocity, device, time, IP reputation
- **OTP**: TOTP (RFC 6238) for 2FA
- **Anti-counterfeit**: Color layer checksums in hybrid codes
