// commands/birthday-role.js
const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
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
        .setName('birthday-role')
        .setDescription('Configure the role automatically given to members on their birthday!')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
        .setDMPermission(false)
        .addSubcommand(sub =>
            sub.setName('set')
                .setDescription('Set a role to be given to birthday members for 24 hours')
                .addRoleOption(option =>
                    option.setName('role')
                        .setDescription('The role to give to the birthday person')
                        .setRequired(true)
                )
        )
        .addSubcommand(sub =>
            sub.setName('remove')
                .setDescription('Remove the configured birthday role')
        )
        .addSubcommand(sub =>
            sub.setName('check')
                .setDescription('Check the current birthday role setting')
        ),

    async execute(interaction) {
        const sub = interaction.options.getSubcommand();
        const config = loadConfig();
        const guildId = interaction.guild.id;

        // Ensure guild config exists
        if (!config[guildId]) config[guildId] = {};
        // Handle legacy flat structure (channel stored as string)
        if (typeof config[guildId] === 'string') {
            config[guildId] = { channelId: config[guildId] };
        }

        if (sub === 'set') {
            const role = interaction.options.getRole('role');

            // Check bot's highest role is above the target role
            const botMember = interaction.guild.members.me;
            if (botMember.roles.highest.comparePositionTo(role) <= 0) {
                return await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('#ff6b6b')
                            .setTitle('❌ Role Hierarchy Issue')
                            .setDescription(`I can't assign **${role.name}** because it's positioned at or above my highest role!\n\nPlease move my role above **${role.name}** in **Server Settings → Roles**.`)
                    ],
                    flags: MessageFlags.Ephemeral
                });
            }

            // Prevent managed roles (bot roles, integration roles)
            if (role.managed) {
                return await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('#ff6b6b')
                            .setTitle('❌ Cannot Use This Role')
                            .setDescription(`**${role.name}** is a managed role (bot or integration role) and cannot be assigned manually.`)
                    ],
                    flags: MessageFlags.Ephemeral
                });
            }

            config[guildId].roleId = role.id;
            saveConfig(config);

            await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#ff1493')
                        .setTitle('🎭 Birthday Role Set!')
                        .setDescription(`*claps hooves excitedly*\n\nMembers will now automatically receive the birthday role for 24 hours on their special day!`)
                        .addFields(
                            { name: '🎭 Role', value: `${role}`, inline: true },
                            { name: '⏰ Duration', value: '24 hours', inline: true },
                            { name: '⚙️ Status', value: 'Active', inline: true }
                        )
                        .setFooter({ text: `Set by ${interaction.user.username}` })
                        .setTimestamp()
                ]
            });

            console.log(`🎭 Birthday role set to @${role.name} in ${interaction.guild.name}`);

        } else if (sub === 'remove') {
            if (!config[guildId]?.roleId) {
                return await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('#ffaa00')
                            .setTitle('⚠️ No Role Configured')
                            .setDescription('There is no birthday role set for this server.')
                    ],
                    flags: MessageFlags.Ephemeral
                });
            }

            delete config[guildId].roleId;
            saveConfig(config);

            await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#ffaa00')
                        .setTitle('🗑️ Birthday Role Removed')
                        .setDescription('The birthday role setting has been removed. No role will be assigned to birthday members anymore.')
                        .setFooter({ text: `Removed by ${interaction.user.username}` })
                        .setTimestamp()
                ]
            });

            console.log(`🎭 Birthday role removed for ${interaction.guild.name}`);

        } else if (sub === 'check') {
            const roleId = config[guildId]?.roleId;

            if (!roleId) {
                return await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('#87ceeb')
                            .setTitle('🔍 Birthday Role Status')
                            .setDescription('No birthday role has been configured for this server.\n\nUse `/birthday-role set` to configure one!')
                            .addFields({ name: '⚙️ Status', value: 'Not configured', inline: true })
                    ],
                    flags: MessageFlags.Ephemeral
                });
            }

            const role = interaction.guild.roles.cache.get(roleId);

            if (!role) {
                return await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('#ff6b6b')
                            .setTitle('⚠️ Configured Role Not Found')
                            .setDescription(`The configured role (ID: \`${roleId}\`) no longer exists! Please set a new one with \`/birthday-role set\`.`)
                    ],
                    flags: MessageFlags.Ephemeral
                });
            }

            const botMember = interaction.guild.members.me;
            const canAssign = botMember.roles.highest.comparePositionTo(role) > 0;

            await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#ff1493')
                        .setTitle('🎭 Birthday Role Status')
                        .setDescription('A birthday role is configured for this server!')
                        .addFields(
                            { name: '🎭 Role', value: `${role}`, inline: true },
                            { name: '⏰ Duration', value: '24 hours', inline: true },
                            { name: '⚙️ Status', value: canAssign ? '✅ Ready' : '⚠️ Bot role too low!', inline: true }
                        )
                        .setFooter({ text: canAssign ? 'Use /birthday-role remove to disable' : 'Fix: Move bot\'s role above the birthday role!' })
                ],
                flags: MessageFlags.Ephemeral
            });
        }
    }
};
