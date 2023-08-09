import { Result, Err, Ok } from "ts-results-es";
import { Otp } from "../models/otp";
import logger from "../util/logger";

type GenerationErrors = "INVALID_RECIPIENT_NUMBER" | "ERROR_PERSISTING_OTP";
type ValidationErrors = "TRANSACTION_NOT_FOUND" | "INVALID_OTP_REF" | "EXPIRED_OTP_TRANSACTION";

export const Generate = async (recipient: string | any): Promise<Result<{ id: string }, GenerationErrors>> => {
  if (!recipient || recipient === "") {
    return Err("INVALID_RECIPIENT_NUMBER");
  }

  try {
    const otp = Otp.build({
      recipient: recipient
    });

    await otp.save();

    return Ok({
      id: otp.id
    });
  }
  catch {
    return Err("ERROR_PERSISTING_OTP");
  }
}

export const Validate = async (id: string | any): Promise<Result<{ isValid: boolean }, ValidationErrors>> => {
  if (!id || id === ""){
    return Err("TRANSACTION_NOT_FOUND");
  }

  try {
    // find transaction
    let otp = await Otp.findById(id).exec();
    if (!otp){
      return Err("TRANSACTION_NOT_FOUND");
    }

    // validate transaction
    return Ok({
      isValid: otp.isValidated
    });
  }
  catch(err: any){
    logger.warn(err.message);
    return Err("TRANSACTION_NOT_FOUND");
  }
}

export const Confirm = async (id: string | any, sender: string | any): Promise<Result<boolean, ValidationErrors>> => {
  if (!id || id === "" || !sender || sender === ""){
    return Err("TRANSACTION_NOT_FOUND");
  }

  try {
    let otp = await Otp.findOne({
        _id: id,
        isValidated: false
      }).exec();
      
    if (!otp){
      logger.debug('otp find by id is null');
      return Err("TRANSACTION_NOT_FOUND");
    }

    logger.debug('found otp transaction', otp);

    // validate transaction
    if (otp.recipient != sender){
      return Err("INVALID_OTP_REF");
    }
    if (otp.expiredAt < new Date()){
      return Err("EXPIRED_OTP_TRANSACTION");
    }

    otp.isValidated = true;
    otp.updatedAt = new Date();

    await otp.save();

    return Ok(true);
  }
  catch(err: any){
    logger.warn(err.message);
    return Err("TRANSACTION_NOT_FOUND");
  }
}