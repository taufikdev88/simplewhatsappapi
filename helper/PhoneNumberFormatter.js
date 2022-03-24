const FormatToIndonesian = function (number){
    number = number.replace(/\D/g, '');
    if (number.startsWith('62')){
        number = '0' + number.substring(2);
    }
    return number;
};

const FormatToWhatsappJid = function (number){
    if (number.startsWith('08')){
        number = '62' + number.substring(1);
    }
    if (!number.endsWith('@s.whatsapp.net')){
        number = number + '@s.whatsapp.net';
    }
    return number;
};

module.exports = {
    FormatToIndonesian,
    FormatToWhatsappJid
}