"use strict";

import { Response, Request } from 'express';
import { check, validationResult } from 'express-validator';
import { StatusCodes, ReasonPhrases } from 'http-status-codes';

/**
 * Send Message
 * @route POST /message
 */
export const postMessage = async (req: Request, res: Response) => {
  await check("phoneNumber", "phone number cannot be blank").notEmpty().run(req);
  await check("phoneNumber", "invalid format for phone number").matches("^[0-9+ \-]+$").run(req);
  await check("message", "message cannot be blank").notEmpty().run(req);

  const errors = validationResult(req);

  if (!errors.isEmpty()){
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({
        status: ReasonPhrases.BAD_REQUEST,
        errors: errors.array()
      });
  }

  const phoneNumber = req.body.phoneNumber;
  const message = req.body.message;
  
  req.wa!.SendWhatsappSimpleMessage(phoneNumber, message);

  return res
    .status(StatusCodes.OK)
    .json({
      status: ReasonPhrases.OK,
      errors: null
    });
}