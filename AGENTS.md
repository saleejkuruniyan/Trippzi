# Trippzi Project: Coding Guidelines & Agent Instructions

This document outlines the strict architectural and coding standards for the Trippzi project. All AI agents and developers must adhere to these rules.

## 📁 1. Project Structure
The current folder structure is strict and must not be altered without explicit permission:
- `backend/`: Django REST Framework API, models, and AI services.
- `portal/`: Next.js User Portal (Frontend).
- `superadmin/`: Next.js Superadmin Dashboard (Frontend).
- `k8s/`: Kubernetes manifests.
- `docs/`: Documentation and implementation plans.

## ⚛️ 2. Frontend Development (Portal & Superadmin)
- **Next.js 15+**: This project uses Next.js 15. APIs, conventions, and file structure may differ from older versions. Always check for deprecation notices in `node_modules/next/dist/docs/`.
- **300 Line Limit**: No frontend file (JSX/TSX/CSS) should exceed **300 lines of code**.
- **Modularization**: If a component or page exceeds this limit, it must be broken down into smaller, reusable components located in `src/components/`.
- **Styling**: Use Tailwind CSS for all styling. Maintain the premium, glassmorphic aesthetic established in the initial setup.
- **Responsiveness**: All components must be fully responsive (Mobile, Tablet, Desktop).
- **Theming**: Support for Dark and Light modes must be maintained using `next-themes`.

## 🧠 3. Backend Development (Django)
- **Environment Variables**: All core settings (API keys, models, endpoints, DB URLs) must be stored in `.env` and accessed via `django.conf.settings`.
- **AI Services**: Use the established `AIEngine` service pattern in `api/services/`.
- **Validation Layer**: Maintain the hybrid approach of AI-generated content followed by a human/rule-based validation layer.

## 🚀 4. General Principles
- **No Placeholders**: Avoid using placeholder images or text. Use the `generate_image` tool or realistic mock data.
- **Performance**: Ensure fast page loads and optimized API calls.
- **PWA**: Maintain PWA manifest and service worker compatibility in the User Portal.

---
**Failure to follow these rules is UNACCEPTABLE.**
