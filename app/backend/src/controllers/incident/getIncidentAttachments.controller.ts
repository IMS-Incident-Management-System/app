import { Request } from 'express';
import {
  asyncErrorHandler,
} from '../../middlewares/errorHandler.middleware';
import { CustomResponse } from '../../middlewares/responseHandler.middleware';
import { incidentAttachmentService } from '../../services/incidentAttachment.service';

export const getIncidentAttachments = asyncErrorHandler(
  async (req: Request, res: CustomResponse) => {
    const { id } = req.params;

    const attachments = await incidentAttachmentService.getAttachmentsByIncidentId(Number(id));

    res.success(attachments, 'Вложения получены');
  }
);

