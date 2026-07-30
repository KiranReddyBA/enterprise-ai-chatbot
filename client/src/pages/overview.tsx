import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bot, Database, FileText, Code2, ArrowRight, Github, Mail, Phone, Brain, Layers, Cloud, Zap, GitBranch, Server, Cpu } from 'lucide-react';

interface Stats {
  totalCustomers: number;
  activeCustomers: number;
  totalRevenue: number;
  openTickets: number;
  churnedCustomers: number;
}

const techStack = [
  { name: 'Python', category: 'Language', icon: Code2 },
  { name: 'LangChain', category: 'Agent Framework', icon: Bot },
  { name: 'OpenAI GPT-4', category: 'LLM', icon: Brain },
  { name: 'FastAPI', category: 'Backend API', icon: Server },
  { name: 'PostgreSQL', category: 'Database', icon: Database },
  { name: 'FAISS', category: 'Vector DB', icon: Layers },
  { name: 'Hugging Face', category: 'Embeddings', icon: Cpu },
  { name: 'Docker', category: 'Deployment', icon: GitBranch },
  { name: 'AWS EC2', category: 'Cloud', icon: Cloud },
  { name: 'AWS Lambda', category: 'Serverless', icon: Zap },
];

const features = [
  {
    icon: Database,
    title: 'Natural Language to SQL',
    description: 'Users ask questions in plain English. The LangChain agent translates them into SQL queries, executes against PostgreSQL, and returns structured results.',
    tags: ['LangChain', 'Function Calling', 'PostgreSQL'],
  },
  {
    icon: FileText,
    title: 'RAG Document Retrieval',
    description: 'Unstructured documents (PDFs, policies, manuals) are chunked, embedded, and stored in FAISS. The chatbot retrieves relevant context before generating responses.',
    tags: ['FAISS', 'Embeddings', 'RAG Pipeline'],
  },
  {
    icon: Brain,
    title: 'ML Model Integration',
    description: 'Churn prediction model (Random Forest/XGBoost) outputs are integrated into the chatbot interface, letting users ask "show at-risk customers" and get ML-powered insights.',
    tags: ['scikit-learn', 'XGBoost', 'SHAP'],
  },
  {
    icon: Code2,
    title: 'Tool-Calling Agent',
    description: 'The agent autonomously decides which data source to query — SQL database, document store, or ML model — using LangChain function-calling patterns.',
    tags: ['LangChain Agents', 'Tool Calling', 'Multi-Source'],
  },
];

const architecture = [
  { layer: 'User Interface', tech: 'React + FastAPI WebSockets', desc: 'Chat interface with streaming responses' },
  { layer: 'API Layer', tech: 'FastAPI + REST + WebSocket', desc: 'Handles auth, rate limiting, request routing' },
  { layer: 'Agent Orchestration', tech: 'LangChain + OpenAI GPT-4', desc: 'Intent classification, tool selection, response generation' },
  { layer: 'RAG Pipeline', tech: 'FAISS + Sentence Transformers', desc: 'Document chunking, embedding, retrieval' },
  { layer: 'Data Layer', tech: 'PostgreSQL + SQLAlchemy', desc: 'Structured enterprise data, SQL generation' },
  { layer: 'ML Layer', tech: 'scikit-learn + XGBoost', desc: 'Churn prediction, risk scoring' },
  { layer: 'Deployment', tech: 'Docker + AWS EC2/Lambda', desc: 'Containerized, auto-scaling, 99.9% uptime' },
];

export default function OverviewPage() {
  const { data: stats } = useQuery<Stats>({ queryKey: ['/api/stats'] });

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b border-border sticky top-0 z-50 bg-background/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Bot className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-sm">Enterprise AI Chatbot</span>
          </div>
          <div className="flex items-center gap-3">
            <a href="https://github.com/kiranreddy" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
              <Github className="h-4 w-4" />
            </a>
            <Link href="/chat">
              <Button size="sm" className="gap-2" data-testid="button-launch">
                Launch Demo
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="relative max-w-6xl mx-auto px-4 py-16 md:py-24">
          <div className="max-w-3xl space-y-6">
            <Badge variant="outline" className="gap-1.5 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
              Live Demo Available
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight" style={{ fontFamily: "'Cabinet Grotesk', sans-serif" }}>
              Enterprise AI Chatbot with RAG Pipeline
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              A production-grade AI chatbot that connects to enterprise databases, retrieves unstructured documents
              via RAG, and integrates ML model outputs — all through a conversational interface powered by LangChain
              and OpenAI GPT-4.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link href="/chat">
                <Button size="lg" className="gap-2" data-testid="button-demo">
                  Try the Live Demo
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <a href="https://github.com/kiranreddy" target="_blank" rel="noopener noreferrer">
                <Button size="lg" variant="outline" className="gap-2">
                  <Github className="h-4 w-4" />
                  View Source Code
                </Button>
              </a>
            </div>
            {stats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-6">
                {[
                  { label: 'Customers', value: stats.totalCustomers, icon: Database },
                  { label: 'Revenue', value: `$${stats.totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, icon: Zap },
                  { label: 'Active', value: stats.activeCustomers, icon: Bot },
                  { label: 'Open Tickets', value: stats.openTickets, icon: FileText },
                ].map((s, i) => (
                  <Card key={i} className="p-3 space-y-1">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <s.icon className="h-3 w-3" />
                      <span className="text-[10px] uppercase tracking-wide">{s.label}</span>
                    </div>
                    <p className="text-lg font-bold">{s.value}</p>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Problem & Solution */}
      <section className="border-b border-border py-16">
        <div className="max-w-6xl mx-auto px-4 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl md:text-3xl font-bold" style={{ fontFamily: "'Cabinet Grotesk', sans-serif" }}>
              The Problem
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Enterprise employees waste hours navigating SQL databases, searching PDFs, and waiting for data teams
              to pull reports. This chatbot eliminates that bottleneck.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6 space-y-3 border-destructive/20">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
                <Database className="h-5 w-5 text-destructive" />
              </div>
              <h3 className="font-semibold">Before: Manual Data Access</h3>
              <ul className="text-sm text-muted-foreground space-y-1.5">
                <li>- Write SQL queries or wait for data team</li>
                <li>- Search through PDFs and wikis manually</li>
                <li>- No unified interface for data + documents</li>
                <li>- Time-to-insight: hours to days</li>
              </ul>
            </Card>
            <Card className="p-6 space-y-3 border-primary/20">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Bot className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold">After: AI-Powered Chatbot</h3>
              <ul className="text-sm text-muted-foreground space-y-1.5">
                <li>- Ask questions in natural language</li>
                <li>- Agent queries SQL + retrieves documents</li>
                <li>- ML model outputs integrated into chat</li>
                <li>- Time-to-insight: seconds</li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="border-b border-border py-16">
        <div className="max-w-6xl mx-auto px-4 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl md:text-3xl font-bold" style={{ fontFamily: "'Cabinet Grotesk', sans-serif" }}>
              Key Features
            </h2>
            <p className="text-muted-foreground">What makes this chatbot production-ready</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {features.map((f, i) => (
              <Card key={i} className="p-6 space-y-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {f.tags.map(t => (
                    <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Architecture */}
      <section className="border-b border-border py-16 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl md:text-3xl font-bold" style={{ fontFamily: "'Cabinet Grotesk', sans-serif" }}>
              System Architecture
            </h2>
            <p className="text-muted-foreground">Seven layers from user input to production deployment</p>
          </div>
          <div className="space-y-2 max-w-3xl mx-auto">
            {architecture.map((a, i) => (
              <div key={i} className="flex items-stretch gap-4">
                <div className="flex flex-col items-center">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0">
                    {i + 1}
                  </div>
                  {i < architecture.length - 1 && <div className="w-px flex-1 bg-border my-1" />}
                </div>
                <Card className="flex-1 p-4 mb-2 space-y-1">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <h4 className="font-semibold text-sm">{a.layer}</h4>
                    <Badge variant="outline" className="text-[10px]">{a.tech}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{a.desc}</p>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="border-b border-border py-16">
        <div className="max-w-6xl mx-auto px-4 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl md:text-3xl font-bold" style={{ fontFamily: "'Cabinet Grotesk', sans-serif" }}>
              Technology Stack
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {techStack.map((t, i) => (
              <Card key={i} className="p-4 space-y-2 text-center hover:border-primary/50 transition-colors">
                <div className="flex h-10 w-10 mx-auto items-center justify-center rounded-lg bg-primary/10">
                  <t.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">{t.name}</p>
                  <p className="text-[10px] text-muted-foreground">{t.category}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-2xl md:text-3xl font-bold" style={{ fontFamily: "'Cabinet Grotesk', sans-serif" }}>
            Try the Live Demo
          </h2>
          <p className="text-muted-foreground">
            Ask the chatbot about revenue, customers, transactions, support tickets, or enterprise policies.
            See how it generates SQL queries, retrieves documents via RAG, and integrates ML model outputs.
          </p>
          <Link href="/chat">
            <Button size="lg" className="gap-2" data-testid="button-cta-demo">
              Launch Chatbot Demo
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-primary">
              <Bot className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <span className="text-sm font-medium">Enterprise AI Chatbot</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>Kiran Kumar Reddy</span>
            <a href="mailto:bkkreddy1969@gmail.com" className="flex items-center gap-1 hover:text-foreground transition-colors">
              <Mail className="h-3.5 w-3.5" />
              Email
            </a>
            <a href="tel:+17325857199" className="flex items-center gap-1 hover:text-foreground transition-colors">
              <Phone className="h-3.5 w-3.5" />
              Phone
            </a>
            <a href="https://github.com/kiranreddy" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-foreground transition-colors">
              <Github className="h-3.5 w-3.5" />
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
