# 🛠️ FixIt – Property Maintenance Board

FixIt is a full-stack property maintenance management application that enables tenants to report maintenance issues and allows property managers to efficiently organize and track repair requests.

The application automatically analyzes each maintenance request using an AI-powered backend classifier to assign a priority level (**High**, **Medium**, or **Low**) before displaying the ticket on an interactive Kanban board.

---

## ✨ Features

### Tenant
- Submit maintenance requests
- User registration and login
- Forgot password with email recovery
- Track the progress of submitted tickets (authenticated users)

### Property Manager
- View all maintenance tickets
- Automatic AI priority classification
- Manage tickets through a drag-and-drop Kanban board
- Update ticket status

---

## 🧠 AI Priority Classification

When a maintenance request is submitted, the backend analyzes the ticket description using a Large Language Model (LLM) to determine its urgency.

Priority levels:

- 🔴 **High** – Safety hazards or severe property damage
- 🟡 **Medium** – Functional issues requiring timely intervention
- 🟢 **Low** – Cosmetic issues or minor inconveniences

---

# 🏗️ Tech Stack

## Frontend
- Next.js
- React
- TypeScript

## Backend
- NestJS
- TypeScript
- TypeORM

## Database
- PostgreSQL

## DevOps
- Docker
- Docker Compose

---

# 📂 Project Structure

```text
fixit/
├── backend/
│   ├── src/
│   ├── Dockerfile
│   └── ...
├── frontend/
│   ├── app/
│   ├── components/
│   └── ...
├── docker-compose.yml
└── README.md
```

---

# 🚀 Getting Started

## Prerequisites

Before running the project, make sure you have installed:

- Node.js
- npm
- Docker
- Docker Compose

---

## Install Dependencies

### Backend

```bash
cd backend
npm install
```

### Frontend

```bash
cd frontend
npm install
```

---

## Start the Database

```bash
docker compose up -d
```

---

## Run the Backend

```bash
cd backend
npm run start:dev
```

---

## Run the Frontend

```bash
cd frontend
npm run dev
```

The application will be available at:

- Frontend: http://localhost:3001
- Backend: http://localhost:3000

---

# 📋 Workflow

1. A tenant submits a maintenance request.
2. The backend validates the request.
3. The AI assigns a priority level.
4. The ticket is stored in PostgreSQL.
5. The ticket appears on the Kanban board.
6. The property manager updates the ticket status until completion.

---

# 🐳 Docker

Start all services:

```bash
docker compose up --build
```

Stop all services:

```bash
docker compose down
```

---

# 📸 Screenshots

Coming soon.

---

# 🎥 Demo

Coming soon.

---


# 👨‍💻 Author

**Nour Amri**

Summer Internship Project – **FixIt – Property Maintenance Board**