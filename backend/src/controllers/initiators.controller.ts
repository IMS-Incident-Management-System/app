import { Request, Response } from 'express';

const getInitiators = async (req: Request, res: Response) => {
  const initiators = ['1', '2'];

  res.status(200).send(initiators);
};

export const getInitiatorsController = { getInitiators };
