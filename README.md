
# DreamDecorators — Window & Door Factory Suite

> Full-stack fabrication management system.  
> **Backend:** Django 5 + Django REST Framework + MySQL  
> **Frontend:** React 18 + Vite + Tailwind CSS (Glassmorphism) + Framer Motion

---

## Project Structure

```
dreamdecorators/
├── backend/                         ← Django API server
│   ├── manage.py
│   ├── requirements.txt
│   ├── .env.example
│   ├── dreamdecorators_project/
│   │   ├── settings.py              ← MySQL + CORS configured
│   │   ├── urls.py
│   │   └── wsgi.py
│   └── window_app/
│       ├── models.py                ← All data models
│       ├── serializers.py           ← DRF serializers
│       ├── api_views.py             ← REST ViewSets
│       ├── api_urls.py              ← API routes
│       ├── admin.py
│       ├── calculation_engine.py    ← BOQ & bar optimisation logic
│       ├── report_generators.py     ← PDF & Excel report generation
│       ├── migrations/
│       └── management/commands/
│           └── seed_data.py         ← Seed profiles, typologies, etc.
│
└── frontend/                        ← React application
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── .env.example
    └── src/
        ├── App.jsx                  ← Router (Splash → Factory → Projects)
        ├── main.jsx
        ├── index.css                ← Glassmorphism design system
        ├── pages/
        │   ├── SplashPage.jsx       ← Animated DreamDecorators intro
        │   ├── FactoryPage.jsx      ← Main dashboard
        │   ├── ProjectListPage.jsx  ← All projects with search/filter
        │   ├── ProjectCreatePage.jsx
        │   ├── ProjectDetailPage.jsx ← Items, BOQ preview, reports
        │   └── ProjectEditPage.jsx
        ├── components/
        │   ├── common/              ← Navbar, PageWrapper, StatCard…
        │   ├── projects/            ← ProjectForm, ReportDownloads
        │   ├── items/               ← ItemsTable, AddItemForm (modal)
        │   └── boq/                 ← BOQPanel (live tabbed preview)
        ├── services/api.js          ← Axios API client
        └── utils/helpers.js
```

---

## Quick Start

### 1. MySQL Database Setup

```sql
CREATE DATABASE dreamdecorators_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'dreamuser'@'localhost' IDENTIFIED BY 'yourpassword';
GRANT ALL PRIVILEGES ON dreamdecorators_db.* TO 'dreamuser'@'localhost';
FLUSH PRIVILEGES;
```

---

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
pip install -r requirements.txt
# Edit .env with your MySQL credentials

# Run migrations
pip install -r requirements.txt

# Load seed data (profiles, typologies, glass types, hardware)
python manage.py seed_data

# Create superuser (for Django admin)
python manage.py createsuperuser

# Start backend server
python manage.py runserver
```
cd backend
python -m venv venv
source venv/Scripts/activate
pip install -r requirements.txt
cp .env.exampl .env
python manage.py migrate
python manage.py seed_data
python manage.py createsuperuser
python manage.py runserver

When you reopen laptop / project later:

cd backend
source venv/Scripts/activate
python manage.py runserver

That’s the normal daily start process.



Backend runs at: **http://localhost:8000**  
Admin panel: **http://localhost:8000/admin/**  
API root: **http://localhost:8000/api/**

---

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit if your backend runs on a different port

# Start dev server
npm run dev
```

Frontend runs at: **http://localhost:5173**

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/` | Stats + recent projects |
| GET/POST | `/api/projects/` | List / create projects |
| GET/PUT/DELETE | `/api/projects/:id/` | Project detail |
| PATCH | `/api/projects/:id/status/` | Update status |
| GET | `/api/projects/:id/boq-preview/` | Live BOQ JSON |
| GET | `/api/projects/:id/reports/quotation.pdf` | Quotation PDF |
| GET | `/api/projects/:id/reports/boq.pdf` | BOQ PDF |
| GET | `/api/projects/:id/reports/bar-optimisation.pdf` | Bar opt. PDF |
| GET | `/api/projects/:id/reports/boq.xlsx` | BOQ Excel |
| GET | `/api/projects/:id/reports/bar-optimisation.xlsx` | Bar opt. Excel |
| GET/POST | `/api/projects/:id/items/` | Items list / add |
| GET/PUT/DELETE | `/api/projects/:id/items/:id/` | Item detail |
| GET | `/api/typologies/` | Window/door types |
| GET | `/api/glass-types/` | Glass specifications |
| GET | `/api/finish-types/` | Profile finishes |
| GET | `/api/profiles/` | Profile types |
| GET | `/api/hardware/` | Hardware items |

---

## Features

- **Splash Page** — Animated DreamDecorators intro with glassmorphism, floating orbs, letter-by-letter text animation, and auto-redirect to factory
- **Factory Dashboard** — Stats overview (projects by status, total units), recent projects table, hero banner
- **Project Management** — Full CRUD with customer details, financials (discount, GST), status tracking
- **Window/Door Items** — Add/edit/delete items with typology, glass type, finish, mesh option, quantity
- **Live BOQ Preview** — Real-time tabbed view: Profiles / Hardware / Glass / Bar Optimisation / Summary
- **Report Downloads** — Quotation PDF, BOQ PDF, Bar Optimisation PDF, BOQ Excel, Bar Opt. Excel
- **Bar Optimisation** — First-Fit Decreasing algorithm to minimise aluminium bar waste
- **Glassmorphism UI** — Frosted glass cards, animated backgrounds, gradient accents throughout

---

## Production Build

```bash
# Frontend
cd frontend
npm run build
# Output in frontend/dist/ — serve with nginx or any static host

# Backend
cd backend
python manage.py collectstatic
# Use gunicorn + nginx for production
```

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend framework | React 18 |
| Build tool | Vite 5 |
| Styling | Tailwind CSS 3 (glassmorphism) |
| Animations | Framer Motion 11 |
| Data fetching | TanStack Query v5 |
| HTTP client | Axios |
| Routing | React Router v6 |
| Toast notifications | react-hot-toast |
| Backend framework | Django 5 + DRF |
| Database | MySQL 8 |
| PDF generation | ReportLab |
| Excel generation | openpyxl |
| CORS | django-cors-headers |
