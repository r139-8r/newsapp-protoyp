# NewsForge — Production Deployment Guide (₹0 Budget)

This guide provides step-by-step instructions for deploying and testing the NewsForge prototype in a production-like environment using completely free-tier services.

---

## 1. Database Setup (NeonDB Serverless Postgres)

NewsForge uses PostgreSQL-specific JSONB and ARRAY types, making NeonDB the perfect free-tier hosting candidate.

1. Go to [NeonDB](https://neon.tech/) and sign up for a free account.
2. Create a new project named `newsforge`.
3. In the Neon Console dashboard, locate your connection string (ensure it uses the pooled option for Serverless environments: ending in `-pooler` or standard connection string).
4. Select `sqlalchemy` or `.env` format from the drop-down. It will look like this:
   `postgresql://alex:xxxx@ep-cool-water-1234-pooler.us-east-2.neon.tech/neondb?sslmode=require`
5. Keep this database URL safe — we will insert it in our HuggingFace Space configuration.

---

## 2. Backend API Deployment (HuggingFace Spaces)

HuggingFace Spaces hosts Python web servers for free using Docker. Since image/video rendering is done client-side, the CPU requirements are extremely lightweight.

1. Go to [HuggingFace](https://huggingface.co/) and sign up or log in.
2. Tap **"New Space"**.
3. Configure the Space settings:
   - **Space Name:** `newsforge-api` (or any custom name)
   - **SDK:** `Docker` (Select "Blank" template)
   - **Hardware:** `CPU basic (2 vCPU, 16GB RAM)` — **Free**
   - **Visibility:** `Public` (so client devices can access the API)
4. Go to **Settings** > **Variables and secrets**.
5. Add the following **Secrets** (Environment variables):
   - `DATABASE_URL`: Your NeonDB connection string.
   - `APP_ENV`: `production`
   - `USER_JWT_SECRET`: Generate a random 64-character hex key (e.g. `python -c "import secrets; print(secrets.token_hex(32))"`)
   - `ADMIN_JWT_SECRET`: Generate another random 64-character hex key.
   - **For AI Scripting (configure either Mistral or Groq):**
     - `MISTRAL_API_KEY`: Your Mistral AI API key (enables direct usage of the lightweight `ministral-8b-2512` model).
     - `MISTRAL_MODEL` (Optional): Override the default model (defaults to `ministral-8b-2512`).
     - `GROQ_API_KEY`: Your Groq API key (used if no Mistral key is configured, defaults to `llama-3.1-8b-instant`).
     - `GROQ_MODEL` (Optional): Override the default Groq model (defaults to `llama-3.1-8b-instant`).
   - **For Cloud Storage (Backblaze B2):**
     - `B2_ENDPOINT_URL`: Your B2 S3-compatible endpoint (e.g., `s3.us-west-004.backblazeb2.com`).
     - `B2_ACCESS_KEY_ID`: Your B2 Application Key ID.
     - `B2_SECRET_ACCESS_KEY`: Your B2 Application Key.
     - `B2_BUCKET_NAME`: Your B2 bucket name (e.g., `newsforge-assets`).
     - `B2_PUBLIC_URL`: Optional custom domain CDN or B2 public access URL.
   - **For Cloudflare R2 (Fallback Option):**
     - `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_URL` (S3/Cloudflare R2 storage credentials, optional for initial testing).
6. Clone the repository and push the `/backend` folder to the HuggingFace git remote. HuggingFace will automatically build from the `Dockerfile` and start the server using `start.sh` on port `7860`.
7. Once running, copy your Space URL: `https://<your-username>-newsforge-api.hf.space`.

---

## 3. Frontend Deployment (Vercel)

Both frontends (`/mobile` and `/admin`) are static HTML/CSS/JS websites that can be hosted on Vercel's free tier.

### 3.1 Deploying the Mobile PWA
1. Go to [Vercel](https://vercel.com/) and link your GitHub repository.
2. Deploy a new project and select the root directory `/mobile`.
3. In [mobile/index.html](file:///f:/newsapp/mobile/index.html), verify that the API base URL points to your deployed HuggingFace URL in the fallback block:
   ```javascript
   } else {
     window.NF_API_BASE = 'https://<your-username>-newsforge-api.hf.space';
   }
   ```
4. Click **Deploy**. Vercel will build and host your app with HSTS and SSL enabled.
5. Retrieve the deployment URL (e.g. `https://newsforge-mobile.vercel.app`).

### 3.2 Testing the PWA on physical devices
1. Open the Vercel mobile app URL in Google Chrome or Safari on your personal Android or iOS phone.
2. In the browser menu, tap **"Add to Home Screen"**.
3. Open the newly added icon from your phone home screen.
4. The PWA will run full-screen as a standalone application, exactly like the final Capacitor APK shell, so you can test camera inputs, responsiveness, and AI services.

### 3.3 Deploying the Admin Dashboard
1. Deploy another project on Vercel and select the root directory `/admin`.
2. In [admin/index.html](file:///f:/newsapp/admin/index.html), verify that the API base URL fallback block points to your deployed HuggingFace Space URL.
3. Click **Deploy** to get the live dashboard url (e.g. `https://newsforge-admin.vercel.app`).
4. Access the dashboard and log in with your seeded credentials:
   - **Email:** `admin@newsforge.app`
   - **Password:** `Admin@123`
