import { Request } from 'express';
import {
  ApiError,
  asyncErrorHandler,
} from '../../middlewares/errorHandler.middleware';
import { CustomResponse } from '../../middlewares/responseHandler.middleware';
import { eventService } from '../../services/event.service';
import { eventCriminalCaseService } from '../../services/eventCriminalCase.service';
import { eventPunishmentService } from '../../services/eventPunishment.service';
import { sequelize } from '../../models';

interface CreateEventBody {
  department_id: number;
  date: Date;
  is_service_investigation: boolean;
  is_service_check: boolean;
  is_service_check_ib: boolean;
  is_verification_activity: boolean;
  quantity?: string;
  description?: string;
  detected_damage?: number;
  recovered_damage?: number;
  prevented_damage?: number;
  additional_income?: number;
  reduced_cost?: number;
  prevented_unnecessary_writeoff?: number;
  vat_deducted?: number;
  criminal_case?: {
    transfer_date?: Date;
    document_number?: string;
    department_name?: string;
    review_result?: string;
    case_number?: string;
    law_article?: string;
    rejection_date?: Date;
    rejection_reason?: string;
    appeal_date?: Date;
    case_date?: Date;
    initiator?: string;
    subject?: string;
    detained_count?: number;
    person_name?: string;
    case_result?: string;
    court_decision?: string;
    convicted_count?: number;
  };
  punishment?: {
    guilty_persons_count?: number;
    measures_taken_count?: number;
    warning_letter_rp398?: number;
    remark?: number;
    reprimand?: number;
    dismissed_count?: number;
  };
}

export const createEvent = asyncErrorHandler(
  async (req: Request, res: CustomResponse) => {
    const data = req.body as CreateEventBody;

    if (!data.department_id || !data.date) {
      throw ApiError.badRequest('Missing required fields');
    }

    const result = await sequelize.transaction(async (transaction) => {
      // 1. Создаем событие
      const event = await eventService.createEvent(
        {
          department_id: data.department_id,
          date: data.date,
          is_service_investigation: Boolean(data.is_service_investigation),
          is_service_check: Boolean(data.is_service_check),
          is_service_check_ib: Boolean(data.is_service_check_ib),
          is_verification_activity: Boolean(data.is_verification_activity),
          quantity: data.quantity,
          description: data.description,
          detected_damage: data.detected_damage,
          recovered_damage: data.recovered_damage,
          prevented_damage: data.prevented_damage,
          additional_income: data.additional_income,
          reduced_cost: data.reduced_cost,
          prevented_unnecessary_writeoff: data.prevented_unnecessary_writeoff,
          vat_deducted: data.vat_deducted,
        },
        { transaction }
      );

      // Создаем уголовное дело (если есть)
      if (data.criminal_case) {
        const { id: criminalCaseId, ...criminalCaseWithoutId } = data.criminal_case as any;
        await eventCriminalCaseService.createEventCriminalCase(
          { ...criminalCaseWithoutId, event_id: event.id },
          { transaction }
        );
      }

      // Создаем наказание (если есть)
      if (data.punishment) {
        const { id: punishmentId, ...punishmentWithoutId } = data.punishment as any;
        await eventPunishmentService.createEventPunishment(
          {
            ...punishmentWithoutId,
            event_id: event.id
          },
          { transaction }
        );
      }

      // 2. Собираем ответ
      return {
        event,
      };
    });

    res.created(result, 'Event created successfully');
  }
);

