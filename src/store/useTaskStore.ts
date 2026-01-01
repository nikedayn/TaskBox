import { create } from 'zustand';
import { db } from '../db/client';
import { tasks, categories, timeBlocks, type Task, type Category, type TimeBlock } from '../db/schema';
import { eq, desc } from 'drizzle-orm';
import * as Crypto from 'expo-crypto';

interface TaskState {
  tasks: Task[];
  categories: Category[];
  timeBlocks: TimeBlock[]; // <--- Нове

  fetchTasks: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  fetchTimeBlocks: () => Promise<void>; // <--- Нове
  initData: () => Promise<void>;

  addTask: (title: string, categoryId?: string) => Promise<void>;
  toggleTaskCompletion: (id: string, isCompleted: boolean) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  
  // Призначити задачу на час
  assignTaskToTime: (taskId: string, time: string) => Promise<void>;
  // Видалити з розкладу
  removeFromSchedule: (blockId: string) => Promise<void>;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  categories: [],
  timeBlocks: [],

  fetchTasks: async () => {
    try {
      const result = await db.select().from(tasks).orderBy(desc(tasks.createdAt));
      set({ tasks: result });
    } catch (e) { console.error(e); }
  },

  fetchCategories: async () => {
    try {
      const result = await db.select().from(categories);
      set({ categories: result });
    } catch (e) { console.error(e); }
  },

  fetchTimeBlocks: async () => {
    try {
      const result = await db.select().from(timeBlocks);
      set({ timeBlocks: result });
    } catch (e) { console.error(e); }
  },

  initData: async () => {
    try {
      const cats = await db.select().from(categories);
      if (cats.length === 0) {
        await db.insert(categories).values([
          { id: Crypto.randomUUID(), name: 'Робота', color: '#4dabf5' },
          { id: Crypto.randomUUID(), name: 'Дім', color: '#66bb6a' },
          { id: Crypto.randomUUID(), name: 'Навчання', color: '#ab47bc' }
        ]);
      }
      get().fetchCategories();
      get().fetchTasks();
      get().fetchTimeBlocks(); // Не забуваємо завантажити блоки
    } catch (e) { console.error(e); }
  },

  addTask: async (title, categoryId) => {
    try {
      await db.insert(tasks).values({ title, categoryId: categoryId || null });
      get().fetchTasks();
    } catch (e) { console.error(e); }
  },

  toggleTaskCompletion: async (id, isCompleted) => {
    try {
      await db.update(tasks).set({ isCompleted: !isCompleted }).where(eq(tasks.id, id));
      get().fetchTasks();
    } catch (e) { console.error(e); }
  },

  updateTask: async (id, updates) => {
    try {
      await db.update(tasks).set(updates).where(eq(tasks.id, id));
      get().fetchTasks();
    } catch (e) { console.error(e); }
  },

  deleteTask: async (id) => {
    try {
      await db.delete(tasks).where(eq(tasks.id, id));
      get().fetchTasks();
    } catch (e) { console.error(e); }
  },

  // 👇 НОВІ МЕТОДИ
  assignTaskToTime: async (taskId, time) => {
    try {
      // Видаляємо старі блоки на цей час, якщо були
      // (Спрощена логіка: одна задача на одну годину)
      const existing = get().timeBlocks.filter(b => b.startTime === time);
      for (const block of existing) {
        await db.delete(timeBlocks).where(eq(timeBlocks.id, block.id));
      }

      await db.insert(timeBlocks).values({
        taskId,
        startTime: time,
        endTime: time, // Поки що для простоти старт=кінець
      });
      get().fetchTimeBlocks();
    } catch (e) { console.error(e); }
  },

  removeFromSchedule: async (blockId) => {
    try {
      await db.delete(timeBlocks).where(eq(timeBlocks.id, blockId));
      get().fetchTimeBlocks();
    } catch (e) { console.error(e); }
  }
}));