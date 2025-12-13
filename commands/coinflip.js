// commands/coinflip.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('coinflip')
        .setDescription('Flip a coin to get heads or tails'),
    async execute(interaction) {
        const isHeads = Math.random() < 0.5;
        const result = isHeads ? 'Heads' : 'Tails';
        const emoji = isHeads ? '🪙' : '🥈';
        const color = isHeads ? '#ffd700' : '#c0c0c0';
        
        const embed = new EmbedBuilder()
            .setColor(color)
            .setTitle('🪙 Coin Flip')
            .setDescription(`${emoji} **${result}**`)
            .addFields(
                { name: 'Result', value: result, inline: true }
            )
            .setFooter({ text: `Flipped by ${interaction.user.username}` })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
