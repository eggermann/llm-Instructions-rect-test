## Project Brief – PromptPing.de

### Overview

**PromptPing.de** is a smart, daily-updated prompt hub designed for businesses to publish structured, RAG-style (Retrieval-Augmented Generation) data for use in external or third-party LLM systems. The core idea is to allow companies to push their latest offerings, FAQs, or service information as up-to-date prompts that can be easily consumed by LLMs to answer customer queries accurately.

### Vision

Enable businesses to maintain conversational accuracy and relevance by letting LLMs access the freshest information via a daily-updated prompt stream. This empowers AI assistants or chatbots (even external ones) to provide real-time, on-brand responses.

---

## Features

- **Push Notifications**: Companies can push new information about their services/offers ("Angebote") daily.
- **RAG-style Prompt Hosting**: Upload semi-structured information chunks designed to be used by LLMs in retrieval-augmented setups.
- **Feed for External LLMs**: Secure, daily-refresh JSON or API endpoint for external LLMs to consume and embed in their chat context.
- **Searchable Prompt Archive**: Businesses can view and manage past prompt sets.

---

## Target Audience

- Businesses using LLMs for customer service or sales.
- AI platforms integrating third-party company data.
- Developers building LLM chatbots or assistants requiring current business info.

---

## Frontend Design Description

- **Main Dashboard**: 
  - Card-style layout for daily prompt entries with timestamps.
  - Push notification trigger button.
  - Summary view of current "Angebot" info and its prompt format.

- **Prompt Composer Page**:
  - Rich text + structured metadata editor (JSON/YAML mode toggle).
  - AI-assisted prompt rewriter to improve clarity.
  - Preview panel for LLM response simulation.

- **Feed Management**:
  - Configurable public/private endpoints.
  - Access controls for team roles.

- **Mobile View**:
  - Optimized notification push and quick edit interface.

---

## Backend Design Description

- **Tech Stack**: Node.js (NestJS), PostgreSQL, Redis, RabbitMQ for push events, S3 for backup.
- **Core Modules**:
  - Prompt Ingestion + Validation Pipeline
  - Versioned Prompt Storage (daily snapshots)
  - Secure API Feed Generator (token-based)
  - Notification Service (email + app-based)
  - Admin Panel for moderation and analytics

- **Integration Points**:
  - LLMs fetch data via `/company/{slug}/daily.json`
  - Webhooks for real-time changes
  - Future plan: LangChain/RAG-ready API extension

---

Let me know if you want a wireframe or clickable prototype layout next.
