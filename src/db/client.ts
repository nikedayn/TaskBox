import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseSync } from "expo-sqlite";
import * as schema from "./schema";

const expoDb = openDatabaseSync("taskbox.db");
export const db = drizzle(expoDb, { schema });

export const initDatabase = async () => {
  console.log("🛠️ Перевірка таблиць бази даних...");
  try {
    // ❌ МИ ПРИБРАЛИ ЦІ РЯДКИ (вони видаляли дані):
    // await expoDb.execAsync(`DROP TABLE IF EXISTS subtasks;`);
    // await expoDb.execAsync(`DROP TABLE IF EXISTS time_blocks;`);
    // await expoDb.execAsync(`DROP TABLE IF EXISTS tasks;`);
    // await expoDb.execAsync(`DROP TABLE IF EXISTS categories;`);
    
    // ✅ Цей код залишаємо. "IF NOT EXISTS" означає:
    // "Створи таблицю, тільки якщо її ще немає". 
    // Якщо вона є (і там є ваші задачі), він нічого не чіпатиме.

    // 1. Таблиця CATEGORIES
    await expoDb.execAsync(`
      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        color TEXT NOT NULL,
        is_system BOOLEAN DEFAULT false
      );
    `);

    // 2. Таблиця TASKS
    await expoDb.execAsync(`
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        category_id TEXT REFERENCES categories(id),
        is_completed BOOLEAN DEFAULT false,
        is_archived BOOLEAN DEFAULT false,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        is_urgent BOOLEAN DEFAULT false,
        is_important BOOLEAN DEFAULT false
      );
    `);

    // 3. Таблиця SUBTASKS
    await expoDb.execAsync(`
      CREATE TABLE IF NOT EXISTS subtasks (
        id TEXT PRIMARY KEY NOT NULL,
        task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        is_completed BOOLEAN DEFAULT false
      );
    `);

    // 4. Таблиця TIME_BLOCKS
    await expoDb.execAsync(`
      CREATE TABLE IF NOT EXISTS time_blocks (
        id TEXT PRIMARY KEY NOT NULL,
        task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
        start_time TEXT NOT NULL,
        end_time TEXT NOT NULL,
        notes TEXT
      );
    `);
    
    console.log("✅ База даних готова до роботи!");
  } catch (e) {
    console.error("❌ Помилка ініціалізації БД:", e);
    throw e;
  }
};