import { Result, Err, Ok } from "ts-results-es";
import { Otp } from "../models/otp";
import logger from "../util/logger";

type GenerationErrors = "INVALID_RECIPIENT_NUMBER" | "ERROR_PERSISTING_OTP";
type ValidationErrors = "TRANSACTION_NOT_FOUND";

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