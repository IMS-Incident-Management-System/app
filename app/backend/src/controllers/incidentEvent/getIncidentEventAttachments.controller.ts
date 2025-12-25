import { Request } from 'express';
import {
  asyncErrorHandler,
} from '../../middlewares/errorHandler.middleware';
import { CustomResponse } from '../../middlewares/responseHandler.middleware';
import { incidentEventAttachmentService } from '../../services/incidentEventAttachment.service';

export const getIncidentEventAttachments = asyncErrorHandler(
  async (req: Request, res: CustomResponse) => {
    const { incidentEventId } = req.params;

    const attachments = await incidentEventAttachmentService.getAttachmentsByIncidentEventId(Number(incidentEventId));

    res.success(attachments, 'Вложения получены');
  }
);

