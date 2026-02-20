// commands/dm-help.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dm-help')
        .setDescription('Get help using the bot in Direct Messages!'),
    async execute(interaction) {
        const isDirectMessage = interaction.guild === null;
        
        const embed = new EmbedBuilder()
            .setColor('#ff69b4')
            .setTitle('💌 Direct Message Magic Guide!')
            .setDescription('Welcome to our private friendship space! Here\'s what you can do:')
            .addFields(
                { 
                    name: '🦄 Personal Pony Commands', 
                    value: '`/cutie-mark` - Get your personal cutie mark\n`/pony-name` - Generate your pony identity\n`/element-of-harmony` - Find your element\n`/friendship-lesson` - Learn about friendship', 
                    inline: false 
                },
                { 
                    name: '🎲 Fun Activities', 
                    value: '`/dice` - Roll magical dice\n`/coinflip` - Flip a coin\n`/8ball` - Ask the Magic 8-Ball\n`/quote` - Get pony wisdom', 
                    inline: false 
                },
                { 
                    name: '🧠 Knowledge & Trivia', 
                    value: '`/pony-trivia` - Test your MLP knowledge\n`/meme` - Get pony memes\n`/weather` - Check magical weather', 
                    inline: false 
                },
                { 
                    name: '🌟 Special DM Features', 
                    value: isDirectMessage 
                        ? '✅ You\'re already in a DM! All commands work here.\n💝 This is our private friendship space!' 
                        : '💌 Use this command in a DM with me for private magic!\n🔒 DMs are perfect for personal pony discoveries!', 
                    inline: false 
                },
                { 
                    name: '💡 Pro Tips', 
                    value: '• Commands work the same in DM as in servers\n• No need to mention me in DMs\n• I respond to every message you send!\n• Perfect for discovering your pony identity privately', 
                    inline: false 
                }
            )
            .setFooter({ text: `Friendship is Magic! | ${isDirectMessage ? 'Private' : 'Public'} help for ${interaction.user.username}` })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
