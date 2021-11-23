const config = require('config')
let service = {};

function verifyIsHello(text) {
    const searchWords = config.get('WebHook.messages.hello')
    return searchWords.some((el) => {
        return text.match(new RegExp(el, "i"))
    })
}


module.exports = {
    verifyIsHello
}