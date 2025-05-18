import { Request } from "express";
import { punishmentsService } from "../services/punishments.service";
import {
  ApiError,
  asyncErrorHandler,
} from "../middlewares/errorHandler.middleware";
import { CustomResponse } from "../middlewares/responseHandler.middleware";
import { PunishmentsCreationAttributes } from "../models/punishments";

export const punishmentsController = {
  getPunishments: asyncErrorHandler(
    async (req: Request, res: CustomResponse) => {
      const punishments = await punishmentsService.getPunishments();
      res.success(punishments, "Punishments retrieved successfully");
    }
  ),

  getPunishmentsById: asyncErrorHandler(
    async (req: Request, res: CustomResponse) => {
      const { id } = req.params;
      const punishments = await punishmentsService.getPunishmentsById(
        Number(id)
      );

      if (!punishments) {
        throw ApiError.notFound("Punishments not found");
      }

      res.success(punishments, "Punishments retrieved successfully");
    }
  ),

  createPunishments: asyncErrorHandler(
    async (
      req: Request<{}, {}, PunishmentsCreationAttributes>,
      res: CustomResponse
    ) => {
      const { full_name, position, punishment_type } = req.body;
      if (!full_name || !position || !punishment_type) {
        throw ApiError.badRequest(
          "Full_name, position, and punishment_type are required"
        );
      }
      const punishments = await punishmentsService.createPunishments(req.body);
      res.created(punishments, "Punishments created successfully");
    }
  ),

  updatePunishments: asyncErrorHandler(
    async (req: Request, res: CustomResponse) => {
      const { id } = req.params;
      const punishments = await punishmentsService.updatePunishments(
        Number(id),
        req.body
      );

      if (!punishments) {
        throw ApiError.notFound("Punishments not found");
      }

      res.success(punishments, "Punishments updated successfully");
    }
  ),

  deletePunishments: asyncErrorHandler(
    async (req: Request, res: CustomResponse) => {
      const { id } = req.params;
      const result = await punishmentsService.deletePunishments(Number(id));

      if (!result) {
        throw ApiError.notFound("Punishments not found");
      }

      res.noContent();
    }
  ),
};
