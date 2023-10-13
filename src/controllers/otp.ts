import { Request, Response } from "express";
import { body, check, checkSchema, validationResult } from "express-validator";
import { StatusCodes, ReasonPhrases } from "http-status-codes";
import { FormatStandardPhoneNumber } from "../util/formatter";
import * as otpService from "../services/otp-service";
import { OtpCallbackType } from "../enums/otp_callback_type";
import { sendData } from "../util/fetch";
import { PATH_BASE } from "../util/environment";

const actionTemplate = "https://wa.me/{n}?text={t}";
const messageTemplate = "*{code}*\n\n_please do not change the content._\n_mohon jangan rubah isi pesan ini._";

/**
 * Get OTP FORM
 * @route GET /otp
 */
export const getOtpForm = (req: Request, res: Response) => {
  return res.render('otp', {
    title: 'OTP Request',
    pathBase: PATH_BASE
  });
}

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

  await checkSchema({
    callbackUrl: {
      optional: true,
      matches: {
        options: /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$|^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/i,
        errorMessage: 'invalid format url'
      },
      trim: true
    },
    callbackType: {
      optional: true,
      isIn: {
        options: Object.values(OtpCallbackType).filter((v) => isNaN(Number(v))),
        errorMessage: 'invalid format callback type'
      },
      trim: true
    }
  })
    .run(req);

  // validation
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({
        status: ReasonPhrases.BAD_REQUEST,
        errors: errors.array()
      });
  }

  // composing message
  let waStatus = req.wa!.GetStatus();

  let formattedPhoneNumber = FormatStandardPhoneNumber(req.body.phoneNumber);

  //checking api callback
  if (req.body.callbackType && req.body.callbackUrl) {
    try {
      if (req.body.callbackType == "Simple") {
        await sendData(req.body.callbackUrl, { otpId: null, phoneNumber: formattedPhoneNumber, status: "requested" })
      }
    } catch (err: any) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({
          status: ReasonPhrases.BAD_REQUEST,
          errors: [
            {
              type: "data",
              msg: "INVALID_CALLBACK"
            }]
        });
    }
  }

  // generation
  let generationResult = await otpService.Generate(formattedPhoneNumber, waStatus.phoneNumber, req.body.callbackType, req.body.callbackUrl);
  if (generationResult.err) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({
        status: ReasonPhrases.BAD_REQUEST,
        errors: [
          {
            type: "data",
            msg: generationResult.val
          }]
      });
  }

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
        action: encodeURI(message),
        expiredAt: generationResult.val.expiredAt
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
  if (validationResult.err) {
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

  if (!validationResult.val.isValid) {
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

/**
 * Get Count Hit OTP
 * Response count hit request OTP
 * @route GET /otp/count
 */
export const count = async (req: Request, res: Response) => {
  await check('start')
    .notEmpty().withMessage('start date cannot be blank')
    .isISO8601().toDate().withMessage('invalid format')
    .trim()
    .run(req);

  await check('end')
    .notEmpty().withMessage('end date cannot be blank')
    .isISO8601().toDate().withMessage('invalid format')
    .trim()
    .run(req);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({
        status: ReasonPhrases.BAD_REQUEST,
        errors: errors.array()
      });
  }

  try {
    const start = req.query.start as string;
    const end = req.query.end as string;

    const startDate = new Date(start)
    const endDate = new Date(end)
    endDate.setDate(endDate.getDate() + 1)

    //if end date greater than of start date
    if (startDate.getTime() >= endDate.getTime()) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({
          status: ReasonPhrases.BAD_REQUEST,
          errors: [
            {
              type: "data",
              msg: "End date must greater than equal to start date"
            }]
        });
    }

    const countResult = await otpService.Count(startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]);
    if (countResult.err) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({
          status: ReasonPhrases.BAD_REQUEST,
          errors: [
            {
              type: "data",
              msg: countResult.val
            }]
        });
    }

    // return transaction id and action needed
    return res
      .status(StatusCodes.OK)
      .json({
        status: ReasonPhrases.OK,
        errors: null,
        data: {
          count: countResult.val.count
        }
      });
  } catch (err: any) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({
        status: ReasonPhrases.BAD_REQUEST,
        errors: [
          {
            type: "data",
            msg: err.message
          }]
      });
  }
}
