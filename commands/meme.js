// commands/meme.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('meme')
        .setDescription('Display My Little Pony themed programming memes!'),
    async execute(interaction) {
        const memes = [
            {
                title: "Programming Logic",
                url: "https://i.imgur.com/8zbx5Kp.jpg",
                description: "When your code works but you don't know why"
            },
            {
                title: "Debugging Life",
                url: "https://i.imgur.com/OOFRJvr.png", 
                description: "99 little bugs in the code..."
            },
            {
                title: "Stack Overflow",
                url: "https://i.imgur.com/rHjKMFp.jpg",
                description: "Every programmer's best friend"
            },
            {
                title: "Git Commit",
                url: "https://i.imgur.com/w7vhkGm.png",
                description: "When you finally fix that bug"
            },
            {
                title: "CSS Problems",
                url: "https://i.imgur.com/Q3cUg29.gif",
                description: "Trying to center a div"
            }
        ];
        
        // Meme text yang aman dan bertema MLP
        const mlpMemes = [
            "```\n     🦄 MLP Programming Logic 🦄\n\n  \"Friendship is Magic\"\n        ↓\n  \"Debugging is Magic\"\n        ↓  \n  \"Stack Overflow is Magic\"\n        ↓\n  \"Copy-Paste is Magic\"\n```",
            "```\n🌈 Rainbow Dash's Coding Style:\n\n□ Plan the code carefully\n□ Write clean documentation  \n□ Test thoroughly\n☑ Code fast, debug later!\n   \"Gotta go fast!\"\n```",
            "```\n📚 Twilight Sparkle's Approach:\n\n▪ Read 47 programming books\n▪ Create detailed flowcharts\n▪ Write perfect documentation\n▪ Code works on first try\n\n  \"Friendship AND good code!\"\n```",
            "```\n🎨 Rarity's Code Review:\n\n\"Darling, this code simply\n must be more... ELEGANT!\"\n\n*adds 500 lines of comments*\n*refactors variable names*\n*makes everything beautiful*\n```",
            "```\n🍎 Applejack's Programming:\n\n\"Keep it simple, sugarcube!\"\n\n - No fancy frameworks\n - Plain vanilla code\n - If it works, ship it!\n - Honest code for honest work\n```"
        ];
        
        const randomMeme = mlpMemes[Math.floor(Math.random() * mlpMemes.length)];
        
        const embed = new EmbedBuilder()
            .setColor('#ff1493')
            .setTitle('🦄 Pony Programming Memes')
            .setDescription(randomMeme)
            .setFooter({ text: `Friendship is Magic! | Requested by ${interaction.user.username}` })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
