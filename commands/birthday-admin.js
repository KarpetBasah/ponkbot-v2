// commands/birthday-admin.js
const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const fs = require('fs');
const path = require('path');

const birthdaysFile = path.join(__dirname, '..', 'data', 'birthdays.json');

function loadBirthdays() {
    try {
        if (fs.existsSync(birthdaysFile)) {
            return JSON.parse(fs.readFileSync(birthdaysFile, 'utf8'));
        }
    } catch (error) {
        console.error('Error loading birthdays:', error);
    }
    return {};
}

function saveBirthdays(birthdays) {
    try {
        const dataDir = path.dirname(birthdaysFile);
        if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
        fs.writeFileSync(birthdaysFile, JSON.stringify(birthdays, null, 2));
    } catch (error) {
        console.error('Error saving birthdays:', error);
    }
}

function isValidDate(day, month) {
    const daysInMonth = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    if (month < 1 || month > 12) return false;
    if (day < 1 || day > daysInMonth[month - 1]) return false;
    return true;
}

const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('birthday-admin')
        .setDescription('Admin tools to manage birthday data for any server member')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDMPermission(false)

        // --- ADD ---
        .addSubcommand(sub =>
            sub.setName('add')
                .setDescription('Add or overwrite a birthday entry for a member')
                .addUserOption(o =>
                    o.setName('user')
                        .setDescription('The member to add a birthday for')
                        .setRequired(true))
                .addIntegerOption(o =>
                    o.setName('day')
                        .setDescription('Birthday day (1-31)')
                        .setRequired(true)
                        .setMinValue(1)
                        .setMaxValue(31))
                .addIntegerOption(o =>
                    o.setName('month')
                        .setDescription('Birthday month (1-12)')
                        .setRequired(true)
                        .setMinValue(1)
                        .setMaxValue(12))
                .addIntegerOption(o =>
                    o.setName('year')
                        .setDescription('Birth year (optional)')
                        .setRequired(false)
                        .setMinValue(1900)
                        .setMaxValue(new Date().getFullYear()))
        )

        // --- EDIT ---
        .addSubcommand(sub =>
            sub.setName('edit')
                .setDescription('Edit the birthday date of an existing entry')
                .addUserOption(o =>
                    o.setName('user')
                        .setDescription('The member whose birthday to edit')
                        .setRequired(true))
                .addIntegerOption(o =>
                    o.setName('day')
                        .setDescription('New birthday day (1-31)')
                        .setRequired(false)
                        .setMinValue(1)
                        .setMaxValue(31))
                .addIntegerOption(o =>
                    o.setName('month')
                        .setDescription('New birthday month (1-12)')
                        .setRequired(false)
                        .setMinValue(1)
                        .setMaxValue(12))
                .addIntegerOption(o =>
                    o.setName('year')
                        .setDescription('New birth year')
                        .setRequired(false)
                        .setMinValue(1900)
                        .setMaxValue(new Date().getFullYear()))
        )

        // --- DELETE ---
        .addSubcommand(sub =>
            sub.setName('delete')
                .setDescription('Delete a birthday entry for a member')
                .addUserOption(o =>
                    o.setName('user')
                        .setDescription('The member whose birthday to delete')
                        .setRequired(true))
        )

        // --- VIEW ---
        .addSubcommand(sub =>
            sub.setName('view')
                .setDescription('View the stored birthday data for a member')
                .addUserOption(o =>
                    o.setName('user')
                        .setDescription('The member to look up')
                        .setRequired(true))
        ),

    async execute(interaction) {
        const sub = interaction.options.getSubcommand();
        const targetUser = interaction.options.getUser('user');
        const guildId = interaction.guild.id;

        const birthdays = loadBirthdays();
        if (!birthdays[guildId]) birthdays[guildId] = {};

        // ── ADD ──────────────────────────────────────────────────────────────
        if (sub === 'add') {
            const day   = interaction.options.getInteger('day');
            const month = interaction.options.getInteger('month');
            const year  = interaction.options.getInteger('year');

            if (!isValidDate(day, month)) {
                return await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('#ff6b6b')
                            .setTitle('❌ Invalid Date')
                            .setDescription(`**${day}/${month}** is not a valid calendar date. Please double-check the day and month.`)
                    ],
                    flags: MessageFlags.Ephemeral
                });
            }

            const existing = birthdays[guildId][targetUser.id];
            const isOverwrite = !!existing;

            birthdays[guildId][targetUser.id] = {
                day,
                month,
                ...(year && { year }),
                username: targetUser.username,
                registeredAt: existing?.registeredAt ?? Date.now(),
                updatedAt: Date.now(),
                addedBy: interaction.user.id
            };

            saveBirthdays(birthdays);

            const dateStr = `${MONTH_NAMES[month - 1]} ${day}${year ? `, ${year}` : ''}`;

            await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#ff1493')
                        .setTitle(isOverwrite ? '✏️ Birthday Updated!' : '🎂 Birthday Added!')
                        .setDescription(isOverwrite
                            ? `The birthday for ${targetUser} has been **overwritten**.`
                            : `A birthday entry has been created for ${targetUser}!`)
                        .addFields(
                            { name: '👤 Member', value: `${targetUser} (${targetUser.username})`, inline: true },
                            { name: '📅 Birthday', value: dateStr, inline: true },
                            { name: '🛠️ Added by', value: `${interaction.user}`, inline: true }
                        )
                        .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
                        .setFooter({ text: 'Birthday Admin • Pinkie Pie Birthday System' })
                        .setTimestamp()
                ]
            });

            console.log(`🎂 [Admin] ${interaction.user.username} ${isOverwrite ? 'updated' : 'added'} birthday for ${targetUser.username}: ${day}/${month}${year ? `/${year}` : ''}`);

        // ── EDIT ─────────────────────────────────────────────────────────────
        } else if (sub === 'edit') {
            const entry = birthdays[guildId][targetUser.id];

            if (!entry) {
                return await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('#ffaa00')
                            .setTitle('⚠️ No Entry Found')
                            .setDescription(`${targetUser} doesn't have a birthday entry yet.\nUse \`/birthday-admin add\` to create one.`)
                    ],
                    flags: MessageFlags.Ephemeral
                });
            }

            const newDay   = interaction.options.getInteger('day')   ?? entry.day;
            const newMonth = interaction.options.getInteger('month') ?? entry.month;
            const newYear  = interaction.options.getInteger('year')  ?? entry.year ?? null;

            // Require at least one field
            if (!interaction.options.getInteger('day') && !interaction.options.getInteger('month') && !interaction.options.getInteger('year')) {
                return await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('#ffaa00')
                            .setTitle('⚠️ Nothing to Edit')
                            .setDescription('Please provide at least one field to change: `day`, `month`, or `year`.')
                    ],
                    flags: MessageFlags.Ephemeral
                });
            }

            if (!isValidDate(newDay, newMonth)) {
                return await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('#ff6b6b')
                            .setTitle('❌ Invalid Date')
                            .setDescription(`**${newDay}/${newMonth}** is not a valid calendar date.`)
                    ],
                    flags: MessageFlags.Ephemeral
                });
            }

            const oldDateStr = `${MONTH_NAMES[entry.month - 1]} ${entry.day}${entry.year ? `, ${entry.year}` : ''}`;

            birthdays[guildId][targetUser.id] = {
                ...entry,
                day: newDay,
                month: newMonth,
                ...(newYear ? { year: newYear } : {}),
                username: targetUser.username,
                updatedAt: Date.now(),
                editedBy: interaction.user.id
            };
            if (!newYear) delete birthdays[guildId][targetUser.id].year;

            saveBirthdays(birthdays);

            const newDateStr = `${MONTH_NAMES[newMonth - 1]} ${newDay}${newYear ? `, ${newYear}` : ''}`;

            await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#00b4d8')
                        .setTitle('✏️ Birthday Edited!')
                        .addFields(
                            { name: '👤 Member', value: `${targetUser} (${targetUser.username})`, inline: true },
                            { name: '📅 Old Date', value: oldDateStr, inline: true },
                            { name: '🆕 New Date', value: newDateStr, inline: true },
                            { name: '🛠️ Edited by', value: `${interaction.user}`, inline: true }
                        )
                        .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
                        .setFooter({ text: 'Birthday Admin • Pinkie Pie Birthday System' })
                        .setTimestamp()
                ]
            });

            console.log(`🎂 [Admin] ${interaction.user.username} edited birthday for ${targetUser.username}: ${oldDateStr} → ${newDateStr}`);

        // ── DELETE ───────────────────────────────────────────────────────────
        } else if (sub === 'delete') {
            const entry = birthdays[guildId][targetUser.id];

            if (!entry) {
                return await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('#ffaa00')
                            .setTitle('⚠️ No Entry Found')
                            .setDescription(`${targetUser} doesn't have a birthday entry in this server.`)
                    ],
                    flags: MessageFlags.Ephemeral
                });
            }

            const dateStr = `${MONTH_NAMES[entry.month - 1]} ${entry.day}${entry.year ? `, ${entry.year}` : ''}`;

            delete birthdays[guildId][targetUser.id];
            saveBirthdays(birthdays);

            await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#ff6b6b')
                        .setTitle('🗑️ Birthday Deleted')
                        .setDescription(`The birthday entry for ${targetUser} has been removed.`)
                        .addFields(
                            { name: '👤 Member', value: `${targetUser} (${targetUser.username})`, inline: true },
                            { name: '📅 Removed Date', value: dateStr, inline: true },
                            { name: '🛠️ Deleted by', value: `${interaction.user}`, inline: true }
                        )
                        .setFooter({ text: 'Birthday Admin • Pinkie Pie Birthday System' })
                        .setTimestamp()
                ]
            });

            console.log(`🎂 [Admin] ${interaction.user.username} deleted birthday for ${targetUser.username} (${dateStr})`);

        // ── VIEW ─────────────────────────────────────────────────────────────
        } else if (sub === 'view') {
            const entry = birthdays[guildId][targetUser.id];

            if (!entry) {
                return await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('#87ceeb')
                            .setTitle('🔍 No Birthday Entry')
                            .setDescription(`${targetUser} hasn't registered a birthday yet in this server.`)
                            .setFooter({ text: 'Use /birthday-admin add to create one' })
                    ],
                    flags: MessageFlags.Ephemeral
                });
            }

            const dateStr = `${MONTH_NAMES[entry.month - 1]} ${entry.day}${entry.year ? `, ${entry.year}` : ''}`;
            const registeredAt = entry.registeredAt ? `<t:${Math.floor(entry.registeredAt / 1000)}:R>` : 'Unknown';
            const updatedAt = entry.updatedAt ? `<t:${Math.floor(entry.updatedAt / 1000)}:R>` : 'Never';

            // Calculate age if year is provided
            let ageInfo = 'Not provided';
            if (entry.year) {
                const today = new Date();
                let age = today.getFullYear() - entry.year;
                const hasBirthdayPassed = today.getMonth() + 1 > entry.month ||
                    (today.getMonth() + 1 === entry.month && today.getDate() >= entry.day);
                if (!hasBirthdayPassed) age--;
                ageInfo = `${age} years old`;
            }

            await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#ff1493')
                        .setTitle(`🎂 Birthday Data — ${targetUser.username}`)
                        .addFields(
                            { name: '👤 Member', value: `${targetUser}`, inline: true },
                            { name: '📅 Birthday', value: dateStr, inline: true },
                            { name: '🎂 Current Age', value: ageInfo, inline: true },
                            { name: '🕐 Registered', value: registeredAt, inline: true },
                            { name: '✏️ Last Updated', value: updatedAt, inline: true }
                        )
                        .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
                        .setFooter({ text: 'Birthday Admin • Pinkie Pie Birthday System' })
                        .setTimestamp()
                ],
                flags: MessageFlags.Ephemeral
            });
        }
    }
};
