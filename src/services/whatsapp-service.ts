import { Boom } from '@hapi/boom'
import makeWASocket, { useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, delay, AnyMessageContent, AuthenticationState, Browsers } from "@whiskeysockets/baileys";
import { FormatToPhoneNumber, FormatToWhatsappJid } from '../util/formatter';
import * as fs from 'fs';

const AUTH_FILE_LOCATION = './data/session';

export class WhatsappService {
    qrcode: string = "";
    phoneNumber: string = "";
    needRestartService: boolean = false;
    sock: any;
    state: AuthenticationState | null = null;
    saveCreds: any;

    constructor() {

    }

    async Initialize() {
        this.sock = await this.CreateNewSocket();
    }

    async CreateNewSocket() {
        const { version, isLatest } = await fetchLatestBaileysVersion();
        console.log(`Using wa version v${version.join('.')}, isLatest: ${isLatest}`);

        const { state, saveCreds } = await useMultiFileAuthState(AUTH_FILE_LOCATION);
        this.state = state;
        this.saveCreds = saveCreds;

        var socket = makeWASocket({
            version: version,
            printQRInTerminal: true,
            auth: state,
            markOnlineOnConnect: true,
            browser: Browsers.macOS('Desktop'),
            syncFullHistory: true
        });

        // autoreconnect
        socket.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect, isNewLogin, qr } = update;

            if (connection == 'close') {
                const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode;

                console.log('connection closed due to', (lastDisconnect?.error as Boom)?.message, statusCode);

                if (statusCode !== DisconnectReason.loggedOut) {
                    this.sock = await this.CreateNewSocket();
                }
                else
                {
                    fs.rmSync(AUTH_FILE_LOCATION, { recursive: true, force: true });
                    this.needRestartService = true;
                    console.log('client logged out, please restart the service for new qrcode');
                }
            } else if (connection === 'open') {
                // saat connection open, ambil nomor hp yang sedang terkoneksi
                console.log('opened connection')
                this.phoneNumber = FormatToPhoneNumber(state.creds.me?.id as string);
                this.qrcode = "";
            }

            console.log(`connection update: ${connection}, isNewLogin: ${isNewLogin}, qr: ${qr}`)
            if (qr !== undefined) {
                console.log("gets qr code")
                this.qrcode = qr as string;
            }
        });

        socket.ev.on('creds.update', this.saveCreds);

        socket.ev.on('chats.upsert', item => console.log(`recv ${item.length} chats`))
        socket.ev.on('chats.update', m => console.log(m));
        socket.ev.on('chats.delete', m => console.log(m));

        socket.ev.on('contacts.upsert', item => console.log(`recv ${item.length} contacts`))
        socket.ev.on('contacts.upsert', m => console.log(m));

        socket.ev.on('messages.upsert', async m => {
            console.log('got messages', m.messages)

            m.messages.forEach(message => {
                if (message.key.fromMe || m.type !== 'notify') {
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

    async SendWhatsappSimpleMessage(phoneNumber: string, message: AnyMessageContent) {
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

    GetStatus() {
        if (this.needRestartService){
            return {
                isConnected: false,
                phoneNumber: "",
                qrcode: "",
                needRestart: true
            };
        }
        if (this.qrcode === "") {
            return {
                isConnected: true,
                phoneNumber: this.phoneNumber,
                qrcode: "",
                needRestart: false
            };
        }
        return {
            isConnected: false,
            phoneNumber: "",
            qrcode: this.qrcode,
            needRestart: false
        };
    }
};