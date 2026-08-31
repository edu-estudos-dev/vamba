import type { Request, Response } from 'express';

import { getCostGuard } from '../config/providers.js';

export const getHealth = (_request: Request, response: Response) => {
  response.status(200).json({
    status: 'ok',
    service: 'vamba-server',
    cost: getCostGuard().snapshot(),
  });
};
