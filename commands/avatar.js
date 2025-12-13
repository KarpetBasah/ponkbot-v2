// commands/avatar.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('avatar')
        .setDescription('Display user avatar')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user whose avatar you want to see')
                .setRequired(false)),
    async execute(interaction) {
        const user = interaction.options.getUser('user') || interaction.user;
        const isDirectMessage = interaction.guild === null;
        
        const avatarEmbed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle(`🖼️ ${user.username}'s ${isDirectMessage ? 'Friendship' : ''} Avatar`)
            .setImage(user.displayAvatarURL({ dynamic: true, size: 512 }))
            .addFields(
                { name: '👤 User', value: user.toString(), inline: true },
                { name: '🎨 Avatar URL', value: `[Click here](${user.displayAvatarURL({ dynamic: true, size: 512 })})`, inline: true },
                { 
                    name: isDirectMessage ? '💌 DM Feature' : '🌟 Tip', 
                    value: isDirectMessage 
                        ? 'Avatars look extra magical in our private friendship space! 🦄' 
                        : 'Try this command in my DMs for a more personal experience!', 
                    inline: false 
                }
            )
            .setFooter({ 
                text: isDirectMessage 
                    ? `Friendship is Magic! | Private view for ${interaction.user.username}` 
                    : `Friendship is Magic! | Requested by ${interaction.user.username}` 
            })
            .setTimestamp();

        await interaction.reply({ embeds: [avatarEmbed] });
    },
};
