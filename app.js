/* eslint-disable no-undef */
const server = require('express');
const axios = require('axios');
const cors = require('cors');
const bodyparser = require('body-parser');
const app = server();
const fs = require('fs');
const config = require('config')
const { verifyIsHello } = require('./service.js');
const { ok } = require('assert');

app.use(cors());
app.use(bodyparser({ limit: '50mb' }));
app.post('/', async (req, res) => {

    if (req.body.mimetype == 'audio/ogg; codecs=opus') {
        const fileContents = new Buffer(req.body.body, 'base64');
        const filehash = req.body.filehash.replace('/', '');
        const filename = `./hitory/${filehash}.ogg`;
        fs.writeFile(filename, fileContents, (err) => {
            if (err) return console.error(err);
            console.log('file saved to');
        });
    }

    // print request body
    let body = req.body.body
    if (body.notifyName == config.WebHook.admin.name) {
        console.log('açao do adm:', body)
        return res.status(200).send({})
    }
    let message = body.content || ''
    if (body.from) {
        return res.status(200).send({ status: 'ok' })
    }
    console.warn(message || `nao tem mensagem deve ser outro webhook ${JSON.stringify(req.body)}`)
    message == message.toLowerCase()
    if (body.type == 'image') {
        console.log('recebi uma imagem');
        res.status(200).send({})
    }

    let isMyMessage = body.fromMe || false;
    if (isMyMessage && body.notifyName == config.WebHook.admin.name) {
        console.log('my message: ', body.content);
    }

    const sender = body.from || '';
    let splitw = sender.indexOf('@');
    let number = sender.slice(0, splitw);



    if (
        verifyIsHello(message)
    ) {
        let data = {
            phone: number,
            message: `Olá ${body.sender.pushname}, está é uma mensagem automatica enviada pelo GuiBot, escolha uma das opçoes para prosseguir:
            1 - falar comigo no meu numero pessoal,
            2 - deixar uma mensagem para ser encaminhada para meu numero pessoal( digite a opçao e deixe a mensagem na frente 2 - msg),
            3 - ir se foder se você for o ulisses`,
            isGroup: false
        };
        await sendMessage(data).catch(e);
    }

    if (message.includes('1')) {

        let data = {
            phone: number,
            message: "Ligue para o numero 5511950468718",
            isGroup: false
        };
        await sendMessage(data);
    }
    if (message.includes('2', 0)) {

        let data = {
            phone: config.WebHook.admin.number,
            message: message,
            isGroup: false
        };
        await sendMessage(data);
    }

    if (message.includes('3')) {
        let data = {
            phone: number,
            message: "VAI SE FODER NERDÃO",
            isGroup: false
        };
        await sendMessage(data);
    }

    // return a text response
    const data = {
        responses: [
            {
                type: 'text',
                elements: ['Hi', 'Hello']
            }
        ]
    };

    res.json(data);
});
async function sendMessage(data) {
    const headers = {
        'Content-Type': 'application/json',
        Authorization:
            'Bearer $2b$10$WkDIPbnzd1CgK_rHArYpru2eNiG3d0Czt65Ci9NGlvdzv_yQ.YwaS'
    };

    return await axios.default
        .post('http://localhost:21465/api/session1/send-message', data, {
            headers: headers
        })
        .catch((e) => {
            console.log(e);
        });
}
app.post('/send-message', async (req, res) => {
    let data = req.body;
    const headers = {
        'Content-Type': 'application/json',
        Authorization:
            'Bearer $2b$10$WkDIPbnzd1CgK_rHArYpru2eNiG3d0Czt65Ci9NGlvdzv_yQ.YwaS'
    };
    let response = await axios.default
        .post('http://localhost:21465/api/session1/send-message', data, {
            headers: headers
        })
        .catch((e) => {
            console.log(e);
        });
    res.status(200).send(response);
});

app.listen(config.WebHook.server.port || 8080, () => {
    console.log('server iniciado na env de:', process.env.NODE_ENV)
    console.log('server de webhook inicado na porta:', config.WebHook.server.port);
});
