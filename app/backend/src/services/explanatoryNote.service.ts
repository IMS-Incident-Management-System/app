import { Op } from 'sequelize';
import { 
  ExplanatoryNote, 
  Department
} from '../models';
import { ExplanatoryNoteCreationAttributes } from '../models/explanatoryNote';
import { paginate, PaginatedQuery } from '../utils/pagination';

interface GetExplanatoryNotesFilters {
  department_id?: number;
  period_from?: Date;
  period_to?: Date;
  entry_date_from?: Date;
  entry_date_to?: Date;
}

export const explanatoryNoteService = {
  async getExplanatoryNotes({ filters, pagination }: PaginatedQuery<GetExplanatoryNotesFilters>) {
    const where: any = {};
    
    if (filters?.department_id) {
      where.department_id = filters.department_id;
    }
    if (filters?.period_from || filters?.period_to) {
      where.period_from = {
        [Op.between]: [
          filters.period_from || new Date(0),
          filters.period_to || new Date()
        ]
      };
    }
    if (filters?.entry_date_from || filters?.entry_date_to) {
      where.entry_date = {
        [Op.between]: [
          filters.entry_date_from || new Date(0),
          filters.entry_date_to || new Date()
        ]
      };
    }

    const result = await paginate(ExplanatoryNote, {
      where,
      include: [
        {
          model: Department,
          as: 'department'
        }
      ],
      order: [['entry_date', 'DESC'], ['id', 'DESC']],
      pagination,
    });

    return {
      explanatoryNotes: result.items,
      total: result.total,
    };
  },

  async getExplanatoryNote(id: number) {
    const explanatoryNote = await ExplanatoryNote.findByPk(id, {
      include: [
        {
          model: Department,
          as: 'department'
        }
      ]
    });

    if (!explanatoryNote) {
      throw new Error('Explanatory note not found');
    }

    return explanatoryNote;
  },

  async createExplanatoryNote(data: ExplanatoryNoteCreationAttributes) {
    const explanatoryNote = await ExplanatoryNote.create(data);
    return await this.getExplanatoryNote(explanatoryNote.id);
  },

  async updateExplanatoryNote(id: number, data: Partial<ExplanatoryNoteCreationAttributes>) {
    const explanatoryNote = await ExplanatoryNote.findByPk(id);
    
    if (!explanatoryNote) {
      throw new Error('Explanatory note not found');
    }

    await explanatoryNote.update(data);
    return await this.getExplanatoryNote(id);
  },

  async deleteExplanatoryNote(id: number) {
    const explanatoryNote = await ExplanatoryNote.findByPk(id);
    
    if (!explanatoryNote) {
      throw new Error('Explanatory note not found');
    }

    await explanatoryNote.destroy();
    return true;
  },
};
