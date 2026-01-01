import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseSync } from "expo-sqlite";
import * as schema from "./schema";

const expoDb = openDatabaseSync("taskbox.db");
export const db = drizzle(expoDb, { schema });

export const initDatabase = async () => {
  console.log("🛠️ Починаю створення таблиць (повна синхронізація)...");
  try {
    // 1. Видаляємо ВСІ старі таблиці, щоб гарантувати чистоту структури
    await expoDb.execAsync(`DROP TABLE IF EXISTS subtasks;`); // Спочатку дочірні
    await expoDb.execAsync(`DROP TABLE IF EXISTS time_blocks;`);
    await expoDb.execAsync(`DROP TABLE IF EXISTS tasks;`);
    await expoDb.execAsync(`DROP TABLE IF EXISTS categories;`);
    
    // 2. Таблиця CATEGORIES
    await expoDb.execAsync(`
      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        color TEXT NOT NULL,
        is_system BOOLEAN DEFAULT false
      );
    `);

    // 3. Таблиця TASKS (Всі поля зі схеми)
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

    // 4. Таблиця SUBTASKS (Нова!)
    await expoDb.execAsync(`
      CREATE TABLE IF NOT EXISTS subtasks (
        id TEXT PRIMARY KEY NOT NULL,
        task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        is_completed BOOLEAN DEFAULT false
      );
    `);

    // 5. Таблиця TIME_BLOCKS (Додано notes)
    await expoDb.execAsync(`
      CREATE TABLE IF NOT EXISTS time_blocks (
        id TEXT PRIMARY KEY NOT NULL,
        task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
        start_time TEXT NOT NULL,
        end_time TEXT NOT NULL,
        notes TEXT
      );
    `);
    
    console.log("✅ Всі таблиці успішно створено згідно схеми!");
  } catch (e) {
    console.error("❌ Помилка БД:", e);
    throw e;
  }
};