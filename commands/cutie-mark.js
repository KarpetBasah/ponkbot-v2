// commands/cutie-mark.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('cutie-mark')
        .setDescription('Discover your special cutie mark and unique talent!'),
    async execute(interaction) {
        const cutieMarks = [
            {
                name: "Magic Sparkle",
                symbol: "⭐",
                talent: "Magic and Knowledge",
                description: "You have a natural talent for learning and using magic. Books are your best friends!"
            },
            {
                name: "Rainbow Lightning",
                symbol: "🌈",
                talent: "Speed and Loyalty",
                description: "You're incredibly fast and fiercely loyal to your friends. Nothing can slow you down!"
            },
            {
                name: "Butterfly Wings",
                symbol: "🦋",
                talent: "Kindness and Animal Care",
                description: "You have a gentle heart and can communicate with all creatures great and small."
            },
            {
                name: "Balloon Trio",
                symbol: "🎈",
                talent: "Party Planning and Joy",
                description: "You bring happiness wherever you go! Every day is a reason to celebrate."
            },
            {
                name: "Diamond Gems",
                symbol: "💎",
                talent: "Fashion and Beauty",
                description: "You have an eye for style and beauty. You can make anything look fabulous!"
            },
            {
                name: "Apple Tree",
                symbol: "🍎",
                talent: "Honesty and Hard Work",
                description: "You're dependable and honest. Hard work and family values guide your way."
            },
            {
                name: "Musical Note",
                symbol: "🎵",
                talent: "Music and Harmony",
                description: "You have a gift for creating beautiful melodies that touch everypony's heart."
            },
            {
                name: "Paint Brush",
                symbol: "🎨",
                talent: "Art and Creativity",
                description: "Your imagination knows no bounds! You can create beauty from nothing."
            },
            {
                name: "Book Quill",
                symbol: "📚",
                talent: "Writing and Storytelling",
                description: "You weave words into magical tales that inspire and educate others."
            },
            {
                name: "Healing Heart",
                symbol: "💖",
                talent: "Healing and Compassion",
                description: "You have the power to mend both physical wounds and broken hearts."
            },
            {
                name: "Star Compass",
                symbol: "🧭",
                talent: "Leadership and Guidance",
                description: "Others naturally look to you for direction and wisdom in difficult times."
            },
            {
                name: "Sunshine Ray",
                symbol: "☀️",
                talent: "Optimism and Hope",
                description: "You bring light to the darkest moments and help others see the bright side."
            }
        ];
        
        const randomCutieMark = cutieMarks[Math.floor(Math.random() * cutieMarks.length)];
        
        const embed = new EmbedBuilder()
            .setColor('#ff69b4')
            .setTitle('🌟 Your Special Cutie Mark!')
            .addFields(
                { name: `${randomCutieMark.symbol} ${randomCutieMark.name}`, value: '\u200B', inline: false },
                { name: '🎯 Special Talent', value: randomCutieMark.talent, inline: false },
                { name: '📝 Description', value: randomCutieMark.description, inline: false },
                { name: '✨ Remember', value: 'Your cutie mark represents what makes you unique and special!', inline: false }
            )
            .setFooter({ text: `Friendship is Magic! | ${interaction.user.username}'s destiny revealed!` })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
