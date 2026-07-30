import { useState, useRef, useEffect } from 'react';
import { Link } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Send, Database, FileText, Code2, Bot, Trash2, ArrowLeft, Sparkles, TrendingUp, Users, DollarSign, AlertCircle } from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  sources?: { type: string; detail: string }[];
  sqlQuery?: string;
  data?: any[];
  chartData?: { label: string; value: number }[];
}

interface Stats {
  totalCustomers: number;
  activeCustomers: number;
  totalRevenue: number;
  openTickets: number;
  churnedCustomers: number;
}

const suggestedQueries = [
  { icon: DollarSign, text: "What's our total revenue?", category: "SQL Query" },
  { icon: Users, text: "Show top 5 customers by revenue", category: "SQL Query" },
  { icon: FileText, text: "What is the refund policy?", category: "RAG" },
  { icon: TrendingUp, text: "Revenue breakdown by plan", category: "SQL + Chart" },
  { icon: AlertCircle, text: "Show at-risk customers", category: "ML Model" },
  { icon: Database, text: "Show recent transactions", category: "SQL Query" },
];

const sourceIcons: Record<string, any> = {
  sql: Database,
  document: FileText,
  llm: Bot,
  ml: Sparkles,
  database: Database,
  system: Code2,
};

const sourceColors: Record<string, string> = {
  sql: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  document: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  llm: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
  ml: 'bg-green-500/10 text-green-500 border-green-500/20',
  database: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  system: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
};

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data: stats } = useQuery<Stats>({
    queryKey: ['/api/stats'],
  });

  const sendMessage = useMutation({
    mutationFn: async (message: string) => {
      const res = await apiRequest('POST', '/api/chat', { message });
      return res.json();
    },
    onMutate: (message) => {
      setMessages(prev => [...prev, { role: 'user', content: message }]);
      setIsTyping(true);
    },
    onSuccess: (data) => {
      setIsTyping(false);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.content,
        sources: data.sources,
        sqlQuery: data.sqlQuery,
        data: data.data,
        chartData: data.chartData,
      }]);
    },
    onError: () => {
      setIsTyping(false);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your request. Please try again.',
      }]);
    },
  });

  const handleSubmit = (text?: string) => {
    const message = text || input.trim();
    if (!message || sendMessage.isPending) return;
    setInput('');
    sendMessage.mutate(message);
  };

  const clearChat = async () => {
    await apiRequest('DELETE', '/api/chat/history');
    setMessages([]);
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const maxChartValue = messages
    .flatMap(m => m.chartData || [])
    .reduce((max, d) => Math.max(max, d.value), 1);

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2" data-testid="button-back">
                <ArrowLeft className="h-4 w-4" />
                Overview
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Bot className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-sm font-semibold leading-none">Enterprise AI Assistant</h1>
                <p className="text-xs text-muted-foreground mt-0.5">LangChain + GPT-4 + RAG + PostgreSQL</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {stats && (
              <div className="hidden md:flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="font-medium">{stats.totalCustomers}</span>
                  <span className="text-muted-foreground">customers</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="font-medium">${stats.totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                  <span className="text-muted-foreground">revenue</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <AlertCircle className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="font-medium">{stats.openTickets}</span>
                  <span className="text-muted-foreground">tickets</span>
                </div>
              </div>
            )}
            <Button variant="ghost" size="sm" onClick={clearChat} className="gap-2" data-testid="button-clear">
              <Trash2 className="h-3.5 w-3.5" />
              Clear
            </Button>
          </div>
        </div>
      </header>

      {/* Chat messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto max-w-3xl space-y-6">
          {messages.length === 0 && (
            <div className="space-y-6 pt-8">
              <div className="text-center space-y-3">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                  <Bot className="h-7 w-7 text-primary" />
                </div>
                <h2 className="text-xl font-semibold">Enterprise AI Chatbot Demo</h2>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Ask questions about enterprise data or policies. The chatbot uses LangChain agents to query
                  PostgreSQL databases and retrieves documents via RAG pipeline.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {suggestedQueries.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleSubmit(q.text)}
                    className="group flex items-start gap-3 rounded-lg border border-border bg-card p-4 text-left transition-colors hover:border-primary/50 hover:bg-accent/50"
                    data-testid={`button-suggestion-${i}`}
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <q.icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-snug">{q.text}</p>
                      <Badge variant="outline" className="text-[10px] py-0 px-1.5">{q.category}</Badge>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
              {msg.role === 'assistant' && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary">
                  <Bot className="h-4 w-4 text-primary-foreground" />
                </div>
              )}
              <div className={`max-w-[80%] space-y-2 ${msg.role === 'user' ? 'items-end' : ''}`}>
                <div
                  className={`rounded-2xl px-4 py-3 text-sm ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-card border border-border'
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                </div>

                {/* SQL Query display */}
                {msg.sqlQuery && (
                  <div className="rounded-lg border border-border bg-muted/50 p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Code2 className="h-3.5 w-3.5 text-blue-500" />
                      <span className="text-xs font-medium text-muted-foreground">Generated SQL Query</span>
                    </div>
                    <pre className="text-xs font-mono text-foreground/80 overflow-x-auto">
                      <code>{msg.sqlQuery}</code>
                    </pre>
                  </div>
                )}

                {/* Chart data */}
                {msg.chartData && msg.chartData.length > 0 && (
                  <div className="rounded-lg border border-border bg-card p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-3.5 w-3.5 text-primary" />
                      <span className="text-xs font-medium text-muted-foreground">Visualization</span>
                    </div>
                    <div className="space-y-2">
                      {msg.chartData.map((d, j) => (
                        <div key={j} className="flex items-center gap-3">
                          <span className="text-xs font-medium w-24 shrink-0">{d.label}</span>
                          <div className="flex-1 h-6 rounded bg-muted/50 overflow-hidden">
                            <div
                              className="h-full rounded bg-primary/70 flex items-center justify-end pr-2"
                              style={{ width: `${(d.value / maxChartValue) * 100}%` }}
                            >
                              <span className="text-[10px] font-medium text-primary-foreground">
                                ${d.value.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sources */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {msg.sources.map((src, j) => {
                      const Icon = sourceIcons[src.type] || Code2;
                      return (
                        <Badge
                          key={j}
                          variant="outline"
                          className={`gap-1 text-[10px] py-0.5 ${sourceColors[src.type] || ''}`}
                        >
                          <Icon className="h-2.5 w-2.5" />
                          {src.detail}
                        </Badge>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary">
                <Bot className="h-4 w-4 text-primary-foreground" />
              </div>
              <div className="rounded-2xl border border-border bg-card px-4 py-3">
                <div className="flex gap-1">
                  <span className="h-2 w-2 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="h-2 w-2 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="h-2 w-2 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-border bg-card/50 backdrop-blur-sm p-4">
        <div className="mx-auto max-w-3xl">
          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              placeholder="Ask about revenue, customers, transactions, policies..."
              className="min-h-[44px] max-h-32 resize-none text-sm"
              rows={1}
              data-testid="input-chat"
            />
            <Button
              size="icon"
              onClick={() => handleSubmit()}
              disabled={!input.trim() || sendMessage.isPending}
              className="h-11 w-11 shrink-0"
              data-testid="button-send"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground mt-2 text-center">
            Enterprise AI Chatbot powered by LangChain + GPT-4 + RAG + FastAPI + PostgreSQL
          </p>
        </div>
      </div>
    </div>
  );
}
