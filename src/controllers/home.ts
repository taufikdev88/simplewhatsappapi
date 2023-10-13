import { Request, Response } from 'express';
import { PATH_BASE } from "../util/environment";

/**
 * Home Page
 * @route GET /
 */
export const index = (req: Request, res: Response) => {
  res.render('home', {
    title: 'Home',
    pathBase: PATH_BASE
  });
};