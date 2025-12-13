// commands/8ball.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('8ball')
        .setDescription('Ask the Magic 8-Ball for an answer!')
        .addStringOption(option =>
            option.setName('question')
                .setDescription('The question you want to ask')
                .setRequired(true)),
    async execute(interaction) {
        const question = interaction.options.getString('question');
        
        const responses = [
            // Positive responses - MLP themed
            "Absolutely, my dear friend! 🌟",
            "Yes! The magic of friendship says so! ✨",
            "Without a doubt, darling! 💎",
            "Of course! Pinkie Pie promises! 🎈",
            "Yes, and Twilight's studies confirm it! 📚",
            "Rainbow Dash says YES! 🌈",
            "Fluttershy whispers... yes, if that's okay with you 🦋",
            "The Elements of Harmony say yes! ⭐",
            "Princess Celestia's wisdom says yes! ☀️",
            "Discord even agrees - and that's saying something! 🌀",
            
            // Neutral/uncertain responses - MLP themed  
            "The Crystal Heart is cloudy... try again later 💎",
            "Even Twilight needs to research this more 📖",
            "Ask Princess Luna in your dreams tonight 🌙",
            "The magic is unclear right now ✨",
            "Zecora's riddles are confusing me... 🦓",
            
            // Negative responses - MLP themed
            "I'm afraid not, my friend 💙",
            "Applejack says that ain't happening, sugar 🍎",
            "The magic 8-ball of harmony says no 🔮",
            "Not even Pinkie's party cannon can make this happen 🎉",
            "Sorry, but even friendship has its limits 💔"
        ];
        
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        
        // Tentukan warna berdasarkan jenis respons  
        let color = '#ff69b4'; // default pink
        if (randomResponse.includes('Yes') || randomResponse.includes('yes') || randomResponse.includes('Absolutely') || randomResponse.includes('course')) {
            color = '#00ff00'; // green for positive
        } else if (randomResponse.includes('not') || randomResponse.includes('No') || randomResponse.includes('afraid') || randomResponse.includes("can't")) {
            color = '#ff0000'; // red for negative
        } else {
            color = '#ffff00'; // yellow for uncertain
        }
        
        const embed = new EmbedBuilder()
            .setColor(color)
            .setTitle('🔮 Magic 8-Ball of Harmony')
            .addFields(
                { name: '❓ Your Question', value: question, inline: false },
                { name: '✨ The Magic Answer', value: `*${randomResponse}*`, inline: false }
            )
            .setFooter({ text: `Friendship is Magic! | Asked by ${interaction.user.username}` })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
