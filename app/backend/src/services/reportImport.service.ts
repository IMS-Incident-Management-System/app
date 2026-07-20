import fs from 'fs';
import path from 'path';
import ExcelJS from 'exceljs';
import { Op } from 'sequelize';
import { Department, ReportFact, ReportImportBatch, sequelize } from '../models';
import {
  REPORT_TYPE_RP053_MATRIX,
  ReportImportBatchInstance,
} from '../models/reportImportBatch';
import { parseReportWorkbook } from './reportImport';
import { parsePeriodFromReportTitle } from './reportImport/parsePeriodFromTitle';

const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');
const REPORT_IMPORTS_DIR = path.join(UPLOAD_DIR, 'report-imports');

function ensureImportDir(): void {
  if (!fs.existsSync(REPORT_IMPORTS_DIR)) {
    fs.mkdirSync(REPORT_IMPORTS_DIR, { recursive: true });
  }
}

function toDateOnly(d: Date | string): string {
  if (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}/.test(d)) {
    return d.slice(0, 10);
  }
  const x = typeof d === 'string' ? new Date(d) : d;
  const y = x.getFullYear();
  const m = String(x.getMonth() + 1).padStart(2, '0');
  const day = String(x.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

async function buildLeafDepartmentsByTitle(): Promise<Map<string, number[]>> {
  const all = await Department.findAll();
  const childrenOf = new Map<number, number[]>();
  for (const d of all) {
    if (d.parent_id == null) continue;
    const list = childrenOf.get(d.parent_id) ?? [];
    list.push(d.department_id);
    childrenOf.set(d.parent_id, list);
  }
  const isLeaf = (id: number) => !(childrenOf.get(id)?.length);

  const map = new Map<string, number[]>();
  for (const d of all) {
    if (!isLeaf(d.department_id)) continue;
    const key = String(d.title || '')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
    const list = map.get(key) ?? [];
    list.push(d.department_id);
    map.set(key, list);
  }
  return map;
}

export const reportImportService = {
  async listBatches(params: {
    reportType?: string;
    periodFrom?: string;
    periodTo?: string;
    status?: string;
  }): Promise<ReportImportBatchInstance[]> {
    const where: Record<string, unknown> = {};
    if (params.reportType) where.report_type = params.reportType;
    if (params.status) where.status = params.status;
    if (params.periodFrom && params.periodTo) {
      // пересечение с выбранным диапазоном
      where.period_from = { [Op.lte]: params.periodTo };
      where.period_to = { [Op.gte]: params.periodFrom };
    } else if (params.periodFrom) {
      where.period_from = { [Op.gte]: params.periodFrom };
    } else if (params.periodTo) {
      where.period_to = { [Op.lte]: params.periodTo };
    }
    return ReportImportBatch.findAll({
      where,
      order: [
        ['period_from', 'DESC'],
        ['createdAt', 'DESC'],
      ],
    });
  },

  async getActiveBatch(params: {
    reportType: string;
    periodFrom: string;
    periodTo: string;
  }): Promise<ReportImportBatchInstance | null> {
    return ReportImportBatch.findOne({
      where: {
        report_type: params.reportType,
        period_from: params.periodFrom,
        period_to: params.periodTo,
        status: 'active',
      },
      order: [['createdAt', 'DESC']],
    });
  },

  /**
   * Активные батчи, чей period пересекается с [periodFrom, periodTo].
   * Для произвольного среза в UI: янв–март = сумма фактов по активным импортам этих месяцев.
   */
  async findActiveBatchesInRange(params: {
    reportType: string;
    periodFrom: string;
    periodTo: string;
  }): Promise<ReportImportBatchInstance[]> {
    return ReportImportBatch.findAll({
      where: {
        report_type: params.reportType,
        status: 'active',
        period_from: { [Op.lte]: params.periodTo },
        period_to: { [Op.gte]: params.periodFrom },
      },
      order: [
        ['period_from', 'ASC'],
        ['createdAt', 'DESC'],
      ],
    });
  },

  async importExcel(params: {
    filePath: string;
    originalName: string;
    /** Fallback, если в заголовке Excel период не распознан */
    periodFrom?: Date | string | null;
    periodTo?: Date | string | null;
    reportType?: string;
    uploadedBy?: string | null;
  }): Promise<ReportImportBatchInstance> {
    ensureImportDir();
    const reportType = params.reportType || REPORT_TYPE_RP053_MATRIX;

    const destName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(params.originalName) || '.xlsx'}`;
    const destPath = path.join(REPORT_IMPORTS_DIR, destName);
    fs.copyFileSync(params.filePath, destPath);

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(destPath);
    const leafMap = await buildLeafDepartmentsByTitle();
    const parsed = parseReportWorkbook(workbook, { leafDepartmentsByTitle: leafMap });

    const fromTitle = parsed.suggestedPeriodTitle
      ? parsePeriodFromReportTitle(parsed.suggestedPeriodTitle)
      : null;

    let periodFrom: string;
    let periodTo: string;
    let periodSource: 'excel_title' | 'form_fallback';

    if (fromTitle) {
      periodFrom = fromTitle.periodFrom;
      periodTo = fromTitle.periodTo;
      periodSource = 'excel_title';
    } else if (params.periodFrom && params.periodTo) {
      periodFrom = toDateOnly(params.periodFrom);
      periodTo = toDateOnly(params.periodTo);
      periodSource = 'form_fallback';
    } else {
      throw new Error(
        'Не удалось определить период: укажите его в заголовке файла («Результаты работы январь 2025») или в форме загрузки'
      );
    }

    const batch = await ReportImportBatch.create({
      report_type: reportType,
      file_name: params.originalName,
      storage_path: destPath,
      period_from: periodFrom as unknown as Date,
      period_to: periodTo as unknown as Date,
      status: 'pending',
      uploaded_by: params.uploadedBy ?? null,
      validation_summary: {
        periodSource,
        periodTitle: parsed.suggestedPeriodTitle ?? null,
      },
    });

    try {
      if (parsed.facts.length === 0) {
        await batch.update({
          status: 'failed',
          validation_summary: {
            ...parsed.validation,
            periodSource,
            periodTitle: parsed.suggestedPeriodTitle ?? null,
            error: 'Не удалось распознать ни одной ячейки отчёта',
          },
        });
        return batch.reload();
      }

      await sequelize.transaction(async (t) => {
        await ReportFact.bulkCreate(
          parsed.facts.map((f) => ({
            batch_id: batch.id,
            metric_key: f.metricKey,
            department_id: f.departmentId,
            value: f.value,
            excel_address: f.excelAddress,
          })),
          { transaction: t }
        );

        const previous = await ReportImportBatch.findAll({
          where: {
            report_type: reportType,
            period_from: periodFrom,
            period_to: periodTo,
            status: 'active',
            id: { [Op.ne]: batch.id },
          },
          transaction: t,
        });

        for (const prev of previous) {
          await prev.update(
            { status: 'superseded', replaced_by_batch_id: batch.id },
            { transaction: t }
          );
        }

        await batch.update(
          {
            status: 'active',
            validation_summary: {
              ...parsed.validation,
              periodSource,
              periodTitle: parsed.suggestedPeriodTitle ?? null,
            } as unknown as Record<string, unknown>,
          },
          { transaction: t }
        );
      });

      return batch.reload();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      await batch.update({
        status: 'failed',
        validation_summary: {
          error: message,
          periodSource,
          periodTitle: parsed.suggestedPeriodTitle ?? null,
        },
      });
      throw err;
    }
  },

  async activateBatch(id: number): Promise<ReportImportBatchInstance> {
    const batch = await ReportImportBatch.findByPk(id);
    if (!batch) throw new Error('Батч не найден');
    if (batch.status === 'failed') throw new Error('Нельзя активировать failed-батч');

    await sequelize.transaction(async (t) => {
      const previous = await ReportImportBatch.findAll({
        where: {
          report_type: batch.report_type,
          period_from: batch.period_from,
          period_to: batch.period_to,
          status: 'active',
          id: { [Op.ne]: batch.id },
        },
        transaction: t,
      });
      for (const prev of previous) {
        await prev.update(
          { status: 'superseded', replaced_by_batch_id: batch.id },
          { transaction: t }
        );
      }
      await batch.update(
        { status: 'active', replaced_by_batch_id: null },
        { transaction: t }
      );
    });
    return batch.reload();
  },

  async deleteBatch(id: number): Promise<void> {
    const batch = await ReportImportBatch.findByPk(id);
    if (!batch) throw new Error('Батч не найден');
    const storagePath = batch.storage_path;
    await batch.destroy();
    if (storagePath && fs.existsSync(storagePath)) {
      try {
        fs.unlinkSync(storagePath);
      } catch {
        /* ignore */
      }
    }
  },
};
