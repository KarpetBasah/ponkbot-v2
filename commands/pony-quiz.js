// commands/pony-quiz.js
const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    MessageFlags
} = require('discord.js');

// ─── Quiz Questions ───────────────────────────────────────────────────────────
const questions = [
    {
        text: 'How do you spend a free afternoon?',
        emoji: '🌤️',
        options: [
            { label: 'Re-reading my favorite book series 📚',     value: 'twilight'   },
            { label: 'Practicing cool new tricks and stunts 💨',   value: 'rainbow'    },
            { label: 'Spending time with my animal friends 🐾',    value: 'fluttershy' },
            { label: 'Planning a spontaneous party for everyone 🎉', value: 'pinkie'  },
            { label: 'Working on a creative DIY project 💎',        value: 'rarity'    },
            { label: 'Catching up on chores and errands 🍎',        value: 'applejack' },
        ]
    },
    {
        text: 'A friend seems upset. What do you do?',
        emoji: '💜',
        options: [
            { label: 'Research the best ways to help them 🧠',      value: 'twilight'   },
            { label: 'Distract them with something exciting 🏃',    value: 'rainbow'    },
            { label: 'Sit quietly and listen to everything 🌸',      value: 'fluttershy' },
            { label: 'Make them laugh until they feel better 😄',   value: 'pinkie'     },
            { label: 'Plan something special and pampering 💅',     value: 'rarity'     },
            { label: 'Give them an honest, caring pep talk 🤠',     value: 'applejack'  },
        ]
    },
    {
        text: 'What are you most proud of in yourself?',
        emoji: '⭐',
        options: [
            { label: 'My knowledge and problem-solving 🔬',         value: 'twilight'   },
            { label: 'My speed, skills, and determination 🌈',      value: 'rainbow'    },
            { label: 'My patience and care for living things 🕊️',   value: 'fluttershy' },
            { label: 'My ability to make everyone smile 🎊',        value: 'pinkie'     },
            { label: 'My creativity and sense of style ✨',          value: 'rarity'     },
            { label: 'My reliability and hard work 🌾',             value: 'applejack'  },
        ]
    },
    {
        text: "Pick your ideal hangout spot:",
        emoji: '🗺️',
        options: [
            { label: 'A cozy library or bookshop 📖',               value: 'twilight'   },
            { label: 'An open sky or sports field 💨',              value: 'rainbow'    },
            { label: 'A quiet forest or nature trail 🌿',           value: 'fluttershy' },
            { label: 'A loud, colorful party venue 🎉',             value: 'pinkie'     },
            { label: 'A boutique, studio, or art gallery 🎨',       value: 'rarity'     },
            { label: 'The peaceful countryside or a farm 🍂',       value: 'applejack'  },
        ]
    },
    {
        text: 'Your friends would describe you as...',
        emoji: '🐴',
        options: [
            { label: 'The smart, logical bookworm 🤓',              value: 'twilight'   },
            { label: 'The bold, competitive go-getter 🏆',          value: 'rainbow'    },
            { label: 'The gentle, empathetic sweetheart 🌼',        value: 'fluttershy' },
            { label: 'The hyper, fun-loving life of the party 🎈',  value: 'pinkie'     },
            { label: 'The stylish, dramatic creative type 💃',      value: 'rarity'     },
            { label: 'The honest, dependable hard worker 🌻',       value: 'applejack'  },
        ]
    }
];

// ─── Pony Results ─────────────────────────────────────────────────────────────
const results = {
    twilight: {
        name: 'Twilight Sparkle',
        element: 'Magic',
        color: '#9B4C96',
        emoji: '📚',
        description: 'You\'re studious, logical, and love learning! You approach problems with care and always find the right solution. Just remember — sometimes the best lesson comes from your friends, not a book!',
        traits: 'Intelligent • Organized • Curious • Natural Leader',
        icon: '⭐'
    },
    rainbow: {
        name: 'Rainbow Dash',
        element: 'Loyalty',
        color: '#00BFFF',
        emoji: '🌈',
        description: 'You\'re bold, competitive, and fiercely loyal! Once you commit to someone or something, nothing can stop you. You might be brash sometimes, but your heart is always in the right place.',
        traits: 'Brave • Loyal • Competitive • Energetic',
        icon: '🌈'
    },
    fluttershy: {
        name: 'Fluttershy',
        element: 'Kindness',
        color: '#FFB6C1',
        emoji: '🦋',
        description: 'You\'re gentle, empathetic, and deeply caring. You might be quiet, but your kindness speaks louder than words. Every living thing feels safer around you — and that\'s a rare gift.',
        traits: 'Compassionate • Patient • Soft-spoken • Empathetic',
        icon: '🦋'
    },
    pinkie: {
        name: 'Pinkie Pie',
        element: 'Laughter',
        color: '#FF69B4',
        emoji: '🎈',
        description: 'WAHOO! You\'re fun, spontaneous, and you live to make others happy! You bring the party wherever you go. Life\'s too short to be anything but SUPER DUPER excited about everything!',
        traits: 'Cheerful • Spontaneous • Warm-hearted • Creative',
        icon: '🎉'
    },
    rarity: {
        name: 'Rarity',
        element: 'Generosity',
        color: '#DA70D6',
        emoji: '💎',
        description: 'You\'re elegant, creative, and love making the world a more beautiful place. You\'re generous to a fault and have an eye for beauty in everything. Fabulous is simply your default setting!',
        traits: 'Creative • Generous • Elegant • Detail-oriented',
        icon: '💎'
    },
    applejack: {
        name: 'Applejack',
        element: 'Honesty',
        color: '#FFA500',
        emoji: '🍎',
        description: 'You\'re down-to-earth, reliable, and as honest as the day is long. Friends know they can always count on you. No fuss, no drama — just good old-fashioned hard work and genuine care.',
        traits: 'Honest • Reliable • Hard-working • Straightforward',
        icon: '🌾'
    }
};

// ─── In-memory quiz state ─────────────────────────────────────────────────────
const activeQuizzes = new Map();

// ─── Helpers ──────────────────────────────────────────────────────────────────
function buildQuestionEmbed(qIndex) {
    const q = questions[qIndex];
    return new EmbedBuilder()
        .setColor('#FF69B4')
        .setTitle(`${q.emoji} Question ${qIndex + 1} of ${questions.length}`)
        .setDescription(`**${q.text}**\n\n*Pick the answer that fits you best!*`)
        .setFooter({ text: `Pinkie\'s Pony Personality Quiz • Question ${qIndex + 1}/${questions.length} 🎀` });
}

function buildSelectMenu(qIndex) {
    const q = questions[qIndex];
    return new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId(`quiz_answer_${qIndex}`)
            .setPlaceholder('Choose your answer...')
            .addOptions(q.options)
    );
}

function getTopPony(scores) {
    return Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
}

// ─── Command ──────────────────────────────────────────────────────────────────
module.exports = {
    data: new SlashCommandBuilder()
        .setName('pony-quiz')
        .setDescription('Find out which Mane 6 pony matches your personality!'),

    async execute(interaction) {
        const userId = interaction.user.id;

        if (activeQuizzes.has(userId)) {
            return await interaction.reply({
                content: '🎀 You already have a quiz in progress! Finish it first.',
                flags: MessageFlags.Ephemeral
            });
        }

        // Initialize state
        activeQuizzes.set(userId, {
            scores: { twilight: 0, rainbow: 0, fluttershy: 0, pinkie: 0, rarity: 0, applejack: 0 },
            question: 0
        });

        const embed = buildQuestionEmbed(0);
        embed.setDescription(
            `🎉 *bounces excitedly* OH OH OH! It\'s TIME for Pinkie\'s Pony Personality Quiz!\n\n**${questions[0].text}**\n\n*Pick the answer that fits you best!*`
        );

        const row = buildSelectMenu(0);
        const reply = await interaction.reply({ embeds: [embed], components: [row], fetchReply: true });

        // ─── Collector ────────────────────────────────────────────────────────
        const collector = reply.createMessageComponentCollector({
            filter: i => i.user.id === userId,
            time: 5 * 60 * 1000 // 5 minutes
        });

        collector.on('collect', async i => {
            const state = activeQuizzes.get(userId);
            if (!state) return;

            const qIndex = state.question;

            // Validate customId matches expected question
            if (i.customId !== `quiz_answer_${qIndex}`) return;

            // Award point
            const chosen = i.values[0];
            state.scores[chosen] += 1;
            state.question += 1;

            // More questions?
            if (state.question < questions.length) {
                const nextEmbed = buildQuestionEmbed(state.question);
                const nextRow = buildSelectMenu(state.question);
                await i.update({ embeds: [nextEmbed], components: [nextRow] });
            } else {
                // Quiz complete
                collector.stop('done');
                activeQuizzes.delete(userId);

                const topPony = getTopPony(state.scores);
                const result = results[topPony];

                const resultEmbed = new EmbedBuilder()
                    .setColor(result.color)
                    .setTitle(`${result.icon} You are... **${result.name}**!`)
                    .setDescription(
                        `*drum roll* 🥁\n\n**Element of Harmony: ${result.element}** ${result.emoji}\n\n${result.description}`
                    )
                    .addFields(
                        { name: '✨ Your Traits', value: result.traits, inline: false }
                    )
                    .setFooter({ text: `Quiz completed by ${interaction.user.username} • Pinkie's Pony Personality Quiz 🎈` })
                    .setTimestamp();

                await i.update({ embeds: [resultEmbed], components: [] });
            }
        });

        collector.on('end', async (_, reason) => {
            if (reason !== 'done') {
                activeQuizzes.delete(userId);
                try {
                    const timeoutEmbed = new EmbedBuilder()
                        .setColor('#aaaaaa')
                        .setDescription('⏰ Quiz timed out! Use `/pony-quiz` again to start over.')
                        .setFooter({ text: 'Pinkie says: Don\'t keep a quiz waiting! 🎀' });
                    await reply.edit({ embeds: [timeoutEmbed], components: [] });
                } catch { /* message may already be gone */ }
            }
        });
    },
};
