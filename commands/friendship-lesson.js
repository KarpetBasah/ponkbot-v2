// commands/friendship-lesson.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('friendship-lesson')
        .setDescription('Learn a valuable friendship lesson from the ponies!'),
    async execute(interaction) {
        const lessons = [
            {
                title: "The Magic of Forgiveness",
                teacher: "Twilight Sparkle",
                lesson: "Sometimes friends make mistakes, but true friendship means being willing to forgive and give second chances.",
                episode: "Inspired by various episodes",
                moral: "Forgiveness strengthens bonds and helps friendships grow stronger."
            },
            {
                title: "Being True to Yourself",
                teacher: "Rainbow Dash",
                lesson: "Don't change who you are to impress others. Real friends will love you for who you truly are.",
                episode: "Wonderbolts Academy",
                moral: "Authenticity is the foundation of genuine friendship."
            },
            {
                title: "The Power of Kindness",
                teacher: "Fluttershy",
                lesson: "A gentle word and a kind gesture can solve problems that force and anger cannot.",
                episode: "Keep Calm and Flutter On",
                moral: "Kindness has the power to change hearts and heal wounds."
            },
            {
                title: "Laughter is the Best Medicine",
                teacher: "Pinkie Pie",
                lesson: "When things get tough, sometimes the best thing you can do is find a reason to smile and help others do the same.",
                episode: "Laughter Song",
                moral: "Joy and laughter can overcome fear and bring friends together."
            },
            {
                title: "The Beauty of Generosity",
                teacher: "Rarity",
                lesson: "True generosity comes from the heart. It's about giving because you want to help, not because you expect something in return.",
                episode: "A Generous Pony",
                moral: "Giving freely makes both the giver and receiver happy."
            },
            {
                title: "The Value of Honesty",
                teacher: "Applejack",
                lesson: "Being honest, even when it's hard, builds trust and stronger relationships with your friends.",
                episode: "The Last Roundup",
                moral: "Truth may be difficult, but it's always the right foundation for friendship."
            },
            {
                title: "Accepting Differences",
                teacher: "Starlight Glimmer",
                lesson: "Our differences make us special. Instead of trying to make everyone the same, celebrate what makes each friend unique.",
                episode: "The Cutie Map",
                moral: "Diversity strengthens friendship and makes life more interesting."
            },
            {
                title: "Asking for Help",
                teacher: "Twilight Sparkle",
                lesson: "It's okay to not know everything. Asking friends for help isn't a sign of weakness—it's a sign of trust.",
                episode: "Lesson Zero",
                moral: "Friends are there to support each other through difficulties."
            },
            {
                title: "Second Chances",
                teacher: "Princess Celestia",
                lesson: "Everyone deserves a chance to change and become better. Sometimes the best friendships come from unexpected places.",
                episode: "Discord's Reformation",
                moral: "Growth and redemption are possible when supported by friendship."
            },
            {
                title: "Standing Up for Friends",
                teacher: "All Mane Six",
                lesson: "True friends stand up for each other, even when it's scary or difficult to do so.",
                episode: "Magical Mystery Cure",
                moral: "Loyalty means being there for friends when they need you most."
            }
        ];
        
        const randomLesson = lessons[Math.floor(Math.random() * lessons.length)];
        
        const embed = new EmbedBuilder()
            .setColor('#ff1493')
            .setTitle('📚 Friendship Lesson of the Day')
            .addFields(
                { name: '✨ Lesson Title', value: randomLesson.title, inline: false },
                { name: '🦄 Teacher', value: randomLesson.teacher, inline: true },
                { name: '📺 Inspiration', value: randomLesson.episode, inline: true },
                { name: '📖 The Lesson', value: randomLesson.lesson, inline: false },
                { name: '💝 Moral of the Story', value: randomLesson.moral, inline: false },
                { name: '🌟 Remember', value: 'Friendship is a journey of learning and growing together!', inline: false }
            )
            .setFooter({ text: `Friendship is Magic! | Lesson for ${interaction.user.username}` })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
