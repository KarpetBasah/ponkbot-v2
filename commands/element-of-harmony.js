// commands/element-of-harmony.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('element-of-harmony')
        .setDescription('Discover which Element of Harmony represents you!'),
    async execute(interaction) {
        const elements = [
            {
                name: "Magic",
                bearer: "Twilight Sparkle",
                symbol: "⭐",
                color: "#9B4C96",
                description: "Magic is the element that binds all the others together. You are a natural leader who brings out the best in your friends through the power of friendship itself.",
                traits: "Leadership, Intelligence, Problem-solving, Bringing friends together"
            },
            {
                name: "Loyalty", 
                bearer: "Rainbow Dash",
                symbol: "🌈",
                color: "#00BFFF",
                description: "You are fiercely loyal to your friends and will never abandon them, no matter how difficult things get. Your loyalty is unwavering and true.",
                traits: "Faithfulness, Dedication, Courage, Standing by friends"
            },
            {
                name: "Kindness",
                bearer: "Fluttershy", 
                symbol: "🦋",
                color: "#FFB6C1",
                description: "You have a gentle soul and show compassion to all living creatures. Your kindness can reach even the most troubled hearts.",
                traits: "Compassion, Gentleness, Empathy, Caring for others"
            },
            {
                name: "Laughter",
                bearer: "Pinkie Pie",
                symbol: "🎈", 
                color: "#FF69B4",
                description: "You bring joy and happiness wherever you go. Your laughter can brighten the darkest days and lift everyone's spirits.",
                traits: "Joy, Optimism, Humor, Spreading happiness"
            },
            {
                name: "Generosity",
                bearer: "Rarity",
                symbol: "💎",
                color: "#800080", 
                description: "You have a generous heart and love to give to others. You find joy in making others happy and beautiful.",
                traits: "Selflessness, Giving nature, Grace, Making others feel special"
            },
            {
                name: "Honesty",
                bearer: "Applejack",
                symbol: "🍎",
                color: "#FFA500",
                description: "You value truth above all else and can always be counted on to tell it like it is. Your honesty builds trust and strong relationships.",
                traits: "Truthfulness, Reliability, Integrity, Being straightforward"
            }
        ];
        
        const randomElement = elements[Math.floor(Math.random() * elements.length)];
        
        const embed = new EmbedBuilder()
            .setColor(randomElement.color)
            .setTitle('✨ Your Element of Harmony!')
            .addFields(
                { name: `${randomElement.symbol} Element of ${randomElement.name}`, value: '\u200B', inline: false },
                { name: '🦄 Bearer', value: randomElement.bearer, inline: true },
                { name: '🌟 Your Traits', value: randomElement.traits, inline: false },
                { name: '💖 What This Means', value: randomElement.description, inline: false },
                { name: '🌈 Remember', value: 'Each Element of Harmony is special and necessary. Together with your friends, you can overcome any challenge!', inline: false }
            )
            .setFooter({ text: `Friendship is Magic! | ${interaction.user.username}'s element revealed!` })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
