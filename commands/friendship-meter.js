// commands/friendship-meter.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const titles = [
    { min: 0,  max: 15,  label: 'Strangers in Ponyville',    icon: '😶', color: '#aaaaaa', note: 'You two have barely crossed paths! But every great friendship has to start somewhere.' },
    { min: 16, max: 30,  label: 'Acquaintances',              icon: '👋', color: '#c8a87a', note: 'You know each other\'s names at least! There\'s a spark of potential here.' },
    { min: 31, max: 45,  label: 'Friendly Neighbors',         icon: '🏠', color: '#7ec8a0', note: 'You wave when you pass each other. That counts for something!' },
    { min: 46, max: 60,  label: 'Blossoming Friendship',      icon: '🌸', color: '#f4a0c8', note: 'Something special is growing here! Water it with kindness and fun!' },
    { min: 61, max: 74,  label: 'Good Friends',               icon: '🤝', color: '#79c9e8', note: 'Solid and reliable. Applejack would approve of this honest friendship!' },
    { min: 75, max: 84,  label: 'Great Friends',              icon: '🎉', color: '#a57ee8', note: 'Rainbow Dash levels of loyalty! You\'ve got each other\'s backs.' },
    { min: 85, max: 93,  label: 'Super Close Friends',        icon: '💜', color: '#f06292', note: 'Almost like family! Rarity would say your bond is *fabulous*.' },
    { min: 94, max: 99,  label: 'Best Friends Forever',       icon: '💖', color: '#ff69b4', note: 'EEEEE! This is the kind of friendship that saves all of Equestria!' },
    { min: 100, max: 100, label: 'THE Magic of Friendship ✨', icon: '🌈', color: '#ffd700', note: 'THIS IS IT! The LEGENDARY 100%! You two together could literally cause a rainbow to appear!' }
];

function buildProgressBar(percent) {
    const total = 20;
    const filled = Math.round((percent / 100) * total);
    const empty = total - filled;
    return '█'.repeat(filled) + '░'.repeat(empty);
}

function getTier(percent) {
    return titles.find(t => percent >= t.min && percent <= t.max) || titles[0];
}

// Deterministic-ish score based on user IDs (same pair always same result)
function calculateScore(id1, id2) {
    const combined = (BigInt(id1) ^ BigInt(id2)).toString();
    let hash = 0;
    for (const ch of combined) {
        hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
    }
    return hash % 101; // 0–100
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('friendship-meter')
        .setDescription('Check the friendship compatibility between two ponies!')
        .addUserOption(option =>
            option.setName('user1')
                .setDescription('First friend')
                .setRequired(true))
        .addUserOption(option =>
            option.setName('user2')
                .setDescription('Second friend (leave empty to check with yourself!)')
                .setRequired(false)),
    async execute(interaction) {
        const user1 = interaction.options.getUser('user1');
        const user2 = interaction.options.getUser('user2') || interaction.user;

        if (user1.id === user2.id) {
            const selfEmbed = new EmbedBuilder()
                .setColor('#ff69b4')
                .setTitle('💖 Self-Friendship Check!')
                .setDescription(`*giggles* You picked the same pony twice, ${interaction.user.username}!\n\nBut you know what? Loving yourself is the FIRST step to a great friendship! That's what Pinkie Pie always says!`)
                .setFooter({ text: 'Pinkie\'s Friendship Meter • You are your own best friend! 🎀' });
            return await interaction.reply({ embeds: [selfEmbed] });
        }

        const score = calculateScore(user1.id, user2.id);
        const tier = getTier(score);
        const bar = buildProgressBar(score);

        const embed = new EmbedBuilder()
            .setColor(tier.color)
            .setTitle('💜 Pinkie\'s Friendship Meter!')
            .setDescription(`*pulls out the official Ponyville Friendship Gauge™*\n\nLet's see how these two ponies are doing...`)
            .addFields(
                { name: '🐴 Friend 1', value: `${user1.displayName || user1.username}`, inline: true },
                { name: '🐴 Friend 2', value: `${user2.displayName || user2.username}`, inline: true },
                { name: '\u200b', value: '\u200b', inline: true },
                { name: `${tier.icon} Friendship Level`, value: `**${tier.label}**`, inline: false },
                { name: '📊 Compatibility', value: `\`${bar}\` **${score}%**`, inline: false },
                { name: '✨ Pinkie\'s Reading', value: tier.note, inline: false }
            )
            .setThumbnail(user1.displayAvatarURL({ dynamic: true }))
            .setFooter({ text: `Powered by Pinkie's Ponyville Friendship Gauge™ • Results are permanent for this pair! 🎈` })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
