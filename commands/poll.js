// commands/poll.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('poll')
        .setDescription('Create a simple poll')
        .addStringOption(option =>
            option.setName('question')
                .setDescription('The poll question')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('option1')
                .setDescription('Option 1')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('option2')
                .setDescription('Option 2')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('option3')
                .setDescription('Option 3 (optional)')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('option4')
                .setDescription('Option 4 (optional)')
                .setRequired(false)),
    async execute(interaction) {
        const question = interaction.options.getString('question');
        const option1 = interaction.options.getString('option1');
        const option2 = interaction.options.getString('option2');
        const option3 = interaction.options.getString('option3');
        const option4 = interaction.options.getString('option4');
        
        const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣'];
        const options = [option1, option2];
        
        if (option3) options.push(option3);
        if (option4) options.push(option4);
        
        let description = '';
        for (let i = 0; i < options.length; i++) {
            description += `${emojis[i]} ${options[i]}\n`;
        }
        
        const embed = new EmbedBuilder()
            .setColor('#9b59b6')
            .setTitle(`📊 ${question}`)
            .setDescription(description)
            .setFooter({ text: `Poll created by ${interaction.user.username}` })
            .setTimestamp();

        const message = await interaction.reply({ embeds: [embed], fetchReply: true });
        
        // Tambahkan reaksi untuk setiap opsi
        for (let i = 0; i < options.length; i++) {
            await message.react(emojis[i]);
        }
    },
};
