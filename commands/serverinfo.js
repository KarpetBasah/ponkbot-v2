// commands/serverinfo.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('serverinfo')
        .setDescription('Display information about the server'),
    async execute(interaction) {
        const guild = interaction.guild;
        
        // Hitung jumlah member berdasarkan status
        const members = await guild.members.fetch();
        const onlineMembers = members.filter(member => member.presence?.status === 'online').size;
        const totalMembers = guild.memberCount;
        const botCount = members.filter(member => member.user.bot).size;
        const humanCount = totalMembers - botCount;

        const serverEmbed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle(`📊 Server Info: ${guild.name}`)
            .setThumbnail(guild.iconURL({ dynamic: true, size: 256 }))
            .addFields(
                { name: '👑 Owner', value: `<@${guild.ownerId}>`, inline: true },
                { name: '🆔 Server ID', value: guild.id, inline: true },
                { name: '📅 Created', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:F>`, inline: true },
                { name: '👥 Total Members', value: `${totalMembers}`, inline: true },
                { name: '🟢 Online', value: `${onlineMembers}`, inline: true },
                { name: '🤖 Bots', value: `${botCount}`, inline: true },
                { name: '📝 Text Channels', value: `${guild.channels.cache.filter(c => c.type === 0).size}`, inline: true },
                { name: '🔊 Voice Channels', value: `${guild.channels.cache.filter(c => c.type === 2).size}`, inline: true },
                { name: '📁 Categories', value: `${guild.channels.cache.filter(c => c.type === 4).size}`, inline: true },
                { name: '🎭 Roles', value: `${guild.roles.cache.size}`, inline: true },
                { name: '😀 Emojis', value: `${guild.emojis.cache.size}`, inline: true },
                { name: '🚀 Boost Level', value: `Level ${guild.premiumTier} (${guild.premiumSubscriptionCount} boosts)`, inline: true }
            )
            .setFooter({ text: `Requested by ${interaction.user.username}` })
            .setTimestamp();

        await interaction.reply({ embeds: [serverEmbed] });
    },
};
