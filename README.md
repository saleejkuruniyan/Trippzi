# Trippzi 🌍

Trippzi is a premium, AI-powered travel content engine and marketplace. It leverages Large Language Models (LLMs) to generate personalized, high-quality travel itineraries while providing real-time visa and documentation requirements based on the user's passport.

## 🚀 Key Features

- **AI Itinerary Engine**: Day-by-day plans, budget estimations, and local tips generated via Langchain & OpenAI.
- **Asynchronous Processing**: Background task management using **Celery** and **Redis** for high-latency AI generations and periodic visa data syncing.
- **Smart Visa Advisor**: Instant documentation requirements based on the traveler's nationality.
- **Dual-Portal Architecture**:
  - **User Portal**: Premium, responsive Next.js frontend for explorers.
  - **Superadmin Dashboard**: Centralized control for content validation and sales monitoring.
- **PWA Ready**: Fully installable Progressive Web App with offline support, service workers, and high-resolution icons.
- **Dark/Light Mode**: Full support for both aesthetics across all frontends.
- **Analytics & Tracking**: Built-in Google Analytics integration for the User Portal.

## 🛠️ Tech Stack

- **Backend**: Django (Python 3.12), Django REST Framework, PostgreSQL.
- **Task Queue**: Celery, Redis.
- **AI Orchestration**: Langchain, OpenAI (GPT-4o).
- **Frontend**: Next.js 15, Tailwind CSS, Framer Motion, Lucide Icons.
- **Infrastructure**: Docker, Kubernetes (K8s StatefulSet for DB), Nginx.

## 📁 Project Structure

```text
Trippzi/
├── backend/            # Django REST API + AI Services + Celery Tasks
├── portal/             # Next.js User Frontend (PWA + Analytics)
├── superadmin/         # Next.js Admin Dashboard
├── k8s/                # Kubernetes Manifests (Postgres, Redis, Apps)
├── docs/               # Technical Documentation
├── AGENTS.md           # Strict Coding Guidelines for AI Tools
└── run.py              # Unified Local Development Script (Python 3.12)
```

## 🏁 Getting Started

### 1. Prerequisites
- Python 3.12+
- Node.js 18+
- Redis (Required for Celery background tasks)
- OpenAI API Key

### 2. Configuration
Copy the `.env.example` files to `.env` in the following directories and add your credentials:
- `backend/` (Includes AI keys, DB URLs, Razorpay secrets, and Celery broker)
- `portal/` (Includes Backend API URL and Google Analytics ID)
- `superadmin/`

### 3. Launch Development Environment
Run the unified startup script from the root:
```bash
python3 run.py
```
This script automatically:
- Creates a Python 3.12 virtual environment.
- Installs all backend and frontend dependencies.
- Runs database migrations.
- Starts the **Backend**, **Celery Worker**, **Celery Beat**, **User Portal**, and **Superadmin Dashboard** simultaneously.

---

## 📜 Coding Standards
Please refer to [AGENTS.md](./AGENTS.md) for strict coding guidelines, including modularization rules and line count limits for frontend development.
