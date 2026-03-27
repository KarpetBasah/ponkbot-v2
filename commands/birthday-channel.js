// commands/birthday-channel.js
const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ChannelType, MessageFlags } = require('discord.js');
const fs = require('fs');
const path = require('path');

const configFile = path.join(__dirname, '..', 'data', 'birthday-config.json');

function loadConfig() {
    try {
        if (fs.existsSync(configFile)) {
            return JSON.parse(fs.readFileSync(configFile, 'utf8'));
        }
    } catch (error) {
        console.error('Error loading birthday config:', error);
    }
    return {};
}

function saveConfig(config) {
    try {
        fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
    } catch (error) {
        console.error('Error saving birthday config:', error);
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('birthday-channel')
        .setDescription('Configure the channel for birthday announcements!')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .setDMPermission(false)
        .addSubcommand(sub =>
            sub.setName('set')
                .setDescription('Set a channel for birthday announcements')
                .addChannelOption(option =>
                    option.setName('channel')
                        .setDescription('The text channel to send birthday messages in')
                        .addChannelTypes(ChannelType.GuildText)
                        .setRequired(true)
                )
        )
        .addSubcommand(sub =>
            sub.setName('remove')
                .setDescription('Remove the configured birthday channel (will auto-detect instead)')
        )
        .addSubcommand(sub =>
            sub.setName('check')
                .setDescription('Check the current birthday channel setting')
        ),

    async execute(interaction) {
        const sub = interaction.options.getSubcommand();
        const config = loadConfig();
        const guildId = interaction.guild.id;

        if (sub === 'set') {
            const channel = interaction.options.getChannel('channel');

            // Check bot has permission to send in that channel
            const botMember = interaction.guild.members.me;
            if (!channel.permissionsFor(botMember).has(PermissionFlagsBits.SendMessages)) {
                return await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('#ff6b6b')
                            .setTitle('❌ Missing Permissions')
                            .setDescription(`I don't have permission to send messages in ${channel}! Please give me access first.`)
                    ],
                    flags: MessageFlags.Ephemeral
                });
            }

            // Ensure guild config exists and preserve existing keys (e.g. roleId)
            if (!config[guildId]) config[guildId] = {};
            if (typeof config[guildId] === 'string') config[guildId] = { channelId: config[guildId] };
            config[guildId].channelId = channel.id;
            saveConfig(config);

            await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#ff1493')
                        .setTitle('🎂 Birthday Channel Set!')
                        .setDescription(`*bounces excitedly*\n\nAll birthday celebrations will now be announced in ${channel}! Get ready for PARTIES! 🎉`)
                        .addFields(
                            { name: '📢 Channel', value: `${channel}`, inline: true },
                            { name: '✅ Status', value: 'Active', inline: true }
                        )
                        .setFooter({ text: `Set by ${interaction.user.username}` })
                        .setTimestamp()
                ]
            });

            console.log(`🎂 Birthday channel set to #${channel.name} in ${interaction.guild.name}`);

        } else if (sub === 'remove') {
            if (typeof config[guildId] === 'string') config[guildId] = { channelId: config[guildId] };
            if (!config[guildId]?.channelId) {
                return await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('#ffaa00')
                            .setTitle('⚠️ No Channel Configured')
                            .setDescription('There is no birthday channel set for this server! I was already using auto-detection.')
                    ],
                    flags: MessageFlags.Ephemeral
                });
            }

            delete config[guildId].channelId;
            saveConfig(config);

            await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#ffaa00')
                        .setTitle('🗑️ Birthday Channel Removed')
                        .setDescription('The birthday channel setting has been removed. I will now auto-detect a suitable channel (looking for channels named `birthday`, `party`, `celebration`, or `general`).')
                        .setFooter({ text: `Removed by ${interaction.user.username}` })
                        .setTimestamp()
                ]
            });

            console.log(`🎂 Birthday channel removed for ${interaction.guild.name}`);

        } else if (sub === 'check') {
            if (typeof config[guildId] === 'string') config[guildId] = { channelId: config[guildId] };
            const channelId = config[guildId]?.channelId;

            if (!channelId) {
                return await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('#87ceeb')
                            .setTitle('🔍 Birthday Channel Status')
                            .setDescription('No specific channel has been set for this server.\n\nPinkie will auto-detect a channel named `birthday`, `party`, `celebration`, or `general`.')
                            .addFields({ name: '⚙️ Mode', value: 'Auto-detection', inline: true })
                            .setFooter({ text: `Use /birthday-channel set to configure one!` })
                    ],
                    flags: MessageFlags.Ephemeral
                });
            }

            const channel = interaction.guild.channels.cache.get(channelId);

            if (!channel) {
                return await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('#ff6b6b')
                            .setTitle('⚠️ Configured Channel Not Found')
                            .setDescription(`The configured channel (ID: \`${channelId}\`) no longer exists! Please set a new one with \`/birthday-channel set\`.`)
                    ],
                    flags: MessageFlags.Ephemeral
                });
            }

            await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#ff1493')
                        .setTitle('🎂 Birthday Channel Status')
                        .setDescription(`Birthday announcements are configured for this server!`)
                        .addFields(
                            { name: '📢 Channel', value: `${channel}`, inline: true },
                            { name: '✅ Status', value: 'Active', inline: true }
                        )
                        .setFooter({ text: `Use /birthday-channel remove to reset to auto-detection` })
                ],
                flags: MessageFlags.Ephemeral
            });
        }
    }
};
