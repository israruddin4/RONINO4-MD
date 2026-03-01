const settings = require("../settings");

async function aliveCommand(sock, chatId, message) {
    try {
        // Step 1: Send reaction first
        await sock.sendMessage(chatId, {
            react: {
                text: '♻️', // Emoji ya kucheka
                key: message.key
            }
        });

        const aliveMessage = `
*╭━━━〔 🎀 𝙍𝙤𝙣𝙞𝙣 𝙈𝘿 🎀 〕━━━┈⊷*
*🎀╭──────────────────*
*🎀 𝙎𝙏𝘼𝙏𝙐𝙎 :❯ 𝙾𝙽𝙻𝙸𝙽𝙴*
*🎀 𝙈𝙊𝘿𝙀 :❯ 𝙿𝚄𝙱𝙻𝙸𝙲*
*🎀 𝙑𝙀𝙍𝙎𝙄𝙊𝙉 :❯ ${settings.version || '1.𝟶.𝟶'}*
*┃🎀╰──────────────────*
*╰━━━━━━━━━━━━━━━┈⊷*

*𝘽𝙊𝙏 𝙄𝙎 𝙎𝙐𝘾𝘾𝙀𝙎𝙎𝙁𝙐𝙇𝙇𝙔 𝘼𝘾𝙏𝙄𝙑𝘼𝙏𝙀𝘿! 🎀*

*━━〔 🎀 𝙁𝙀𝘼𝙏𝙐𝙍𝙀𝙎 🎀 〕━━┈⊷*
*🎀 • 𝙂𝙍𝙊𝙐𝙋 𝙈𝘼𝙉𝘼𝙂𝙀𝙈𝙀𝙉𝙏*
*🎀 • 𝘼𝙉𝙏𝙄 𝙇𝙄𝙉𝙆 𝙋𝙍𝙊𝙏𝙀𝘾𝙏𝙄𝙊𝙉*
*🎀 • 𝙁𝙐𝙉 𝘾𝙈𝘿𝙎*
*🎀 • 𝘼𝙄 𝘾𝙈𝘿𝙎*
*🎀 • 𝘿𝙊𝙒𝙉𝙇𝙊𝘼𝘿 𝘾𝙈𝘿𝙎*
*🎀 • 𝘼𝙉𝘿 𝙈𝙊𝙍𝙀 𝙁𝙀𝘼𝙏𝙐𝙍𝙀𝙎*
*━━━━━━━━━━━━━━━┈⊷*

*𝚃𝚈𝙿𝙴 .𝙼𝙴𝙽𝚄 𝙵𝙾𝚁 𝙵𝚄𝙻𝙻 𝙲𝙾𝙼𝙼𝙰𝙽𝙳 𝙻𝙸𝚂𝚃*`;

        await sock.sendMessage(chatId, {
            text: aliveMessage,
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: 'tter',
                    newsletterName: '𝙧𝙤𝙣𝙞𝙣 TECH',
                    serverMessageId: -1
                }
            }
        }, { quoted: message });
    } catch (error) {
        console.error('Error in alive command:', error);
        await sock.sendMessage(chatId, { 
            text: '*𝙱𝙾𝚃 𝙸𝚂 𝙰𝙻𝙸𝚅𝙴 𝙰𝙽𝙳 𝚁𝚄𝙽𝙽𝙸𝙽𝙶! 🎀*' 
        }, { quoted: message });
    }
}

module.exports = aliveCommand;