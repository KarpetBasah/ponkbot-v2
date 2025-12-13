// commands/dice.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dice')
        .setDescription('Roll the dice!')
        .addIntegerOption(option =>
            option.setName('sides')
                .setDescription('Number of sides on the dice (default: 6)')
                .setRequired(false)
                .setMinValue(2)
                .setMaxValue(100))
        .addIntegerOption(option =>
            option.setName('count')
                .setDescription('Number of dice to roll (default: 1)')
                .setRequired(false)
                .setMinValue(1)
                .setMaxValue(10)),
    async execute(interaction) {
        const sides = interaction.options.getInteger('sides') || 6;
        const count = interaction.options.getInteger('count') || 1;
        
        const results = [];
        let total = 0;
        
        for (let i = 0; i < count; i++) {
            const roll = Math.floor(Math.random() * sides) + 1;
            results.push(roll);
            total += roll;
        }
        
        const diceEmojis = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
        const resultText = results.map(result => {
            if (sides === 6 && result <= 6) {
                return diceEmojis[result - 1];
            }
            return `**${result}**`;
        }).join(' ');
        
        const embed = new EmbedBuilder()
            .setColor('#ff6b6b')
            .setTitle('🎲 Dice Roll Results')
            .addFields(
                { name: 'Results', value: resultText, inline: false },
                { name: 'Total', value: `${total}`, inline: true },
                { name: 'Dice', value: `${count}d${sides}`, inline: true }
            )
            .setFooter({ text: `Rolled by ${interaction.user.username}` })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
