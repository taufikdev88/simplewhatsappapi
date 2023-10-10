import { Result, Err, Ok } from "ts-results-es";
import { Otp } from "../models/otp";
import { OtpValid } from '../models/otp_validated';
import logger from "../util/logger";
import { sendData } from "../util/fetch";



type GenerationErrors = "INVALID_RECIPIENT_NUMBER" | "ERROR_PERSISTING_OTP";
type ValidationErrors = "TRANSACTION_NOT_FOUND" | "INVALID_OTP_REF" | "EXPIRED_OTP_TRANSACTION" | "ERROR_CALLBACK";

export const Generate = async (recipient: string | any, cs: string | any, type: string | any, url: string | any): Promise<Result<{ id: string, expiredAt: Date }, GenerationErrors>> => {
  if (!recipient || recipient === "") {
    return Err("INVALID_RECIPIENT_NUMBER");
  }

  try {
    const otp = Otp.build({
      recipient: recipient,
      cs: cs,
      callbackType: type,
      callbackUrl: url
    });

    await otp.save();

    return Ok({
      id: otp.id,
      expiredAt: otp.expiredAt
    });
  }
  catch {
    return Err("ERROR_PERSISTING_OTP");
  }
}

export const Validate = async (id: string | any): Promise<Result<{ isValid: boolean }, ValidationErrors>> => {
  if (!id || id === "") {
    return Err("TRANSACTION_NOT_FOUND");
  }

  try {
    // find transaction
    let otp = await Otp.findById(id).exec();
    if (!otp) {
      return Err("TRANSACTION_NOT_FOUND");
    }

    // validate transaction
    return Ok({
      isValid: otp.isValidated
    });
  }
  catch (err: any) {
    logger.warn(err.message);
    return Err("TRANSACTION_NOT_FOUND");
  }
}

export const Confirm = async (id: string | any, sender: string | any): Promise<Result<boolean, ValidationErrors>> => {
  if (!id || id === "" || !sender || sender === "") {
    return Err("TRANSACTION_NOT_FOUND");
  }

  try {
    let otp = await Otp.findOne({
      _id: id,
      isValidated: false
    }).exec();

    if (!otp) {
      logger.debug('otp find by id is null');
      return Err("TRANSACTION_NOT_FOUND");
    }

    logger.debug('found otp transaction', otp);

    // validate transaction
    if (otp.recipient != sender) {
      return Err("INVALID_OTP_REF");
    }
    if (otp.expiredAt < new Date()) {
      return Err("EXPIRED_OTP_TRANSACTION");
    }

    if (otp.callbackType != null && otp.callbackUrl != null) {
      const status = await HandleCallback(otp.callbackType, otp.callbackUrl)
      if (status.err) {
        return Err(status.val);
      }
    }

    otp.isValidated = true;
    otp.updatedAt = new Date();

    await otp.save();

    const otpValid = OtpValid.build({
      otpNumber: otp._id,
      recipient: otp.recipient,
      cs: otp.cs,
      callbackType: otp.callbackType,
      callbackUrl: otp.callbackUrl,
      isValidated: true
    });

    await otpValid.save();

    return Ok(true);
  }
  catch (err: any) {
    logger.warn(err.message);
    return Err("TRANSACTION_NOT_FOUND");
  }
}

export const Count = async (start: string | any, end: string | any): Promise<Result<{ count: number }, ValidationErrors>> => {
  try {
    const resCount = Otp.countDocuments({
      createdAt: {
        $gte: start,
        $lt: end,
      }
    }).exec()

    return Ok({
      count: await resCount
    })
  } catch (err: any) {
    logger.warn(err.message);
    return Err("TRANSACTION_NOT_FOUND");
  }
}

const HandleCallback = async (type: string | any, url: string | any): Promise<Result<boolean, ValidationErrors>> => {
  try {
    if (type == "simple") {
      await sendData(url, {})
      return Ok(true)
    }

    return Ok(true)
  } catch (err: any) {
    logger.warn(err.message);
    return Err("ERROR_CALLBACK");
  }
}