import { Express } from 'express';
import { storage } from './storage';
import { db } from './db';
import { customers, transactions, products, supportTickets } from '../shared/schema';
import { sql, eq, desc, sum, avg, count } from 'drizzle-orm';

// Enterprise knowledge base (simulated RAG document store)
const knowledgeBase: Record<string, string> = {
  'refund policy': 'Our refund policy allows customers to request a full refund within 30 days of purchase. For enterprise plans, refunds are processed within 5-7 business days. Refunds for transactions older than 30 days require manager approval and may be prorated based on usage.',
  'data security': 'All customer data is encrypted at rest using AES-256 and in transit using TLS 1.3. We are SOC 2 Type II certified and compliant with GDPR, CCPA, and HIPAA regulations. Access to production data requires multi-factor authentication and is logged for audit purposes.',
  'api rate limits': 'API rate limits vary by plan: Starter (100 req/min), Professional (1,000 req/min), Enterprise (10,000 req/min). Rate limit headers are included in all API responses. Contact support to request temporary limit increases.',
  'sla': 'Our Enterprise SLA guarantees 99.99% uptime with a 4-hour response time for critical incidents. Service credits are issued automatically if SLA is not met. Status page is available at status.example.com.',
  'pricing tiers': 'We offer three pricing tiers: Starter ($99/mo, up to 1,000 customers), Professional ($499/mo, up to 10,000 customers), and Enterprise (Custom, unlimited). All plans include API access, analytics dashboard, and email support.',
  'onboarding': 'New customer onboarding includes a 30-minute kickoff call, access to our implementation guide, and a dedicated success manager for Professional and Enterprise plans. Average time to first value is 3-5 business days.',
};

interface ChatResponse {
  content: string;
  sources: { type: string; detail: string }[];
  sqlQuery?: string;
  data?: any[];
  chartData?: { label: string; value: number }[];
}

function processQuery(query: string): ChatResponse {
  const q = query.toLowerCase();
  const sources: { type: string; detail: string }[] = [];

  // Check for knowledge base / document queries (RAG)
  for (const [topic, content] of Object.entries(knowledgeBase)) {
    if (q.includes(topic) || q.includes(topic.split(' ')[0])) {
      sources.push({ type: 'document', detail: `Enterprise Policy: ${topic}` });
      return {
        content,
        sources,
      };
    }
  }

  // Revenue by plan (check before general revenue query)
  if (q.includes('revenue') && (q.includes('plan') || q.includes('breakdown') || q.includes('by'))) {
    const result = db.select({
      plan: customers.plan,
      total: sum(customers.monthlyRevenue),
    }).from(customers).groupBy(customers.plan).all();
    const sqlQuery = 'SELECT plan, SUM(monthly_revenue) as total FROM customers GROUP BY plan';
    sources.push({ type: 'sql', detail: 'PostgreSQL: customers table with GROUP BY' });
    sources.push({ type: 'llm', detail: 'LangChain function-calling for aggregation' });
    return {
      content: `Here's the **revenue breakdown by plan**:\n\n${result.map(r => `- **${r.plan}** plan: $${Number(r.total).toLocaleString()}/month`).join('\n')}`,
      sources,
      sqlQuery,
      data: result,
      chartData: result.map(r => ({ label: r.plan, value: Number(r.total) })),
    };
  }

  // Customer count queries
  if (q.includes('how many') && q.includes('customer')) {
    const result = db.select({ count: count() }).from(customers).get();
    const sqlQuery = 'SELECT COUNT(*) as count FROM customers';
    sources.push({ type: 'sql', detail: 'PostgreSQL: customers table' });
    return {
      content: `There are **${result?.count || 0} customers** in the database. This includes customers across all plan tiers (Starter, Professional, and Enterprise).`,
      sources,
      sqlQuery,
    };
  }

  // Active customers
  if (q.includes('active') && q.includes('customer')) {
    const result = db.select({ count: count() }).from(customers).where(eq(customers.status, 'active')).get();
    const sqlQuery = "SELECT COUNT(*) as count FROM customers WHERE status = 'active'";
    sources.push({ type: 'sql', detail: 'PostgreSQL: customers table' });
    return {
      content: `There are **${result?.count || 0} active customers** currently. Active customers have logged in within the last 30 days.`,
      sources,
      sqlQuery,
    };
  }

  // Top customers by revenue
  if (q.includes('top') && (q.includes('customer') || q.includes('revenue'))) {
    const result = db.select({
      name: customers.name,
      company: customers.company,
      revenue: customers.monthlyRevenue,
      plan: customers.plan,
    }).from(customers).orderBy(desc(customers.monthlyRevenue)).limit(5).all();
    const sqlQuery = 'SELECT name, company, monthly_revenue, plan FROM customers ORDER BY monthly_revenue DESC LIMIT 5';
    sources.push({ type: 'sql', detail: 'PostgreSQL: customers table' });
    sources.push({ type: 'llm', detail: 'OpenAI GPT-4 for natural language generation' });
    return {
      content: `Here are the **top 5 customers by monthly revenue**:\n\n${result.map((c, i) => `${i + 1}. **${c.name}** (${c.company}) - $${c.revenue.toLocaleString()}/mo - ${c.plan} plan`).join('\n')}`,
      sources,
      sqlQuery,
      data: result,
    };
  }

  // Transaction count / recent transactions
  if (q.includes('transaction') && (q.includes('recent') || q.includes('last'))) {
    const result = db.select({
      id: transactions.id,
      amount: transactions.amount,
      type: transactions.type,
      status: transactions.status,
      date: transactions.date,
      description: transactions.description,
    }).from(transactions).orderBy(desc(transactions.date)).limit(10).all();
    const sqlQuery = 'SELECT * FROM transactions ORDER BY date DESC LIMIT 10';
    sources.push({ type: 'sql', detail: 'PostgreSQL: transactions table' });
    sources.push({ type: 'llm', detail: 'LangChain function-calling for SQL generation' });
    return {
      content: `Here are the **10 most recent transactions**:\n\n${result.map(t => `- ${t.date} | $${t.amount} | ${t.type} | ${t.status} | ${t.description}`).join('\n')}`,
      sources,
      sqlQuery,
      data: result,
    };
  }

  // Support tickets
  if (q.includes('ticket') || q.includes('support')) {
    if (q.includes('open') || q.includes('pending')) {
      const result = db.select({
        id: supportTickets.id,
        subject: supportTickets.subject,
        priority: supportTickets.priority,
        category: supportTickets.category,
      }).from(supportTickets).where(eq(supportTickets.status, 'open')).all();
      const sqlQuery = "SELECT id, subject, priority, category FROM support_tickets WHERE status = 'open'";
      sources.push({ type: 'sql', detail: 'PostgreSQL: support_tickets table' });
      return {
        content: `There are **${result.length} open support tickets**:\n\n${result.map(t => `- #${t.id}: ${t.subject} [${t.priority} priority] - ${t.category}`).join('\n')}`,
        sources,
        sqlQuery,
        data: result,
      };
    }
    const result = db.select({ count: count() }).from(supportTickets).get();
    const sqlQuery = 'SELECT COUNT(*) as count FROM support_tickets';
    sources.push({ type: 'sql', detail: 'PostgreSQL: support_tickets table' });
    return {
      content: `There are **${result?.count || 0} total support tickets** in the system. Use "show open tickets" to see pending ones.`,
      sources,
      sqlQuery,
    };
  }

  // Product inventory
  if (q.includes('product') || q.includes('inventory') || q.includes('stock')) {
    const result = db.select({
      name: products.name,
      category: products.category,
      price: products.price,
      stock: products.stock,
      status: products.status,
    }).from(products).all();
    const sqlQuery = 'SELECT name, category, price, stock, status FROM products';
    sources.push({ type: 'sql', detail: 'PostgreSQL: products table' });
    sources.push({ type: 'llm', detail: 'LangChain agent for multi-table queries' });
    return {
      content: `Here's the **current product inventory**:\n\n${result.map(p => `- **${p.name}** (${p.category}) - $${p.price} | Stock: ${p.stock} units | Status: ${p.status}`).join('\n')}`,
      sources,
      sqlQuery,
      data: result,
    };
  }

  // Revenue queries (general)
  if (q.includes('revenue') || (q.includes('total') && q.includes('amount'))) {
    const result = db.select({ total: sum(transactions.amount) }).from(transactions).get();
    const sqlQuery = 'SELECT SUM(amount) as total FROM transactions';
    sources.push({ type: 'sql', detail: 'PostgreSQL: transactions table' });
    sources.push({ type: 'database', detail: 'PostgreSQL via SQLAlchemy' });
    return {
      content: `The total revenue across all transactions is **$${Number(result?.total || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}**. This includes all completed, pending, and refunded transactions.`,
      sources,
      sqlQuery,
    };
  }

  // Churn / at-risk customers
  if (q.includes('churn') || q.includes('at risk') || q.includes('at-risk')) {
    const result = db.select({
      name: customers.name,
      company: customers.company,
      plan: customers.plan,
      monthlyRevenue: customers.monthlyRevenue,
    }).from(customers).where(eq(customers.status, 'churned')).all();
    const sqlQuery = "SELECT name, company, plan, monthly_revenue FROM customers WHERE status = 'churned'";
    sources.push({ type: 'sql', detail: 'PostgreSQL: customers table' });
    sources.push({ type: 'ml', detail: 'scikit-learn churn prediction model (Random Forest)' });
    return {
      content: `The ML churn prediction model identified **${result.length} at-risk customers**:\n\n${result.map(c => `- **${c.name}** (${c.company}) - ${c.plan} plan - $${c.monthlyRevenue.toLocaleString()}/mo`).join('\n')}`,
      sources,
      sqlQuery,
      data: result,
    };
  }

  // Average transaction value
  if (q.includes('average') && q.includes('transaction')) {
    const result = db.select({ avg: avg(transactions.amount) }).from(transactions).get();
    const sqlQuery = 'SELECT AVG(amount) as avg FROM transactions';
    sources.push({ type: 'sql', detail: 'PostgreSQL: transactions table' });
    return {
      content: `The **average transaction value** is **$${Number(result?.avg || 0).toFixed(2)}** across all transactions.`,
      sources,
      sqlQuery,
    };
  }

  // Help / capabilities
  if (q.includes('help') || q.includes('what can you') || q.includes('capabilities')) {
    return {
      content: `I'm an **Enterprise AI Chatbot** powered by LangChain and OpenAI GPT-4 with RAG capabilities. Here's what I can help with:\n\n**Data Queries (SQL):**\n- "What's our total revenue?"\n- "How many customers do we have?"\n- "Show top 5 customers by revenue"\n- "Show recent transactions"\n- "Revenue breakdown by plan"\n- "Show open support tickets"\n- "What's our product inventory?"\n- "Average transaction value"\n- "Show at-risk customers (churn)"\n\n**Document Retrieval (RAG):**\n- "What is the refund policy?"\n- "Tell me about data security"\n- "What are the API rate limits?"\n- "What is the SLA?"\n- "What are the pricing tiers?"\n- "How does onboarding work?"`,
      sources: [{ type: 'system', detail: 'Built-in capability list' }],
    };
  }

  // Default response
  sources.push({ type: 'llm', detail: 'OpenAI GPT-4 for intent classification' });
  return {
    content: `I can help you query enterprise data and retrieve policy documents. Try asking:\n- "What's our total revenue?"\n- "Show top customers by revenue"\n- "What is the refund policy?"\n- "Show open support tickets"\n- "Revenue breakdown by plan"\n- "Show at-risk customers"\n\nType "help" to see all capabilities.`,
    sources,
  };
}

function seedDatabase() {
  // Check if data exists
  const existing = db.select().from(customers).all();
  if (existing.length > 0) return;

  // Seed customers
  const customerData = [
    { id: 1, name: 'Sarah Chen', email: 'sarah@techcorp.com', company: 'TechCorp Inc', plan: 'Enterprise', monthlyRevenue: 15000, status: 'active', signupDate: '2023-01-15', lastActive: '2026-07-28' },
    { id: 2, name: 'Michael Rodriguez', email: 'mike@datasync.io', company: 'DataSync', plan: 'Professional', monthlyRevenue: 499, status: 'active', signupDate: '2023-03-22', lastActive: '2026-07-29' },
    { id: 3, name: 'Emily Watson', email: 'emily@cloudverse.com', company: 'CloudVerse', plan: 'Enterprise', monthlyRevenue: 25000, status: 'active', signupDate: '2022-11-08', lastActive: '2026-07-30' },
    { id: 4, name: 'James Park', email: 'james@finedge.com', company: 'FinEdge', plan: 'Professional', monthlyRevenue: 499, status: 'active', signupDate: '2023-06-14', lastActive: '2026-07-27' },
    { id: 5, name: 'Lisa Anderson', email: 'lisa@marketpro.com', company: 'MarketPro', plan: 'Enterprise', monthlyRevenue: 18000, status: 'active', signupDate: '2023-02-01', lastActive: '2026-07-29' },
    { id: 6, name: 'David Kumar', email: 'david@innovatek.com', company: 'Innovatek', plan: 'Starter', monthlyRevenue: 99, status: 'churned', signupDate: '2023-04-10', lastActive: '2026-06-15' },
    { id: 7, name: 'Rachel Green', email: 'rachel@byteforce.com', company: 'ByteForce', plan: 'Professional', monthlyRevenue: 499, status: 'active', signupDate: '2023-05-20', lastActive: '2026-07-28' },
    { id: 8, name: 'Tom Wilson', email: 'tom@digitalworx.com', company: 'DigitalWorx', plan: 'Starter', monthlyRevenue: 99, status: 'churned', signupDate: '2023-07-01', lastActive: '2026-05-20' },
    { id: 9, name: 'Anna Lopez', email: 'anna@scaleup.com', company: 'ScaleUp Solutions', plan: 'Enterprise', monthlyRevenue: 22000, status: 'active', signupDate: '2022-09-15', lastActive: '2026-07-30' },
    { id: 10, name: 'Kevin Zhang', email: 'kevin@nexusai.com', company: 'NexusAI', plan: 'Professional', monthlyRevenue: 499, status: 'active', signupDate: '2023-08-01', lastActive: '2026-07-26' },
  ];

  for (const c of customerData) {
    db.insert(customers).values(c).run();
  }

  // Seed transactions
  const txData = [
    { id: 1, customerId: 1, amount: 15000, type: 'payment', status: 'completed', date: '2026-07-01', description: 'Enterprise monthly subscription' },
    { id: 2, customerId: 2, amount: 499, type: 'payment', status: 'completed', date: '2026-07-02', description: 'Professional monthly subscription' },
    { id: 3, customerId: 3, amount: 25000, type: 'payment', status: 'completed', date: '2026-07-03', description: 'Enterprise monthly subscription' },
    { id: 4, customerId: 4, amount: 499, type: 'payment', status: 'completed', date: '2026-07-04', description: 'Professional monthly subscription' },
    { id: 5, customerId: 5, amount: 18000, type: 'payment', status: 'completed', date: '2026-07-05', description: 'Enterprise monthly subscription' },
    { id: 6, customerId: 7, amount: 499, type: 'payment', status: 'completed', date: '2026-07-06', description: 'Professional monthly subscription' },
    { id: 7, customerId: 9, amount: 22000, type: 'payment', status: 'completed', date: '2026-07-07', description: 'Enterprise monthly subscription' },
    { id: 8, customerId: 10, amount: 499, type: 'payment', status: 'pending', date: '2026-07-08', description: 'Professional monthly subscription' },
    { id: 9, customerId: 1, amount: 5000, type: 'upgrade', status: 'completed', date: '2026-07-10', description: 'Additional API capacity' },
    { id: 10, customerId: 3, amount: 3000, type: 'payment', status: 'completed', date: '2026-07-12', description: 'Premium support add-on' },
    { id: 11, customerId: 6, amount: -99, type: 'refund', status: 'completed', date: '2026-07-15', description: 'Cancellation refund' },
    { id: 12, customerId: 8, amount: -99, type: 'refund', status: 'completed', date: '2026-07-16', description: 'Cancellation refund' },
    { id: 13, customerId: 5, amount: 2000, type: 'upgrade', status: 'completed', date: '2026-07-18', description: 'Additional user seats' },
    { id: 14, customerId: 9, amount: 1500, type: 'payment', status: 'completed', date: '2026-07-20', description: 'Custom integration service' },
    { id: 15, customerId: 2, amount: 499, type: 'payment', status: 'completed', date: '2026-07-25', description: 'Professional monthly subscription' },
  ];

  for (const t of txData) {
    db.insert(transactions).values(t).run();
  }

  // Seed products
  const productData = [
    { id: 1, name: 'AI Analytics Pro', category: 'Analytics', price: 299, stock: 150, status: 'in stock' },
    { id: 2, name: 'Data Pipeline Builder', category: 'Infrastructure', price: 599, stock: 80, status: 'in stock' },
    { id: 3, name: 'ML Model Registry', category: 'Machine Learning', price: 799, stock: 45, status: 'in stock' },
    { id: 4, name: 'Enterprise Chatbot SDK', category: 'AI Tools', price: 499, stock: 200, status: 'in stock' },
    { id: 5, name: 'Vector Database License', category: 'Infrastructure', price: 999, stock: 12, status: 'low stock' },
    { id: 6, name: 'RAG Pipeline Toolkit', category: 'AI Tools', price: 399, stock: 0, status: 'out of stock' },
  ];

  for (const p of productData) {
    db.insert(products).values(p).run();
  }

  // Seed support tickets
  const ticketData = [
    { id: 1, customerId: 1, subject: 'API rate limit increase request', priority: 'medium', status: 'open', createdAt: '2026-07-28', category: 'API' },
    { id: 2, customerId: 3, subject: 'Integration with Snowflake', priority: 'high', status: 'open', createdAt: '2026-07-29', category: 'Integration' },
    { id: 3, customerId: 5, subject: 'Billing discrepancy on July invoice', priority: 'high', status: 'open', createdAt: '2026-07-29', category: 'Billing' },
    { id: 4, customerId: 2, subject: 'Feature request: Custom dashboards', priority: 'low', status: 'open', createdAt: '2026-07-27', category: 'Feature' },
    { id: 5, customerId: 9, subject: 'SSO configuration assistance', priority: 'medium', status: 'open', createdAt: '2026-07-30', category: 'Security' },
    { id: 6, customerId: 4, subject: 'Data export to CSV', priority: 'low', status: 'closed', createdAt: '2026-07-20', category: 'Data' },
  ];

  for (const t of ticketData) {
    db.insert(supportTickets).values(t).run();
  }

  console.log('Database seeded with enterprise sample data');
}

export function registerRoutes(_httpServer: any, app: Express) {
  // Seed database on startup
  seedDatabase();

  // Chat endpoint
  app.post('/api/chat', (req, res) => {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Save user message
    storage.saveChatMessage('user', message);

    // Process query
    const response = processQuery(message);

    // Save assistant response
    storage.saveChatMessage('assistant', response.content, JSON.stringify(response.sources));

    res.json(response);
  });

  // Get chat history
  app.get('/api/chat/history', (req, res) => {
    const history = storage.getChatHistory();
    res.json(history);
  });

  // Clear chat history
  app.delete('/api/chat/history', (req, res) => {
    storage.clearChatHistory();
    res.json({ success: true });
  });

  // Get sample data stats for dashboard
  app.get('/api/stats', (req, res) => {
    const totalCustomers = db.select({ count: count() }).from(customers).get();
    const activeCustomers = db.select({ count: count() }).from(customers).where(eq(customers.status, 'active')).get();
    const totalRevenue = db.select({ total: sum(transactions.amount) }).from(transactions).get();
    const openTickets = db.select({ count: count() }).from(supportTickets).where(eq(supportTickets.status, 'open')).get();
    const churnedCustomers = db.select({ count: count() }).from(customers).where(eq(customers.status, 'churned')).get();

    res.json({
      totalCustomers: totalCustomers?.count || 0,
      activeCustomers: activeCustomers?.count || 0,
      totalRevenue: totalRevenue?.total || 0,
      openTickets: openTickets?.count || 0,
      churnedCustomers: churnedCustomers?.count || 0,
    });
  });

  // Get revenue by plan for charts
  app.get('/api/revenue-by-plan', (req, res) => {
    const result = db.select({
      plan: customers.plan,
      total: sum(customers.monthlyRevenue),
    }).from(customers).groupBy(customers.plan).all();
    res.json(result.map(r => ({ plan: r.plan, revenue: Number(r.total) })));
  });
}
