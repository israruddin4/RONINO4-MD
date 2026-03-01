const settings = require('../settings');
const axios = require('axios');

async function ownerCommand(sock, chatId, message) {
    try {
        // Step 1: Send reaction first
        await sock.sendMessage(chatId, {
            react: {
                text: '🎀', // Emoji ya taji
                key: message.key
            }
        });

        const imageUrl = '';
        
        // Download the image
        const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        const imageBuffer = Buffer.from(response.data, 'binary');

        // Create vcard
        const vcard = `
BEGIN:VCARD
VERSION:3.0
FN:${settings.botOwner}
TEL;waid=${settings.ownerNumber}:${settings.ownerNumber}
END:VCARD
`.trim();

        // Send image first
        await sock.sendMessage(chatId, {
            image: imageBuffer,
            caption: `*╭━━━ 🎀 𝙊𝙒𝙉𝙀𝙍 𝙄𝙉𝙁𝙊 🎀 ━━━~√*\n` +
                   `*┃🎀│ 𝙉𝘼𝙈𝙀 :❯ ${settings.botOwner}*\n` +
                   `*┃🎀│ 𝙉𝙐𝙈𝘽𝙀𝙍 :❯ ${settings.ownerNumber}*\n` +
                   `*┃🎀│ 𝘽𝙊𝙏 :❯ 𝙍𝙊𝙉𝙄𝙉-𝙈𝘿*\n` +
                   `*╰━━━━━━━━━━━━━━━~√*\n\n` +
                   `*𝘾𝙊𝙉𝙏𝙀𝘾𝙏 𝙒𝙄𝙏𝙃 𝙊𝙒𝙉𝙀𝙍 𝙁𝙊𝙍 𝘼𝙉𝙔 𝙃𝙀𝙇𝙋! 🎀*`
        }, { quoted: message });

        // Send vcard contact
        await sock.sendMessage(chatId, {
            contacts: { 
                displayName: settings.botOwner, 
                contacts: [{ vcard }] 
            }
        });

    } catch (error) {
        console.error('Error in owner command:', error);
        
        // Fallback: Send only vcard if image fails
        const vcard = `
BEGIN:VCARD
VERSION:3.0
FN:${settings.botOwner}
TEL;waid=${settings.ownerNumber}:${settings.ownerNumber}
END:VCARD
`.trim();

        await sock.sendMessage(chatId, {
            contacts: { 
                displayName: settings.botOwner, 
                contacts: [{ vcard }] 
            }
        }, { quoted: message });
    }
}

module.exports = ownerCommand;