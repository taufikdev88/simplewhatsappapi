import { Request, Response } from "express";
import { check, validationResult } from "express-validator";
import { StatusCodes, ReasonPhrases } from "http-status-codes";
import * as otpService from "../services/otp-service";

/**
 * Request OTP
 * Response recipient number as request id and action for recipient
 * @route POST /otp
 */
export const request = async (req: Request, res: Response) => {
  await check('phoneNumber', 'phone number cannot be blank').notEmpty().run(req);
  await check('phoneNumber', "invalid format for phone number").matches("^[0-9+ \-]+$").run(req);
  
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
  var waStatus = req.wa!.GetStatus();

  // return transaction id and action needed
  return res
    .status(StatusCodes.OK)
    .json({
      status: ReasonPhrases.OK,
      errors: null,
      data: {
        id: generationResult.val.id,
        action: `wa.me/${waStatus.phoneNumber}?message=test${generationResult.val.id}`
      }
    })
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