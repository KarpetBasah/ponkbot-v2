// commands/pony-name.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pony-name')
        .setDescription('Generate your unique pony name!')
        .addStringOption(option =>
            option.setName('type')
                .setDescription('Type of pony you want to be')
                .setRequired(false)
                .addChoices(
                    { name: 'Earth Pony', value: 'earth' },
                    { name: 'Pegasus', value: 'pegasus' },
                    { name: 'Unicorn', value: 'unicorn' },
                    { name: 'Alicorn', value: 'alicorn' }
                )),
    async execute(interaction) {
        const ponyType = interaction.options.getString('type') || 'random';
        
        const firstNames = [
            "Star", "Moon", "Sun", "Rainbow", "Crystal", "Golden", "Silver", "Misty",
            "Bright", "Sweet", "Magic", "Wonder", "Dream", "Sparkle", "Shining",
            "Dancing", "Flying", "Singing", "Laughing", "Gentle", "Brave", "Swift",
            "Autumn", "Spring", "Winter", "Summer", "Rose", "Lily", "Daisy", "Iris"
        ];
        
        const lastNames = [
            "Shine", "Glow", "Beam", "Whisper", "Song", "Dance", "Flight", "Dream",
            "Heart", "Soul", "Spirit", "Magic", "Wonder", "Bliss", "Joy", "Hope",
            "Grace", "Charm", "Belle", "Star", "Moon", "Sparkle", "Gleam", "Shimmer",
            "Breeze", "Storm", "Rain", "Snow", "Frost", "Bloom", "Petal", "Blossom"
        ];
        
        const randomFirstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const randomLastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const ponyName = `${randomFirstName} ${randomLastName}`;
        
        // Determine pony type if random
        const types = ['earth', 'pegasus', 'unicorn', 'alicorn'];
        const finalType = ponyType === 'random' ? types[Math.floor(Math.random() * types.length)] : ponyType;
        
        // Type-specific info
        const typeInfo = {
            earth: {
                emoji: "🌱",
                name: "Earth Pony",
                color: "#8FBC8F",
                abilities: "Strong connection to nature, excellent farmers and bakers, incredible strength and endurance",
                description: "Earth ponies are grounded, practical, and have a special connection to the land and growing things."
            },
            pegasus: {
                emoji: "☁️",
                name: "Pegasus",
                color: "#87CEEB", 
                abilities: "Flight, weather manipulation, cloud walking, incredible speed and agility",
                description: "Pegasi soar through the skies and control the weather, bringing rain, snow, and clearing clouds."
            },
            unicorn: {
                emoji: "🦄",
                name: "Unicorn",
                color: "#DDA0DD",
                abilities: "Magic spells, telekinesis, teleportation, specialized magical talents",
                description: "Unicorns harness the power of magic through their horns, each with their own special magical abilities."
            },
            alicorn: {
                emoji: "👑",
                name: "Alicorn",
                color: "#FFD700",
                abilities: "All pegasus and unicorn abilities, powerful magic, leadership, immortality",
                description: "Alicorns are the rarest ponies, combining the powers of all pony types. They often become princesses."
            }
        };
        
        const currentType = typeInfo[finalType];
        
        const embed = new EmbedBuilder()
            .setColor(currentType.color)
            .setTitle('🦄 Your Pony Identity!')
            .addFields(
                { name: '✨ Your Pony Name', value: `**${ponyName}**`, inline: false },
                { name: `${currentType.emoji} Pony Type`, value: currentType.name, inline: true },
                { name: '🌟 Special Abilities', value: currentType.abilities, inline: false },
                { name: '📖 About Your Type', value: currentType.description, inline: false },
                { name: '💫 Fun Fact', value: 'Every pony name reflects their personality and special talents!', inline: false }
            )
            .setFooter({ text: `Welcome to Equestria, ${ponyName}! | Generated for ${interaction.user.username}` })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
