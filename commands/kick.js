// commands/kick.js
const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits , MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Kick a member from the server with friendship guidance!')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to kick from the server')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for kicking this member')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
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
                    .addFields({
                        name: '💡 Tip',
                        value: 'Try using this command in a server where you have kick permissions.',
                        inline: false
                    })
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
            if (!executorMember.permissions.has(PermissionFlagsBits.KickMembers)) {
                const errorEmbed = new EmbedBuilder()
                    .setColor('#ff6b6b')
                    .setTitle('🚫 Insufficient Permissions')
                    .setDescription('You need the **Kick Members** permission to use this command!')
                    .addFields({
                        name: '🦄 Friendship Reminder',
                        value: 'Great power requires great responsibility. Make sure you have the right permissions!',
                        inline: false
                    })
                    .setFooter({ text: 'Friendship is Magic! • Server Moderation' });
                
                return await interaction.reply({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral });
            }

            // Check if bot has permissions
            const botMember = await interaction.guild.members.fetch(interaction.client.user.id);
            if (!botMember.permissions.has(PermissionFlagsBits.KickMembers)) {
                const errorEmbed = new EmbedBuilder()
                    .setColor('#ff6b6b')
                    .setTitle('🚫 Bot Missing Permissions')
                    .setDescription('I need the **Kick Members** permission to perform this action!')
                    .setFooter({ text: 'Friendship is Magic! • Server Moderation' });
                
                return await interaction.reply({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral });
            }

            // Check role hierarchy
            if (targetMember.roles.highest.position >= executorMember.roles.highest.position && executor.id !== interaction.guild.ownerId) {
                const errorEmbed = new EmbedBuilder()
                    .setColor('#ff6b6b')
                    .setTitle('🚫 Role Hierarchy Error')
                    .setDescription(`You cannot kick ${targetUser.tag} because they have a higher or equal role than you!`)
                    .addFields({
                        name: '🦄 Friendship Wisdom',
                        value: 'Even Princess Celestia respects the chain of command!',
                        inline: false
                    })
                    .setFooter({ text: 'Friendship is Magic! • Server Moderation' });
                
                return await interaction.reply({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral });
            }

            if (targetMember.roles.highest.position >= botMember.roles.highest.position) {
                const errorEmbed = new EmbedBuilder()
                    .setColor('#ff6b6b')
                    .setTitle('🚫 Bot Role Hierarchy Error')
                    .setDescription(`I cannot kick ${targetUser.tag} because they have a higher or equal role than me!`)
                    .setFooter({ text: 'Friendship is Magic! • Server Moderation' });
                
                return await interaction.reply({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral });
            }

            // Cannot kick server owner
            if (targetUser.id === interaction.guild.ownerId) {
                const errorEmbed = new EmbedBuilder()
                    .setColor('#ff6b6b')
                    .setTitle('🚫 Cannot Kick Server Owner')
                    .setDescription('You cannot kick the server owner!')
                    .addFields({
                        name: '👑 Royal Immunity',
                        value: 'Just like Princess Celestia, server owners have special protection!',
                        inline: false
                    })
                    .setFooter({ text: 'Friendship is Magic! • Server Moderation' });
                
                return await interaction.reply({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral });
            }

            // Try to send DM to user before kicking
            const dmEmbed = new EmbedBuilder()
                .setColor('#ff9800')
                .setTitle('🥾 You Have Been Kicked')
                .setDescription(`You have been kicked from **${interaction.guild.name}**`)
                .addFields(
                    { name: '👮 Moderator', value: executor.tag, inline: true },
                    { name: '📝 Reason', value: reason, inline: true },
                    { name: '🦄 Friendship Message', value: 'Sometimes we make mistakes, but friendship gives us second chances. Learn from this experience!', inline: false }
                )
                .setFooter({ text: 'Friendship is Magic! • You can still learn and grow' })
                .setTimestamp();

            try {
                await targetUser.send({ embeds: [dmEmbed] });
            } catch (dmError) {
                console.log(`Could not send DM to ${targetUser.tag} about kick.`);
            }

            // Perform the kick
            await targetMember.kick(reason);

            // Success response
            const successEmbed = new EmbedBuilder()
                .setColor('#4caf50')
                .setTitle('🥾 Member Kicked Successfully')
                .setDescription(`${targetUser.tag} has been kicked from the server.`)
                .addFields(
                    { name: '👮 Moderator', value: executor.tag, inline: true },
                    { name: '📝 Reason', value: reason, inline: true },
                    { name: '🦄 Friendship Note', value: 'Remember, discipline with kindness helps everypony learn and grow!', inline: false }
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
                    .setColor('#ff9800')
                    .setTitle('🥾 Member Kicked')
                    .addFields(
                        { name: '👤 User', value: `${targetUser.tag} (${targetUser.id})`, inline: true },
                        { name: '👮 Moderator', value: `${executor.tag} (${executor.id})`, inline: true },
                        { name: '📝 Reason', value: reason, inline: false },
                        { name: '📅 Date', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: false }
                    )
                    .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
                    .setFooter({ text: 'Moderation Log • Friendship is Magic!' })
                    .setTimestamp();

                try {
                    await modLogChannel.send({ embeds: [logEmbed] });
                } catch (logError) {
                    console.error('Could not send kick log:', logError);
                }
            }

        } catch (error) {
            console.error('Error in kick command:', error);
            
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff6b6b')
                .setTitle('🚫 Kick Failed')
                .setDescription('An error occurred while trying to kick the member.')
                .addFields({
                    name: '🔧 Possible Solutions',
                    value: '• Check bot permissions\n• Verify role hierarchy\n• Make sure user is still in server',
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
