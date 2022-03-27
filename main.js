const { WhatsappService } = require('./services/WhatsappService');
const express = require('express');
const { MessageWrite } = require('./rules/MessageWrite');
const validator = require('./helper/Validator');
const QRCode = require('qrcode')

const app = express();
const wa = new WhatsappService();

wa.ConnectToWhatsApp()
    .catch(err => {
        console.log("unexpected error: " + err);
    });

// configure http connection
app.use(express.json()) 

app.get('/', (req, res) => {
    res.send('Hello, This is simple whatsapp server for internal use fast and reliable.');
});

app.get('/status', (req, res) => {
    wa.ConnectToWhatsApp();
    res.send(wa.GetStatus());
});

app.get('/qr', (req, res) => {
    const body = "<html><head><title>Whatsapp QrCode</title><script>setTimeout(function(){window.location.reload();}, 1000);</script></head><body>@body</body></html>";

    const status = wa.GetStatus();
    if (status.isConnected){
        const response = "<div><h1 style='text-align: center;' >Whatsapp Connected to " + status.phoneNumber + "</h1></div>";
        const result = body.replace('@body', response);
        res.send(result);
    } else {
        QRCode.toDataURL(wa.qrcode, (err, code) => {
            if (err) {
                const response = "<div><h1 style='text-align: center;' >" + err.message + "</h1></div></div>";
                const result = body.replace('@body', response);
                res.send(result);
            } else {
                const response = "<div><img style='display: block; margin-left: auto; margin-right: auto; width: 30%;' src='" + code + "' alt='whatsapp qrcode' /></div>"
                const result = body.replace('@body', response);
                res.send(result);
            }
        });
    }
});

app.post('/message', (req, res) => {
    validator(req.body, MessageWrite, {}, (error, isValid) => {
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

app.post('/logout', (req, res) => {
    wa.Logout();

    res.send({ 
        status: "success",
        errors: null
     });
});

// run express
const apiserver = app.listen(80, function(){
    var host = apiserver.address().address
    var port = apiserver.address().port
    
    console.log("Example app listening at http://%s:%s", host, port)
});