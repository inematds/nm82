# Introduction

This document outlines the complete fullstack architecture for **nm82**, including backend systems, frontend implementation, database design, security patterns, and deployment strategy. It serves as the single source of truth for AI-driven development, ensuring consistency across the entire technology stack.

This architecture replaces the fragmented nm81 system (n8n workflows + isolated HTML pages) with a modern, secure, integrated web application built on **Next.js 14+** with **App Router**, **Prisma ORM**, and **Supabase PostgreSQL**.

## Project Context

**From PRD (Sarah)**:
- **Vision**: Integrated platform for INEMA.VIP community management and affiliate marketing program
- **MVP Scope**: Phases 1+2 (Authentication + Core CRUD) - 5-7 weeks
- **Key Goals**:
  - Eliminate 90% of manual operations
  - Secure authentication with role-based access (Admin, Padrinho, Afiliado)
  - Real-time dashboards with metrics
  - Integration with existing n8n workflows

**From Brownfield Analysis (Mary)**:
- Current system: 23% complete as integrated platform
- Critical gaps: No auth, no backend, exposed credentials, manual data management
- Existing infrastructure: Supabase DB, n8n workflows, Gmail API, Telegram Bot
