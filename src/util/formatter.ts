export const FormatToPhoneNumber = (number: string) : string => {
    if(typeof(number) == 'undefined' || number == ''){
        return "";
    }
    number = number.substring(0, number.indexOf(':'));
    return number;
}

export const FormatStandardPhoneNumber = (number: string) : string => {
    if(typeof(number) == 'undefined' || number == ''){
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

export const FormatToWhatsappJid = (number: string) : string => {
    // format to standard number with country code first
    number = FormatStandardPhoneNumber(number);
    // add whatsapp jid
    number = number + '@s.whatsapp.net';
    return number;
}