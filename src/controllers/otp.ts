import { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { StatusCodes, ReasonPhrases } from "http-status-codes";
import * as otpService from "../services/otp-service";

const actionTemplate = "https://wa.me/{n}?text={t}";
const messageTemplate = "*{code}*\n\n_please do not change the content._\n_mohon jangan rubah isi pesan ini._";

/**
 * Request OTP
 * Response recipient number as request id and action for recipient
 * @route POST /otp
 */
export const request = async (req: Request, res: Response) => {
  await body('phoneNumber')
    .notEmpty().withMessage('phone number cannot be blank')
    .matches("^[0-9+ \-]+$").withMessage('invalid format')
    .trim()
    .run(req);

  await body('message')
    .optional()
    .contains("{code}", {
      ignoreCase: false,
      minOccurrences: 1
    }).withMessage('message must contains {code} for unique id')
    .trim()
    .run(req);
  
  // validation
  const errors = validationResult(req);
  if (!errors.isEmpty()){
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({
        status: ReasonPhrases.BAD_REQUEST,
        errors: errors.array()
      });
  }
  
  // generation
  let generationResult = await otpService.Generate(req.body.phoneNumber);
  if (generationResult.err){
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({
        status: ReasonPhrases.BAD_REQUEST,
        errors: generationResult.val
      });
  }

  // composing message
  let waStatus = req.wa!.GetStatus();

  let message = actionTemplate
    .replace('{n}', waStatus.phoneNumber)
    .replace('{t}', (!req.body.message ? messageTemplate : req.body.message).replace('{code}', `otp:${generationResult.val.id}`));

  // return transaction id and action needed
  return res
    .status(StatusCodes.OK)
    .json({
      status: ReasonPhrases.OK,
      errors: null,
      data: {
        id: generationResult.val.id,
        action: encodeURI(message)
      }
    });
};

/**
 * Validate OTP
 * @route POST /otp/:id/validate
 */
export const validate = async (req: Request, res: Response) => {
  let id: string = req.params.id;

  let validationResult = await otpService.Validate(id);
  if (validationResult.err){
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({
        status: ReasonPhrases.NOT_FOUND,
        errors: [
          {
            type: "data",
            msg: "transaction not found"
          }
        ]
      });
  }
  
  if (!validationResult.val.isValid){
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({
        status: ReasonPhrases.BAD_REQUEST,
        errors: [
          {
            type: "data",
            msg: "not validated"
          }
        ]
      });
  }

  return res
    .status(StatusCodes.OK)
    .json({
      status: ReasonPhrases.OK,
      errors: null
    });
};