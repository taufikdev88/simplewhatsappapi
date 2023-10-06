import { WAMessage } from "@whiskeysockets/baileys";
import * as otpService from "../services/otp-service";
import logger from "../util/logger";
import { FormatToPhoneNumber } from "../util/formatter";

type MessageType = 'otp' | 'unknown';

export const Process = async (m: WAMessage | undefined) : Promise<{
  needReply: boolean,
  message: any
}> => {
  if (m == undefined){
    return {
      needReply: false,
      message: null
    };
  }

  let senderJid = m.key.remoteJid;
  let formattedJid = FormatToPhoneNumber(senderJid);
  let senderName = m.pushName;
  let text = m.message?.ephemeralMessage?.message?.extendedTextMessage?.text ??
    m.message?.extendedTextMessage?.text ?? 
    m.message?.conversation;

  logger.info(`got message from: ${senderJid} -> ${formattedJid} ,name: ${senderName} ,message: ${text}`);

  const { type, ref } = GetType(text);
  if (type == 'otp'){
    logger.info(`confirming otp with ref ${ref} from ${formattedJid}`);

    var validationResult = await otpService.Confirm(ref, formattedJid);
    if (validationResult.err){
      return {
        needReply: true,
        message: validationResult.val
      }
    }

    return {
      needReply: true,
      message: "SUCCESS"
    }
  }

  return {
    needReply: false,
    message: null
  };
}

const GetType = (m: string | null | undefined) : {
  type: MessageType,
  ref: string | null
} => {
  // empty string return unknown
  if (m == undefined || m == null || m === ""){
    return {
      type: 'unknown',
      ref: null
    };
  }

  const otpMatch = m.match("otp:[a-zA-Z0-9]+");
  logger.debug('otp match regex func', otpMatch);

  if (otpMatch){
    return {
      type: 'otp',
      ref: otpMatch[0]?.substring(4)
    };
  }

  // unkown type return default
  return {
    type: 'unknown',
    ref: null
  };
}