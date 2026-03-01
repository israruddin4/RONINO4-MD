const yts = require('yt-search');
const axios = require('axios');

async function playCommand(sock, chatId, message) {
    try {
        // Step 1: Send reaction first
        await sock.sendMessage(chatId, {
            react: {
                text: '🎵', // Emoji ya muziki inayofaa kwa download ya song
                key: message.key
            }
        });

        const text = message.message?.conversation || message.message?.extendedTextMessage?.text;
        const searchQuery = text.split(' ').slice(1).join(' ').trim();
        
        if (!searchQuery) {
            return await sock.sendMessage(chatId, { 
                text: "*╭━━━〔 🎀 𝙋𝙇𝘼𝙔 𝘾𝙊𝙈𝙈𝘼𝙉𝘿 🎀 〕━━━┈⊷*\n" +
                      "*┃🎀│ 𝙎𝙏𝘼𝙏𝙐𝙎 :❯ 𝙴𝚁𝚁𝙾𝚁*\n" +
                      "*┃🎀│ 𝙈𝙀𝙎𝙎𝘼𝙂𝙀 :❯ 𝙋𝙇𝙀𝘼𝙎𝙀 𝙀𝙉𝙏𝙀𝙍 𝙏𝙃𝙀 𝙎𝙊𝙉𝙂 𝙉𝘼𝙈𝙀*\n" +
                      "*╰━━━━━━━━━━━━━━━┈⊷*"
            });
        }

        // Search for the song
        const { videos } = await yts(searchQuery);
        if (!videos || videos.length === 0) {
            return await sock.sendMessage(chatId, { 
                text: "*╭━━━ 🎀 𝙿𝙻𝙰𝚈 𝙲𝙾𝙼𝙼𝙰𝙽𝙳 🎀 ━━━~√*\n" +
                      "*┃🎀│ 𝙎𝙏𝘼𝙏𝙐𝙎 :❯ 𝙴𝚁𝚁𝙾𝚁*\n" +
                      "*┃🎀│ 𝙈𝙀𝙎𝙎𝘼𝙂𝙀 :❯ 𝙉𝙊𝙏𝙃𝙄𝙉𝙂 𝙁𝙊𝙐𝙉𝘿𝙀𝘿*\n" +
                      "*╰━━━━━━━━━━━━━━━~√*"
            });
        }

        // Send loading message with design
        await sock.sendMessage(chatId, {
            text: "*╭━━━ 🎀 𝙋𝙇𝘼𝙔 𝘾𝙊𝙈𝙈𝘼𝙉𝘿 🎀 ━━━~√*\n" +
                  "*┃🎀│ 𝙎𝙏𝘼𝙏𝙐𝙎 :❯ 𝙳𝙾𝚆𝙽𝙻𝙾𝙰𝙳𝙸𝙽𝙶*\n" +
                  "*┃🎀│ 𝙈𝙀𝙎𝙎𝘼𝙂𝙀 :❯ 𝙋𝙇𝙀𝘼𝙎𝙀 𝙒𝘼𝙄𝙏 𝘼 𝙇𝙄𝙏𝙏𝙇𝙀🤏...*\n" +
                  "*╰━━━━━━━━━━━━━━━~√*"
        });

        // Get the first video result
        const video = videos[0];
        const urlYt = video.url;

        // Fetch audio data from API
        const response = await axios.get(`https://apis-keith.vercel.app/download/dlmp3?url=${urlYt}`);
        const data = response.data;

        if (!data || !data.status || !data.result || !data.result.downloadUrl) {
            return await sock.sendMessage(chatId, { 
                text: "*╭━━━ 🎀 𝙋𝙇𝘼𝙔 𝘾𝙊𝙈𝙈𝘼𝙉𝘿 🎀 ━━━~√*\n" +
                      "*┃🐢│ 𝙎𝙏𝘼𝙏𝙐𝙎 :❯ 𝙴𝚁𝚁𝙾𝚁*\n" +
                      "*┃🐢│ 𝙈𝙀𝙎𝙎𝘼𝙂𝙀 :❯ 𝙏𝙃𝙀𝙍𝙀 𝙒𝘼𝙎 𝘼𝙉 𝙀𝙍𝙍𝙊𝙍*\n" +
                      "*╰━━━━━━━━━━━━━━━~√*"
            });
        }

        const audioUrl = data.result.downloadUrl;
        const title = data.result.title;

        // Send the audio with caption design
        await sock.sendMessage(chatId, {
            audio: { url: audioUrl },
            mimetype: "audio/mpeg",
            fileName: `${title}.mp3`,
            caption: `*╭━━━ 🎀 𝙋𝙇𝘼𝙔 𝘾𝙊𝙈𝙈𝘼𝙉𝘿 🎀 ━━━~√*\n` +
                     `*┃🎀│ 𝙎𝙏𝘼𝙏𝙐𝙎 :❯ 𝚂𝚄𝙲𝙲𝙴𝚂𝚂*\n` +
                     `*┃🎀│ 𝙏𝙄𝙏𝙇𝙀  :❯ ${title}*\n` +
                     `*┃🎀│ 𝙌𝙐𝘼𝙇𝙄𝙏𝙔 :❯ 𝙼𝙿𝟹*\n` +
                     `*╰━━━━━━━━━━━━━━━~√*\n\n` +
                     `*𝘿𝙊𝙒𝙉𝙇𝙊𝘼𝘿𝙀𝘿 𝙎𝙐𝘾𝘾𝙀𝙎𝙎𝙁𝙐𝙇! 🎀*`
        }, { quoted: message });

    } catch (error) {
        console.error('Error in song2 command:', error);
        await sock.sendMessage(chatId, { 
            text: "*╭━━━ 🎀 𝙋𝙇𝘼𝙔 𝘾𝙊𝙈𝙈𝘼𝙉𝘿 🎀 ━━━~√*\n" +
                  "*┃🎀│ 𝙎𝙏𝘼𝙏𝙐𝙎 :❯ 𝙴𝚁𝚁𝙾𝚁*\n" +
                  "*┃🎀│ 𝙈𝙀𝙎𝙎𝘼𝙂𝙀 :❯ 𝘿𝙊𝙒𝙉𝙇𝙊𝘼𝘿 𝙁𝘼𝙄𝙇𝙀𝘿👎*\n" +
                  "*╰━━━━━━━━━━━━━━━~√*"
        });
    }
}

module.exports = playCommand;