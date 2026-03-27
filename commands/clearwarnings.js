// commands/clearwarnings.js
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

function saveWarnings(warnings) {
    try {
        fs.writeFileSync(warningsFile, JSON.stringify(warnings, null, 2));
    } catch (error) {
        console.error('Error saving warnings:', error);
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clearwarnings')
        .setDescription('Clear all warnings for a user!')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to clear warnings for')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for clearing warnings')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
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

            const executorMember = await interaction.guild.members.fetch(executor.id);

            // Check permissions - requires Administrator for clearing warnings
            if (!executorMember.permissions.has(PermissionFlagsBits.Administrator)) {
                const errorEmbed = new EmbedBuilder()
                    .setColor('#ff6b6b')
                    .setTitle('🚫 Insufficient Permissions')
                    .setDescription('You need **Administrator** permissions to clear warnings!')
                    .addFields({
                        name: '🦄 High Responsibility',
                        value: 'Clearing warnings is a serious action that requires the highest level of trust!',
                        inline: false
                    })
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
                    .setTitle('🧹 No Warnings to Clear')
                    .setDescription(`${targetUser.tag} has no warnings in this server!`)
                    .addFields({
                        name: '🌟 Clean Record',
                        value: 'This pony already has a spotless record!',
                        inline: false
                    })
                    .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
                    .setFooter({ text: 'Friendship is Magic! • Already Perfect!' })
                    .setTimestamp();

                return await interaction.reply({ embeds: [noWarningsEmbed] });
            }

            const warningCount = userWarnings.length;

            // Clear the warnings
            delete serverWarnings[targetUser.id];
            warnings[interaction.guild.id] = serverWarnings;
            saveWarnings(warnings);

            // Try to send DM to user
            const dmEmbed = new EmbedBuilder()
                .setColor('#4caf50')
                .setTitle('🧹 Warnings Cleared!')
                .setDescription(`Great news! All your warnings in **${interaction.guild.name}** have been cleared!`)
                .addFields(
                    { name: '👮 Cleared by', value: executor.tag, inline: true },
                    { name: '📝 Reason', value: reason, inline: true },
                    { name: '🗑️ Warnings Removed', value: warningCount.toString(), inline: true },
                    { name: '🦄 Fresh Start Message', value: 'You now have a clean slate! This is a fresh beginning - use this opportunity to continue being a positive member of our community.', inline: false },
                    { name: '🌟 Keep It Up', value: 'Remember the lessons learned and keep making our server a better place for everypony!', inline: false }
                )
                .setFooter({ text: 'Friendship is Magic! • Fresh start!' })
                .setTimestamp();

            try {
                await targetUser.send({ embeds: [dmEmbed] });
            } catch (dmError) {
                console.log(`Could not send DM to ${targetUser.tag} about warning clearance.`);
            }

            // Success response
            const successEmbed = new EmbedBuilder()
                .setColor('#4caf50')
                .setTitle('🧹 Warnings Cleared Successfully')
                .setDescription(`All warnings for ${targetUser.tag} have been cleared.`)
                .addFields(
                    { name: '👮 Administrator', value: executor.tag, inline: true },
                    { name: '📝 Reason', value: reason, inline: true },
                    { name: '🗑️ Warnings Removed', value: warningCount.toString(), inline: true },
                    { name: '🌈 Fresh Slate', value: 'This member now has a completely clean record. Sometimes everypony deserves a fresh start!', inline: false }
                )
                .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
                .setFooter({ text: 'Friendship is Magic! • Clean Slate' })
                .setTimestamp();

            await interaction.reply({ embeds: [successEmbed] });

            // Log to moderation channel if exists
            const modLogChannel = interaction.guild.channels.cache.find(ch => 
                ch.name.includes('mod-log') || ch.name.includes('audit-log') || ch.name.includes('moderation')
            );

            if (modLogChannel && modLogChannel.isTextBased()) {
                const logEmbed = new EmbedBuilder()
                    .setColor('#4caf50')
                    .setTitle('🧹 Warnings Cleared')
                    .addFields(
                        { name: '👤 User', value: `${targetUser.tag} (${targetUser.id})`, inline: true },
                        { name: '👮 Administrator', value: `${executor.tag} (${executor.id})`, inline: true },
                        { name: '📝 Reason', value: reason, inline: false },
                        { name: '🗑️ Warnings Removed', value: warningCount.toString(), inline: true },
                        { name: '📅 Date', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
                    )
                    .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
                    .setFooter({ text: 'Moderation Log • Friendship is Magic!' })
                    .setTimestamp();

                try {
                    await modLogChannel.send({ embeds: [logEmbed] });
                } catch (logError) {
                    console.error('Could not send clear warnings log:', logError);
                }
            }

        } catch (error) {
            console.error('Error in clearwarnings command:', error);
            
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff6b6b')
                .setTitle('🚫 Clear Warnings Failed')
                .setDescription('An error occurred while trying to clear the warnings.')
                .setFooter({ text: 'Friendship is Magic! • Error Handling' });

            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral });
            } else {
                await interaction.reply({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral });
            }
        }
    },
};
