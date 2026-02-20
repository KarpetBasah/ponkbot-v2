// commands/ping.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('PING PARTY TIME! Test my super-duper connection!'),
    async execute(interaction) {
        const sent = await interaction.reply({ content: '� WHEEE! Testing my party connection...', fetchReply: true });
        const latency = sent.createdTimestamp - interaction.createdTimestamp;
        
        // Pinkie Pie's fun latency responses
        let latencyResponse = '';
        if (latency < 100) {
            latencyResponse = 'SUPER-DUPER FAST! Faster than me eating cupcakes! 🧁💨';
        } else if (latency < 300) {
            latencyResponse = 'Pretty speedy! Like a good canter through Ponyville! 🐎💖';
        } else if (latency < 500) {
            latencyResponse = 'A little slow, but that\'s okay! More time to enjoy the party! 🎪';
        } else {
            latencyResponse = 'Whoa! Slower than Applejack carrying apple buckets! But still fun! 🍎';
        }
        
        const embed = new EmbedBuilder()
            .setColor('#ff1493')
            .setTitle('🎉 PINKIE\'S PING PARTY RESULTS! 🎉')
            .setDescription('*bounces excitedly while showing connection stats*')
            .addFields(
                { name: '🎈 Party Connection Speed', value: `${latency}ms\n${latencyResponse}`, inline: true },
                { name: '🎪 Discord Magic Speed', value: `${Math.round(interaction.client.ws.ping)}ms\n*giggles* That\'s how fast I talk to Discord!`, inline: true },
                { name: '🧁 Party Status', value: '**PARTY MODE: ACTIVATED!** 🎊\nFun Level: MAXIMUM!\nSmiles: UNLIMITED!', inline: false }
            )
            .setThumbnail('https://derpicdn.net/img/view/2017/3/4/1379385.gif') // You can add Pinkie Pie image URL here
            .setFooter({ text: 'Pinkie Pie\'s Ping Party! • Every ping deserves a celebration! 🎂' })
            .setTimestamp();

        await interaction.editReply({ content: '', embeds: [embed] });
    },
};