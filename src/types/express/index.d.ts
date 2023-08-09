import { WhatsappService } from "../../services/whatsapp-service"

declare global {
  namespace Express {
    export interface Request {
      wa?: WhatsappService
    }
  }
}