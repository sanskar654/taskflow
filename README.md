# TaskFlow — MERN Stack Task Manager

> A production-ready task management application built with MongoDB, Express, React, and Node.js. Features a distinctive dark UI, comprehensive REST API with validation, real-time updates, filtering/sorting, and bulk operations.

---

## ✨ Features

### Core (Mandatory)
| Feature | Details |
|---|---|
| **Full CRUD** | Create, Read, Update, Delete tasks via REST API |
| **Form Validation** | Client-side (React) + Server-side (express-validator) |
| **REST API** | 8 endpoints: GET, POST, PUT, PATCH, DELETE + bulk delete + stats |
| **MongoDB Integration** | Mongoose ODM with schema, virtuals, indexes, pre-hooks |
| **Responsive UI** | Mobile-first, works on all screen sizes, floating action button on mobile |
| **Dynamic Updates** | No page refresh — React Context + Axios, instant UI updates |

### Bonus Features
| Feature | Details |
|---|---|
| **Filter by status/priority/category** | Dropdown filters with instant re-fetch |
| **Full-text search** | Search task titles and descriptions |
| **Multi-sort** | Sort by date, due date, priority, title |
| **Stats dashboard** | Live count of total, in-progress, completed, overdue tasks |
| **Bulk delete** | Select multiple tasks, delete in one request |
| **Completion rate** | Percentage and "completed this week" tracking |
| **Tags** | Add up to 5 tags per task, filterable |
| **Due date tracking** | Overdue detection, "Due today/tomorrow" labels |
| **Status cycling** | Click the status pill on any card to advance it |
| **Notifications** | Toast notifications for all create/update/delete actions |
| **Environment variables** | All secrets in `.env` files, never hardcoded |
| **Reusable components** | `TaskCard`, `TaskForm`, `StatsBar`, `FilterBar`, `TaskList`, `Header` |
| **API health check** | `GET /health` endpoint with version and env info |
| **Pagination** | Server-side pagination with page controls |

---

## 🏗️ Project Structure

```
taskflow/
├── backend/
│   ├── config/
│   │   └── db.js               # MongoDB connection + event handlers
│   ├── middleware/
│   │   └── validate.js         # express-validator rules (create, update, id)
│   ├── models/
│   │   └── Task.js             # Mongoose schema with virtuals & hooks
│   ├── routes/
│   │   └── tasks.js            # All task endpoints
│   ├── server.js               # Express app entry point
│   ├── .env.example            # Environment variable template
│   └── package.json
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── Header.js / .css
    │   │   ├── StatsBar.js / .css
    │   │   ├── FilterBar.js / .css
    │   │   ├── TaskCard.js / .css
    │   │   ├── TaskForm.js / .css
    │   │   └── TaskList.js / .css
    │   ├── context/
    │   │   └── TaskContext.js  # Global state (useReducer + Context API)
    │   ├── styles/
    │   │   └── global.css      # Design system tokens + base styles
    │   ├── utils/
    │   │   └── api.js          # Axios instance + taskAPI service
    │   ├── App.js
    │   ├── App.css
    │   └── index.js
    ├── .env.example
    └── package.json
```

---

## 🚀 Quick Start (Local)

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free tier) **or** local MongoDB

### 1. Clone & install

```bash
git clone https://github.com/YOUR_USERNAME/taskflow.git
cd taskflow

# Install backend deps
cd backend && npm install

# Install frontend deps
cd ../frontend && npm install
```

### 2. Configure environment

**Backend** — create `backend/.env` from the example:
```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env`:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/taskflow?retryWrites=true&w=majority
FRONTEND_URL=http://localhost:3000
```

**Frontend** — create `frontend/.env`:
```bash
cp frontend/.env.example frontend/.env
```

Edit `frontend/.env`:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

### 3. Run

Open two terminals:

```bash
# Terminal 1 – Backend
cd backend
npm run dev     # starts on http://localhost:5000

# Terminal 2 – Frontend
cd frontend
npm start       # starts on http://localhost:3000
```

Visit `http://localhost:3000` 🎉

---

## 📡 REST API Reference

Base URL: `http://localhost:5000/api`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/tasks` | Get all tasks (with filters, sort, pagination) |
| `GET` | `/tasks/stats` | Get task statistics |
| `GET` | `/tasks/:id` | Get single task |
| `POST` | `/tasks` | Create a new task |
| `PUT` | `/tasks/:id` | Update a task (full update) |
| `PATCH` | `/tasks/:id/status` | Update status only |
| `DELETE` | `/tasks/:id` | Delete a task |
| `DELETE` | `/tasks/bulk/delete` | Bulk delete tasks |

### Query Parameters (GET /tasks)

| Param | Type | Example |
|---|---|---|
| `status` | string | `todo`, `in-progress`, `completed` |
| `priority` | string | `low`, `medium`, `high` |
| `search` | string | `?search=deploy` |
| `sort` | string | `createdAt`, `dueDate`, `priority`, `title` |
| `order` | string | `asc` or `desc` |
| `page` | number | `?page=2` |
| `limit` | number | `?limit=10` |
| `tags` | string | `?tags=frontend,urgent` |

### Task Schema

```json
{
  "_id": "...",
  "title": "Implement auth module",
  "description": "JWT-based auth with refresh tokens",
  "status": "in-progress",
  "priority": "high",
  "category": "Work",
  "dueDate": "2024-12-31T00:00:00.000Z",
  "tags": ["backend", "security"],
  "isOverdue": false,
  "completedAt": null,
  "createdAt": "...",
  "updatedAt": "..."
}
```

---

## ☁️ Deployment

### Backend → Render (free)

1. Push code to GitHub
2. Go to [render.com](https://render.com) → New Web Service
3. Connect your GitHub repo, set root directory to `backend`
4. Build command: `npm install`
5. Start command: `npm start`
6. Add environment variables:
   - `MONGO_URI` = your Atlas connection string
   - `FRONTEND_URL` = your Vercel frontend URL (after step below)
   - `NODE_ENV` = `production`

### Frontend → Vercel (free)

1. Go to [vercel.com](https://vercel.com) → New Project
2. Import your GitHub repo, set root to `frontend`
3. Add environment variable:
   - `REACT_APP_API_URL` = `https://your-backend.onrender.com/api`
4. Deploy

> **Update CORS**: After deploying both, update `FRONTEND_URL` on Render to your Vercel URL.

---

## 🛠️ Technical Highlights

### Backend
- **Mongoose virtuals** — `isOverdue` computed on the fly
- **Pre-save hooks** — auto-sets `completedAt` when status → completed
- **DB indexes** — `{ status, priority, createdAt }` and `{ dueDate }` for query performance
- **express-validator** — declarative validation chains, clean error response format
- **Async handler wrapper** — eliminates try/catch boilerplate in every route
- **Morgan logging** — `dev` in development, `combined` in production
- **Health check endpoint** — `/health` for uptime monitoring

### Frontend
- **Context + useReducer** — predictable global state, no Redux needed
- **Axios interceptors** — centralized error extraction from all API responses
- **Optimistic UI feel** — instant dispatch on mutation, no re-fetch needed for single ops
- **Custom design system** — CSS custom properties for full theme control
- **Status cycling** — clicking status pill advances todo → in-progress → completed → todo
- **Keyboard UX** — Escape to close modal, Enter to submit search
- **Responsive FAB** — floating action button on mobile for quick task creation
- **react-hot-toast** — lightweight toast notifications styled to match the dark theme

---

## 🧪 Sample API Requests

```bash
# Create a task
curl -X POST http://localhost:5000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Deploy to production","priority":"high","tags":["devops"]}'

# Get overdue in-progress tasks sorted by due date
curl "http://localhost:5000/api/tasks?status=in-progress&sort=dueDate&order=asc"

# Bulk delete
curl -X DELETE http://localhost:5000/api/tasks/bulk/delete \
  -H "Content-Type: application/json" \
  -d '{"ids":["id1","id2"]}'
```

---

## 📦 Dependencies

### Backend
| Package | Purpose |
|---|---|
| `express` | HTTP server & routing |
| `mongoose` | MongoDB ODM |
| `cors` | Cross-origin resource sharing |
| `dotenv` | Environment variable loading |
| `express-validator` | Server-side validation |
| `morgan` | HTTP request logging |

### Frontend
| Package | Purpose |
|---|---|
| `react` / `react-dom` | UI library |
| `axios` | HTTP client with interceptors |
| `react-hot-toast` | Toast notifications |
| `date-fns` | Date formatting and comparison |

---

*MERN Stack Internship Project — TaskFlow*
