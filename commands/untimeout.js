// commands/untimeout.js
const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits , MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('untimeout')
        .setDescription('Remove timeout from a member! 🕐')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to remove timeout from')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for removing the timeout')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .setDMPermission(false),
    async execute(interaction) {
        const targetUser = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason') || 'No reason provided';
        const executor = interaction.user;
        
        try {
            // Check if command is used in DM
            if (!interaction.guild) {
                const errorEmbed = new EmbedBuilder()
                    .setColor('#ff6b6b')
                    .setTitle('🚫 Moderation Error')
                    .setDescription('Moderation commands can only be used in servers, not in DMs!')
                    .setFooter({ text: 'Friendship is Magic! • Server Moderation' });
                
                return await interaction.reply({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral });
            }

            const targetMember = await interaction.guild.members.fetch(targetUser.id).catch(() => null);
            const executorMember = await interaction.guild.members.fetch(executor.id);

            // Check if target user is in the server
            if (!targetMember) {
                const errorEmbed = new EmbedBuilder()
                    .setColor('#ff6b6b')
                    .setTitle('🚫 User Not Found')
                    .setDescription(`${targetUser.tag} is not a member of this server!`)
                    .setFooter({ text: 'Friendship is Magic! • Server Moderation' });
                
                return await interaction.reply({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral });
            }

            // Check permissions
            if (!executorMember.permissions.has(PermissionFlagsBits.ModerateMembers)) {
                const errorEmbed = new EmbedBuilder()
                    .setColor('#ff6b6b')
                    .setTitle('🚫 Insufficient Permissions')
                    .setDescription('You need the **Moderate Members** permission to remove timeouts!')
                    .setFooter({ text: 'Friendship is Magic! • Server Moderation' });
                
                return await interaction.reply({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral });
            }

            // Check if bot has permissions
            const botMember = await interaction.guild.members.fetch(interaction.client.user.id);
            if (!botMember.permissions.has(PermissionFlagsBits.ModerateMembers)) {
                const errorEmbed = new EmbedBuilder()
                    .setColor('#ff6b6b')
                    .setTitle('🚫 Bot Missing Permissions')
                    .setDescription('I need the **Moderate Members** permission to remove timeouts!')
                    .setFooter({ text: 'Friendship is Magic! • Server Moderation' });
                
                return await interaction.reply({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral });
            }

            // Check if user is actually timed out
            if (!targetMember.communicationDisabledUntil || targetMember.communicationDisabledUntil <= new Date()) {
                const errorEmbed = new EmbedBuilder()
                    .setColor('#ff6b6b')
                    .setTitle('🚫 User Not Timed Out')
                    .setDescription(`${targetUser.tag} is not currently timed out!`)
                    .addFields({
                        name: '🦄 Already Free',
                        value: 'This pony is already free to participate in the conversation!',
                        inline: false
                    })
                    .setFooter({ text: 'Friendship is Magic! • Server Moderation' });
                
                return await interaction.reply({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral });
            }

            // Store original timeout end time for logging
            const originalTimeoutEnd = targetMember.communicationDisabledUntil;

            // Remove the timeout
            await targetMember.timeout(null, reason);

            // Try to send DM to user
            const dmEmbed = new EmbedBuilder()
                .setColor('#4caf50')
                .setTitle('🕐 Timeout Removed!')
                .setDescription(`Good news! Your timeout in **${interaction.guild.name}** has been lifted!`)
                .addFields(
                    { name: '👮 Removed by', value: executor.tag, inline: true },
                    { name: '📝 Reason', value: reason, inline: true },
                    { name: '🦄 Welcome Back Message', value: 'Your timeout has been removed! Please remember to follow the server rules and contribute positively to our community. We\'re glad to have you back!', inline: false },
                    { name: '🌟 Fresh Start', value: 'Use this opportunity to show that you\'ve learned from the experience. Friendship is about growing together!', inline: false }
                )
                .setFooter({ text: 'Friendship is Magic! • Welcome back!' })
                .setTimestamp();

            try {
                await targetUser.send({ embeds: [dmEmbed] });
            } catch (dmError) {
                console.log(`Could not send DM to ${targetUser.tag} about timeout removal.`);
            }

            // Success response
            const successEmbed = new EmbedBuilder()
                .setColor('#4caf50')
                .setTitle('🕐 Timeout Removed Successfully')
                .setDescription(`${targetUser.tag}'s timeout has been removed.`)
                .addFields(
                    { name: '👮 Moderator', value: executor.tag, inline: true },
                    { name: '📝 Reason', value: reason, inline: true },
                    { name: '⏰ Original End Time', value: `<t:${Math.floor(originalTimeoutEnd.getTime() / 1000)}:F>`, inline: false },
                    { name: '🌈 Second Chance', value: 'This member can now participate fully in the server again. Welcome them back with friendship!', inline: false }
                )
                .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
                .setFooter({ text: 'Friendship is Magic! • Freedom Restored' })
                .setTimestamp();

            await interaction.reply({ embeds: [successEmbed] });

            // Log to moderation channel if exists
            const modLogChannel = interaction.guild.channels.cache.find(ch => 
                ch.name.includes('mod-log') || ch.name.includes('audit-log') || ch.name.includes('moderation')
            );

            if (modLogChannel && modLogChannel.isTextBased()) {
                const logEmbed = new EmbedBuilder()
                    .setColor('#4caf50')
                    .setTitle('🕐 Timeout Removed')
                    .addFields(
                        { name: '👤 User', value: `${targetUser.tag} (${targetUser.id})`, inline: true },
                        { name: '👮 Moderator', value: `${executor.tag} (${executor.id})`, inline: true },
                        { name: '📝 Reason', value: reason, inline: false },
                        { name: '⏰ Original End Time', value: `<t:${Math.floor(originalTimeoutEnd.getTime() / 1000)}:F>`, inline: true },
                        { name: '📅 Removed At', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
                    )
                    .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
                    .setFooter({ text: 'Moderation Log • Friendship is Magic!' })
                    .setTimestamp();

                try {
                    await modLogChannel.send({ embeds: [logEmbed] });
                } catch (logError) {
                    console.error('Could not send untimeout log:', logError);
                }
            }

        } catch (error) {
            console.error('Error in untimeout command:', error);
            
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff6b6b')
                .setTitle('🚫 Untimeout Failed')
                .setDescription('An error occurred while trying to remove the timeout.')
                .setFooter({ text: 'Friendship is Magic! • Error Handling' });

            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral });
            } else {
                await interaction.reply({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral });
            }
        }
    },
};
