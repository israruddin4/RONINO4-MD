const isAdmin = require('../lib/isAdmin');

async function tagAllCommand(sock, chatId, senderId, message) {
    try {
        // Step 1: Send reaction first
        await sock.sendMessage(chatId, {
            react: {
                text: '📢', // Emoji ya kutangaza/mikophone inayofaa kwa tagall
                key: message.key
            }
        });

        const { isSenderAdmin, isBotAdmin } = await isAdmin(sock, chatId, senderId);
        

        if (!isBotAdmin) {
            await sock.sendMessage(chatId, { 
                text: '*╭━━━〔 🎀 𝙏𝘼𝙂𝘼𝙇𝙇 𝘾𝙊𝙈𝙈𝘼𝙉𝘿 🎀 〕━━━~√*\n' +
                      '*┃🎀│ `𝙎𝙏𝘼𝙏𝙐𝙎` :❯ 𝙴𝚁𝚁𝙾𝚁*\n' +
                      `'*┃🎀│ `𝙈𝘼𝙎𝙎𝘼𝙂𝙀 :❯ 𝙈𝘼𝙆𝙀 𝘽𝙊𝙏 𝘼𝘿𝙈𝙄𝙉 𝙁𝙄𝙍𝙎𝙏🥇`*\n' +
                      '*╰━━━━━━━━━━━━━━━~√*'
            }, { quoted: message });
            return;
        }

        if (!isSenderAdmin) {
            await sock.sendMessage(chatId, { 
                text: '*╭━━━〔 🎀 𝙏𝘼𝙂𝘼𝙇𝙇 𝘾𝙈𝙈𝙊𝙉𝘿 🎀 〕━━━~√*\n' +
                      '*┃🎀│ 𝙎𝙏𝘼𝙏𝙐𝙎 :❯ 𝙴𝚁𝚁𝙾𝚁*\n' +
                      '*┃🎀│ 𝙈𝙀𝙎𝙎𝘼𝙂𝙀 :❯ 𝙊𝙉𝙇𝙔 𝘼𝘿𝙈𝙄𝙉 𝘾𝘼𝙉 𝙐𝙎𝙀 𝙏𝙃𝙄𝙎 𝘾𝙈𝘿*\n' +
                      '*╰━━━━━━━━━━━━━━━~√*'
            }, { quoted: message });
            return;
        }

        // Get group metadata
        const groupMetadata = await sock.groupMetadata(chatId);
        const participants = groupMetadata.participants;

        if (!participants || participants.length === 0) {
            await sock.sendMessage(chatId, { 
                text: '*╭━━━〔 🎀 𝙏𝘼𝙂𝘼𝙇𝙇 𝘾𝙊𝙈𝙈𝘼𝙉𝘿  🎀 〕━━━~√*\n' +
                      '*┃🐢│ 𝙎𝙏𝘼𝙏𝙐𝙎 :❯ 𝙴𝚁𝚁𝙾𝚁*\n' +
                      '*┃🐢│ 𝙈𝙀𝙎𝙎𝘼𝙂𝙀 :❯ 𝙉𝙊 𝙋𝘼𝙍𝙏𝙄𝘾𝙄𝙋𝘼𝙉𝙏𝙎 𝙁𝙊𝙐𝙉𝘿*\n' +
                      '*╰━━━━━━━━━━━━━━━~√*'
            });
            return;
        }

        // Create message with each member on a new line inside box design
        let messageText = '*╭━━━〔 🎀 𝙏𝘼𝙂𝘼𝙇𝙇 𝘾𝙊𝙈𝙈𝘼𝙉𝘿  🎀 〕━━━~√*\n';
        messageText += '*┃🎀│ 𝙎𝙏𝘼𝙏𝙐𝙎 :❯ 𝚂𝚄𝙲𝙲𝙴𝚂𝚂*\n';
        messageText += '*┃🎀│ 𝙼𝙴𝙼𝙱𝙴𝚁𝚂 :❯ ' + participants.length + '*\n';
        messageText += '*┃🎀╰──────────────────*\n\n';
        messageText += '🔊 *𝙷𝙴𝙻𝙻𝙾 𝙴𝚅𝙴𝚁𝚈𝙾𝙽𝙴!* 🔊\n\n';
        
        participants.forEach((participant, index) => {
            const number = participant.id.split('@')[0];
            messageText += `👤 @${number}\n`;
        });

        messageText += '\n*╰━━━━━━━━━━━━━━━~√*';

        // Send message with mentions
        await sock.sendMessage(chatId, {
            text: messageText,
            mentions: participants.map(p => p.id)
        });

    } catch (error) {
        console.error('Error in tagall command:', error);
        await sock.sendMessage(chatId, { 
            text: '*╭━━━〔 🎀 𝙏𝘼𝙂𝘼𝙇𝙇 𝘾𝙊𝙈𝙈𝘼𝙉𝘿  🎀 〕━━━┈⊷*\n' +
                  '*┃🎀│ 𝙎𝙏𝘼𝙏𝙐𝙎 :❯ 𝙴𝚁𝚁𝙾𝚁*\n' +
                  '*┃🎀│ 𝙈𝙀𝙎𝙎𝘼𝙂𝙀 :❯ 𝙁𝘼𝙄𝙇𝙀𝘿 𝙏𝙊 𝙏𝘼𝙂 𝙈𝙀𝙈𝘽𝙀𝙍𝙎*\n' +
                  '*╰━━━━━━━━━━━━━━━┈⊷*'
        });
    }
}

module.exports = tagAllCommand;