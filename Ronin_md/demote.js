const isAdmin = require('../lib/isAdmin');

// Helper function to safely extract JID string
const extractJidString = (jid) => {
    if (!jid) return '';
    if (typeof jid === 'string') return jid;
    if (typeof jid === 'object' && jid.id) return jid.id;
    if (typeof jid === 'object' && jid.toString) return jid.toString();
    return '';
};

async function demoteCommand(sock, chatId, mentionedJids, message) {
    try {
        // First check if it's a group
        if (!chatId.endsWith('@g.us')) {
            await sock.sendMessage(chatId, { 
                text: 'This command can only be used in groups!'
            });
            return;
        }

        // Check admin status first, before any other operations
        try {
            const adminStatus = await isAdmin(sock, chatId, message.key.participant || message.key.remoteJid);
            
            if (!adminStatus.isBotAdmin) {
                await sock.sendMessage(chatId, { 
                    text: '❌ Error: Please make the bot an admin first to use this command.'
                });
                return;
            }

            if (!adminStatus.isSenderAdmin) {
                await sock.sendMessage(chatId, { 
                    text: '❌ Error: Only group admins can use the demote command.'
                });
                return;
            }
        } catch (adminError) {
            console.error('Error checking admin status:', adminError);
            await sock.sendMessage(chatId, { 
                text: '❌ Error: Please make sure the bot is an admin of this group.'
            });
            return;
        }

        let userToDemote = [];
        
        // Check for mentioned users
        if (mentionedJids && mentionedJids.length > 0) {
            userToDemote = mentionedJids;
        }
        // Check for replied message
        else if (message.message?.extendedTextMessage?.contextInfo?.participant) {
            userToDemote = [message.message.extendedTextMessage.contextInfo.participant];
        }
        
        // If no user found through either method
        if (userToDemote.length === 0) {
            await sock.sendMessage(chatId, { 
                text: '❌ Error: Please mention the user or reply to their message to demote!'
            });
            return;
        }

        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Extract JID strings from all demotion targets
        const userJids = userToDemote
            .map(u => extractJidString(u))
            .filter(jid => jid && jid.includes('@'));

        if (userJids.length === 0) {
            await sock.sendMessage(chatId, { 
                text: '❌ Invalid user format. Please mention a valid user.'
            });
            return;
        }

        await sock.groupParticipantsUpdate(chatId, userJids, "demote");
        
        // Get usernames for each demoted user
        const usernames = userJids.map(jid => {
            const username = jid.split('@')[0];
            return `@${username || 'unknown'}`;
        });

        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));

        const demotionMessage = `*┏━ 𝗚𝗥𝗢𝗨𝗣 𝗗𝗘𝗠𝗢𝗧𝗜𝗢𝗡 ━━━━━━━━━━
┃
┃ 👤 𝗨𝘀𝗲𝗿${userJids.length > 1 ? '𝘀' : ''} 𝗗𝗲𝗺𝗼𝘁𝗲𝗱:
${usernames.map(name => `┃ ⤷ ${name}`).join('\\n')}
┃
┃ 👑 𝗗𝗲𝗺𝗼𝘁𝗲𝗱 𝗕𝘆: @${message.key.participant ? message.key.participant.split('@')[0] : message.key.remoteJid.split('@')[0]}
┃ 📅 𝗗𝗮𝘁𝗲: ${new Date().toLocaleString()}
┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
        
        await sock.sendMessage(chatId, { 
            text: demotionMessage,
            mentions: userJids
        });
    } catch (error) {
        console.error('Error in demote command:', error);
        if (error.data === 429) {
            await new Promise(resolve => setTimeout(resolve, 2000));
            try {
                await sock.sendMessage(chatId, { 
                    text: '❌ Rate limit reached. Please try again in a few seconds.'
                });
            } catch (retryError) {
                console.error('Error sending retry message:', retryError);
            }
        } else {
            try {
                await sock.sendMessage(chatId, { 
                    text: '❌ Failed to demote user(s). Make sure the bot is admin and has sufficient permissions.'
                });
            } catch (sendError) {
                console.error('Error sending error message:', sendError);
            }
        }
    }
}

// Function to handle automatic demotion detection
async function handleDemotionEvent(sock, groupId, participants, author) {
    try {
        if (!groupId || !participants) {
            console.log('Invalid groupId or participants:', { groupId, participants });
            return;
        }

        if (!Array.isArray(participants)) {
            console.error('Invalid participants format:', participants);
            return;
        }

        // Convert all participants to JID strings
        const participantJids = participants.map(p => extractJidString(p)).filter(jid => jid && jid.includes('@'));
        
        if (participantJids.length === 0) {
            console.error('No valid participants found');
            return;
        }

        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Get usernames for demoted participants
        const demotedUsernames = participantJids.map(jidString => {
            const username = jidString.split('@')[0];
            return `@${username || 'unknown'}`;
        });

        let demotedBy;
        let mentionList = participantJids;

        if (author) {
            const authorJid = extractJidString(author);
            if (authorJid && authorJid.includes('@')) {
                demotedBy = `@${authorJid.split('@')[0]}`;
                mentionList = [...participantJids, authorJid];
            } else {
                demotedBy = 'System';
            }
        } else {
            demotedBy = 'System';
        }

        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));

        const demotionMessage = `*┏━❑ 𝗚𝗥𝗢𝗨𝗣 𝗗𝗘𝗠𝗢𝗧𝗜𝗢𝗡 ━━━━━━━━━━
┃ 👤 𝗗𝗲𝗺𝗼𝘁𝗲𝗱 𝗨𝘀𝗲𝗿${participantJids.length > 1 ? '𝘀' : ''}:
${demotedUsernames.map(name => `┃ ⤷ ${name}`).join('\\n')}
┃
┃ 👑 𝗗𝗲𝗺𝗼𝘁𝗲𝗱 𝗕𝘆: ${demotedBy}
┃ 📅 𝗗𝗮𝘁𝗲: ${new Date().toLocaleString()}
┗━━━━━━━━━━━━━━━━━━━━━━━━`;
        
        await sock.sendMessage(groupId, {
            text: demotionMessage,
            mentions: mentionList
        });
    } catch (error) {
        console.error('Error handling demotion event:', error);
        if (error.data === 429) {
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }
}

module.exports = { demoteCommand, handleDemotionEvent };
