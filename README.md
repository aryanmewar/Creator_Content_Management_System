# ContentFlow — Content Management & Scheduling System

A production-ready full-stack CMS built with React + Vite (frontend) and Node.js + Express + MongoDB (backend).

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### 1. Setup Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI
npm install
npm run seed      # Creates default admin user
npm run dev       # Starts on http://localhost:5000
```

Default admin credentials:
- **Email:** admin@cms.com
- **Password:** Admin@1234

### 2. Setup Frontend

```bash
cd frontend
npm install
npm run dev       # Starts on http://localhost:5173
```

---

## 🏗️ Architecture

### Backend — Module-based Clean Architecture
```
backend/src/
├── config/          # DB connection, env loader
├── modules/         # Feature modules (auth, instructors, content, etc.)
│   ├── auth/
│   ├── instructors/
│   ├── content/
│   ├── assignments/
│   ├── schedules/
│   ├── publications/
│   ├── dashboard/
│   └── activityLog/
├── middleware/      # Auth, role, error, upload, validate
├── utils/           # response, generateToken, dateUtils, statusUtils
├── app.js
└── server.js
```

### Frontend — Feature-based Organization
```
frontend/src/
├── components/      # Reusable UI components (common/, layout/, dashboard/, etc.)
├── pages/           # Route-level page components
├── context/         # AuthContext, ContentContext, InstructorContext
├── hooks/           # useAuth, useDebounce
├── services/        # API service layer (never call axios in components)
├── utils/           # constants, dateUtils, statusUtils, formatUtils
└── routes/          # AppRoutes, ProtectedRoute
```

---

## ⚙️ Content Workflow (Enforced Backend + Frontend)

```
DRAFT → ASSIGNED → IN_PROGRESS → SUBMITTED → APPROVED → SCHEDULED → PUBLISHED
                                      ↓
                                  REJECTED → IN_PROGRESS
```

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/login | Login |
| POST | /api/auth/register | Register |
| GET | /api/auth/me | Get current user |
| GET | /api/instructors | List instructors |
| POST | /api/instructors | Create instructor |
| GET | /api/instructors/:id | Instructor profile |
| PUT | /api/instructors/:id | Update instructor |
| PATCH | /api/instructors/:id/status | Toggle active status |
| GET | /api/content | List content (search/filter/paginate) |
| POST | /api/content | Create content |
| GET | /api/content/:id | Content details |
| PUT | /api/content/:id | Update content |
| DELETE | /api/content/:id | Delete content (guards enforced) |
| PATCH | /api/content/:id/status | Update status (transition enforced) |
| GET | /api/assignments | List assignments |
| POST | /api/assignments | Assign content |
| GET | /api/schedules | Get schedules (month/day filter) |
| POST | /api/schedules | Schedule content |
| PUT | /api/schedules/:id | Reschedule |
| DELETE | /api/schedules/:id | Cancel schedule |
| GET | /api/publications | Publication history |
| POST | /api/publications | Log publication |
| GET | /api/dashboard/summary | Dashboard stats |
| GET | /api/dashboard/deadlines | Today's deadlines |
| GET | /api/dashboard/upcoming | Upcoming content |
| GET | /api/dashboard/overdue | Overdue content |
| GET | /api/dashboard/recent | Recent publications |
| GET | /api/dashboard/activity | Activity feed |
| GET | /api/activity | Full activity log |

---

## 🔒 Business Rules

1. **Inactive instructors** cannot receive new assignments
2. **Deadline** cannot be before the assignment date
3. **Status transitions** are strictly enforced (DRAFT → PUBLISHED directly is rejected)
4. **Content must be APPROVED** before scheduling
5. **Published content** cannot be deleted
6. **Historical data preserved** when instructor is deactivated
7. **One content → multiple platform schedules** (Instagram, YouTube, LinkedIn, Facebook)
8. **One content → multiple publication records** (per platform)
9. **Overdue state** is always calculated dynamically, never stored
10. **All significant actions** are logged in the activity log

---

## 🛡️ Security

- JWT authentication with 7-day expiry
- bcrypt password hashing (12 rounds)
- Rate limiting (100 req/15min, 20 req/15min for auth)
- CORS protection
- Helmet security headers
- Zod validation on all inputs (backend + frontend)

---

## 📦 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend Framework | React 18 + Vite |
| Styling | Tailwind CSS v3 |
| Routing | React Router v6 |
| Forms | React Hook Form + Zod |
| HTTP Client | Axios |
| Icons | Lucide React |
| Charts | Recharts |
| Toast | React Hot Toast |
| Date Utils | date-fns |
| Backend | Node.js + Express |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcryptjs |
| Validation | Zod |
| Uploads | Multer + Cloudinary |
| Security | Helmet + CORS + Rate Limiting |
