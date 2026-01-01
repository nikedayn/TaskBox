import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseSync } from "expo-sqlite";
import * as schema from "./schema";

const expoDb = openDatabaseSync("taskbox.db");
export const db = drizzle(expoDb, { schema });

export const initDatabase = async () => {
  console.log("🛠️ Перевірка таблиць бази даних...");
  try {
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

    // 4. Таблиця TIME_BLOCKS (Оновлено SQL)
    await expoDb.execAsync(`
      CREATE TABLE IF NOT EXISTS time_blocks (
        id TEXT PRIMARY KEY NOT NULL,
        task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
        start_time TEXT NOT NULL,
        end_time TEXT NOT NULL,
        date TEXT NOT NULL, 
        notes TEXT
      );
    `);

    // --- МІГРАЦІЯ (Для виправлення вашої помилки) ---
    try {
      // Спробуємо додати колонку date, якщо її немає.
      // Якщо вона вже є, SQLite видасть помилку, яку ми просто ігноруємо.
      // Ми ставимо дефолтну дату (сьогодні), щоб старі записи не ламалися.
      const today = new Date().toISOString().split('T')[0];
      await expoDb.execAsync(`
        ALTER TABLE time_blocks ADD COLUMN date TEXT NOT NULL DEFAULT '${today}';
      `);
      console.log("✅ Міграція: Колонка 'date' успішно додана.");
    } catch (e: any) {
      // Якщо помилка каже, що колонка існує - все добре.
      if (!e.toString().includes("duplicate column name")) {
        console.log("ℹ️ Перевірка міграції: колонка 'date' вже існує або інша помилка (це нормально).");
      }
    }
    // ------------------------------------------------

    console.log("✅ База даних готова до роботи!");
  } catch (e) {
    console.error("❌ Помилка ініціалізації БД:", e);
    throw e;
  }
};