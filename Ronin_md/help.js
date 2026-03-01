const settings = require('../settings');
const os = require('os');

function formatUptime(seconds) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${days}d ${hours}h ${minutes}m ${secs}s`;
}
const fs = require('fs');
const path = require('path');

async function helpCommand(sock, chatId, message, pushname, config) {
    // Hakikisha config ipo, iwapo haipo tumia default
    const prefix = config && config.PREFIX ? config.PREFIX : '.';
    const mode = settings.mode || '𝙿𝚄𝙱𝙻𝙸𝙲';
    const version = settings.version || '1.𝟶.𝟶';
    const now = new Date();
    const date = now.toLocaleDateString('en-GB');
    const time = now.toLocaleTimeString('en-US', { hour12: true });
    const uptime = formatUptime(process.uptime());
    const totalMemGB = (os.totalmem() / (1024 ** 3)).toFixed(1);
    const usedMemGB = ((os.totalmem() - os.freemem()) / (1024 ** 3)).toFixed(1);
    const ram = `${usedMemGB}GB/${totalMemGB}GB`;
    const plugins = fs.readdirSync(path.join(__dirname, '../silatech')).filter(file => file.endsWith('.js')).length;
    const userNumber = message.key.participant ? message.key.participant.split('@')[0] : chatId.split('@')[0];
    const modeDisplay = 'PUBLIC';
    const helpMessage = `
┏━━━━━ 𝙍𝙊𝙉𝙄𝙉-𝙈𝘿 𝐌𝐄𝐍𝐔 ━━━━━━
┃ 🚀 `𝙈𝙊𝘿𝙀`: ${modeDisplay}
┃ 💡 `𝙋𝙍𝙀𝙁𝙄𝙓`: ${prefix}
┃ 👤 `𝙐𝙎𝙀𝙍`: ${userNumber}
┃ 📦 `𝙋𝙇𝙐𝙂𝙄𝙉`: ${plugins}
┃ ⏰ `𝙐𝙋𝙏𝙄𝙈𝙀`: ${uptime}
┃ 📅 `𝘿𝘼𝙏𝙀`: ${date}
┃ ⏱️ `𝙏𝙄𝙈𝙀`: ${time}
┃ 💾 `𝙍𝘼𝙈`: ${ram}
┗━━━━━━━━━━━━━━━━━━━━

 `𝘼𝙑𝘼𝙄𝙇𝘼𝘽𝙇𝙀 𝘾𝙊𝙈𝙈𝘼𝙉𝘿𝙎`

┏━━━━━ 𝐆𝐄𝐍𝐄𝐑𝐀𝐋 ━━━━━━━━━
┃ 🎀 .help / .menu
┃ 🎀 .ping
┃ 🎀 .alive
┃ 🎀 .owner
┃ 🎀 .joke
┃ 🎀 .quote
┃ 🎀 .fact
┃ 🎀 .lyrics <song>
┃ 🎀 .8ball <question>
┃ 🎀 .groupinfo
┃ 🎀 .staff / .admins
┃ 🎀 .jid
┗━━━━━━━━━━━━━━━━━━━━

┏━━━━━ 𝐀𝐃𝐌𝐈𝐍 ━━━━━━━━━
┃ 🎀 .ban @user
┃ 🎀 .promote @user
┃ 🎀 .demote @user
┃ 🎀 .mute <minutes>
┃ 🎀 .unmute
┃ 🎀 .delete / .del
┃ 🎀 .kick @user
┃ 🎀 .warnings @user
┃ 🎀 .antilink
┃ 🎀 .clear
┃ 🎀 .tag <message>
┃ 🎀 .tagall
┃ 🎀 .tagnotadmin
┃ 🎀 .resetlink
┗━━━━━━━━━━━━━━━━━━━

┏━━━━━ 𝐎𝐖𝐍𝐄𝐑 ━━━━━━━━━
┃ 🎀 .mode <public/private>
┃ 🎀 .clearsession
┃ 🎀 .antidelete
┃ 🎀 .update
┃ 🎀 .settings
┃ 🎀 .setpp <image>
┃ 🎀 .autoreact <on/off>
┃ 🎀 .autostatus <on/off>
┃ 🎀 .autotyping <on/off>
┃ 🎀 .antical <on/off>
┗━━━━━━━━━━━━━━━━━━━━

┏━━━━━ 𝐌𝐄𝐃𝐈𝐀 ━━━━━━━━━
┃ 🎀 .blur <image>
┃ 🎀 .sticker <image>
┃ 🎀 .removebg
┃ 🎀 .remini
┃ 🎀 .meme
┃ 🎀 .ig <instagram link>
┃ 🎀 .igs <instagram link>
┗━━━━━━━━━━━━━━━━━━━━

┏━━━━━ 𝐀𝐈 ━━━━━━━━━
┃ 🎀 .gpt <question>
┃ 🎀 .gemini <question>
┃ 🎀 .imagine <prompt>
┃ 🎀 .flux <prompt>
┃ 🎀 .sora <prompt>
┗━━━━━━━━━━━━━━━━━━━━

┏━━━━━ 𝐃𝐎𝐖𝐍𝐋𝐎𝐀𝐃𝐄𝐑 ━━━━━━
┃ 🎀 .play <song>
┃ 🎀 .song <song>
┃ 🎀 .spotify <query>
┃ 🎀 .instagram <link>
┃ 🎀 .facebook <link>
┃ 🎀 .tiktok <link>
┃ 🎀 .video <song>
┃ 🎀 .ytmp4 <link>
┗━━━━━━━━━━━━━━━━━━━━

┏━━━━━ 𝐓𝐄𝐗𝐓 𝐌𝐀𝐊𝐄𝐑 ━━━━━━━
┃ 🎀 .metallic <text>
┃ 🎀 .ice <text>
┃ 🎀 .snow <text>
┃ 🎀 .matrix <text>
┃ 🎀 .light <text>
┃ 🎀 .neon <text>
┃ 🎀 .devil <text>
┃ 🎀 .glitch <text>
┃ 🎀 .fire <text>
┗━━━━━━━━━━━━━━━━━━━━

┏━━━━━ 𝐌𝐈𝐒𝐂 ━━━━━━━━━
┃ 🎀 .heart
┃ 🎀 .circle
┃ 🎀 .lgbt
┃ 🎀 .namecard
┃ 🎀 .tweet
┗━━━━━━━━━━━━━━━━━━━━

┏━━━━━𝐓𝐎𝐎𝐋𝐒 ━━━━━━━━━
┃ 🎀 .tts <text>
┃ 🎀 .translate <text> <lang>
┃ 🎀 .ss <link>
┃ 🎀 .weather <city>
┃ 🎀 .news
┃ 🎀 .attp <text>`
┗━━━━━━━━━━━━━━━━━━━━

     ┏━━━━━━━━━━━━━━┓
        𝙍𝙊𝙉𝙄𝙉-𝐌𝐃 𝐁𝐎𝐓
┗━━━━━━━━━━━━━━━━━━━━┛`;

    try {
        const imagePath = path.join(__dirname, '../assets/bot_image.jpg');
        
        if (fs.existsSync(imagePath)) {
            const imageBuffer = fs.readFileSync(imagePath);
            
            await sock.sendMessage(chatId, {
                image: imageBuffer,
                caption: helpMessage,
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '',
                        newsletterName: '',
                        serverMessageId: -1
                    }
                }
            },{ quoted: message });
        } else {
            console.error('Bot image not found at:', imagePath);
            await sock.sendMessage(chatId, { 
                text: helpMessage,
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '',
                        newsletterName: '',
                        serverMessageId: -1
                    } 
                }
            });
        }
    } catch (error) {
        console.error('Error in help command:', error);
        await sock.sendMessage(chatId, { text: helpMessage });
    }
}

module.exports = helpCommand;
