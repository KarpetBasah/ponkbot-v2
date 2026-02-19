// events/messageCreate.js
const { Events, ChannelType, EmbedBuilder } = require('discord.js');
const pinkieAI = require('../ai-helper');

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        try {
            // Cek apakah pesan dari DM atau server
            const isDirectMessage = message.channel.type === ChannelType.DM;
            const channelInfo = isDirectMessage ? 'DM' : `#${message.channel.name}`;
            
            // Log setiap pesan yang diterima bot
            console.log(`[DEBUG] Pesan diterima dari ${message.author.tag} di ${channelInfo}: "${message.content}"`);
            console.log(`[DEBUG] Channel type: ${message.channel.type}, Guild: ${message.guild ? message.guild.name : 'null'}`);
            console.log(`[DEBUG] Is DM? ${isDirectMessage}`);

            // Filter pesan dari bot itu sendiri
            if (message.author.bot) {
                console.log(`[DEBUG] Pesan diabaikan: dari bot ${message.author.tag}`);
                return;
            }

            // Handle DM khusus dengan AI
            if (isDirectMessage) {
                console.log(`[DEBUG] ✅ DM terdeteksi dari ${message.author.tag}! Processing with AI...`);
                
                try {
                    let response;
                    
                    // Try to use AI for DM responses
                    if (pinkieAI.isAvailable()) {
                        console.log('[DEBUG] 🤖 Using AI for DM response...');
                        
                        const context = {
                            user: message.author,
                            guild: null,
                            channel: message.channel,  // Added for typing indicator
                            channelType: 'DM',
                            mentionableUsers: [],  // No mentions in DM
                            // Remove isFirstTime - will be determined by memory system
                        };
                        
                        const aiResult = await pinkieAI.generateResponse(message.content, context);
                        
                        if (aiResult.success) {
                            response = aiResult.response;
                        } else {
                            // Use fallback from AI helper
                            response = aiResult.response;
                        }
                    } else {
                        console.log('[DEBUG] 🎪 AI not available, using random fallback...');
                        
                        // Fallback responses when AI is not available
                        const dmResponses = [
                            `OMG OMG OMG! ${message.author.username}! 🎉🎈 *bounces excitedly* You sent me a private message! This is like having our own super-duper-special party! WHEEEEE!`,
                            `GASP! ${message.author.username}! 💖🧁 *throws confetti everywhere* A secret friendship message just for me?! This is even better than finding a new cupcake recipe!`,
                            `OH BOY OH BOY! ${message.author.username}! 🎪🎭 *spins around with joy* Private chats are the BEST! It's like we're having our own little friendship carnival!`,
                            `SURPRISE! ${message.author.username}! 🎂🎵 *giggles uncontrollably* You just made my day 120% more FUN! Let's throw a text party together!`,
                            `WOW WOW WOW! ${message.author.username}! 🌈🎈 *hops around* This is totally awesome-tastic! A DM means we're like super-special-best-friends now!`,
                            `PINKIE PIE ALERT! ${message.author.username}! 🍰🎉 *does a little dance* Somepony wants to chat with me personally! This calls for a celebration!`
                        ];
                        
                        response = dmResponses[Math.floor(Math.random() * dmResponses.length)];
                    }
                    
                    // Add tip about slash commands
                    const finalResponse = response + "\n\n🎪 **PARTY TIP**: Ooh! Ooh! You can use my super-fun slash commands here too! Try `/chat-pinkie` for AI-powered conversations or `/pinkie-pic` for cute pictures! 🧠✨";
                    
                    console.log(`[DEBUG] Mengirim respon DM ke ${message.author.tag}...`);
                    const sentMessage = await message.channel.send(finalResponse);
                    console.log('[DEBUG] ✅ DM response sent successfully!');
                    console.log(`[DEBUG] Response message ID: ${sentMessage.id}`);
                    return;
                    
                } catch (error) {
                    console.error('[ERROR] ❌ Failed to send DM response:', error);
                    console.error('[ERROR] Error details:', error.code, error.message);
                    return;
                }
            }

            // Cek apakah bot ini di-mention (untuk server messages) - dengan AI
            if (message.mentions.users.has(message.client.user.id)) {
                console.log(`[DEBUG] Bot (${message.client.user.tag}) di-mention! Membalas dengan AI...`);
                
                try {
                    let response;
                    
                    // Try to use AI for mention responses
                    if (pinkieAI.isAvailable()) {
                        console.log('[DEBUG] 🤖 Using AI for mention response...');
                        
                        // Remove the mention from the message content for AI processing
                        const cleanMessage = message.content.replace(/<@!?\d+>/g, '').trim();
                        const userMessage = cleanMessage || "Hi Pinkie!"; // Default if empty after removing mention
                        
                        const context = {
                            user: message.author,
                            guild: message.guild,
                            channel: message.channel,  // Added for typing indicator
                            channelType: 'mention'
                            // Remove isFirstTime - will be determined by memory system
                        };
                        
                        const aiResult = await pinkieAI.generateResponse(userMessage, context);
                        
                        if (aiResult.success) {
                            response = aiResult.response;
                        } else {
                            response = aiResult.response; // Fallback is still from AI helper
                        }
                    } else {
                        console.log('[DEBUG] 🎪 AI not available, using random fallback...');
                        
                        // Fallback responses when AI is not available
                        const responses = [
                            `OH MY GOSH ${message.author}! 🎉🎈 *throws party streamers* You mentioned me! This is like... the BEST thing ever! How can Pinkie help make your day more AMAZING?!`,
                            `WHEEEEE! ${message.author}! 🧁💖 *bounces up and down* Somepony called my name! Time for a spontaneous friendship party! What can I do for my super-duper friend?`,
                            `GASP! ${message.author}! 🎪🌈 *spins around excitedly* You want to talk to me?! This is more exciting than getting a new party cannon! Tell Pinkie everything!`,
                            `OH BOY OH BOY! ${message.author}! 🎂🎵 *does a happy dance* A mention! A mention! This calls for cupcakes and confetti! How can I spread some joy your way?`,
                            `SURPRISE! ${message.author}! 🎭✨ *giggles uncontrollably* You just made my Pinkie Sense tingle with happiness! Let's make this conversation 20% cooler... wait, that's Rainbow's thing! Let's make it 200% more FUN!`,
                            `WOW WOW WOW! ${message.author}! 🍰🎨 *throws a mini party* Pinkie Pie reporting for friendship duty! Ready to turn any frown upside down and make everypony smile!`
                        ];
                        
                        response = responses[Math.floor(Math.random() * responses.length)];
                    }
                    
                    await message.reply(response);
                    console.log('[DEBUG] ✅ AI-powered pony response sent successfully!');
                    
                } catch (error) {
                    console.error('[ERROR] ❌ Failed to send AI pony response:', error);
                }
            } else {
                console.log(`[DEBUG] Bot tidak di-mention dalam pesan ini.`);
            }
        } catch (generalError) {
            console.error('[ERROR] ❌ General error in messageCreate:', generalError);
        }
    },
};