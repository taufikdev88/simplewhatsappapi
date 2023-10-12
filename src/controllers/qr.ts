import { Request, Response } from "express";
import QRCode from "qrcode";
import logger from '../util/logger';
import { PATH_BASE } from "../util/environment";

/**
 * Get QR code
 * @route GET /qr
 */
export const getQrCode = (req: Request, res: Response) => {
  const status = req.wa!.GetStatus();
  if (status.needRestart) {
    return res.render('qr/info', {
      title: 'Qr Code',
      message: 'Client Logged Out, Restart Service For New QRCode',
      PATH: PATH_BASE
    });
  }
  if (status.isConnected) {
    logger.info('client connected');
    return res.render('qr/info', {
      title: 'Qr Code',
      message: 'Connected to ' + status.phoneNumber,
      test: 'test',
      PATH: PATH_BASE
    });
  }

  QRCode.toDataURL(req.wa!.qrcode, (err: Error | null | undefined, url: string) => {
    if (err) {
      logger.info(err.message);
      return res.render('qr/info', {
        title: 'Qr Code',
        message: err.message,
        PATH: PATH_BASE
      })
    } else {
      return res.render('qr/index', {
        title: 'Qr Code',
        url: url,
        PATH: PATH_BASE
      });
    }
  });
}