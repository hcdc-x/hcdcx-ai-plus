# Deployment Guide (Free Tier)

This document provides step‑by‑step instructions to deploy the entire HCDC-X AI+ platform using **only free services**. Follow the sections below for each component.

---

## 📋 Overview

| Component          | Platform               | Free Tier Limits                                      |
|--------------------|------------------------|-------------------------------------------------------|
| Frontend           | Netlify                | 100 GB bandwidth / month, unlimited sites             |
| Backend            | Railway                | 0.5 GB RAM, shared CPU, no cron                       |
| Database           | MongoDB Atlas          | 512 MB storage (M0 cluster)                           |
| File Storage       | Supabase Storage       | 1 GB storage, 2 GB bandwidth                          |
| Image CDN          | Cloudinary             | 25 GB storage / month, automatic optimization         |
| AI Inference       | Hugging Face Spaces    | CPU only, community GPU optional                      |
| Monitoring         | Sentry                 | 5k errors / month                                     |
| Maps               | Mapbox GL JS           | 50k map loads / month                                 |
| Email              | Resend                 | 100 emails / day                                      |
| IP Geolocation     | ip‑api.com             | Unlimited (non‑commercial), no API key                |

---

## 🔧 Prerequisites

- A [GitHub](https://github.com) account.
- Accounts on all platforms listed above (free registration).
- Node.js 20+ and npm installed locally (for testing).
- Git installed locally.

---

## 1. GitHub Repository Setup

1. Create a new repository on GitHub: **`hcdcx-ai-plus`**.
2. Clone the repository to your local machine:
   ```bash
   git clone https://github.com/hcdc-x/hcdcx-ai-plus.git
   cd hcdcx-ai-plus
   ```
3. Copy the project files into the repository.
4. Push the initial code:
   ```bash
   git add .
   git commit -m "Initial commit"
   git push -u origin main
   ```

---

## 2. MongoDB Atlas (Database)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and sign up / log in.
2. Create a **Shared Cluster** (M0 free tier).
   - Choose your preferred cloud provider and region (pick one close to Railway's region `us-west1` or `eu-west1`).
3. Once the cluster is created, click **"Connect"**.
4. Add a **database user**:
   - Username: `hcdcx_admin`
   - Password: generate a strong password (save it securely).
5. Add your IP address to the **IP Access List**:
   - For Railway, you need to allow all IPs temporarily: `0.0.0.0/0`
   - *Later you can restrict to Railway's static IP if you upgrade.*
6. Choose **"Connect your application"** and copy the connection string.
   - Replace `<password>` with your actual password.
   - Example: `mongodb+srv://hcdcx_admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`
7. Save this URI – you'll need it later.

---

## 3. Supabase (File Storage)

1. Sign up at [Supabase](https://supabase.com).
2. Create a new project:
   - Name: `hcdcx-storage`
   - Database password: generate and save.
   - Region: choose the one closest to your users.
3. After creation, go to **Storage** → **New bucket**:
   - Name: `hcdcx-codes` (for generated hybrid code PNGs)
   - Public bucket: **Yes** (so images can be displayed without authentication)
4. Create a second bucket: `hcdcx-avatars` (optional).
5. Go to **Project Settings** → **API**.
   - Copy the **Project URL** and **`anon` public key**.
   - Also copy the **`service_role` secret** (keep this private – it goes into backend env).
6. Save these values.

---

## 4. Cloudinary (Image Optimization)

1. Sign up at [Cloudinary](https://cloudinary.com).
2. After login, you'll see your **Cloud Name**, **API Key**, and **API Secret**.
3. Go to **Settings** → **Security** and enable **"Unsigned uploading"** if you plan to upload directly from the frontend.
4. Create an **Upload Preset** (optional, for frontend uploads):
   - Name: `hcdcx_unsigned`
   - Signing Mode: **Unsigned**
   - Folder: `hcdcx-codes/`
5. Save the `CLOUDINARY_URL` in the format:
   ```
   cloudinary://API_KEY:API_SECRET@CLOUD_NAME
   ```

---

## 5. Hugging Face Spaces (AI Vision)

1. Go to [Hugging Face Spaces](https://huggingface.co/spaces) and create a new Space.
2. Choose **Gradio** as the SDK.
3. Name it `hcdcx-vision`.
4. In the Space repository, create an `app.py` file with your image enhancement logic.
5. Example minimal `app.py`:
   ```python
   import gradio as gr
   import cv2
   import numpy as np

   def enhance_image(img):
       # Your enhancement code here
       return img

   iface = gr.Interface(fn=enhance_image, inputs="image", outputs="image")
   iface.launch()
   ```
6. After deployment, note the Space URL: `https://hcdc-x-hcdcx-vision.hf.space`
7. This URL will be used in the backend as `HF_SPACE_URL`.

---

## 6. Railway (Backend Deployment)

1. Sign up at [Railway](https://railway.app) (use GitHub login).
2. Click **"New Project"** → **"Deploy from GitHub repo"**.
3. Connect your GitHub account and select `hcdc-x/hcdcx-ai-plus`.
4. Railway will automatically detect the Node.js project (ensure `backend/` contains a `package.json`).
5. **Set the root directory**: Under project settings, set **Root Directory** to `backend/`.
6. **Add Environment Variables** (Service → Variables):

   ```
   NODE_ENV=production
   PORT=8080
   MONGODB_URI=mongodb+srv://hcdcx_admin:password@cluster0.xxxxx.mongodb.net/hcdcx
   JWT_SECRET=<generate 64 char random string>
   JWT_REFRESH_SECRET=<generate another 64 char random string>
   TOTP_ISSUER=HCDCX-AI
   CLOUDINARY_URL=cloudinary://API_KEY:API_SECRET@CLOUD_NAME
   SUPABASE_URL=https://xxxxx.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=<service_role key>
   RESEND_API_KEY=re_xxxxx
   HF_SPACE_URL=https://hcdc-x-hcdcx-vision.hf.space
   SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
   ```

7. Generate secure JWT secrets using:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

8. **Deploy**: Railway will automatically build and deploy on each push to `main`.

9. After deployment, note the generated URL: `https://hcdcx-api.railway.app`

---

## 7. Netlify (Frontend Deployment)

1. Sign up at [Netlify](https://netlify.com).
2. Click **"Import from Git"** → **GitHub** → select `hcdcx-ai-plus`.
3. Configure build settings:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build` (or `next build` if using Next.js)
   - **Publish directory**: `.next` (or `out` for static export)
4. **Add Environment Variables** (Site settings → Environment variables):

   ```
   NEXT_PUBLIC_API_URL=https://hcdcx-api.railway.app
   NEXT_PUBLIC_WS_URL=wss://hcdcx-api.railway.app
   NEXT_PUBLIC_MAPBOX_TOKEN=pk.xxxxx
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```

5. Deploy! Netlify will provide a URL like `https://hcdcx-ai.netlify.app`.

6. (Optional) Set up a custom domain in **Domain Management**.

---

## 8. Mapbox (Maps & Heatmap)

1. Register at [Mapbox](https://account.mapbox.com).
2. Create a new **Access Token** with default public scopes.
3. Copy the token and add it to:
   - Frontend environment variable: `NEXT_PUBLIC_MAPBOX_TOKEN`
4. In your frontend code, use `react-map-gl` or `mapbox-gl` and pass the token.

---

## 9. Resend (Email Service)

1. Sign up at [Resend](https://resend.com).
2. Verify your domain (or use the provided test domain for development).
3. Create an **API Key** and copy it.
4. Add to backend environment variable: `RESEND_API_KEY`

---

## 10. Sentry (Error Monitoring)

1. Sign up at [Sentry](https://sentry.io).
2. Create a new project → **Next.js**.
3. Follow the setup wizard to install `@sentry/nextjs`.
4. After setup, you'll get a **DSN**.
5. Add to both frontend and backend environment variables as `SENTRY_DSN`.

---

## 11. IP Geolocation (ip-api.com)

This service requires **no API key**. In your backend code, simply make a request to:
```
http://ip-api.com/json/{ip_address}?fields=status,country,regionName,city,lat,lon
```
No environment variable needed.

---

## 12. Mobile App (Flutter + Firebase)

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com).
2. Register your Android/iOS app.
3. Enable **Authentication** → Email/Password.
4. Enable **Firestore Database** in test mode.
5. Download `google-services.json` (Android) or `GoogleService-Info.plist` (iOS) and place in the respective folders.
6. Build and distribute your app.

---

## 🚨 Troubleshooting

### Backend not starting on Railway
- Check logs in Railway dashboard.
- Ensure `MONGODB_URI` is correctly formatted and network access is allowed (`0.0.0.0/0`).
- Verify all required environment variables are set.

### Frontend cannot connect to API
- Confirm `NEXT_PUBLIC_API_URL` uses HTTPS.
- Check CORS settings in backend (allow Netlify origin).
- Ensure Railway service is not sleeping (free tier may hibernate after inactivity).

### WebSocket connection fails
- Verify `NEXT_PUBLIC_WS_URL` uses `wss://` protocol.
- In backend, ensure Socket.IO is attached to the same HTTP server and CORS allows the frontend origin.

### Cloudinary upload fails
- Check if "Unsigned uploading" is enabled.
- Ensure the upload preset exists and is correctly named.

### AI Vision endpoint times out
- Hugging Face Spaces on CPU can be slow; consider optimizing the model or reducing image size.

---

## 🔄 Continuous Deployment

Both Netlify and Railway automatically deploy on `git push` to the `main` branch.

- **Frontend**: Netlify builds on every push.
- **Backend**: Railway rebuilds on every push.

To prevent accidental broken deployments, you can set up **GitHub Actions** to run tests before merging.

---

## ✅ Post‑Deployment Checklist

- [ ] Register a test user and log in.
- [ ] Generate a hybrid code and download the PNG.
- [ ] Scan the code using the web scanner (or mobile app).
- [ ] Verify that the scan appears in the real‑time feed.
- [ ] Check the analytics dashboard for charts and heatmap.
- [ ] Confirm Sentry is receiving errors (trigger a test error).
- [ ] Test email sending (e.g., password reset or OTP email).

---

## 📞 Support

If you encounter issues not covered here, please open an issue on GitHub:
[https://github.com/hcdc-x/hcdcx-ai-plus/issues](https://github.com/hcdc-x/hcdcx-ai-plus/issues)

---

*Happy deploying! 🚀*
