const moment = require('moment-timezone');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

async function githubCommand(sock, chatId, message) {
  try {
    // Step 1: Send reaction first
    await sock.sendMessage(chatId, {
      react: {
        text: '🐙', // Emoji ya GitHub octopus
        key: message.key
      }
    });

    const res = await fetch('https://api.github.com/repos/israruddim4/RONIN04-MD');
    if (!res.ok) throw new Error('Error fetching repository data');
    const json = await res.json();

    let txt = `┏━ 𝙍𝙊𝙉𝙄𝙉-𝐌𝐃 𝙶𝙸𝚃𝙷𝚄𝙱 ━━━━━━━━━
┃ 📦 𝙍𝙀𝙋𝙊𝙎𝙄𝙏𝙊𝙍𝙔: ${json.name}
┃ 👀 𝙒𝘼𝙏𝘾𝙃𝙀𝙍𝙎: ${json.watchers_count}
┃ 💾 𝙎𝙄𝙕𝙀: ${(json.size / 1024).toFixed(2)} 𝙈𝘽
┃ 📅 𝙐𝙋𝘿𝘼𝙏𝙀: ${moment(json.updated_at).format('DD/MM/YY - HH:mm:ss')}
┃ 🔀 𝙁𝙊𝙍𝙆𝙎: ${json.forks_count}
┃ ⭐ 𝙎𝙏𝘼𝙍𝙎: ${json.stargazers_count}
┃ 🔗 𝙇𝙄𝙉𝙆 𝙐𝙍𝙇𝙻: ${json.html_url}
┗━━━━━━━━━━━━━━━━━━━━

🐙 𝙂𝙄𝙏𝙃𝙐𝘽 𝙍𝙀𝙋𝙊𝙎𝙄𝙏𝙊𝙍𝙔 𝙄𝙉𝙁𝙊𝙍𝙈𝘼𝙏𝙄𝙊𝙉`;

    // Use the local asset image
    const imgPath = path.join(__dirname, '../assets/bot_image.jpg');
    const imgBuffer = fs.readFileSync(imgPath);

    await sock.sendMessage(chatId, { 
      image: imgBuffer, 
      caption: txt 
    }, { quoted: message });

  } catch (error) {
    console.error('Error in github command:', error);
    await sock.sendMessage(chatId, { 
      text: '*╭━━━ 🎀 𝙂𝙄𝙏𝙃𝙐𝘽 𝘾𝙊𝙈𝙈𝘼𝙉𝘿 🎀━━━┈⊷*\n' +
            '*┃🎀│ 𝙎𝙏𝘼𝙏𝙐𝙎 :❯ 𝙴𝚁𝚁𝙾𝚁*\n' +
            '*┃🎀│ 𝙈𝙀𝙎𝙎𝘼𝙂𝙀 :❯ 𝙁𝘼𝙄𝙇𝙀𝘿 𝙏𝙊 𝙁𝙀𝙏𝘾𝙃*\n' +
            '*╰━━━━━━━━━━━━━━━┈⊷*'
    }, { quoted: message });
  }
}

module.exports = githubCommand;