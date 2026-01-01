import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import * as Crypto from 'expo-crypto';

const generateId = () => Crypto.randomUUID();

// 1. Categories
export const categories = sqliteTable('categories', {
  id: text('id').primaryKey().$defaultFn(generateId),
  name: text('name').notNull(),
  color: text('color').notNull(),
  isSystem: integer('is_system', { mode: 'boolean' }).default(false),
});

// 2. Tasks
export const tasks = sqliteTable('tasks', {
  id: text('id').primaryKey().$defaultFn(generateId),
  title: text('title').notNull(),
  description: text('description'),
  categoryId: text('category_id').references(() => categories.id),
  isCompleted: integer('is_completed', { mode: 'boolean' }).default(false),
  isArchived: integer('is_archived', { mode: 'boolean' }).default(false),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  isUrgent: integer('is_urgent', { mode: 'boolean' }).default(false),
  isImportant: integer('is_important', { mode: 'boolean' }).default(false),
});

// 3. Subtasks
export const subtasks = sqliteTable('subtasks', {
  id: text('id').primaryKey().$defaultFn(generateId),
  taskId: text('task_id').references(() => tasks.id, { onDelete: 'cascade' }).notNull(),
  title: text('title').notNull(),
  isCompleted: integer('is_completed', { mode: 'boolean' }).default(false),
});

// 4. TimeBlocks (ОНОВЛЕНО)
export const timeBlocks = sqliteTable('time_blocks', {
  id: text('id').primaryKey().$defaultFn(generateId),
  taskId: text('task_id').references(() => tasks.id, { onDelete: 'cascade' }).notNull(),
  startTime: text('start_time').notNull(), // Наприклад "14:00"
  endTime: text('end_time').notNull(),     // Наприклад "15:00"
  date: text('date').notNull(),            // <--- НОВЕ ПОЛЕ: "YYYY-MM-DD"
  notes: text('notes'),
});

// Types export
export type Category = typeof categories.$inferSelect;
export type Task = typeof tasks.$inferSelect;
export type Subtask = typeof subtasks.$inferSelect;
export type TimeBlock = typeof timeBlocks.$inferSelect;