/**
 * Набор Excel для ручной проверки архива / Auto / пересечений.
 * База — sample_report_rp053_full_template.xlsx (реальные листья + 160 метрик).
 *
 *   node ./node_modules/ts-node/dist/bin.js src/scripts/generateTestArchiveSamples.ts
 */
import fs from 'fs';
import path from 'path';
import ExcelJS from 'exceljs';

type SampleSpec = {
  fileName: string;
  title: string;
  marker: number;
  note: string;
};

const SAMPLES: SampleSpec[] = [
  {
    fileName: 'test_01_jan_2025.xlsx',
    title: 'Результаты работы 01.01.2025-31.01.2025',
    marker: 111,
    note: 'Январь — загрузить первым',
  },
  {
    fileName: 'test_02_mar_2025.xlsx',
    title: 'Результаты работы 01.03.2025-31.03.2025',
    marker: 333,
    note: 'Март — без пересечения; февраль в Авто = live',
  },
  {
    fileName: 'test_03_may_2025.xlsx',
    title: 'Результаты работы 01.05.2025-31.05.2025',
    marker: 555,
    note: 'Май — ещё один непересекающийся кусок',
  },
  {
    fileName: 'test_04_OVERLAP_jan_feb.xlsx',
    title: 'Результаты работы 15.01.2025-15.02.2025',
    marker: 999,
    note: 'ДОЛЖЕН ОТКЛОНИТЬСЯ, если уже есть test_01',
  },
  {
    fileName: 'test_05_replace_jan_v2.xlsx',
    title: 'Результаты работы 01.01.2025-31.01.2025',
    marker: 222,
    note: 'Тот же период, что test_01 — новая версия (222 вместо 111)',
  },
];

function findTemplate(): string {
  const candidates = [
    path.resolve(process.cwd(), '..', 'samples', 'sample_report_rp053_full_template.xlsx'),
    path.resolve(process.cwd(), 'samples', 'sample_report_rp053_full_template.xlsx'),
    '/samples/sample_report_rp053_full_template.xlsx',
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  throw new Error('Не найден sample_report_rp053_full_template.xlsx');
}

function findOutDir(): string {
  const candidates = [
    path.resolve(process.cwd(), '..', 'samples', 'test-archives'),
    path.resolve(process.cwd(), 'samples', 'test-archives'),
    '/app/uploads/test-archives',
    '/tmp/test-archives',
  ];
  for (const dir of candidates) {
    try {
      fs.mkdirSync(dir, { recursive: true });
      fs.accessSync(dir, fs.constants.W_OK);
      return dir;
    } catch {
      /* try next */
    }
  }
  throw new Error('Не удалось создать выходную папку');
}

function findDataStartRow(sheet: ExcelJS.Worksheet): number {
  for (let r = 1; r <= 20; r++) {
    const s = String(sheet.getRow(r).getCell(1).value ?? '');
    if (s === 'Показатель') {
      for (let dr = r + 1; dr <= r + 12; dr++) {
        const label = sheet.getRow(dr).getCell(1).value;
        if (label != null && String(label).trim() !== '' && String(label) !== 'Показатель') {
          return dr;
        }
      }
      return r + 1;
    }
  }
  return 5;
}

function detectColumnLayout(sheet: ExcelJS.Worksheet, dataStart: number): {
  leafCount: number;
  totalGkCol: number;
  totalPaoCol: number;
} {
  const headerRow = sheet.getRow(dataStart - 1);
  let totalPaoCol = 0;
  let totalGkCol = 0;
  for (let c = 2; c <= 200; c++) {
    const v = String(headerRow.getCell(c).value ?? '').trim();
    if (v.includes('Итого ГК')) totalGkCol = c;
    if (v.includes('Итого ПАО')) totalPaoCol = c;
  }
  // fallback: last two used columns
  if (!totalGkCol || !totalPaoCol) {
    let last = 2;
    for (let c = 2; c <= 200; c++) {
      if (headerRow.getCell(c).value != null) last = c;
    }
    totalPaoCol = last;
    totalGkCol = last - 1;
  }
  return {
    leafCount: Math.max(0, totalGkCol - 2),
    totalGkCol,
    totalPaoCol,
  };
}

async function stampSample(
  templatePath: string,
  outPath: string,
  spec: SampleSpec
): Promise<{ leafCols: number; metricRows: number }> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(templatePath);
  const sheet = workbook.worksheets[0];
  if (!sheet) throw new Error('Нет листа в шаблоне');

  sheet.getRow(1).getCell(1).value = spec.title;

  const dataStart = findDataStartRow(sheet);
  const { leafCount, totalGkCol, totalPaoCol } = detectColumnLayout(sheet, dataStart);

  let metricRows = 0;
  for (let r = dataStart; r <= sheet.rowCount; r++) {
    const row = sheet.getRow(r);
    const label = row.getCell(1).value;
    if (label == null || String(label).trim() === '') break;
    metricRows++;

    let totalGk = 0;
    for (let c = 2; c < totalGkCol; c++) {
      const cell = row.getCell(c);
      cell.value = spec.marker;
      cell.numFmt = '#,##0';
      totalGk += spec.marker;
    }
    // Для теста оба итога = сумма листьев (парсер итоги пропускает)
    row.getCell(totalGkCol).value = totalGk;
    row.getCell(totalGkCol).numFmt = '#,##0';
    row.getCell(totalPaoCol).value = totalGk;
    row.getCell(totalPaoCol).numFmt = '#,##0';
  }

  await workbook.xlsx.writeFile(outPath);
  return { leafCols: leafCount, metricRows };
}

async function main() {
  const templatePath = findTemplate();
  const outDir = findOutDir();
  console.log('Template:', templatePath);
  console.log('Out:', outDir);

  const guide: Array<SampleSpec & { path: string }> = [];

  for (const spec of SAMPLES) {
    const outPath = path.join(outDir, spec.fileName);
    const stats = await stampSample(templatePath, outPath, spec);
    console.log(
      `✓ ${spec.fileName}  marker=${spec.marker}  metrics=${stats.metricRows}  leaves=${stats.leafCols}`
    );
    console.log(`  ${spec.note}`);
    guide.push({ ...spec, path: outPath });
  }

  const howTo = [
    '# Как проверить архив / Авто',
    '',
    '1. Генератор → «Архив Excel».',
    '2. Загрузить: test_01 → test_02 → test_03 (все ок).',
    '3. test_04_OVERLAP — должен отклониться (пересечение с январём).',
    '4. test_05_replace_jan_v2 — ок, новая версия января (222 вместо 111).',
    '5. Период 01.01.2025 — 31.05.2025, режим «Авто»:',
    '   янв=222 (или 111), март=333, май=555; февраль и апрель = live системы.',
    '6. Режим «Архив» на тот же диапазон — только Excel-снимки (без live-пробелов).',
    '',
    ...guide.map((g) => `- ${g.fileName}: «${g.title}», marker=${g.marker} — ${g.note}`),
    '',
  ].join('\n');

  fs.writeFileSync(path.join(outDir, 'HOW_TO_TEST.txt'), howTo, 'utf8');
  console.log('\n' + howTo);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
