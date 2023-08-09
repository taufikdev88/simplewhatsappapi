export const FormatToPhoneNumber = (number: string | null | undefined) : string => {
    if(number == undefined || number == null || number == ''){
        return "";
    }

    const indexOfDoubleDots = number.indexOf(':');
    number = number.substring(0, indexOfDoubleDots >= 0 ? indexOfDoubleDots : number.indexOf('@'));
    return number;
}

export const FormatStandardPhoneNumber = (number: string | null | undefined) : string => {
    if(number == undefined || number == null || number == ''){
        return "";
    }
    // remove all character except digit
    number = number.replace(/\D/g, '');
    // replace 08 with 62
    if (number.startsWith('08')){
        number = '62' + number.substring(1);
    }
    return number;
}

export const FormatToWhatsappJid = (number: string | null | undefined) : string => {
    // format to standard number with country code first
    number = FormatStandardPhoneNumber(number);
    // add whatsapp jid
    if (!number.endsWith('@s.whatsapp.net')){
        number = number + '@s.whatsapp.net';
    }
    return number;
}