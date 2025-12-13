// commands/quote.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('quote')
        .setDescription('Display random inspirational quotes'),
    async execute(interaction) {
        const quotes = [
            {
                text: "Friendship is magic!",
                author: "Twilight Sparkle"
            },
            {
                text: "The magic of friendship grows stronger when it's shared.",
                author: "Princess Celestia"
            },
            {
                text: "A true friend is someone who sees the pain in your eyes while everyone else believes the smile on your face.",
                author: "Fluttershy"
            },
            {
                text: "You can't force someone to be your friend, but you can be a friend to them.",
                author: "Pinkie Pie"
            },
            {
                text: "Being different isn't a bad thing. It means you're brave enough to be yourself.",
                author: "Rainbow Dash"
            },
            {
                text: "Sometimes we all just need to be shown a little kindness.",
                author: "Rarity"
            },
            {
                text: "The best way to solve problems is by working together with your friends.",
                author: "Applejack"
            },
            {
                text: "Friendship isn't always easy, but it's always worth it.",
                author: "Spike"
            },
            {
                text: "True friends are never apart, maybe in distance but never in heart.",
                author: "Princess Luna"
            },
            {
                text: "Being kind is never a weakness. It's one of the greatest strengths you can have.",
                author: "Starlight Glimmer"
            },
            {
                text: "You are worthy of friendship and love, just as you are.",
                author: "Sunset Shimmer"
            },
            {
                text: "Sometimes you have to fail before you can fly.",
                author: "Scootaloo"
            }
        ];
        
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
        
        const quoteEmbed = new EmbedBuilder()
            .setColor('#ff69b4')
            .setTitle('🦄 Pony Wisdom')
            .setDescription(`*"${randomQuote.text}"*`)
            .addFields(
                { name: '🌟 Said by', value: `— ${randomQuote.author}`, inline: false }
            )
            .setFooter({ text: `Friendship is Magic! | Requested by ${interaction.user.username}` })
            .setTimestamp();

        await interaction.reply({ embeds: [quoteEmbed] });
    },
};
