import { drizzle } from "drizzle-orm/expo-sqlite";
// 👇 ВИПРАВЛЕННЯ: прибрали "/next", тепер просто "expo-sqlite"
import { openDatabaseSync } from "expo-sqlite"; 
import * as schema from "./schema";

// 1. Відкриваємо файл бази даних
const expoDb = openDatabaseSync("taskbox.db");

// 2. Підключаємо Drizzle (передаємо об'єкт бази даних)
export const db = drizzle(expoDb, { schema });

// 3. ФУНКЦІЯ СТВОРЕННЯ ТАБЛИЦЬ (Манюальна міграція)
export const initDatabase = async () => {
  try {
    // Створюємо таблицю категорій
    await expoDb.execAsync(`
      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        color TEXT NOT NULL
      );
    `);

    // Створюємо таблицю задач
    await expoDb.execAsync(`
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY NOT NULL,
        title TEXT NOT NULL,
        is_completed BOOLEAN DEFAULT false,
        is_urgent BOOLEAN DEFAULT false,
        is_important BOOLEAN DEFAULT false,
        category_id TEXT,
        created_at INTEGER DEFAULT (strftime('%s', 'now'))
      );
    `);

    // Створюємо таблицю розкладу
    await expoDb.execAsync(`
      CREATE TABLE IF NOT EXISTS time_blocks (
        id TEXT PRIMARY KEY NOT NULL,
        task_id TEXT NOT NULL,
        start_time TEXT NOT NULL,
        end_time TEXT NOT NULL
      );
    `);
    
    console.log("Таблиці успішно перевірено/створено ✅");
  } catch (e) {
    console.error("Помилка при створенні таблиць:", e);
  }
};

// Запускаємо створення таблиць одразу при імпорті файлу
initDatabase();