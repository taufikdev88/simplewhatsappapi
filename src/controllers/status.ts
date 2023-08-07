import { Request, Response } from "express"

/**
 * Get Status
 * @route /status
 */
export const getStatus = (req: Request, res: Response) => {
  const status = req.wa!.GetStatus();
  return res.json(status);
}