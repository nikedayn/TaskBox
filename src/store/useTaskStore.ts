import { create } from 'zustand';
import { initDatabase, db } from '../db/client';
import { tasks, categories, timeBlocks, type Task, type Category, type TimeBlock } from '../db/schema';
import { eq, desc } from 'drizzle-orm';
import * as Crypto from 'expo-crypto';
import { Alert } from 'react-native'; // 👈 Додано для відображення помилок

interface TaskState {
  tasks: Task[];
  categories: Category[];
  timeBlocks: TimeBlock[];

  // Завантаження даних
  fetchTasks: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  fetchTimeBlocks: () => Promise<void>;
  
  // Ініціалізація (створення дефолтних категорій)
  initData: () => Promise<void>;

  // Робота з задачами
  addTask: (title: string, categoryId?: string) => Promise<void>;
  toggleTaskCompletion: (id: string, isCompleted: boolean) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  
  // Робота з розкладом
  assignTaskToTime: (taskId: string, time: string) => Promise<void>;
  removeFromSchedule: (blockId: string) => Promise<void>;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  categories: [],
  timeBlocks: [],

  // --- ЗАВАНТАЖЕННЯ ДАНИХ ---
  
  fetchTasks: async () => {
    try {
      const result = await db.select().from(tasks).orderBy(desc(tasks.createdAt));
      set({ tasks: result });
    } catch (e: any) {
      console.error("Fetch Tasks Error:", e);
      // Alert.alert("Помилка", "Не вдалося завантажити задачі: " + e.toString());
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
      const result = await db.select().from(timeBlocks);
      set({ timeBlocks: result });
    } catch (e) {
      console.error(e);
    }
  },

  // --- ІНІЦІАЛІЗАЦІЯ ---

  initData: async () => {
    try {
      console.log("⏳ Чекаю на базу даних...");
      
      // 👇 КЛЮЧОВИЙ МОМЕНТ: Чекаємо створення таблиць!
      await initDatabase(); 

      console.log("📥 Починаю завантаження даних...");
      
      // Тепер безпечно читати дані
      await get().fetchCategories();
      await get().fetchTasks();
      await get().fetchTimeBlocks();

      // Створення дефолтних категорій, якщо пусто
      const currentCats = get().categories;
      if (currentCats.length === 0) {
        console.log("✨ Створюю дефолтні категорії...");
        await db.insert(categories).values([
          { id: Crypto.randomUUID(), name: 'Робота', color: '#4dabf5', isSystem: true },
          { id: Crypto.randomUUID(), name: 'Дім', color: '#66bb6a', isSystem: true },
          { id: Crypto.randomUUID(), name: 'Навчання', color: '#ab47bc', isSystem: true }
        ]);
        await get().fetchCategories();
      }
    } catch (e: any) {
      console.error(e);
      Alert.alert("Критична помилка", "Не вдалося ініціалізувати базу даних:\n" + e.toString());
    }
  },

  // --- ЗАДАЧІ (CRUD) ---

  addTask: async (title, categoryId) => {
    try {
      if (!title.trim()) return;
      
      await db.insert(tasks).values({ 
        title, 
        categoryId: categoryId || null 
      });
      
      // Одразу оновлюємо список
      await get().fetchTasks();
    } catch (e: any) {
      console.error(e);
      // 🔥 ОСЬ ЦЕ ПОКАЖЕ ТОБІ, ЧОМУ НЕ ЗБЕРІГАЄТЬСЯ
      Alert.alert("Помилка збереження", "Не вдалося створити задачу. Причина:\n" + e.toString());
    }
  },

  toggleTaskCompletion: async (id, isCompleted) => {
    try {
      await db.update(tasks).set({ isCompleted: !isCompleted }).where(eq(tasks.id, id));
      get().fetchTasks();
    } catch (e: any) {
      console.error(e);
      Alert.alert("Помилка", e.toString());
    }
  },

  updateTask: async (id, updates) => {
    try {
      await db.update(tasks).set(updates).where(eq(tasks.id, id));
      get().fetchTasks();
    } catch (e: any) {
      console.error(e);
      Alert.alert("Помилка оновлення", e.toString());
    }
  },

  deleteTask: async (id) => {
    try {
      await db.delete(tasks).where(eq(tasks.id, id));
      get().fetchTasks();
      // Також треба оновити розклад, якщо задача була там
      get().fetchTimeBlocks();
    } catch (e: any) {
      console.error(e);
      Alert.alert("Помилка видалення", e.toString());
    }
  },

  // --- РОЗКЛАД ---

  assignTaskToTime: async (taskId, time) => {
    try {
      // Видаляємо старий блок на цей час (щоб не було дублів)
      const existing = get().timeBlocks.filter(b => b.startTime === time);
      for (const block of existing) {
        await db.delete(timeBlocks).where(eq(timeBlocks.id, block.id));
      }

      // Створюємо новий
      await db.insert(timeBlocks).values({
        taskId,
        startTime: time,
        endTime: time, 
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