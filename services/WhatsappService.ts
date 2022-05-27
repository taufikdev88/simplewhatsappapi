import { Boom } from '@hapi/boom'
import makeWASocket, { DisconnectReason, useSingleFileAuthState, fetchLatestBaileysVersion, delay, AnyMessageContent } from "@adiwajshing/baileys";
import { FormatToIndonesian, FormatToWhatsappJid } from '../helper/PhoneNumberFormatter';

const AUTH_FILE_LOCATION = './data/session.json';
const { state, saveState }  = useSingleFileAuthState(AUTH_FILE_LOCATION);

export class WhatsappService {
    qrcode: string = "";
    phoneNumber: string = "";
    sock: any;

    constructor(){

    }

    async Initialize() {
        this.sock = await this.CreateNewSocket();
    }
    
    async CreateNewSocket() {
        const { version, isLatest } = await fetchLatestBaileysVersion();
        console.log(`Using wa version v${version.join('.')}, isLatest: ${isLatest}`);
        
        var socket = makeWASocket({
            version: version,
            printQRInTerminal: true,
            auth: state,
            getMessage: async key => {
                return {
                    conversation: 'hello'
                }
            }
        });
        
        // autoreconnect
        socket.ev.on('connection.update', (update) => {
            const { connection, lastDisconnect, isNewLogin, qr } = update;

            if (connection == 'close'){
                const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode;

                console.log('connection closed due to', (lastDisconnect?.error as Boom)?.message, statusCode);
                
                if(statusCode !== DisconnectReason.loggedOut) {
                    this.sock = this.CreateNewSocket();
                }
            } else if(connection === 'open') {
                // saat connection open, ambil nomor hp yang sedang terkoneksi
                console.log('opened connection')
                this.phoneNumber = FormatToIndonesian(state.creds.me?.id as string);
                this.qrcode = "";
            }

            console.log(`connection update: ${connection}, isNewLogin: ${isNewLogin}, qr: ${qr}`)
            if (qr !== undefined) {
                console.log("gets qr code")
                this.qrcode = qr as string;
            }
        });

        socket.ev.on('creds.update', saveState);

        socket.ev.on('chats.set', item => console.log(`recv ${item.chats.length} chats (is latest: ${item.isLatest})`))
        socket.ev.on('chats.update', m => console.log(m));
        socket.ev.on('chats.delete', m => console.log(m));

        socket.ev.on('contacts.set', item => console.log(`recv ${item.contacts.length} contacts`))
        socket.ev.on('contacts.upsert', m => console.log(m));

        socket.ev.on('messages.set', item => console.log(`recv ${item.messages.length} messages (is latest: ${item.isLatest})`));
        socket.ev.on('messages.upsert', async m => {
            console.log('got messages', m.messages)
        
            m.messages.forEach(message => {
              if (message.key.fromMe || m.type !== 'notify'){
                return
              }
        
              console.log('got message from:', message.key.remoteJid, 'name:', message.pushName, 'message:', message)
            })
        });
        socket.ev.on('messages.update', m => console.log(m));
        socket.ev.on('message-receipt.update', m => console.log(m));

        socket.ev.on('presence.update', m => console.log(m))

        return socket;
    }
    
    async SendWhatsappSimpleMessage(phoneNumber: string, message: AnyMessageContent){
        console.log('Sending To:', phoneNumber, 'with message:', message);
        const jid = FormatToWhatsappJid(phoneNumber);
        console.log('Formatted jid to:', jid);

        await this.sock.presenceSubscribe(jid);
        await delay(10);
        await this.sock.sendPresenceUpdate('composing', jid);
        await delay(10);
        await this.sock.sendPresenceUpdate('paused', jid);
        await delay(10);
        await this.sock.sendMessage(jid, {
            text: message
        });
    }

    GetStatus(){
        if (this.qrcode === ""){
            return {
                isConnected: true,
                phoneNumber: this.phoneNumber,
                qrcode: ""
            };
        }
        return { 
            isConnected: false,
            phoneNumber: "" ,
            qrcode: this.qrcode
        };
    }

    Logout(){
        this.sock.logout();
    }
};