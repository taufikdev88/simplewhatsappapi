const ParseTextFromMessage = function (message){
    const content = message.message;
    const type = Object.keys(content)[0];
    
    if (type != "conversation"){
        return "unsupported type (" + type + ")";
    }
    return content[type];
}

module.exports = {
    ParseTextFromMessage
}