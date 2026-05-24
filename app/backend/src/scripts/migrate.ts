#!/usr/bin/env ts-node

/**
 * Скрипт для ручного управления миграциями
 * 
 * Использование:
 *   npm run migrate:up       - Применить все неприменённые миграции
 *   npm run migrate:status   - Показать статус миграций
 */

import dotenv from 'dotenv';
import { runMigrations, showMigrationsStatus } from '../utils/migrations';
import { sequelize } from '../models/sequelize';

dotenv.config();

const command = process.argv[2] || 'up';

async function main() {
  try {
    console.log('🔌 Подключение к базе данных...');
    await sequelize.authenticate();
    console.log('✅ Подключение установлено\n');

    switch (command) {
      case 'up':
        await runMigrations();
        break;
      
      case 'status':
        await showMigrationsStatus();
        break;
      
      default:
        console.error(`❌ Неизвестная команда: ${command}`);
        console.log('\nДоступные команды:');
        console.log('  up      - Применить все неприменённые миграции');
        console.log('  status  - Показать статус миграций');
        process.exit(1);
    }

    await sequelize.close();
    console.log('✅ Готово!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Ошибка:', error);
    await sequelize.close();
    process.exit(1);
  }
}

main();





