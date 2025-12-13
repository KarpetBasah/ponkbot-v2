// commands/warn.js
const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits , MessageFlags } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Simple file-based warning system
const warningsFile = path.join(__dirname, '..', 'data', 'warnings.json');

// Ensure data directory exists
const dataDir = path.dirname(warningsFile);
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Load warnings from file
function loadWarnings() {
    try {
        if (fs.existsSync(warningsFile)) {
            const data = fs.readFileSync(warningsFile, 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('Error loading warnings:', error);
    }
    return {};
}

// Save warnings to file
function saveWarnings(warnings) {
    try {
        fs.writeFileSync(warningsFile, JSON.stringify(warnings, null, 2));
    } catch (error) {
        console.error('Error saving warnings:', error);
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Give a member a friendly warning! ⚠️')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to warn')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for the warning')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .setDMPermission(false),
    async execute(interaction) {
        const targetUser = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason');
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
                    .setDescription('You need the **Moderate Members** permission to use this command!')
                    .addFields({
                        name: '🦄 Friendship Guidance',
                        value: 'Only trusted ponies can help guide others back to the path of friendship!',
                        inline: false
                    })
                    .setFooter({ text: 'Friendship is Magic! • Server Moderation' });
                
                return await interaction.reply({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral });
            }

            // Check role hierarchy
            if (targetMember.roles.highest.position >= executorMember.roles.highest.position && executor.id !== interaction.guild.ownerId) {
                const errorEmbed = new EmbedBuilder()
                    .setColor('#ff6b6b')
                    .setTitle('🚫 Role Hierarchy Error')
                    .setDescription(`You cannot warn ${targetUser.tag} because they have a higher or equal role than you!`)
                    .setFooter({ text: 'Friendship is Magic! • Server Moderation' });
                
                return await interaction.reply({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral });
            }

            // Cannot warn server owner
            if (targetUser.id === interaction.guild.ownerId) {
                const errorEmbed = new EmbedBuilder()
                    .setColor('#ff6b6b')
                    .setTitle('🚫 Cannot Warn Server Owner')
                    .setDescription('You cannot warn the server owner!')
                    .addFields({
                        name: '👑 Royal Wisdom',
                        value: 'Princess Celestia guides others, but who guides the princess?',
                        inline: false
                    })
                    .setFooter({ text: 'Friendship is Magic! • Server Moderation' });
                
                return await interaction.reply({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral });
            }

            // Cannot warn yourself
            if (targetUser.id === executor.id) {
                const errorEmbed = new EmbedBuilder()
                    .setColor('#ff6b6b')
                    .setTitle('🚫 Cannot Warn Yourself')
                    .setDescription('You cannot warn yourself!')
                    .addFields({
                        name: '🤔 Self-Reflection',
                        value: 'Self-reflection is good, but official warnings should come from others!',
                        inline: false
                    })
                    .setFooter({ text: 'Friendship is Magic! • Server Moderation' });
                
                return await interaction.reply({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral });
            }

            // Load current warnings
            const warnings = loadWarnings();
            const serverWarnings = warnings[interaction.guild.id] || {};
            const userWarnings = serverWarnings[targetUser.id] || [];

            // Create new warning
            const newWarning = {
                id: Date.now(),
                reason: reason,
                moderator: executor.tag,
                moderatorId: executor.id,
                timestamp: Date.now(),
                guildId: interaction.guild.id,
                guildName: interaction.guild.name
            };

            // Add warning to user's record
            userWarnings.push(newWarning);
            serverWarnings[targetUser.id] = userWarnings;
            warnings[interaction.guild.id] = serverWarnings;

            // Save warnings
            saveWarnings(warnings);

            const warningCount = userWarnings.length;

            // Try to send DM to user
            const dmEmbed = new EmbedBuilder()
                .setColor('#ff9800')
                .setTitle('⚠️ You Have Received a Warning')
                .setDescription(`You have received a warning in **${interaction.guild.name}**`)
                .addFields(
                    { name: '👮 Moderator', value: executor.tag, inline: true },
                    { name: '📝 Reason', value: reason, inline: true },
                    { name: '📊 Total Warnings', value: warningCount.toString(), inline: true },
                    { name: '🦄 Friendship Reminder', value: 'This is a gentle reminder to follow the server rules and be kind to everypony. We believe in your ability to learn and grow!', inline: false }
                )
                .setFooter({ text: 'Friendship is Magic! • Learn from this experience' })
                .setTimestamp();

            try {
                await targetUser.send({ embeds: [dmEmbed] });
            } catch (dmError) {
                console.log(`Could not send DM to ${targetUser.tag} about warning.`);
            }

            // Determine warning level message
            let warningLevelMessage = '';
            let embedColor = '#ff9800';

            if (warningCount === 1) {
                warningLevelMessage = '🌟 First warning - A gentle reminder to stay on the path of friendship!';
            } else if (warningCount === 2) {
                warningLevelMessage = '⚠️ Second warning - Please be more mindful of the server rules.';
            } else if (warningCount === 3) {
                warningLevelMessage = '🚨 Third warning - Consider this a serious reminder. Further violations may result in stronger action.';
                embedColor = '#ff6b6b';
            } else {
                warningLevelMessage = `🔴 ${warningCount} warnings - This member may need additional guidance or action.`;
                embedColor = '#d32f2f';
            }

            // Success response
            const successEmbed = new EmbedBuilder()
                .setColor(embedColor)
                .setTitle('⚠️ Warning Issued Successfully')
                .setDescription(`${targetUser.tag} has been warned.`)
                .addFields(
                    { name: '👮 Moderator', value: executor.tag, inline: true },
                    { name: '📝 Reason', value: reason, inline: true },
                    { name: '📊 Total Warnings', value: warningCount.toString(), inline: true },
                    { name: '🎯 Warning Level', value: warningLevelMessage, inline: false }
                )
                .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
                .setFooter({ text: 'Friendship is Magic! • Guidance with Kindness' })
                .setTimestamp();

            await interaction.reply({ embeds: [successEmbed] });

            // Log to moderation channel if exists
            const modLogChannel = interaction.guild.channels.cache.find(ch => 
                ch.name.includes('mod-log') || ch.name.includes('audit-log') || ch.name.includes('moderation')
            );

            if (modLogChannel && modLogChannel.isTextBased()) {
                const logEmbed = new EmbedBuilder()
                    .setColor(embedColor)
                    .setTitle('⚠️ Warning Issued')
                    .addFields(
                        { name: '👤 User', value: `${targetUser.tag} (${targetUser.id})`, inline: true },
                        { name: '👮 Moderator', value: `${executor.tag} (${executor.id})`, inline: true },
                        { name: '📝 Reason', value: reason, inline: false },
                        { name: '📊 Total Warnings', value: warningCount.toString(), inline: true },
                        { name: '📅 Date', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
                    )
                    .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
                    .setFooter({ text: 'Moderation Log • Friendship is Magic!' })
                    .setTimestamp();

                try {
                    await modLogChannel.send({ embeds: [logEmbed] });
                } catch (logError) {
                    console.error('Could not send warning log:', logError);
                }
            }

        } catch (error) {
            console.error('Error in warn command:', error);
            
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff6b6b')
                .setTitle('🚫 Warning Failed')
                .setDescription('An error occurred while trying to warn the member.')
                .setFooter({ text: 'Friendship is Magic! • Error Handling' });

            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral });
            } else {
                await interaction.reply({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral });
            }
        }
    },
};
