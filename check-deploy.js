// Скрипт проверки проекта перед деплоем на Render
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('=== Проверка проекта для деплоя на Render ===\n');

const checks = [];

// 1. Проверка package.json
checks.push(() => {
  console.log('1. Проверка package.json...');
  try {
    const pkg = JSON.parse(readFileSync(join(__dirname, 'package.json'), 'utf8'));
    
    const requiredScripts = ['build', 'start'];
    const missingScripts = requiredScripts.filter(script => !pkg.scripts?.[script]);
    
    if (missingScripts.length > 0) {
      return `❌ Отсутствуют скрипты: ${missingScripts.join(', ')}`;
    }
    
    return '✅ package.json в порядке';
  } catch (error) {
    return `❌ Ошибка чтения package.json: ${error.message}`;
  }
});

// 2. Проверка render.yaml
checks.push(() => {
  console.log('2. Проверка render.yaml...');
  try {
    const renderYaml = readFileSync(join(__dirname, 'render.yaml'), 'utf8');
    
    if (!renderYaml.includes('buildCommand:')) {
      return '❌ render.yaml: отсутствует buildCommand';
    }
    
    if (!renderYaml.includes('startCommand:')) {
      return '❌ render.yaml: отсутствует startCommand';
    }
    
    return '✅ render.yaml в порядке';
  } catch (error) {
    return `❌ Ошибка чтения render.yaml: ${error.message}`;
  }
});

// 3. Проверка необходимых файлов
checks.push(() => {
  console.log('3. Проверка необходимых файлов...');
  const requiredFiles = [
    'package.json',
    'render.yaml',
    'vite.config.ts',
    'tsconfig.json',
    'backend/server.js',
    'backend/scripts/initDB.js',
    'utils/gameEngine.ts',
    'services/api.ts'
  ];
  
  const missingFiles = [];
  
  for (const file of requiredFiles) {
    if (!existsSync(join(__dirname, file))) {
      missingFiles.push(file);
    }
  }
  
  if (missingFiles.length > 0) {
    return `❌ Отсутствуют файлы: ${missingFiles.join(', ')}`;
  }
  
  return '✅ Все необходимые файлы присутствуют';
});

// 4. Проверка сборки
checks.push(async () => {
  console.log('4. Проверка TypeScript конфигурации...');
  try {
    const tsconfig = JSON.parse(readFileSync(join(__dirname, 'tsconfig.json'), 'utf8'));
    
    if (!tsconfig.compilerOptions) {
      return '❌ tsconfig.json: отсутствует compilerOptions';
    }
    
    return '✅ TypeScript конфигурация в порядке';
  } catch (error) {
    return `❌ Ошибка чтения tsconfig.json: ${error.message}`;
  }
});

// 5. Проверка Vite конфигурации
checks.push(() => {
  console.log('5. Проверка Vite конфигурации...');
  try {
    const viteConfig = readFileSync(join(__dirname, 'vite.config.ts'), 'utf8');
    
    if (!viteConfig.includes("'@':") && !viteConfig.includes('"@":')) {
      return '❌ vite.config.ts: отсутствует алиас @';
    }
    
    return '✅ Vite конфигурация в порядке';
  } catch (error) {
    return `❌ Ошибка чтения vite.config.ts: ${error.message}`;
  }
});

// Запуск проверок
(async () => {
  let allPassed = true;
  
  for (const check of checks) {
    try {
      const result = await (typeof check === 'function' ? check() : check);
      console.log(result + '\n');
      
      if (result.startsWith('❌')) {
        allPassed = false;
      }
    } catch (error) {
      console.log(`❌ Ошибка при проверке: ${error.message}\n`);
      allPassed = false;
    }
  }
  
  console.log('=== Итог проверки ===');
  if (allPassed) {
    console.log('✅ Проект готов к деплою на Render!');
    console.log('\nСледующие шаги:');
    console.log('1. git add .');
    console.log('2. git commit -m "fix: подготовка к деплою на Render"');
    console.log('3. git push');
    console.log('4. На Render.com создайте новый Web Service');
    console.log('5. Подключите репозиторий и используйте render.yaml');
  } else {
    console.log('❌ Есть проблемы, которые нужно исправить перед деплоем.');
    console.log('\nРекомендации:');
    console.log('1. Проверьте все отмеченные ошибки выше');
    console.log('2. Запустите: node test-imports.js');
    console.log('3. Запустите: npm run build');
    console.log('4. Исправьте ошибки и повторите проверку');
  }
  
  process.exit(allPassed ? 0 : 1);
})();