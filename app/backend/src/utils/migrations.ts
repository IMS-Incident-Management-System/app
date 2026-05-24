import { sequelize } from '../models/sequelize';
import { QueryInterface, QueryTypes } from 'sequelize';
import fs from 'fs';
import path from 'path';

interface Migration {
  filename: string;
  appliedAt: Date;
}

/**
 * Создаёт таблицу для отслеживания применённых миграций
 */
async function ensureMigrationsTable(): Promise<void> {
  const queryInterface: QueryInterface = sequelize.getQueryInterface();
  
  const tableExists = await queryInterface.showAllTables().then(tables => 
    tables.includes('migrations')
  );

  if (!tableExists) {
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) UNIQUE NOT NULL,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      COMMENT ON TABLE migrations IS 'Таблица для отслеживания применённых миграций';
      COMMENT ON COLUMN migrations.filename IS 'Имя файла миграции';
      COMMENT ON COLUMN migrations.applied_at IS 'Дата и время применения миграции';
    `);
    console.log('✅ Таблица migrations создана');
  }
}

/**
 * Получает список уже применённых миграций
 */
async function getAppliedMigrations(): Promise<string[]> {
  try {
    const results = await sequelize.query<Migration>(
      'SELECT filename FROM migrations ORDER BY applied_at ASC',
      { type: QueryTypes.SELECT }
    );
    return results.map(r => r.filename);
  } catch (error) {
    console.error('Ошибка при получении списка миграций:', error);
    return [];
  }
}

/**
 * Получает путь к директории миграций
 */
function getMigrationsDirectory(): string {
  // Определяем путь в зависимости от окружения
  // В production (скомпилированный): dist/src/utils -> ../../../migrations
  // В development (ts-node): src/utils -> ../../migrations
  const isProduction = __dirname.includes('/dist/');
  return isProduction 
    ? path.join(__dirname, '../../../migrations')
    : path.join(__dirname, '../../migrations');
}

/**
 * Получает список файлов миграций из директории
 */
function getMigrationFiles(migrationsDir: string): string[] {
  if (!fs.existsSync(migrationsDir)) {
    console.warn(`⚠️ Директория миграций не найдена: ${migrationsDir}`);
    return [];
  }

  return fs
    .readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort(); // Сортировка по имени файла (001_, 002_, etc.)
}

/**
 * Применяет одну миграцию
 */
async function applyMigration(migrationsDir: string, filename: string): Promise<void> {
  const filePath = path.join(migrationsDir, filename);
  const sql = fs.readFileSync(filePath, 'utf-8');

  console.log(`📄 Применение миграции: ${filename}`);

  try {
    // Выполняем SQL из файла
    await sequelize.query(sql);

    // Записываем информацию о применённой миграции
    await sequelize.query(
      'INSERT INTO migrations (filename) VALUES (:filename)',
      {
        replacements: { filename }
      }
    );

    console.log(`✅ Миграция ${filename} успешно применена`);
  } catch (error) {
    console.error(`❌ Ошибка при применении миграции ${filename}:`, error);
    throw error;
  }
}

/**
 * Запускает все неприменённые миграции
 */
export async function runMigrations(): Promise<void> {
  try {
    console.log('\n🔄 Проверка миграций...');

    // Создаём таблицу для отслеживания миграций, если её нет
    await ensureMigrationsTable();

    // Получаем список применённых миграций
    const appliedMigrations = await getAppliedMigrations();
    console.log(`📊 Применённых миграций: ${appliedMigrations.length}`);

    // Получаем список файлов миграций
    const migrationsDir = getMigrationsDirectory();
    const migrationFiles = getMigrationFiles(migrationsDir);
    console.log(`📁 Найдено файлов миграций: ${migrationFiles.length}`);

    // Находим неприменённые миграции
    const pendingMigrations = migrationFiles.filter(
      file => !appliedMigrations.includes(file)
    );

    if (pendingMigrations.length === 0) {
      console.log('✅ Все миграции уже применены');
      return;
    }

    console.log(`\n🚀 Найдено неприменённых миграций: ${pendingMigrations.length}`);
    console.log('Список:', pendingMigrations.join(', '));

    // Применяем каждую неприменённую миграцию
    for (const migration of pendingMigrations) {
      await applyMigration(migrationsDir, migration);
    }

    console.log('\n✅ Все миграции успешно применены\n');
  } catch (error) {
    console.error('\n❌ Ошибка при выполнении миграций:', error);
    throw error;
  }
}

/**
 * Показывает статус миграций (для отладки)
 */
export async function showMigrationsStatus(): Promise<void> {
  try {
    await ensureMigrationsTable();
    
    const appliedMigrations = await getAppliedMigrations();
    const migrationsDir = getMigrationsDirectory();
    const migrationFiles = getMigrationFiles(migrationsDir);

    console.log('\n📊 Статус миграций:');
    console.log('─'.repeat(80));

    for (const file of migrationFiles) {
      const status = appliedMigrations.includes(file) ? '✅ Применена' : '⏳ Ожидает';
      console.log(`${status} | ${file}`);
    }

    console.log('─'.repeat(80));
    console.log(`Всего: ${migrationFiles.length} | Применено: ${appliedMigrations.length} | Ожидает: ${migrationFiles.length - appliedMigrations.length}\n`);
  } catch (error) {
    console.error('Ошибка при получении статуса миграций:', error);
  }
}

