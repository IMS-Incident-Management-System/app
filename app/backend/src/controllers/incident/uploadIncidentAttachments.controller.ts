import { Request } from 'express';
import {
  ApiError,
  asyncErrorHandler,
} from '../../middlewares/errorHandler.middleware';
import { CustomResponse } from '../../middlewares/responseHandler.middleware';
import { incidentAttachmentService } from '../../services/incidentAttachment.service';
import { activityBuilderService } from '../../services/activityBuilder.service';
import { activityService } from '../../services/activity.service';
import { getActivityActorContext } from '../../utils/activityContext';
import { EntityType } from '../../enums/entityActivity';
import { MulterRequest } from '../../types/multer';

export const uploadIncidentAttachments = asyncErrorHandler(
  async (req: MulterRequest, res: CustomResponse) => {
    const { id } = req.params;
    const files = req.files;

    if (!files || files.length === 0) {
      throw ApiError.badRequest('Файлы не были загружены');
    }

    // Проверяем количество файлов
    const currentCount = await incidentAttachmentService.getAttachmentCountByIncidentId(Number(id));
    if (currentCount + files.length > 10) {
      throw ApiError.badRequest('Максимальное количество файлов: 10');
    }

    const actor = getActivityActorContext(req as unknown as Request);
    const incidentId = Number(id);

    const attachments = await Promise.all(
      files.map(async (file) => {
        const attachment = await incidentAttachmentService.createAttachment(incidentId, file);
        await activityService.record(
          activityBuilderService.buildAttachmentUploaded(
            EntityType.INCIDENT,
            incidentId,
            file.originalname,
            actor,
            { attachment_id: attachment.id }
          )
        );
        return attachment;
      })
    );

    res.success(attachments, 'Файлы успешно загружены');
  }
);

