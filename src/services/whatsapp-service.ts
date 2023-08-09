import { Boom } from '@hapi/boom'
import makeWASocket, { useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, delay, AnyMessageContent, AuthenticationState, Browsers } from "@whiskeysockets/baileys";
import { FormatToPhoneNumber, FormatToWhatsappJid } from '../util/formatter';
import * as fs from 'fs';
import * as msgProcessorService from "../services/msg-processor-service";
import logger from '../util/logger';

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
        logger.info(`Using wa version v${version.join('.')}, isLatest: ${isLatest}`);

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

            logger.info(`connection update: ${connection}, isNewLogin: ${isNewLogin}, qr: ${qr}`)
            if (qr !== undefined) {
                logger.info("gets qr code")
                this.qrcode = qr as string;
            }

            // closed connection
            if (connection == 'close') {
                const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode;
                logger.info('connection closed due to', lastDisconnect?.error, statusCode);

                if (statusCode !== DisconnectReason.loggedOut) {
                    this.sock = await this.CreateNewSocket();
                }
                else
                {
                    fs.rmSync(AUTH_FILE_LOCATION, { recursive: true, force: true });
                    this.needRestartService = true;
                    logger.info('client logged out, please restart the service for new qrcode');
                }
            }
            // opened connection 
            else if (connection == 'open') {
                logger.info('opened connection');
                this.phoneNumber = FormatToPhoneNumber(state.creds.me?.id as string);
                this.qrcode = "";
            }
        });

        socket.ev.on('creds.update', this.saveCreds);

        socket.ev.on('chats.upsert', item => logger.info(`recv ${item.length} chats`))
        socket.ev.on('chats.update', m => logger.info('chats.update event', m));
        socket.ev.on('chats.delete', m => logger.info('chats.delete event', m));

        socket.ev.on('contacts.upsert', item => logger.info(`recv ${item.length} contacts`))
        socket.ev.on('contacts.update', m => logger.info('contacts.update event', m));

        socket.ev.on('messages.upsert', async m => {
            logger.info('messages.upsert event', m);

            m.messages.forEach(async message => {
                // skip message if the message sent by me
                if (message.key.fromMe) {
                    return;
                }
                // process the message
                const result = await msgProcessorService.Process(message);
                if (result.needReply){
                    await this.SendWhatsappSimpleMessage(message.key.remoteJid, result.message);
                }
            })
        });

        socket.ev.on('messages.update', m => logger.info('messages.update event', m));
        socket.ev.on('message-receipt.update', m => logger.info('message-receipt.update event', m));
        socket.ev.on('presence.update', m => logger.info('presence.update event', m))

        return socket;
    }

    async SendWhatsappSimpleMessage(phoneNumber: string | null | undefined, message: AnyMessageContent) {
        logger.info(`Sending To: ${phoneNumber} with message: ${message}`);

        const jid = FormatToWhatsappJid(phoneNumber);
        logger.info(`Formatted jid to: ${jid}`);

        await this.sock.presenceSubscribe(jid);
        await delay(10);
        await this.sock.sendPresenceUpdate('composing', jid);
        await delay(10);
        await this.sock.sendPresenceUpdate('available', jid);
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