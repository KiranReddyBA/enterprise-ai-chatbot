import { sqliteTable, text, real, integer } from 'drizzle-orm/sqlite-core';

// Enterprise sample data tables
export const customers = sqliteTable('customers', {
  id: integer('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  company: text('company').notNull(),
  plan: text('plan').notNull(),
  monthlyRevenue: real('monthly_revenue').notNull(),
  status: text('status').notNull(),
  signupDate: text('signup_date').notNull(),
  lastActive: text('last_active').notNull(),
});

export const transactions = sqliteTable('transactions', {
  id: integer('id').primaryKey(),
  customerId: integer('customer_id').notNull(),
  amount: real('amount').notNull(),
  type: text('type').notNull(),
  status: text('status').notNull(),
  date: text('date').notNull(),
  description: text('description').notNull(),
});

export const products = sqliteTable('products', {
  id: integer('id').primaryKey(),
  name: text('name').notNull(),
  category: text('category').notNull(),
  price: real('price').notNull(),
  stock: integer('stock').notNull(),
  status: text('status').notNull(),
});

export const supportTickets = sqliteTable('support_tickets', {
  id: integer('id').primaryKey(),
  customerId: integer('customer_id').notNull(),
  subject: text('subject').notNull(),
  priority: text('priority').notNull(),
  status: text('status').notNull(),
  createdAt: text('created_at').notNull(),
  category: text('category').notNull(),
});

// Chat messages table for conversation history
export const chatMessages = sqliteTable('chat_messages', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  role: text('role').notNull(),
  content: text('content').notNull(),
  timestamp: text('timestamp').notNull(),
  sources: text('sources'),
});

// Types
export type Customer = typeof customers.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
export type Product = typeof products.$inferSelect;
export type SupportTicket = typeof supportTickets.$inferSelect;
export type ChatMessage = typeof chatMessages.$inferSelect;
