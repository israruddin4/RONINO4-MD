require('./settings')
const { Boom } = require('@hapi/boom')
const fs = require('fs')
const chalk = require('chalk')
const FileType = require('file-type')
const path = require('path')
const axios = require('axios')
const { handleMessages, handleGroupParticipantUpdate, handleStatus } = require('./silamd');
const PhoneNumber = require('awesome-phonenumber')
const { imageToWebp, videoToWebp, writeExifImg, writeExifVid } = require('./lib/exif')
const { smsg, isUrl, generateMessageTag, getBuffer, getSizeMedia, fetch, await, sleep, reSize } = require('./lib/myfunc')
const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    generateForwardMessageContent,
    prepareWAMessageMedia,
    generateWAMessageFromContent,
    generateMessageID,
    downloadContentFromMessage,
    jidDecode,
    proto,
    jidNormalizedUser,
    makeCacheableSignalKeyStore,
    delay
} = require("@whiskeysockets/baileys")
const NodeCache = require("node-cache")
// Using a lightweight persisted store instead of makeInMemoryStore (compat across versions)
const pino = require("pino")
const readline = require("readline")
const { parsePhoneNumber } = require("libphonenumber-js")
const { PHONENUMBER_MCC } = require('@whiskeysockets/baileys/lib/Utils/generics')
const { rmSync, existsSync } = require('fs')
const { join } = require('path')

// Import lightweight store
const store = require('./lib/lightweight_store')

// Initialize store
store.readFromFile()
const settings = require('./settings')
setInterval(() => store.writeToFile(), settings.storeWriteInterval || 10000)

// Memory optimization - Force garbage collection if available
setInterval(() => {
    if (global.gc) {
        global.gc()
        console.log('🧹 Garbage collection completed')
    }
}, 60_000) // every 1 minute

// Memory monitoring - Restart if RAM gets too high
setInterval(() => {
    const used = process.memoryUsage().rss / 1024 / 1024
    if (used > 400) {
        console.log('⚠️ RAM too high (>400MB), restarting bot...')
        process.exit(1) // Panel will auto-restart
    }
}, 30_000) // check every 30 seconds

let phoneNumber = "923308363433"
let owner = JSON.parse(fs.readFileSync('./data/owner.json'))

global.botname = "𝙍𝙊𝙉𝙄𝙉 𝙈𝘿"
global.themeemoji = "•"
const pairingCode = !!phoneNumber || process.argv.includes("--pairing-code")
const useMobile = process.argv.includes("--mobile")

// Only create readline interface if we're in an interactive environment
const rl = process.stdin.isTTY ? readline.createInterface({ input: process.stdin, output: process.stdout }) : null
const question = (text) => {
    if (rl) {
        return new Promise((resolve) => rl.question(text, resolve))
    } else {
        // In non-interactive environment, use ownerNumber from settings
        return Promise.resolve(settings.ownerNumber || phoneNumber)
    }
}


async function startroninBotInc() {
    let { version, isLatest } = await fetchLatestBaileysVersion()
    const { state, saveCreds } = await useMultiFileAuthState(`./session`)
    const msgRetryCounterCache = new NodeCache()

    const roninBotInc = makeWASocket({
        version,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: !pairingCode,
        browser: ["Ubuntu", "Chrome", "20.0.04"],
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })),
        },
        markOnlineOnConnect: true,
        generateHighQualityLinkPreview: true,
        syncFullHistory: true,
        getMessage: async (key) => {
            let jid = jidNormalizedUser(key.remoteJid)
            let msg = await store.loadMessage(jid, key.id)
            return msg?.message || ""
        },
        msgRetryCounterCache,
        defaultQueryTimeoutMs: undefined,
    })

    store.bind(roninBotInc.ev)

    // Message handling
    silaBotInc.ev.on('messages.upsert', async chatUpdate => {
        try {
            const mek = chatUpdate.messages[0]
            if (!mek.message) return
            mek.message = (Object.keys(mek.message)[0] === 'ephemeralMessage') ? mek.message.ephemeralMessage.message : mek.message
            if (mek.key && mek.key.remoteJid === 'status@broadcast') {
                await handleStatus(roninBotInc, chatUpdate);
                return;
            }
            if (!roninBotInc.public && !mek.key.fromMe && chatUpdate.type === 'notify') return
            if (mek.key.id.startsWith('𝙍𝙊𝙉𝙄𝙉-𝙈𝘿') && mek.key.id.length === 16) return

            // Clear message retry cache to prevent memory bloat
            if (roninBotInc?.msgRetryCounterCache) {
                roninBotInc.msgRetryCounterCache.clear()
            }

            try {
                await handleMessages(roninBotInc, chatUpdate, true)
            } catch (err) {
                console.error("Error in handleMessages:", err)
                // Only try to send error message if we have a valid chatId
                if (mek.key && mek.key.remoteJid) {
                    await roninBotInc.sendMessage(mek.key.remoteJid, {
                        text: '❌ An error occurred while processing your message.',
                        contextInfo: {
                            forwardingScore: 1,
                            isForwarded: true,
                            forwardedNewsletterMessageInfo: {
                                newsletterJid: '',
                                newsletterName: '𝙍𝙊𝙉𝙄𝙉 𝙈𝘿',
                                serverMessageId: -1
                            }
                        }
                    }).catch(console.error);
                }
            }
        } catch (err) {
            console.error("Error in messages.upsert:", err)
        }
    })

    // Add these event handlers for better functionality
    roninBotInc.decodeJid = (jid) => {
        if (!jid) return jid
        if (/:\d+@/gi.test(jid)) {
            let decode = jidDecode(jid) || {}
            return decode.user && decode.server && decode.user + '@' + decode.server || jid
        } else return jid
    }

    roninBotInc.ev.on('contacts.update', update => {
        for (let contact of update) {
            let id = roninBotInc.decodeJid(contact.id)
            if (store && store.contacts) store.contacts[id] = { id, name: contact.notify }
        }
    })

    roninBotInc.getName = (jid, withoutContact = false) => {
        id = roninBotInc.decodeJid(jid)
        withoutContact = roninBotInc.withoutContact || withoutContact
        let v
        if (id.endsWith("@g.us")) return new Promise(async (resolve) => {
            v = store.contacts[id] || {}
            if (!(v.name || v.subject)) v = roninBotInc.groupMetadata(id) || {}
            resolve(v.name || v.subject || PhoneNumber('+' + id.replace('@s.whatsapp.net', '')).getNumber('international'))
        })
        else v = id === '0@s.whatsapp.net' ? {
            id,
            name: 'WhatsApp'
        } : id === silaBotInc.decodeJid(roninBotInc.user.id) ?
            roninBotInc.user :
            (store.contacts[id] || {})
        return (withoutContact ? '' : v.name) || v.subject || v.verifiedName || PhoneNumber('+' + jid.replace('@s.whatsapp.net', '')).getNumber('international')
    }

    roninBotInc.public = true

    roninBotInc.serializeM = (m) => smsg(roninBotInc, m, store)

    // Handle pairing code
    if (pairingCode && !silaBotInc.authState.creds.registered) {
        if (useMobile) throw new Error('Cannot use pairing code with mobile api')

        let phoneNumber
        if (!!global.phoneNumber) {
            phoneNumber = global.phoneNumber
        } else {
            phoneNumber = await question(chalk.bgBlack(chalk.greenBright(`Please type your WhatsApp number 😍\nFormat: 923308363433 (without + or spaces) : `)))
        }

        // Clean the phone number - remove any non-digit characters
        phoneNumber = phoneNumber.replace(/[^0-9]/g, '')

        // Validate the phone number using awesome-phonenumber
        const pn = require('awesome-phonenumber');
        if (!pn('+' + phoneNumber).isValid()) {
            console.log(chalk.red('Invalid phone number. Please enter your full international number (e.g., 15551234567 for US, 447911123456 for UK, etc.) without + or spaces.'));
            process.exit(1);
        }

        setTimeout(async () => {
            try {
                let code = await silaBotInc.requestPairingCode(phoneNumber)
                code = code?.match(/.{1,4}/g)?.join("-") || code
                console.log(chalk.black(chalk.bgGreen(`Your Pairing Code : `)), chalk.black(chalk.white(code)))
                console.log(chalk.yellow(`\𝙣𝙋𝙡𝙚𝙖𝙨𝙚 𝙚𝙣𝙩𝙚𝙧 𝙩𝙝𝙞𝙨 𝙘𝙤𝙙𝙚 𝙞𝙣 𝙮𝙤𝙪𝙧 𝙒𝙝𝙖𝙩𝙨𝘼𝙥𝙥 𝙖𝙥𝙥:\n1. 𝙊𝙥𝙚𝙣 𝙒𝙝𝙖𝙩𝙨𝘼𝙥𝙥\n2. 𝙂𝙤 𝙩𝙤 𝙎𝙚𝙩𝙩𝙞𝙣𝙜𝙨 > 𝙇𝙞𝙣𝙠𝙚𝙙 𝘿𝙚𝙫𝙞𝙘𝙚𝙨\n3. 𝚃𝚊𝚙 "𝙇𝙞𝙣𝙠 𝙖 𝘿𝙚𝙫𝙞𝙘𝙚"\n4. 𝙀𝙣𝙩𝙚𝙧 𝙩𝙝𝙚 𝙘𝙤𝙙𝙚 𝙨𝙝𝙤𝙬𝙣 𝙖𝙗𝙤𝙫𝙚`))
            } catch (error) {
                console.error('Error requesting pairing code:', error)
                console.log(chalk.red('Failed to get pairing code. Please check your phone number and try again.'))
            }
        }, 3000)
    }

    // Connection handling
    silaBotInc.ev.on('connection.update', async (s) => {
        const { connection, lastDisconnect } = s
        if (connection == "open") {
            console.log(chalk.magenta(` `))
            console.log(chalk.yellow(`☘️Connected to => ` + JSON.stringify(silaBotInc.user, null, 2)))

            const botNumber = silaBotInc.user.id.split(':')[0] + '@s.whatsapp.net';
            await silaBotInc.sendMessage(botNumber, {
                text: `*╭━━━〔 🖥 𝙍𝙊𝙉𝙄  𝙈𝘿 🖥 〕━━━┈⊷*\n*┃🍁│ 🔗 𝘽𝙊𝙏 𝘾𝙊𝙉𝙉𝙀𝘾𝙏𝙀𝘿 𝙎𝙐𝘾𝘾𝙀𝙎𝙎𝙁𝙐𝙇𝙇𝙔!*\n*┃🎀│*\n*┃🎀│ 📟 𝙏𝙞𝙢𝙚: ${new Date().toLocaleString()}*\n*┃🎀│ ✅ 𝙎𝙩𝙖𝙩𝙪𝙨: 𝙊𝙣𝙡𝙞𝙣𝙚 𝙖𝙣𝙙 𝙍𝙚𝙖𝙙𝙮!*\n*┃🎀│*\n*┃🎀│ ✅ 𝙈𝙖𝙠𝙚 𝙨𝙪𝙧𝙚 𝙩𝙤 𝙟𝙤𝙞𝙣 𝙗𝙚𝙡𝙤𝙬 𝙘𝙝𝙖𝙣𝙣𝙚𝙡*\n*╰━━━━━━━━━━━━━━━┈⊷*\n\n> © 𝘿𝙀𝙑𝙀𝙇𝙊𝙋𝙀𝘿 𝘽𝙔 🖥 𝙍𝙊𝙉𝙄𝙉 𝙈𝘿`,
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '',
                        newsletterName: '𝙍𝙊𝙉𝙄𝙉 𝙈𝘿',
                        serverMessageId: -1
                    }
                }
            });

            await delay(1999)
            console.log(chalk.yellow(`\n\n                  ${chalk.bold.blue(`[ ${global.botname || '𝙍𝙊𝙉𝙄𝙉 𝙈𝘿'} ]`)}\n\n`))
            console.log(chalk.cyan(`< ================================================== >`))
            console.log(chalk.magenta(`\n${global.themeemoji || '•'} YT CHANNEL: 𝙐𝙢𝙖𝙧𝙞 𝙋𝙧𝙤𝙟𝙚𝙘𝙩𝙨`))
            console.log(chalk.magenta(`${global.themeemoji || '•'} GITHUB: RONIN-Md`))
            console.log(chalk.magenta(`${global.themeemoji || '•'} WA NUMBER: ${owner}`))
            console.log(chalk.magenta(`${global.themeemoji || '•'} CREDIT: Sir 𝙍𝙊𝙉𝙄𝙉 𝙈𝘿`))
            console.log(chalk.green(`${global.themeemoji || '•'} 🌿 𝘽𝙤𝙩 𝘾𝙤𝙣𝙣𝙚𝙘𝙩𝙚𝙙 𝙎𝙪𝙘𝙘𝙚𝙨𝙨𝙛𝙪𝙡𝙡𝙮! 🌿`))
        }
        if (connection === 'close') {
            const statusCode = lastDisconnect?.error?.output?.statusCode
            if (statusCode === DisconnectReason.loggedOut || statusCode === 401) {
                try {
                    rmSync('./session', { recursive: true, force: true })
                } catch { }
                console.log(chalk.red('Session logged out. Please re-authenticate.'))
                startroninBotInc()
            } else {
                startroninBotInc()
            }
        }
    })

    roninBotInc.ev.on('creds.update', saveCreds)

    roninBotInc.ev.on('group-participants.update', async (update) => {
        await handleGroupParticipantUpdate(roninBotInc, update);
    });

    roninBotInc.ev.on('messages.upsert', async (m) => {
        if (m.messages[0].key && m.messages[0].key.remoteJid === 'status@broadcast') {
            await handleStatus(roninBotInc, m);
        }
    });

    roninBotInc.ev.on('status.update', async (status) => {
        await handleStatus(roninBotInc, status);
    });

    roninBotInc.ev.on('messages.reaction', async (status) => {
        await handleStatus(roninBotInc, status);
    });

    return roninBotInc
}


// Start the bot with error handling
startroninBotInc().catch(error => {
    console.error('Fatal error:', error)
    process.exit(1)
})
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err)
})

process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err)
})

let file = require.resolve(__filename)
fs.watchFile(file, () => {
    fs.unwatchFile(file)
    console.log(chalk.redBright(`Update ${__filename}`))
    delete require.cache[file]
    require(file)
})
