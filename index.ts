import express from 'express';
import QRCode from 'qrcode';

import { WhatsappService } from './services/WhatsappService';
import { MessageWrite } from './rules/MessageWrite';
import { validator } from './helper/Validator';

const app: express.Application = express();
const wa: WhatsappService = new WhatsappService();

wa.Initialize();
app.use(express.json()) 

app.get('/', (req: any, res: any) => {
    res.send('Hello, This is simple whatsapp server for internal use fast and reliable.');
});

app.get('/status', (req: any, res: any) => {
    res.send(wa.GetStatus());
});

app.get('/qr', (req: any, res: any) => {
    const body = "<html><head><title>Whatsapp QrCode</title><script>setTimeout(function(){window.location.reload();}, 1000);</script></head><body>@body</body></html>";

    const status = wa.GetStatus();
    if (status.isConnected){
        const response = "<div><h1 style='text-align: center;' >Whatsapp Connected to " + status.phoneNumber + "</h1></div>";
        const result = body.replace('@body', response);
        res.send(result);
    } else {
        QRCode.toDataURL(wa.qrcode, (err: Error, url: string) => {
            if (err) {
                const response = "<div><h1 style='text-align: center;' >" + err.message + "</h1></div></div>";
                const result = body.replace('@body', response);
                res.send(result);
            } else {
                const response = "<div><img style='display: block; margin-left: auto; margin-right: auto; width: 30%;' src='" + url + "' alt='whatsapp qrcode' /></div>"
                const result = body.replace('@body', response);
                res.send(result);
            }
        });
    }
});

app.post('/message', (req: any, res: any) => {
    validator(req.body, MessageWrite, {}, (error: any, isValid: boolean) => {
        if (!isValid){
            res.status(400);
            res.send({
                status: "failed",
                errors: error.errors
            });
        } else {
            const message = req.body.message;
            const phoneNumber = req.body.phoneNumber;

            wa.SendWhatsappSimpleMessage(phoneNumber, message);

            res.send({ 
               status: "success",
               errors: null
            });
        }
    });
});

app.post('/logout', (req: any, res: any) => {
    wa.Logout();

    res.send({ 
        status: "success",
        errors: null
     });
});

// run express
const apiserver = app.listen(80, () => {
    console.log("Example app listening at http://0.0.0.0:80");
});