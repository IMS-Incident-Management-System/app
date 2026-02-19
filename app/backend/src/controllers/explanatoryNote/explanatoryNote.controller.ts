import { Request } from 'express';
import { asyncErrorHandler } from '../../middlewares/errorHandler.middleware';
import { CustomResponse } from '../../middlewares/responseHandler.middleware';
import { explanatoryNoteService } from '../../services/explanatoryNote.service';
import { getExplanatoryNotes } from './getExplanatoryNotes.controller';
import { exportExplanatoryNotes } from './exportExplanatoryNotes.controller';

export const explanatoryNoteController = {
  getExplanatoryNotes,
  exportExplanatoryNotes,
  
  getExplanatoryNote: asyncErrorHandler(
    async (req: Request, res: CustomResponse) => {
      const id = Number(req.params.id);
      const explanatoryNote = await explanatoryNoteService.getExplanatoryNote(id);
      res.success(explanatoryNote, 'Explanatory note retrieved successfully');
    }
  ),

  createExplanatoryNote: asyncErrorHandler(
    async (req: Request, res: CustomResponse) => {
      const explanatoryNote = await explanatoryNoteService.createExplanatoryNote(req.body);
      res.success(explanatoryNote, 'Explanatory note created successfully', 201);
    }
  ),

  updateExplanatoryNote: asyncErrorHandler(
    async (req: Request, res: CustomResponse) => {
      const id = Number(req.params.id);
      const explanatoryNote = await explanatoryNoteService.updateExplanatoryNote(id, req.body);
      res.success(explanatoryNote, 'Explanatory note updated successfully');
    }
  ),

  deleteExplanatoryNote: asyncErrorHandler(
    async (req: Request, res: CustomResponse) => {
      const id = Number(req.params.id);
      await explanatoryNoteService.deleteExplanatoryNote(id);
      res.success(null, 'Explanatory note deleted successfully');
    }
  ),
};
