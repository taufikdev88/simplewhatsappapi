import compression from 'compression';
import express from 'express';
import session from 'express-session';
import flash from 'express-flash';
import path from 'path';
import { WhatsappService } from './services/whatsapp-service';
import { SESSION_SECRET } from './util/secrets';

// Controllers (route handlers)
import * as homeController from './controllers/home';
import * as messageController from './controllers/message';
import * as qrController from './controllers/qr';
import * as statusController from './controllers/status';

// API Keys and Passport configuration

// Create Express Server
const app = express();

// Connect to MongoDB

// Services
const wa = new WhatsappService();
wa.Initialize();
const exposeWhatsappService = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  req.wa = wa;
  next();
}

// Express configuration
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'pug');

app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: SESSION_SECRET as string
}));
app.use(flash());

app.use(
  express.static(path.join(__dirname, "public"), { maxAge: 31557600000 })
);

/**
 * Primary app routes.
 */
app.get('/', homeController.index);
app.post('/message', exposeWhatsappService, messageController.postMessage);
app.get('/qr', exposeWhatsappService, qrController.getQrCode);
app.get('/status', exposeWhatsappService, statusController.getStatus);

export default app;