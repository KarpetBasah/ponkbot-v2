// commands/userinfo.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('Display information about a user')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user whose information you want to see')
                .setRequired(false)),
    async execute(interaction) {
        const user = interaction.options.getUser('user') || interaction.user;
        const isDirectMessage = interaction.guild === null;
        const member = isDirectMessage ? null : interaction.guild.members.cache.get(user.id);
        
        // Status emoji
        const statusEmojis = {
            online: '🟢',
            idle: '🟡',
            dnd: '🔴',
            offline: '⚫'
        };
        
        const userEmbed = new EmbedBuilder()
            .setColor('#4a90e2')
            .setTitle(`👤 ${isDirectMessage ? 'Friendship Profile' : 'User Info'}: ${user.username}`)
            .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 256 }))
            .addFields(
                { name: '🆔 User ID', value: user.id, inline: true },
                { name: '🏷️ Tag', value: user.tag, inline: true },
                { name: '📅 Account Created', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:F>`, inline: false }
            );

        if (!isDirectMessage && member) {
            const status = member.presence?.status || 'offline';
            const statusText = statusEmojis[status] + ' ' + status.charAt(0).toUpperCase() + status.slice(1);
            
            userEmbed.addFields(
                { name: '📝 Nickname', value: member.nickname || 'None', inline: true },
                { name: '🔗 Status', value: statusText, inline: true },
                { name: '📅 Joined Server', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>`, inline: false },
                { name: '🎭 Roles', value: member.roles.cache.filter(role => role.name !== '@everyone').map(role => role.toString()).join(', ') || 'No roles', inline: false }
            );
            
            // Activity/game info
            if (member.presence?.activities && member.presence.activities.length > 0) {
                const activity = member.presence.activities[0];
                userEmbed.addFields(
                    { name: '🎮 Activity', value: activity.name, inline: true }
                );
            }
        } else if (isDirectMessage) {
            userEmbed.addFields(
                { name: '💌 DM Mode', value: 'This is our private friendship space! Server-specific info isn\'t available here.', inline: false },
                { name: '🦄 Friendship Tip', value: 'Try `/my-pony-profile` to create your personal pony identity!', inline: false }
            );
        }
        
        userEmbed.setFooter({ 
            text: isDirectMessage 
                ? `Friendship is Magic! | Private info for ${interaction.user.username}` 
                : `Friendship is Magic! | Requested by ${interaction.user.username}` 
        })
        .setTimestamp();

        await interaction.reply({ embeds: [userEmbed] });
    },
};
