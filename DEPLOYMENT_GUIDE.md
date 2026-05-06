# DreamDecorators Production Deployment Guide

## ✅ Completed Configuration Updates

### Frontend (Vercel - https://dreamdecorators.vercel.app/)

1. **Environment Setup**
   - `.env.example` - Updated with clear development/production examples
   - `.env.production.local` - Created with production API URL
   - `src/services/api.js` - Already configured to use `VITE_API_URL` environment variable

2. **API Configuration**
   ```javascript
   // API is configured to read from VITE_API_URL
   baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
   ```

3. **Vercel Deployment**
   - Build command: `npm run build`
   - Output directory: `dist/`
   - Environment variable to set in Vercel dashboard:
     ```
     VITE_API_URL=https://dreamdecorators-production.up.railway.app/api
     ```

---

### Backend (Railway - https://dreamdecorators-production.up.railway.app/api)

1. **Security Settings Updated**
   - `DEBUG = False` (environment controlled)
   - `ALLOWED_HOSTS` (environment controlled)
   - `SECRET_KEY` (environment controlled)

2. **CORS Configuration**
   - ✅ Allows `https://dreamdecorators.vercel.app`
   - ✅ Allows any subdomain on `*.vercel.app` (regex pattern)
   - ✅ Allows localhost for development

3. **Environment Variables for Railway**
   Add these in Railway dashboard environment settings:
   ```
   DEBUG=False
   SECRET_KEY=<your-secret-key-here>
   ALLOWED_HOSTS=dreamdecorators-production.up.railway.app
   DB_NAME=dreamdecorators_db
   DB_USER=<railway-mysql-user>
   DB_PASSWORD=<railway-mysql-password>
   DB_HOST=<railway-mysql-host>
   DB_PORT=3306
   FRONTEND_URL=https://dreamdecorators.vercel.app
   ```

---

## 📋 Deployment Checklist

### Before Pushing to GitHub

- [ ] `.env` files are in `.gitignore` (already configured)
- [ ] No hardcoded localhost URLs (verified ✓)
- [ ] API endpoints use environment variables (verified ✓)

### Railway Backend Setup

1. Connect your GitHub repository
2. Set all environment variables in Railway dashboard
3. Configure MySQL database connection
4. Deploy and test API endpoints

### Vercel Frontend Setup

1. Connect your GitHub repository  
2. Set `VITE_API_URL` in environment variables
3. Deploy (Vercel auto-detects Vite setup)
4. Test API calls to Railway backend

---

## 🔧 Local Development

Run your development server with:

```bash
# Frontend
cd frontend
npm install
npm run dev

# Backend (in new terminal)
cd backend
python manage.py runserver
```

Frontend will use `http://localhost:8000/api` (fallback) or your local `.env.local` setting.

---

## 🌐 API Endpoints

All endpoints use the `/api/` prefix:
- Dashboard: `GET /api/dashboard/`
- Projects: `GET|POST /api/projects/`
- Items: `GET|POST /api/projects/{id}/items/`
- Reference Data: `GET /api/typologies/`, `/api/glass-types/`, etc.

---

## ✨ Key Files Modified

- `/backend/dreamdecorators_project/settings.py` - Production config
- `/frontend/.env.example` - Environment template
- `/frontend/.env.production.local` - Production variables
- `/backend/.env.production` - Backend production template
- `/.gitignore` - Sensitive file protection

All files are ready for production deployment! 🚀
