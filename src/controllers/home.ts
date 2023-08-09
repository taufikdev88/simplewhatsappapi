import { Request, Response } from 'express';

/**
 * Home Page
 * @route GET /
 */
export const index = (req: Request, res: Response) => {
  res.render('home', {
    title: 'Home'
  });
};