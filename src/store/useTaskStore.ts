import { create } from 'zustand';
import { initDatabase, db } from '../db/client';
import { tasks, categories, timeBlocks, type Task, type Category, type TimeBlock } from '../db/schema';
import { eq, desc } from 'drizzle-orm';
import * as Crypto from 'expo-crypto';
import { Alert } from 'react-native';

interface TaskState {
  tasks: Task[];
  categories: Category[];
  timeBlocks: TimeBlock[];

  fetchTasks: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  fetchTimeBlocks: () => Promise<void>;
  initData: () => Promise<void>;

  addTask: (title: string, categoryId?: string) => Promise<void>;
  toggleTaskCompletion: (id: string, isCompleted: boolean) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  
  // Оновлено: тепер приймає date
  assignTaskToTime: (taskId: string, time: string, date: string) => Promise<void>;
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
    } catch (e: any) {
      console.error("Fetch Tasks Error:", e);
    }
  },

  fetchCategories: async () => {
    try {
      const result = await db.select().from(categories);
      set({ categories: result });
    } catch (e) {
      console.error(e);
    }
  },

  fetchTimeBlocks: async () => {
    try {
      // Тут можна додати фільтрацію по даті, якщо даних стане дуже багато
      const result = await db.select().from(timeBlocks);
      set({ timeBlocks: result });
    } catch (e) {
      console.error(e);
    }
  },

  initData: async () => {
    try {
      console.log("⏳ Чекаю на базу даних...");
      await initDatabase(); 
      console.log("📥 Починаю завантаження даних...");
      
      await get().fetchCategories();
      await get().fetchTasks();
      await get().fetchTimeBlocks();

      const currentCats = get().categories;
      if (currentCats.length === 0) {
        await db.insert(categories).values([
          { id: Crypto.randomUUID(), name: 'Робота', color: '#4dabf5', isSystem: true },
          { id: Crypto.randomUUID(), name: 'Дім', color: '#66bb6a', isSystem: true },
          { id: Crypto.randomUUID(), name: 'Навчання', color: '#ab47bc', isSystem: true }
        ]);
        await get().fetchCategories();
      }
    } catch (e: any) {
      console.error(e);
      Alert.alert("Критична помилка", e.toString());
    }
  },

  addTask: async (title, categoryId) => {
    try {
      if (!title.trim()) return;
      await db.insert(tasks).values({ title, categoryId: categoryId || null });
      await get().fetchTasks();
    } catch (e: any) {
      console.error(e);
      Alert.alert("Помилка збереження", e.toString());
    }
  },

  toggleTaskCompletion: async (id, isCompleted) => {
    try {
      await db.update(tasks).set({ isCompleted: !isCompleted }).where(eq(tasks.id, id));
      get().fetchTasks();
    } catch (e: any) {
      console.error(e);
    }
  },

  updateTask: async (id, updates) => {
    try {
      await db.update(tasks).set(updates).where(eq(tasks.id, id));
      get().fetchTasks();
    } catch (e: any) {
      console.error(e);
    }
  },

  deleteTask: async (id) => {
    try {
      await db.delete(tasks).where(eq(tasks.id, id));
      get().fetchTasks();
      get().fetchTimeBlocks();
    } catch (e: any) {
      console.error(e);
    }
  },

  // Оновлена функція з датою
  assignTaskToTime: async (taskId, time, date) => {
    try {
      // Видаляємо старий блок на цей час І ЦЮ ДАТУ
      const allBlocks = get().timeBlocks;
      const existing = allBlocks.filter(b => b.startTime === time && b.date === date);
      
      for (const block of existing) {
        await db.delete(timeBlocks).where(eq(timeBlocks.id, block.id));
      }

      await db.insert(timeBlocks).values({
        taskId,
        startTime: time,
        endTime: time,
        date: date // Зберігаємо дату
      });
      get().fetchTimeBlocks();
    } catch (e: any) {
      console.error(e);
      Alert.alert("Помилка розкладу", e.toString());
    }
  },

  removeFromSchedule: async (blockId) => {
    try {
      await db.delete(timeBlocks).where(eq(timeBlocks.id, blockId));
      get().fetchTimeBlocks();
    } catch (e: any) {
      console.error(e);
    }
  }
}));