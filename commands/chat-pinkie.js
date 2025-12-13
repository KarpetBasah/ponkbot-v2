// commands/chat-pinkie.js
const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const pinkieAI = require('../gemini-helper');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('chat-pinkie')
        .setDescription('Have an AI-powered conversation with Pinkie Pie! 🤖🎈')
        .addStringOption(option =>
            option.setName('message')
                .setDescription('What do you want to say to Pinkie Pie?')
                .setRequired(true)
                .setMaxLength(500))
        .addStringOption(option =>
            option.setName('mood')
                .setDescription('What kind of conversation do you want?')
                .setRequired(false)
                .addChoices(
                    { name: '🎉 Party Talk', value: 'celebration' },
                    { name: '😢 Need Cheering Up', value: 'sad' },
                    { name: '❓ Ask for Help', value: 'confused' },
                    { name: '🎂 Birthday Chat', value: 'birthday' },
                    { name: '✨ Surprise Me!', value: 'normal' }
                ))
        .setDMPermission(true),
    
    async execute(interaction) {
        try {
            // Start typing indicator before deferring (for immediate visual feedback)
            await interaction.channel.sendTyping();
            
            await interaction.deferReply();

            const userMessage = interaction.options.getString('message');
            const mood = interaction.options.getString('mood') || 'normal';
            const user = interaction.user;
            const guild = interaction.guild;

            // Check if AI is available
            if (!pinkieAI.isAvailable()) {
                const noAIEmbed = new EmbedBuilder()
                    .setColor('#ffaa00')
                    .setTitle('🚨 AI Party System Offline!')
                    .setDescription('OH NO OH NO! My super-duper smart AI brain isn\'t working right now! *dramatic gasp* But don\'t worry, I can still chat with you the old-fashioned way!')
                    .addFields(
                        {
                            name: '🔧 What Happened?',
                            value: 'The Gemini API key might be missing or there\'s a connection issue. Check the console for more details!',
                            inline: false
                        },
                        {
                            name: '🎪 What Can You Do?',
                            value: 'Try the regular bot commands like `/ping`, `/pinkie-pic`, or just mention me for basic responses!',
                            inline: false
                        }
                    )
                    .setFooter({ text: 'Pinkie\'s AI Chat • Technical Difficulties! 🛠️' });

                return await interaction.editReply({ embeds: [noAIEmbed] });
            }

            // Get mentionable users if in a guild
            let mentionableUsers = [];
            if (guild && interaction.channel) {
                mentionableUsers = await pinkieAI.getMentionableUsers(interaction.channel, 10);
                console.log(`👥 Found ${mentionableUsers.length} mentionable users for chat-pinkie`);
            }

            // Build context for AI
            const context = {
                user: user,
                guild: guild,
                channel: interaction.channel,  // Added for typing indicator
                channelType: interaction.channel?.type || 'unknown',
                mood: mood,
                mentionableUsers: mentionableUsers  // Added for mentions
                // Remove isFirstTime - will be determined by memory system
            };

            // Add mood-specific context if needed
            let enhancedMessage = userMessage;
            if (mood !== 'normal') {
                const moodPrompt = pinkieAI.getMoodPrompt(mood);
                if (moodPrompt) {
                    enhancedMessage += `\n\nContext: ${moodPrompt}`;
                }
            }

            // Generate AI response
            const aiResult = await pinkieAI.generateResponse(enhancedMessage, context);

            // Create embed based on result
            let embed;
            
            if (aiResult.success) {
                // Successful AI response
                embed = new EmbedBuilder()
                    .setColor('#FF69B4')
                    .setAuthor({ 
                        name: 'Pinkie Pie', 
                        iconURL: 'https://derpicdn.net/img/2021/11/11/2747109/medium.png'
                    })
                    .setDescription(aiResult.response)
                    .setFooter({ text: '✨ Powered by Gemini AI & Friendship Magic! 🤖🎈' })
                    .setTimestamp();

                // Add mood indicator if specified
                if (mood !== 'normal') {
                    const moodEmojis = {
                        celebration: '🎉',
                        sad: '🤗',
                        confused: '❓',
                        birthday: '🎂',
                        excited: '⚡'
                    };
                    
                    embed.addFields({
                        name: `${moodEmojis[mood] || '✨'} Conversation Mode`,
                        value: mood.charAt(0).toUpperCase() + mood.slice(1),
                        inline: true
                    });
                }

            } else {
                // Fallback response
                embed = new EmbedBuilder()
                    .setColor('#FF69B4')
                    .setAuthor({ 
                        name: 'Pinkie Pie', 
                        iconURL: 'https://derpicdn.net/img/2021/11/11/2747109/medium.png'
                    })
                    .setDescription(aiResult.response)
                    .setFooter({ text: '🎪 Regular Pinkie Mode (AI taking a cupcake break!) 🧁' });
            }

            await interaction.editReply({ embeds: [embed] });

            // Log successful interaction
            const logMode = aiResult.success ? 'AI' : 'Fallback';
            console.log(`🎈 ${logMode} Chat: ${user.username} in ${guild?.name || 'DM'} - "${userMessage.substring(0, 50)}..."`);

        } catch (error) {
            console.error('Error in chat-pinkie command:', error);
            
            // Error embed
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff6b6b')
                .setTitle('🎪 Chat System Crashed!')
                .setDescription('OH NO! Something went super-duper wrong with my chatting system! *bounces sadly* It\'s like when I mix up salt and sugar in my cupcakes!')
                .addFields({
                    name: '🔧 What Happened?',
                    value: 'There was an unexpected error while trying to process your message. Don\'t worry though - you can always try again!',
                    inline: false
                })
                .setFooter({ text: 'Pinkie\'s AI Chat • System Error! 🚨' });

            if (interaction.deferred) {
                await interaction.editReply({ embeds: [errorEmbed] });
            } else {
                await interaction.reply({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral });
            }
        }
    },
};