// Тестовый скрипт для проверки импортов
// Запуск: node test-imports.js

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('=== Тест импортов Infinity Roguelike RPG ===\n');

const filesToCheck = [
  'App.tsx',
  'index.tsx',
  'components/AdventureScreen.tsx',
  'components/CharacterScreen.tsx',
  'components/InventoryScreen.tsx',
  'components/MapScreen.tsx',
  'components/ShopScreen.tsx',
  'components/TradeScreen.tsx',
  'components/ChatScreen.tsx',
  'utils/gameEngine.ts',
  'services/api.ts'
];

let allPassed = true;

for (const file of filesToCheck) {
  try {
    const filePath = join(__dirname, file);
    const content = readFileSync(filePath, 'utf8');
    
    // Проверяем проблемные импорты
    const badImports = [];
    
    // Ищем относительные импорты, которые могут быть проблемными
    const relativeImportRegex = /from\s+['"]\.\.?\/(?!@)(types|utils|components|services)/g;
    const matches = content.match(relativeImportRegex);
    
    if (matches) {
      badImports.push(...matches);
    }
    
    if (badImports.length > 0) {
      console.log(`❌ ${file}:`);
      console.log(`   Найдены проблемные импорты: ${badImports.join(', ')}`);
      allPassed = false;
    } else {
      console.log(`✓ ${file}: OK`);
    }
    
  } catch (error) {
    console.log(`❌ ${file}: Ошибка чтения файла - ${error.message}`);
    allPassed = false;
  }
}

console.log('\n=== Результат ===');
if (allPassed) {
  console.log('✅ Все импорты в порядке! Проект готов к деплою на Render.');
} else {
  console.log('❌ Есть проблемы с импортами. Нужно исправить перед деплоем.');
  console.log('\nРекомендации:');
  console.log('1. Используйте алиас @ для импортов (например: from "@/types")');
  console.log('2. Убедитесь, что все файлы существуют');
  console.log('3. Проверьте чувствительность к регистру в путях');
}

process.exit(allPassed ? 0 : 1);