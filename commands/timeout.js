// commands/timeout.js
const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits , MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('timeout')
        .setDescription('Put a member in timeout (temporary mute)! ⏰')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to timeout')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('duration')
                .setDescription('Duration in minutes (max 40320 = 4 weeks)')
                .setMinValue(1)
                .setMaxValue(40320)
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for the timeout')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .setDMPermission(false),
    async execute(interaction) {
        const targetUser = interaction.options.getUser('user');
        const duration = interaction.options.getInteger('duration');
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
                    .setDescription('You need the **Moderate Members** permission to use timeouts!')
                    .addFields({
                        name: '⏰ Time Management',
                        value: 'Only trusted ponies can manage timeout periods for the community!',
                        inline: false
                    })
                    .setFooter({ text: 'Friendship is Magic! • Server Moderation' });
                
                return await interaction.reply({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral });
            }

            // Check if bot has permissions
            const botMember = await interaction.guild.members.fetch(interaction.client.user.id);
            if (!botMember.permissions.has(PermissionFlagsBits.ModerateMembers)) {
                const errorEmbed = new EmbedBuilder()
                    .setColor('#ff6b6b')
                    .setTitle('🚫 Bot Missing Permissions')
                    .setDescription('I need the **Moderate Members** permission to use timeouts!')
                    .setFooter({ text: 'Friendship is Magic! • Server Moderation' });
                
                return await interaction.reply({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral });
            }

            // Check role hierarchy
            if (targetMember.roles.highest.position >= executorMember.roles.highest.position && executor.id !== interaction.guild.ownerId) {
                const errorEmbed = new EmbedBuilder()
                    .setColor('#ff6b6b')
                    .setTitle('🚫 Role Hierarchy Error')
                    .setDescription(`You cannot timeout ${targetUser.tag} because they have a higher or equal role than you!`)
                    .setFooter({ text: 'Friendship is Magic! • Server Moderation' });
                
                return await interaction.reply({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral });
            }

            if (targetMember.roles.highest.position >= botMember.roles.highest.position) {
                const errorEmbed = new EmbedBuilder()
                    .setColor('#ff6b6b')
                    .setTitle('🚫 Bot Role Hierarchy Error')
                    .setDescription(`I cannot timeout ${targetUser.tag} because they have a higher or equal role than me!`)
                    .setFooter({ text: 'Friendship is Magic! • Server Moderation' });
                
                return await interaction.reply({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral });
            }

            // Cannot timeout server owner
            if (targetUser.id === interaction.guild.ownerId) {
                const errorEmbed = new EmbedBuilder()
                    .setColor('#ff6b6b')
                    .setTitle('🚫 Cannot Timeout Server Owner')
                    .setDescription('You cannot timeout the server owner!')
                    .setFooter({ text: 'Friendship is Magic! • Server Moderation' });
                
                return await interaction.reply({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral });
            }

            // Cannot timeout yourself
            if (targetUser.id === executor.id) {
                const errorEmbed = new EmbedBuilder()
                    .setColor('#ff6b6b')
                    .setTitle('🚫 Cannot Timeout Yourself')
                    .setDescription('You cannot timeout yourself!')
                    .addFields({
                        name: '🤔 Self-Control',
                        value: 'If you need a break, just step away from the keyboard!',
                        inline: false
                    })
                    .setFooter({ text: 'Friendship is Magic! • Server Moderation' });
                
                return await interaction.reply({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral });
            }

            // Check if user is already timed out
            if (targetMember.communicationDisabledUntil && targetMember.communicationDisabledUntil > new Date()) {
                const errorEmbed = new EmbedBuilder()
                    .setColor('#ff6b6b')
                    .setTitle('🚫 User Already Timed Out')
                    .setDescription(`${targetUser.tag} is already timed out until <t:${Math.floor(targetMember.communicationDisabledUntil.getTime() / 1000)}:F>!`)
                    .addFields({
                        name: '💡 Tip',
                        value: 'Use `/untimeout` to remove their current timeout first, or wait for it to expire.',
                        inline: false
                    })
                    .setFooter({ text: 'Friendship is Magic! • Server Moderation' });
                
                return await interaction.reply({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral });
            }

            // Calculate timeout duration
            const timeoutDuration = duration * 60 * 1000; // Convert minutes to milliseconds
            const timeoutUntil = new Date(Date.now() + timeoutDuration);

            // Format duration for display
            function formatDuration(minutes) {
                if (minutes < 60) return `${minutes} minute(s)`;
                if (minutes < 1440) return `${Math.floor(minutes / 60)} hour(s) and ${minutes % 60} minute(s)`;
                const days = Math.floor(minutes / 1440);
                const hours = Math.floor((minutes % 1440) / 60);
                const mins = minutes % 60;
                return `${days} day(s), ${hours} hour(s), and ${mins} minute(s)`;
            }

            // Try to send DM to user before timeout
            const dmEmbed = new EmbedBuilder()
                .setColor('#ff9800')
                .setTitle('⏰ You Have Been Timed Out')
                .setDescription(`You have been timed out in **${interaction.guild.name}**`)
                .addFields(
                    { name: '👮 Moderator', value: executor.tag, inline: true },
                    { name: '⏰ Duration', value: formatDuration(duration), inline: true },
                    { name: '📝 Reason', value: reason, inline: false },
                    { name: '📅 Ends At', value: `<t:${Math.floor(timeoutUntil.getTime() / 1000)}:F>`, inline: false },
                    { name: '🦄 Friendship Message', value: 'Use this time to reflect and think about how to contribute positively to our community. We believe in your ability to come back better!', inline: false }
                )
                .setFooter({ text: 'Friendship is Magic! • Take time to reflect' })
                .setTimestamp();

            try {
                await targetUser.send({ embeds: [dmEmbed] });
            } catch (dmError) {
                console.log(`Could not send DM to ${targetUser.tag} about timeout.`);
            }

            // Perform the timeout
            await targetMember.timeout(timeoutDuration, reason);

            // Success response
            const successEmbed = new EmbedBuilder()
                .setColor('#ff9800')
                .setTitle('⏰ Member Timed Out Successfully')
                .setDescription(`${targetUser.tag} has been timed out.`)
                .addFields(
                    { name: '👮 Moderator', value: executor.tag, inline: true },
                    { name: '⏰ Duration', value: formatDuration(duration), inline: true },
                    { name: '📝 Reason', value: reason, inline: false },
                    { name: '📅 Ends At', value: `<t:${Math.floor(timeoutUntil.getTime() / 1000)}:F>`, inline: false },
                    { name: '🤔 Reflection Time', value: 'This timeout provides time for reflection and learning. When it ends, welcome them back with friendship!', inline: false }
                )
                .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
                .setFooter({ text: 'Friendship is Magic! • Temporary Reflection' })
                .setTimestamp();

            await interaction.reply({ embeds: [successEmbed] });

            // Log to moderation channel if exists
            const modLogChannel = interaction.guild.channels.cache.find(ch => 
                ch.name.includes('mod-log') || ch.name.includes('audit-log') || ch.name.includes('moderation')
            );

            if (modLogChannel && modLogChannel.isTextBased()) {
                const logEmbed = new EmbedBuilder()
                    .setColor('#ff9800')
                    .setTitle('⏰ Member Timed Out')
                    .addFields(
                        { name: '👤 User', value: `${targetUser.tag} (${targetUser.id})`, inline: true },
                        { name: '👮 Moderator', value: `${executor.tag} (${executor.id})`, inline: true },
                        { name: '📝 Reason', value: reason, inline: false },
                        { name: '⏰ Duration', value: formatDuration(duration), inline: true },
                        { name: '📅 Ends At', value: `<t:${Math.floor(timeoutUntil.getTime() / 1000)}:F>`, inline: true }
                    )
                    .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
                    .setFooter({ text: 'Moderation Log • Friendship is Magic!' })
                    .setTimestamp();

                try {
                    await modLogChannel.send({ embeds: [logEmbed] });
                } catch (logError) {
                    console.error('Could not send timeout log:', logError);
                }
            }

        } catch (error) {
            console.error('Error in timeout command:', error);
            
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff6b6b')
                .setTitle('🚫 Timeout Failed')
                .setDescription('An error occurred while trying to timeout the member.')
                .setFooter({ text: 'Friendship is Magic! • Error Handling' });

            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral });
            } else {
                await interaction.reply({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral });
            }
        }
    },
};
