// commands/unban.js
const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits , MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unban')
        .setDescription('Unban a user from the server - second chances! 🌈')
        .addStringOption(option =>
            option.setName('user-id')
                .setDescription('The User ID of the person to unban')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for unbanning this user')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .setDMPermission(false),
    async execute(interaction) {
        const userId = interaction.options.getString('user-id');
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

            const executorMember = await interaction.guild.members.fetch(executor.id);

            // Check permissions
            if (!executorMember.permissions.has(PermissionFlagsBits.BanMembers)) {
                const errorEmbed = new EmbedBuilder()
                    .setColor('#ff6b6b')
                    .setTitle('🚫 Insufficient Permissions')
                    .setDescription('You need the **Ban Members** permission to unban users!')
                    .addFields({
                        name: '🌈 Second Chances',
                        value: 'Only those with ban permissions can give ponies a second chance!',
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
                    .setDescription('I need the **Ban Members** permission to unban users!')
                    .setFooter({ text: 'Friendship is Magic! • Server Moderation' });
                
                return await interaction.reply({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral });
            }

            // Validate User ID format
            if (!/^\d{17,19}$/.test(userId)) {
                const errorEmbed = new EmbedBuilder()
                    .setColor('#ff6b6b')
                    .setTitle('🚫 Invalid User ID')
                    .setDescription('Please provide a valid Discord User ID (17-19 digits)!')
                    .addFields({
                        name: '💡 How to get User ID',
                        value: '1. Enable Developer Mode in Discord settings\n2. Right-click on user profile\n3. Select "Copy User ID"',
                        inline: false
                    })
                    .setFooter({ text: 'Friendship is Magic! • Server Moderation' });
                
                return await interaction.reply({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral });
            }

            // Check if user is actually banned
            let bannedUser = null;
            try {
                const ban = await interaction.guild.bans.fetch(userId);
                bannedUser = ban.user;
            } catch (fetchError) {
                const errorEmbed = new EmbedBuilder()
                    .setColor('#ff6b6b')
                    .setTitle('🚫 User Not Banned')
                    .setDescription(`User with ID \`${userId}\` is not banned from this server!`)
                    .addFields({
                        name: '🔍 Double Check',
                        value: 'Make sure the User ID is correct and that they are actually banned.',
                        inline: false
                    })
                    .setFooter({ text: 'Friendship is Magic! • Server Moderation' });
                
                return await interaction.reply({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral });
            }

            // Perform the unban
            await interaction.guild.members.unban(userId, reason);

            // Success response
            const successEmbed = new EmbedBuilder()
                .setColor('#4caf50')
                .setTitle('🌈 User Unbanned Successfully')
                .setDescription(`${bannedUser.tag} has been unbanned from the server!`)
                .addFields(
                    { name: '👮 Moderator', value: executor.tag, inline: true },
                    { name: '📝 Reason', value: reason, inline: true },
                    { name: '🌟 Second Chance', value: 'Everyone deserves an opportunity to learn and grow. Welcome them back with friendship!', inline: false }
                )
                .setThumbnail(bannedUser.displayAvatarURL({ dynamic: true }))
                .setFooter({ text: 'Friendship is Magic! • Second Chances Matter' })
                .setTimestamp();

            await interaction.reply({ embeds: [successEmbed] });

            // Try to send DM to unbanned user
            try {
                const dmEmbed = new EmbedBuilder()
                    .setColor('#4caf50')
                    .setTitle('🌈 You Have Been Unbanned!')
                    .setDescription(`Great news! You have been unbanned from **${interaction.guild.name}**!`)
                    .addFields(
                        { name: '👮 Unbanned by', value: executor.tag, inline: true },
                        { name: '📝 Reason', value: reason, inline: true },
                        { name: '🦄 Welcome Back Message', value: 'This is your second chance to be part of our community! Please remember to follow the server rules and treat everypony with kindness and respect.', inline: false },
                        { name: '🌟 Fresh Start', value: 'Consider this a fresh beginning. Learn from past experiences and help make our server a better place for everypony!', inline: false }
                    )
                    .setFooter({ text: 'Friendship is Magic! • Welcome back!' })
                    .setTimestamp();

                await bannedUser.send({ embeds: [dmEmbed] });
            } catch (dmError) {
                console.log(`Could not send DM to ${bannedUser.tag} about unban.`);
            }

            // Log to moderation channel if exists
            const modLogChannel = interaction.guild.channels.cache.find(ch => 
                ch.name.includes('mod-log') || ch.name.includes('audit-log') || ch.name.includes('moderation')
            );

            if (modLogChannel && modLogChannel.isTextBased()) {
                const logEmbed = new EmbedBuilder()
                    .setColor('#4caf50')
                    .setTitle('🌈 User Unbanned')
                    .addFields(
                        { name: '👤 User', value: `${bannedUser.tag} (${bannedUser.id})`, inline: true },
                        { name: '👮 Moderator', value: `${executor.tag} (${executor.id})`, inline: true },
                        { name: '📝 Reason', value: reason, inline: false },
                        { name: '📅 Date', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: false }
                    )
                    .setThumbnail(bannedUser.displayAvatarURL({ dynamic: true }))
                    .setFooter({ text: 'Moderation Log • Friendship is Magic!' })
                    .setTimestamp();

                try {
                    await modLogChannel.send({ embeds: [logEmbed] });
                } catch (logError) {
                    console.error('Could not send unban log:', logError);
                }
            }

        } catch (error) {
            console.error('Error in unban command:', error);
            
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff6b6b')
                .setTitle('🚫 Unban Failed')
                .setDescription('An error occurred while trying to unban the user.')
                .addFields({
                    name: '🔧 Possible Solutions',
                    value: '• Check bot permissions\n• Verify the User ID is correct\n• Make sure the user is actually banned',
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
