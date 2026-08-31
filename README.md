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

## DevOps & DevSecOps
- Docker / Docker Compose
- Jenkins (CI/CD pipeline)
- SonarQube (static code analysis & quality gate)
- Trivy (container vulnerability scanning)
- Gitleaks (secret scanning)
- Prometheus (metrics collection)
- Grafana (monitoring dashboards)
- cAdvisor (container resource metrics)

---

# 📂 Project Structure

```text
fixit/
├── backend/
│   ├── src/
│   │   ├── metrics/         # Prometheus metrics (counter + histogram)
│   │   ├── health/          # Health check endpoint (Terminus)
│   │   └── ...
│   ├── Dockerfile
│   └── ...
├── frontend/
│   ├── app/
│   ├── components/
│   └── ...
├── prometheus/
│   └── prometheus.yml       # Scrape config (backend + cAdvisor)
├── docker-compose.yml            # App services (backend, frontend, db)
├── docker-compose.monitoring.yml # Prometheus, Grafana, cAdvisor
├── docker-compose.jenkins.yml    # Jenkins CI/CD server
├── docker-compose.sonar.yml      # SonarQube server
├── Jenkinsfile                   # Full CI/CD pipeline definition
└── README.md
```

---

🚀 Getting Started

## Prerequisites

Before running the project, make sure you have installed:

* Node.js
* npm
* Docker
* Docker Compose

## Install Dependencies

Backend

```bash
cd backend
npm install
```

Frontend

```bash
cd frontend
npm install
```

## Start the Database

```bash
docker compose up -d
```

## Run the Backend

```bash
cd backend
npm run start:dev
```

## Run the Frontend

```bash
cd frontend
npm run dev
```

The application will be available at:

* Frontend: http://localhost:3001
* Backend: http://localhost:3000

---

📋 Workflow

1. A tenant submits a maintenance request.
2. The backend validates the request.
3. The AI assigns a priority level.
4. The ticket is stored in PostgreSQL.
5. The ticket appears on the Kanban board.
6. The property manager updates the ticket status until completion.
7. The tenant receives an email notification whenever the status of their request changes.

---

🐳 Docker

Start all services:

```bash
docker compose up --build
```

Stop all services:

```bash
docker compose down
```

---

# 🔐 DevSecOps Pipeline

FixIt is built and deployed through a fully automated Jenkins CI/CD pipeline that enforces security and quality gates before any deployment.

## Pipeline Stages

1. **Checkout** – Pulls the latest code from GitHub
2. **Secret Scanning** – Gitleaks scans the codebase for hardcoded credentials/API keys
3. **Install & Build (Backend/Frontend)** – Installs dependencies and compiles both apps
4. **Dependency Audit** – `npm audit` on both backend and frontend
5. **SonarQube Analysis** – Static code analysis for bugs, code smells, and security hotspots
6. **Quality Gate** – Pipeline is blocked if the SonarQube Quality Gate fails
7. **Build Docker Images** – Builds fresh backend and frontend images
8. **Container Vulnerability Scanning** – Trivy scans both images:
   - **CRITICAL** vulnerabilities → pipeline fails
   - **HIGH** vulnerabilities → reported only, non-blocking
9. **Push to Registry** – Tagged images are pushed to Docker Hub
10. **Deploy** – Latest images are pulled and redeployed via Docker Compose

## Running the Pipeline Locally

Start Jenkins and SonarQube:

```bash
docker compose -f docker-compose.jenkins.yml up -d
docker compose -f docker-compose.sonar.yml up -d
```

* Jenkins: http://localhost:8080
* SonarQube: http://localhost:9000

---

# 📊 Monitoring Stack

The application exposes real-time metrics through a self-hosted monitoring stack.

## Components

- **cAdvisor** – Collects per-container CPU, memory, and I/O metrics
- **Prometheus** – Scrapes and stores metrics from the backend and cAdvisor every 15s
- **Grafana** – Visual dashboards for API request rate, error rate, latency, and container health

## Application Metrics

The NestJS backend exposes a `/metrics` endpoint (Prometheus format) via a global interceptor, tracking:

- `http_requests_total` – Total HTTP requests (labeled by method, route, status code)
- `http_request_duration_seconds` – Request latency histogram (used for p95/p99 latency)
- Default Node.js metrics (heap, event loop lag, CPU)

A `/health` endpoint (via NestJS Terminus) checks database connectivity, memory usage, and disk usage.

## Start the Monitoring Stack

```bash
docker compose -f docker-compose.monitoring.yml up -d
```

* Prometheus: http://localhost:9090
* Grafana: http://localhost:3002 (default login: `admin` / see `GF_SECURITY_ADMIN_PASSWORD`)
* cAdvisor: http://localhost:8081

Prometheus scrape targets are defined in `prometheus/prometheus.yml`:

```yaml
scrape_configs:
  - job_name: 'cadvisor'
    static_configs:
      - targets: ['cadvisor:8080']

  - job_name: 'backend'
    metrics_path: '/metrics'
    static_configs:
      - targets: ['backend:3000']
```

---

👨‍💻 Author
Nour Amri
Summer Internship Project – FixIt – Property Maintenance Board
