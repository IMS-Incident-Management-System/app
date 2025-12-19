/**
 * Генерирует код на основе текущей даты и времени в формате DDMMYYYY-HHmmss
 * Пример: IN-15032024-143025 (15 марта 2024, 14:30:25)
 */
function generateTimestampCode(prefix: string): string {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  
  return `${prefix}-${day}${month}${year}-${hours}${minutes}${seconds}`;
}

/**
 * Генерирует код для инцидента в формате IN-DDMMYYYY-HHmmss
 */
export async function generateIncidentCode(): Promise<string> {
  // Добавляем небольшую задержку, чтобы избежать коллизий при одновременном создании
  await new Promise(resolve => setTimeout(resolve, 100));
  return generateTimestampCode('IN');
}

/**
 * Генерирует код для события в формате EV-DDMMYYYY-HHmmss
 */
export async function generateEventCode(): Promise<string> {
  // Добавляем небольшую задержку, чтобы избежать коллизий при одновременном создании
  await new Promise(resolve => setTimeout(resolve, 100));
  return generateTimestampCode('EV');
}

/**
 * Генерирует код для операционной деятельности в формате OA-DDMMYYYY-HHmmss
 */
export async function generateOperationalActivityCode(): Promise<string> {
  // Добавляем небольшую задержку, чтобы избежать коллизий при одновременном создании
  await new Promise(resolve => setTimeout(resolve, 100));
  return generateTimestampCode('OA');
}

