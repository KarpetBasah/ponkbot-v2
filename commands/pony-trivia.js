// commands/pony-trivia.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pony-trivia')
        .setDescription('OMG! Brain-tickling pony questions! Let\'s test your friendship knowledge!'),
    async execute(interaction) {
        const triviaQuestions = [
            {
                question: "Ooh! Ooh! What is Twilight Sparkle's super-pretty cutie mark?",
                answer: "A big six-pointed star surrounded by five smaller white stars - just like magic should be!",
                difficulty: "Party Starter",
                pinkieComment: "Twilight's cutie mark is sooo sparkly! Just like her personality! ✨"
            },
            {
                question: "Who rules the super-shiny Crystal Empire? (Hint: They're SO in love!)",
                answer: "Princess Cadance and Shining Armor - the most romantic couple EVER!",
                difficulty: "Fun Challenge",
                pinkieComment: "They have the most amazing wedding! I threw the BEST party for them! 💕"
            },
            {
                question: "What are the names of those adorable cutie mark-seeking fillies?",
                answer: "Apple Bloom, Sweetie Belle, and Scootaloo - the Cutie Mark Crusaders!",
                difficulty: "Party Starter",
                pinkieComment: "Those little fillies are SO determined! I love their spirit! 🌟"
            },
            {
                question: "What's the name of Fluttershy's sometimes-grumpy bunny friend?",
                answer: "Angel! He's not always an angel though, teehee!",
                difficulty: "Party Starter",
                pinkieComment: "Angel can be such a drama queen! But he loves Fluttershy SO much! 🐰"
            },
            {
                question: "Who are the two sisters that make the sun and moon dance across the sky?",
                answer: "Princess Celestia and Princess Luna - the royal sister duo!",
                difficulty: "Party Starter",
                pinkieComment: "Their family reunions must be AMAZING! Though Luna was grumpy for a while... 🌙☀️"
            },
            {
                question: "Where was Rainbow Dash born? (It's up in the clouds!)",
                answer: "Cloudsdale - the most spectacular cloud city ever!",
                difficulty: "Fun Challenge",
                pinkieComment: "I visited once! Walking on clouds is like bouncing on trampolines! WHEEE! ☁️"
            },
            {
                question: "What kind of fabulous business does Rarity run?",
                answer: "Carousel Boutique - the most glamorous fashion shop in Ponyville!",
                difficulty: "Party Starter",
                pinkieComment: "Rarity makes the prettiest dresses! Though she can be a tiny bit dramatic... 💎"
            },
            {
                question: "What's the name of MY family's rock farm? (This one's personal!)",
                answer: "Pie Family Rock Farm - where rocks are SERIOUS business!",
                difficulty: "Fun Challenge",
                pinkieComment: "That's where I grew up! So many rocks, so little laughter... until I discovered PARTIES! 🪨"
            },
            {
                question: "Who's that crazy chaos guy who became our friend? (He's totally bonkers!)",
                answer: "Discord - the spirit of chaos who learned that friendship is better than chaos!",
                difficulty: "Fun Challenge",
                pinkieComment: "Discord throws the WILDEST parties! Chocolate rain is surprisingly tasty! 🍫"
            },
            {
                question: "What are those super-important magical friendship things we used to save Equestria?",
                answer: "The Elements of Harmony: Magic, Loyalty, Kindness, Laughter, Generosity, and Honesty!",
                difficulty: "Brain Buster",
                pinkieComment: "I represent Laughter! Best element EVER! Giggling saves the day! 😂"
            },
            {
                question: "What's the name of Applejack's absolutely adorable little sister?",
                answer: "Apple Bloom - she's got the biggest heart and the biggest bow!",
                difficulty: "Party Starter",
                pinkieComment: "Apple Bloom is SO sweet! Almost as sweet as apple cider! 🍎"
            },
            {
                question: "Who taught Twilight everything about the magic of friendship?",
                answer: "Princess Celestia - the wisest teacher and cake-lover in all of Equestria!",
                difficulty: "Party Starter",
                pinkieComment: "Princess Celestia LOVES my cakes! We have excellent taste in desserts! 🎂"
            }
        ];
        
        const randomTrivia = triviaQuestions[Math.floor(Math.random() * triviaQuestions.length)];
        
        // Pinkie Pie's colorful difficulty system
        let color = '#ff1493'; // Pinkie's signature hot pink
        let difficultyEmoji = '';
        if (randomTrivia.difficulty === 'Party Starter') {
            color = '#ff69b4';
            difficultyEmoji = '🎈';
        } else if (randomTrivia.difficulty === 'Fun Challenge') {
            color = '#ff1493';
            difficultyEmoji = '🎪';
        } else if (randomTrivia.difficulty === 'Brain Buster') {
            color = '#d1006f';
            difficultyEmoji = '🧠';
        }
        
        const embed = new EmbedBuilder()
            .setColor(color)
            .setTitle('🎉 PINKIE\'S SUPER-DUPER PONY TRIVIA TIME! 🎉')
            .setDescription('*bounces excitedly* OH BOY OH BOY! Time to test your friendship knowledge!')
            .addFields(
                { name: '🎪 Pinkie\'s Question', value: randomTrivia.question, inline: false },
                { name: `${difficultyEmoji} Difficulty Level`, value: randomTrivia.difficulty, inline: true },
                { name: '🧁 Think Time!', value: 'Ooh! Ooh! I\'ll reveal the answer in 10 seconds! Use your brain AND your heart!', inline: false },
                { name: '🎈 Pinkie Tip', value: 'Remember, the best answers come from the magic of friendship!', inline: false }
            )
            .setFooter({ text: `Trivia Party for ${interaction.user.username} • Let\'s test that friendship knowledge! 🎂` })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
        
        // Pinkie's answer reveal after 10 seconds
        setTimeout(async () => {
            const answerEmbed = new EmbedBuilder()
                .setColor(color)
                .setTitle('🎊 TA-DA! PINKIE\'S ANSWER REVEAL PARTY! 🎊')
                .setDescription('*throws confetti everywhere* Here comes the answer!')
                .addFields(
                    { name: '❓ The Question Was', value: randomTrivia.question, inline: false },
                    { name: '🎯 The Super-Duper Answer', value: randomTrivia.answer, inline: false },
                    { name: '💖 Pinkie\'s Comment', value: randomTrivia.pinkieComment, inline: false },
                    { name: '🎉 Party Status', value: 'How did you do?! Right or wrong, you\'re still AWESOME! Let\'s do another one!', inline: false }
                )
                .setFooter({ text: 'Every answer is a reason to party! Try another trivia for more fun! 🧁' });
                
            await interaction.followUp({ embeds: [answerEmbed] });
        }, 10000);
    },
};
