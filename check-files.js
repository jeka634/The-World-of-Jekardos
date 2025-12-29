// Скрипт проверки файлов перед сборкой
import { existsSync, readFileSync } from 'fs';
import { join, dirname, extname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('=== Проверка файлов перед сборкой ===\n');

// Файлы, которые должны существовать
const requiredFiles = [
  'utils/gameEngine.ts',
  'types.ts',
  'services/api.ts',
  'backend/server.js',
  'backend/scripts/initDB.js',
  'backend/routes/api.js',
  'backend/controllers/userController.js',
  'components/AdventureScreen.tsx',
  'components/CharacterScreen.tsx',
  'components/InventoryScreen.tsx',
  'components/MapScreen.tsx',
  'components/ShopScreen.tsx',
  'components/TradeScreen.tsx',
  'components/ChatScreen.tsx'
];

let allFilesExist = true;

// Проверка существования файлов
for (const file of requiredFiles) {
  const filePath = join(__dirname, file);
  if (!existsSync(filePath)) {
    console.log(`❌ Файл не найден: ${file}`);
    allFilesExist = false;
  } else {
    console.log(`✓ ${file}`);
  }
}

console.log('\n=== Проверка импортов в App.tsx ===\n');

// Проверка импортов в App.tsx
try {
  const appContent = readFileSync(join(__dirname, 'App.tsx'), 'utf8');
  const importRegex = /from\s+['"]([^'"]+)['"]/g;
  const imports = [];
  let match;
  
  while ((match = importRegex.exec(appContent)) !== null) {
    imports.push(match[1]);
  }
  
  // Проверка каждого импорта
  for (const imp of imports) {
    if (imp.startsWith('@/')) {
      const relativePath = imp.substring(2); // Убираем @/
      let filePath = join(__dirname, relativePath);
      
      // Проверяем с разными расширениями
      const extensions = ['', '.ts', '.tsx', '.js', '.jsx'];
      let found = false;
      
      for (const ext of extensions) {
        const testPath = filePath + ext;
        if (existsSync(testPath)) {
          found = true;
          console.log(`✓ Импорт: ${imp} -> ${relativePath}${ext}`);
          break;
        }
      }
      
      if (!found) {
        console.log(`❌ Импорт не найден: ${imp}`);
        allFilesExist = false;
      }
    } else if (!imp.startsWith('.') && !imp.startsWith('@/')) {
      // Это npm пакет
      console.log(`✓ npm пакет: ${imp}`);
    }
  }
} catch (error) {
  console.log(`❌ Ошибка чтения App.tsx: ${error.message}`);
  allFilesExist = false;
}

console.log('\n=== Проверка чувствительности к регистру ===\n');

// Проверка чувствительности к регистру (имитация Linux)
const caseSensitiveCheck = [
  { path: 'utils/gameEngine.ts', test: 'utils/gameengine.ts' },
  { path: 'types.ts', test: 'Types.ts' },
  { path: 'services/api.ts', test: 'services/Api.ts' }
];

for (const check of caseSensitiveCheck) {
  const correctPath = join(__dirname, check.path);
  const wrongPath = join(__dirname, check.test);
  
  if (existsSync(correctPath) && !existsSync(wrongPath)) {
    console.log(`✓ Регистр правильный: ${check.path}`);
  } else if (existsSync(wrongPath)) {
    console.log(`⚠️  Возможна проблема с регистром: ${check.test} существует вместо ${check.path}`);
  }
}

console.log('\n=== Итог проверки ===\n');

if (allFilesExist) {
  console.log('✅ Все файлы найдены. Можно запускать сборку.');
  console.log('\nЗапуск сборки: npm run build');
} else {
  console.log('❌ Есть проблемы с файлами. Нужно исправить перед сборкой.');
  console.log('\nРекомендации:');
  console.log('1. Проверьте, что все файлы существуют');
  console.log('2. Проверьте регистр в именах файлов (Linux чувствителен к регистру)');
  console.log('3. Убедитесь, что импорты имеют правильные расширения');
}

process.exit(allFilesExist ? 0 : 1);