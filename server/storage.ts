import { db } from './db';
import { customers, transactions, products, supportTickets, chatMessages } from '../shared/schema';
import { sql } from 'drizzle-orm';

export interface IStorage {
  getCustomers(): any[];
  getTransactions(): any[];
  getProducts(): any[];
  getTickets(): any[];
  getChatHistory(): any[];
  saveChatMessage(role: string, content: string, sources?: string): void;
  clearChatHistory(): void;
}

export class MemStorage implements IStorage {
  getCustomers() {
    return db.select().from(customers).all();
  }
  getTransactions() {
    return db.select().from(transactions).all();
  }
  getProducts() {
    return db.select().from(products).all();
  }
  getTickets() {
    return db.select().from(supportTickets).all();
  }
  getChatHistory() {
    return db.select().from(chatMessages).all();
  }
  saveChatMessage(role: string, content: string, sources?: string) {
    db.insert(chatMessages).values({
      role,
      content,
      timestamp: new Date().toISOString(),
      sources: sources || null,
    }).run();
  }
  clearChatHistory() {
    db.delete(chatMessages).run();
  }
}

export const storage = new MemStorage();
