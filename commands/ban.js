// commands/ban.js
const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits , MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Ban a member from the server permanently!')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to ban from the server')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for banning this member')
                .setRequired(false))
        .addIntegerOption(option =>
            option.setName('delete-days')
                .setDescription('Days of messages to delete (0-7)')
                .setMinValue(0)
                .setMaxValue(7)
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .setDMPermission(false),
    async execute(interaction) {
        const targetUser = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason') || 'No reason provided';
        const deleteDays = interaction.options.getInteger('delete-days') || 0;
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

            // Check permissions
            if (!executorMember.permissions.has(PermissionFlagsBits.BanMembers)) {
                const errorEmbed = new EmbedBuilder()
                    .setColor('#ff6b6b')
                    .setTitle('🚫 Insufficient Permissions')
                    .setDescription('You need the **Ban Members** permission to use this command!')
                    .addFields({
                        name: '⚖️ Justice Reminder',
                        value: 'With great power comes great responsibility. Banning is serious business!',
                        inline: false
                    })
                    .setFooter({ text: 'Friendship is Magic! • Server Moderation' });
                
                return await interaction.reply({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral });
            }

            // Check if bot has permissions
            const botMember = await interaction.guild.members.fetch(interaction.client.user.id);
            if (!botMember.permissions.has(PermissionFlagsBits.BanMembers)) {
                const errorEmbed = new EmbedBuilder()
                    .setColor('#ff6b6b')
                    .setTitle('🚫 Bot Missing Permissions')
                    .setDescription('I need the **Ban Members** permission to perform this action!')
                    .setFooter({ text: 'Friendship is Magic! • Server Moderation' });
                
                return await interaction.reply({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral });
            }

            // Check role hierarchy (if user is still in server)
            if (targetMember) {
                if (targetMember.roles.highest.position >= executorMember.roles.highest.position && executor.id !== interaction.guild.ownerId) {
                    const errorEmbed = new EmbedBuilder()
                        .setColor('#ff6b6b')
                        .setTitle('🚫 Role Hierarchy Error')
                        .setDescription(`You cannot ban ${targetUser.tag} because they have a higher or equal role than you!`)
                        .setFooter({ text: 'Friendship is Magic! • Server Moderation' });
                    
                    return await interaction.reply({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral });
                }

                if (targetMember.roles.highest.position >= botMember.roles.highest.position) {
                    const errorEmbed = new EmbedBuilder()
                        .setColor('#ff6b6b')
                        .setTitle('🚫 Bot Role Hierarchy Error')
                        .setDescription(`I cannot ban ${targetUser.tag} because they have a higher or equal role than me!`)
                        .setFooter({ text: 'Friendship is Magic! • Server Moderation' });
                    
                    return await interaction.reply({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral });
                }
            }

            // Cannot ban server owner
            if (targetUser.id === interaction.guild.ownerId) {
                const errorEmbed = new EmbedBuilder()
                    .setColor('#ff6b6b')
                    .setTitle('🚫 Cannot Ban Server Owner')
                    .setDescription('You cannot ban the server owner!')
                    .addFields({
                        name: '👑 Royal Protection',
                        value: 'Princess Celestia cannot be banished from her own kingdom!',
                        inline: false
                    })
                    .setFooter({ text: 'Friendship is Magic! • Server Moderation' });
                
                return await interaction.reply({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral });
            }

            // Check if user is already banned
            try {
                const existingBan = await interaction.guild.bans.fetch(targetUser.id);
                if (existingBan) {
                    const errorEmbed = new EmbedBuilder()
                        .setColor('#ff6b6b')
                        .setTitle('🚫 User Already Banned')
                        .setDescription(`${targetUser.tag} is already banned from this server!`)
                        .setFooter({ text: 'Friendship is Magic! • Server Moderation' });
                    
                    return await interaction.reply({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral });
                }
            } catch (fetchError) {
                // User is not banned, continue
            }

            // Try to send DM to user before banning (if they're in the server)
            if (targetMember) {
                const dmEmbed = new EmbedBuilder()
                    .setColor('#d32f2f')
                    .setTitle('🔨 You Have Been Banned')
                    .setDescription(`You have been permanently banned from **${interaction.guild.name}**`)
                    .addFields(
                        { name: '👮 Moderator', value: executor.tag, inline: true },
                        { name: '📝 Reason', value: reason, inline: true },
                        { name: '⚖️ Appeal Process', value: 'If you believe this ban was unjust, you may appeal through the server\'s official channels.', inline: false },
                        { name: '🦄 Final Message', value: 'Everyone deserves a chance to learn and grow. Reflect on this experience and consider how to be a better friend in the future.', inline: false }
                    )
                    .setFooter({ text: 'Friendship is Magic! • This action is permanent' })
                    .setTimestamp();

                try {
                    await targetUser.send({ embeds: [dmEmbed] });
                } catch (dmError) {
                    console.log(`Could not send DM to ${targetUser.tag} about ban.`);
                }
            }

            // Perform the ban
            await interaction.guild.members.ban(targetUser, {
                reason: reason,
                deleteMessageDays: deleteDays
            });

            // Success response
            const successEmbed = new EmbedBuilder()
                .setColor('#d32f2f')
                .setTitle('🔨 Member Banned Successfully')
                .setDescription(`${targetUser.tag} has been permanently banned from the server.`)
                .addFields(
                    { name: '👮 Moderator', value: executor.tag, inline: true },
                    { name: '📝 Reason', value: reason, inline: true },
                    { name: '🗑️ Messages Deleted', value: `${deleteDays} day(s)`, inline: true },
                    { name: '⚖️ Justice Note', value: 'Bans are serious actions taken to protect the harmony of our community.', inline: false }
                )
                .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
                .setFooter({ text: 'Friendship is Magic! • Server Moderation' })
                .setTimestamp();

            await interaction.reply({ embeds: [successEmbed] });

            // Log to moderation channel if exists
            const modLogChannel = interaction.guild.channels.cache.find(ch => 
                ch.name.includes('mod-log') || ch.name.includes('audit-log') || ch.name.includes('moderation')
            );

            if (modLogChannel && modLogChannel.isTextBased()) {
                const logEmbed = new EmbedBuilder()
                    .setColor('#d32f2f')
                    .setTitle('🔨 Member Banned')
                    .addFields(
                        { name: '👤 User', value: `${targetUser.tag} (${targetUser.id})`, inline: true },
                        { name: '👮 Moderator', value: `${executor.tag} (${executor.id})`, inline: true },
                        { name: '📝 Reason', value: reason, inline: false },
                        { name: '🗑️ Messages Deleted', value: `${deleteDays} day(s)`, inline: true },
                        { name: '📅 Date', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
                    )
                    .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
                    .setFooter({ text: 'Moderation Log • Friendship is Magic!' })
                    .setTimestamp();

                try {
                    await modLogChannel.send({ embeds: [logEmbed] });
                } catch (logError) {
                    console.error('Could not send ban log:', logError);
                }
            }

        } catch (error) {
            console.error('Error in ban command:', error);
            
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff6b6b')
                .setTitle('🚫 Ban Failed')
                .setDescription('An error occurred while trying to ban the member.')
                .addFields({
                    name: '🔧 Possible Solutions',
                    value: '• Check bot permissions\n• Verify role hierarchy\n• Check if user is already banned',
                    inline: false
                })
                .setFooter({ text: 'Friendship is Magic! • Error Handling' });

            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral });
            } else {
                await interaction.reply({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral });
            }
        }
    },
};
