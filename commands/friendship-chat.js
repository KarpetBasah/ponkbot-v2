// commands/friendship-chat.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('friendship-chat')
        .setDescription('Have a friendly conversation about anything! 💬')
        .addStringOption(option =>
            option.setName('topic')
                .setDescription('What would you like to talk about?')
                .setRequired(false)
                .addChoices(
                    { name: 'Friendship advice', value: 'friendship' },
                    { name: 'Feeling sad', value: 'sad' },
                    { name: 'Celebrate good news', value: 'happy' },
                    { name: 'Need motivation', value: 'motivation' },
                    { name: 'Just want to chat', value: 'chat' }
                )),
    async execute(interaction) {
        const topic = interaction.options.getString('topic') || 'chat';
        const isDirectMessage = interaction.guild === null;
        
        const responses = {
            friendship: {
                title: "💖 Friendship Wisdom",
                message: "Friendship is one of the most magical things in Equestria and beyond! Remember, a true friend accepts you for who you are, supports you through tough times, and celebrates your successes. What's on your heart about friendship?",
                color: "#ff69b4",
                character: "Twilight Sparkle",
                advice: "The magic of friendship grows stronger when shared. Don't be afraid to reach out and make new connections!"
            },
            sad: {
                title: "🤗 Gentle Comfort",
                message: "Oh my... I can sense you might be feeling a little down. That's okay - even the strongest ponies have difficult days. Remember that you're not alone, and this feeling will pass like clouds across the sky.",
                color: "#ffb6c1",
                character: "Fluttershy",
                advice: "Sometimes we need to be gentle with ourselves. Take things one step at a time, and remember that asking for help is a sign of strength, not weakness."
            },
            happy: {
                title: "🎉 Celebration Time!",
                message: "OH MY GOSH OH MY GOSH! Something good happened! *bounces excitedly* I LOVE celebrating with friends! Good news is even better when shared!",
                color: "#ff1493",
                character: "Pinkie Pie",
                advice: "Life is full of reasons to celebrate! Don't forget to appreciate the little victories along with the big ones!"
            },
            motivation: {
                title: "⚡ You've Got This!",
                message: "Hey there, champ! Feeling like you need some speed and determination? Well, you've come to the right pony! Champions aren't made by never falling - they're made by getting back up every time!",
                color: "#00bfff",
                character: "Rainbow Dash",
                advice: "Believe in yourself as much as your friends believe in you! You're stronger than you think and capable of amazing things!"
            },
            chat: {
                title: "✨ Friendly Conversation",
                message: "Hello there, my friend! I'm so happy you wanted to chat! There's nothing quite like a good conversation between friends. What's been on your mind lately?",
                color: "#9b4c96",
                character: "Twilight Sparkle",
                advice: "Sometimes the best conversations happen when we simply open our hearts and share what's real. I'm here to listen!"
            }
        };
        
        const response = responses[topic];
        
        const embed = new EmbedBuilder()
            .setColor(response.color)
            .setTitle(response.title)
            .setDescription(response.message)
            .addFields(
                { name: `🦄 ${response.character} says:`, value: response.advice, inline: false },
                { 
                    name: '💝 Remember', 
                    value: isDirectMessage 
                        ? 'This is our private friendship space - feel free to share whatever\'s on your heart!' 
                        : 'For more private conversations, feel free to DM me anytime!', 
                    inline: false 
                }
            )
            .setFooter({ text: `Friendship is Magic! | ${response.character} is here for you` })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
