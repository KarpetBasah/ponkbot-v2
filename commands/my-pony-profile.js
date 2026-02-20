// commands/my-pony-profile.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('my-pony-profile')
        .setDescription('Create your complete pony profile!')
        .addStringOption(option =>
            option.setName('name')
                .setDescription('Your pony name (leave empty for random)')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('type')
                .setDescription('Type of pony you are')
                .setRequired(false)
                .addChoices(
                    { name: 'Earth Pony', value: 'earth' },
                    { name: 'Pegasus', value: 'pegasus' },
                    { name: 'Unicorn', value: 'unicorn' },
                    { name: 'Alicorn', value: 'alicorn' }
                ))
        .addStringOption(option =>
            option.setName('personality')
                .setDescription('Your pony personality trait')
                .setRequired(false)
                .addChoices(
                    { name: 'Adventurous', value: 'adventurous' },
                    { name: 'Gentle & Kind', value: 'gentle' },
                    { name: 'Studious & Wise', value: 'studious' },
                    { name: 'Creative & Artistic', value: 'creative' },
                    { name: 'Fun & Energetic', value: 'energetic' },
                    { name: 'Loyal & Brave', value: 'loyal' }
                )),
    async execute(interaction) {
        const customName = interaction.options.getString('name');
        const ponyType = interaction.options.getString('type');
        const personality = interaction.options.getString('personality');
        const isDirectMessage = interaction.guild === null;
        
        // Generate random elements if not provided
        const firstNames = ["Star", "Moon", "Crystal", "Rainbow", "Golden", "Silver", "Bright", "Sweet", "Magic", "Dream"];
        const lastNames = ["Shine", "Glow", "Whisper", "Dance", "Heart", "Spirit", "Grace", "Charm", "Sparkle", "Breeze"];
        
        const finalName = customName || `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
        
        const types = ['earth', 'pegasus', 'unicorn', 'alicorn'];
        const finalType = ponyType || types[Math.floor(Math.random() * types.length)];
        
        const personalities = ['adventurous', 'gentle', 'studious', 'creative', 'energetic', 'loyal'];
        const finalPersonality = personality || personalities[Math.floor(Math.random() * personalities.length)];
        
        // Type info
        const typeInfo = {
            earth: { emoji: "🌱", name: "Earth Pony", color: "#8FBC8F" },
            pegasus: { emoji: "☁️", name: "Pegasus", color: "#87CEEB" },
            unicorn: { emoji: "🦄", name: "Unicorn", color: "#DDA0DD" },
            alicorn: { emoji: "👑", name: "Alicorn", color: "#FFD700" }
        };
        
        // Personality info
        const personalityInfo = {
            adventurous: { emoji: "⚡", trait: "Adventurous Spirit", desc: "You love exploring new places and trying new things!" },
            gentle: { emoji: "🌸", trait: "Gentle Heart", desc: "You have a kind soul and care deeply for all creatures." },
            studious: { emoji: "📚", trait: "Studious Mind", desc: "You love learning and sharing knowledge with others." },
            creative: { emoji: "🎨", trait: "Creative Soul", desc: "You express yourself through art and beautiful creations." },
            energetic: { emoji: "🎈", trait: "Energetic Spirit", desc: "You bring joy and excitement wherever you go!" },
            loyal: { emoji: "🌈", trait: "Loyal Heart", desc: "You're fiercely loyal and always stand by your friends." }
        };
        
        // Generate cutie mark
        const cutieMarks = ["⭐", "🌙", "🌈", "🎨", "🎵", "💎", "🦋", "🍎", "⚡", "🌸"];
        const randomCutieMark = cutieMarks[Math.floor(Math.random() * cutieMarks.length)];
        
        const currentType = typeInfo[finalType];
        const currentPersonality = personalityInfo[finalPersonality];
        
        const embed = new EmbedBuilder()
            .setColor(currentType.color)
            .setTitle('🦄 Your Complete Pony Profile!')
            .addFields(
                { name: '✨ Pony Name', value: `**${finalName}**`, inline: true },
                { name: `${currentType.emoji} Pony Type`, value: currentType.name, inline: true },
                { name: '🎯 Cutie Mark', value: randomCutieMark, inline: true },
                { name: `${currentPersonality.emoji} Personality`, value: currentPersonality.trait, inline: true },
                { name: '🌟 Special Trait', value: currentPersonality.desc, inline: false },
                { 
                    name: '💝 Your Story', 
                    value: `Meet ${finalName}, a ${currentPersonality.trait.toLowerCase()} ${currentType.name.toLowerCase()} with a ${randomCutieMark} cutie mark! ${currentPersonality.desc}`, 
                    inline: false 
                },
                {
                    name: '🌈 Profile Status',
                    value: isDirectMessage 
                        ? '🔒 This is your private pony profile! Only you can see this.' 
                        : '👥 This profile is public in this server. Use `/my-pony-profile` in my DMs for a private version!',
                    inline: false
                }
            )
            .setFooter({ text: `Welcome to Equestria, ${finalName}! | Profile for ${interaction.user.username}` })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
