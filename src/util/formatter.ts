export const FormatToPhoneNumber = function (number: string){
    if(typeof(number) == 'undefined' || number == ''){
        return "";
    }
    number = number.substring(0, number.indexOf(':'));
    return number;
};

export const FormatToWhatsappJid = function (number: string){
    if(typeof(number) == 'undefined' || number == ''){
        return "";
    }
    
    number = number.replace(/\D/g, '');
    if (number.startsWith('+')){
        number = number.substring(1);
    }
    if (number.startsWith('08')){
        number = '62' + number.substring(1);
    }
    if (!number.endsWith('@s.whatsapp.net')){
        number = number + '@s.whatsapp.net';
    }
    return number;
};