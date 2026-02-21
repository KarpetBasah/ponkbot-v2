// commands/pinkie-sense.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const senses = [
    {
        twitch: 'Tail Twitch',
        signal: '🐴 *tail twitches rapidly*',
        meaning: 'Something is about to fall from above! Best to stay away from balconies, tall shelves, or... flying pies.',
        advice: 'Stay indoors and wear a helmet just in case!'
    },
    {
        twitch: 'Knee Twitch',
        signal: '🦵 *knee bounces uncontrollably*',
        meaning: 'Something scary is coming! But don\'t worry, scary things are just surprises that haven\'t introduced themselves yet.',
        advice: 'Take a deep breath and have a cupcake ready for courage!'
    },
    {
        twitch: 'Eye Flutter',
        signal: '👁️ *eye flutters left and right*',
        meaning: 'Keep your eyes peeled! There\'s a hidden opportunity nearby that most ponies would miss.',
        advice: 'Look carefully at the small details today — something wonderful is tucked away!'
    },
    {
        twitch: 'Ear Wiggle',
        signal: '👂 *ear wiggles three times*',
        meaning: 'Somepony nearby needs a friend right now! The Pinkie Sense never lies about loneliness.',
        advice: 'Reach out to a friend you haven\'t talked to in a while. It\'ll mean more than you know!'
    },
    {
        twitch: 'Shoulder Shiver',
        signal: '😬 *shivers from top to bottom*',
        meaning: 'A MAJOR surprise party event is on the horizon! Could be for you, could be for someone you love.',
        advice: 'Start stockpiling streamers and confetti immediately!'
    },
    {
        twitch: 'Nose Nuzzle',
        signal: '👃 *nose twitches like a bunny*',
        meaning: 'Something delicious is headed your way today. Could be a meal, a gift, or a really sweet compliment.',
        advice: 'Leave room for dessert — literally and figuratively!'
    },
    {
        twitch: 'Whole Body Shimmy',
        signal: '🎊 *entire body vibrates with excitement*',
        meaning: 'OH WOW. This is the big one. Something INCREDIBLY exciting is about to happen. Could be life-changing!',
        advice: 'Clear your schedule! You won\'t want to miss this!'
    },
    {
        twitch: 'Hoof Tap',
        signal: '🦶 *hoof taps rhythmically on the ground*',
        meaning: 'Someone is on their way to see you! Could be an old friend, a new one, or a surprise visitor.',
        advice: 'Tidy up a little and put on your best smile. Company is coming!'
    },
    {
        twitch: 'Tail Wag',
        signal: '🐾 *tail wags back and forth like a puppy*',
        meaning: 'Great news is about to reach you! Stay near your messages and notifications today.',
        advice: 'Don\'t put your phone on silent — you\'ll want to hear this!'
    },
    {
        twitch: 'Belly Gurgle',
        signal: '🎵 *tummy makes a melodic sound*',
        meaning: 'Today is a perfect day for music and creativity. Your inner artist is trying to come out!',
        advice: 'Hum your favorite song today — it might turn into something amazing!'
    }
];

const intensities = [
    { label: 'Mild Twitch', color: '#FFD1DC', stars: '⭐' },
    { label: 'Strong Twitch', color: '#FF69B4', stars: '⭐⭐' },
    { label: 'SUPER DUPER Twitch', color: '#FF1493', stars: '⭐⭐⭐' }
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pinkie-sense')
        .setDescription('Pinkie Pie\'s mysterious twitchy predictions — what does today hold?'),
    async execute(interaction) {
        const sense = senses[Math.floor(Math.random() * senses.length)];
        const intensity = intensities[Math.floor(Math.random() * intensities.length)];

        const embed = new EmbedBuilder()
            .setColor(intensity.color)
            .setTitle('🎀 The Pinkie Sense is Tingling!')
            .setDescription(`${sense.signal}\n\n*gasps dramatically* I feel it! THE PINKIE SENSE!`)
            .addFields(
                { name: '✨ Sense Type', value: `**${sense.twitch}**`, inline: true },
                { name: '📊 Intensity', value: `${intensity.stars} ${intensity.label}`, inline: true },
                { name: '\u200b', value: '\u200b', inline: true },
                { name: '🔮 What It Means', value: sense.meaning, inline: false },
                { name: '💡 Pinkie\'s Advice', value: sense.advice, inline: false }
            )
            .setFooter({ text: `Predicted for ${interaction.user.username} • The Pinkie Sense is never wrong! 🎈` })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
