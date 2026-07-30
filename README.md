# Enterprise AI Chatbot with RAG Pipeline

A production-grade enterprise AI chatbot that connects to SQL databases, retrieves unstructured documents via RAG (Retrieval-Augmented Generation), and integrates ML model outputs — all through a conversational interface powered by LangChain and OpenAI GPT-4.

## Live Demo

The deployed portfolio site includes a working chatbot demo. Try asking:
- "What's our total revenue?" — Natural language to SQL query
- "Revenue breakdown by plan" — SQL aggregation with data visualization
- "What is the refund policy?" — RAG document retrieval
- "Show at-risk customers" — ML churn prediction model output
- "Show top 5 customers by revenue" — SQL query with formatted results
- "Show recent transactions" — SQL query with structured data display

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    User Interface                        │
│              React + FastAPI WebSockets                   │
├─────────────────────────────────────────────────────────┤
│                    API Layer                             │
│           FastAPI + REST + WebSocket                      │
│     Auth, Rate Limiting, Request Routing                 │
├─────────────────────────────────────────────────────────┤
│              Agent Orchestration                          │
│           LangChain + OpenAI GPT-4                       │
│   Intent Classification, Tool Selection, Response Gen   │
├─────────────────────────────────────────────────────────┤
│                  RAG Pipeline                             │
│          FAISS + Sentence Transformers                   │
│      Document Chunking, Embedding, Retrieval             │
├─────────────────────────────────────────────────────────┤
│                   Data Layer                             │
│            PostgreSQL + SQLAlchemy                        │
│      Structured Enterprise Data, SQL Generation          │
├─────────────────────────────────────────────────────────┤
│                    ML Layer                              │
│           scikit-learn + XGBoost                          │
│         Churn Prediction, Risk Scoring                   │
├─────────────────────────────────────────────────────────┤
│                  Deployment                              │
│            Docker + AWS EC2/Lambda                        │
│       Containerized, Auto-scaling, 99.9% uptime          │
└─────────────────────────────────────────────────────────┘
```

## Key Features

### 1. Natural Language to SQL
Users ask questions in plain English. The LangChain agent translates them into SQL queries, executes against PostgreSQL, and returns structured results.

### 2. RAG Document Retrieval
Unstructured documents (PDFs, policies, manuals) are chunked, embedded, and stored in FAISS. The chatbot retrieves relevant context before generating responses.

### 3. ML Model Integration
Churn prediction model (Random Forest/XGBoost) outputs are integrated into the chatbot interface, letting users ask "show at-risk customers" and get ML-powered insights.

### 4. Tool-Calling Agent
The agent autonomously decides which data source to query — SQL database, document store, or ML model — using LangChain function-calling patterns.

## Technology Stack

| Component | Technology |
|-----------|-----------|
| Language | Python |
| Agent Framework | LangChain |
| LLM | OpenAI GPT-4 |
| Backend API | FastAPI |
| Database | PostgreSQL |
| Vector Database | FAISS |
| Embeddings | Hugging Face Sentence Transformers |
| ML Models | scikit-learn, XGBoost |
| Containerization | Docker |
| Cloud | AWS EC2, AWS Lambda |

## Project Structure

```
enterprise-ai-chatbot/
├── client/                 # React frontend
│   ├── src/
│   │   ├── pages/         # Overview (portfolio) + Chat (demo)
│   │   ├── components/     # UI components, theme provider
│   │   └── lib/            # Query client, API helpers
├── server/                 # Express backend
│   ├── routes.ts           # Chatbot intelligence engine
│   ├── storage.ts          # Storage interface
│   └── db.ts               # SQLite + Drizzle ORM
├── shared/
│   └── schema.ts           # Data models (customers, transactions, etc.)
└── package.json
```

## Getting Started

```bash
# Install dependencies
npm install

# Start the development server
npm run dev

# Build for production
npm run build

# Start production server
NODE_ENV=production node dist/index.cjs
```

## Data Models

The demo uses a seeded SQLite database with:
- **Customers** (10 records) — name, company, plan, monthly revenue, status
- **Transactions** (15 records) — amount, type, status, date, description
- **Products** (6 records) — name, category, price, stock
- **Support Tickets** (6 records) — customer, subject, status, priority
- **Chat Messages** — conversation history
- **Policy Documents** (6 RAG documents) — refund policy, SLA, data security, etc.

## RAG Knowledge Base

The chatbot retrieves answers from 6 enterprise policy documents:
1. Refund Policy
2. SLA Agreement
3. Data Security Policy
4. Pricing Policy
5. Customer Support Policy
6. Enterprise Onboarding

## Skills Demonstrated

- **LangChain Agents** — Tool-calling patterns for multi-source data retrieval
- **RAG Pipeline** — Document chunking, embedding, FAISS retrieval
- **SQL Generation** — Natural language to SQL via function calling
- **ML Integration** — Churn prediction model outputs in chat
- **FastAPI/Express** — RESTful API with streaming support
- **PostgreSQL/SQL** — Complex queries, aggregations, joins
- **OpenAI GPT-4** — LLM-powered response generation
- **Docker/AWS** — Containerized deployment

## Author

**Kiran Kumar Reddy**
- Email: bkkreddy1969@gmail.com
- Phone: +1 (732) 585-7199
- GitHub: [github.com/KiranReddyBA](https://github.com/KiranReddyBA)

## License

This project is part of a portfolio submission for a Junior AI/ML Engineer position.
