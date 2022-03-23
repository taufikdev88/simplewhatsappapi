const { WhatsappService } = require('./services/WhatsappService');
const express = require('express');

const app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

const wa = new WhatsappService();

wa.ConnectToWhatsApp()
    .catch(err => {
        console.log("unexpected error: " + err);
    });

// configure socket connection
io.on('connection', client => {
    console.log('client connected');

    client.on('ready', () => {
        console.log('ready');
    });
    client.on('join', data => {
        console.log(data);
    });
    client.on('message', message => {
        console.log(message);
    });
});

// configure http connection
app.get('/', (req, res) => { 
    wa.SendWhatsappSimpleMessage("081977321571", "Sudah Menyala Yei");
    res.send('Hello World');
});

// run express
const apiserver = app.listen(8080, function(){
    var host = apiserver.address().address
    var port = apiserver.address().port
    
    console.log("Example app listening at http://%s:%s", host, port)
});