// commands/warnings.js
const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits , MessageFlags } = require('discord.js');
const fs = require('fs');
const path = require('path');

const warningsFile = path.join(__dirname, '..', 'data', 'warnings.json');

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

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warnings')
        .setDescription('View warnings for a user! 📋')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to check warnings for')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .setDMPermission(false),
    async execute(interaction) {
        const targetUser = interaction.options.getUser('user');
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
            if (!executorMember.permissions.has(PermissionFlagsBits.ModerateMembers)) {
                const errorEmbed = new EmbedBuilder()
                    .setColor('#ff6b6b')
                    .setTitle('🚫 Insufficient Permissions')
                    .setDescription('You need the **Moderate Members** permission to view warnings!')
                    .setFooter({ text: 'Friendship is Magic! • Server Moderation' });
                
                return await interaction.reply({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral });
            }

            // Load warnings
            const warnings = loadWarnings();
            const serverWarnings = warnings[interaction.guild.id] || {};
            const userWarnings = serverWarnings[targetUser.id] || [];

            if (userWarnings.length === 0) {
                const noWarningsEmbed = new EmbedBuilder()
                    .setColor('#4caf50')
                    .setTitle('📋 Warning History')
                    .setDescription(`${targetUser.tag} has no warnings in this server! 🌟`)
                    .addFields({
                        name: '🦄 Clean Record',
                        value: 'This pony has been following the friendship guidelines perfectly!',
                        inline: false
                    })
                    .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
                    .setFooter({ text: 'Friendship is Magic! • Keep up the good work!' })
                    .setTimestamp();

                return await interaction.reply({ embeds: [noWarningsEmbed] });
            }

            // Sort warnings by timestamp (newest first)
            const sortedWarnings = userWarnings.sort((a, b) => b.timestamp - a.timestamp);

            // Create warning embed
            let embedColor = '#ff9800';
            if (userWarnings.length >= 3) embedColor = '#ff6b6b';
            if (userWarnings.length >= 5) embedColor = '#d32f2f';

            const warningsEmbed = new EmbedBuilder()
                .setColor(embedColor)
                .setTitle('📋 Warning History')
                .setDescription(`${targetUser.tag} has **${userWarnings.length}** warning(s) in this server.`)
                .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
                .setFooter({ text: `Friendship is Magic! • Total: ${userWarnings.length} warning(s)` })
                .setTimestamp();

            // Add warning fields (limit to 10 most recent to avoid embed limits)
            const recentWarnings = sortedWarnings.slice(0, 10);
            
            recentWarnings.forEach((warning, index) => {
                const date = new Date(warning.timestamp);
                const warningNumber = sortedWarnings.length - index;
                
                warningsEmbed.addFields({
                    name: `⚠️ Warning #${warningNumber}`,
                    value: `**Reason:** ${warning.reason}\n**Moderator:** ${warning.moderator}\n**Date:** ${date.toLocaleDateString()} ${date.toLocaleTimeString()}`,
                    inline: false
                });
            });

            if (sortedWarnings.length > 10) {
                warningsEmbed.addFields({
                    name: '📋 Note',
                    value: `Only showing the 10 most recent warnings. Total: ${sortedWarnings.length}`,
                    inline: false
                });
            }

            // Add severity assessment
            let severityMessage = '';
            if (userWarnings.length === 1) {
                severityMessage = '🌟 One warning - Minor concern, likely just a reminder.';
            } else if (userWarnings.length === 2) {
                severityMessage = '⚠️ Two warnings - Moderate concern, keep an eye on this user.';
            } else if (userWarnings.length === 3) {
                severityMessage = '🚨 Three warnings - Significant concern, consider additional action.';
            } else {
                severityMessage = `🔴 ${userWarnings.length} warnings - High concern, this user may need immediate attention.`;
            }

            warningsEmbed.addFields({
                name: '🎯 Severity Assessment',
                value: severityMessage,
                inline: false
            });

            await interaction.reply({ embeds: [warningsEmbed] });

        } catch (error) {
            console.error('Error in warnings command:', error);
            
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff6b6b')
                .setTitle('🚫 Error Loading Warnings')
                .setDescription('An error occurred while trying to load the warning history.')
                .setFooter({ text: 'Friendship is Magic! • Error Handling' });

            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral });
            } else {
                await interaction.reply({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral });
            }
        }
    },
};
