// events/interactionCreate.js
const { Events } = require('discord.js');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isCommand()) return; // Pastikan ini adalah perintah slash

        const { commandName } = interaction;

        // Cek apakah perintah ada di koleksi commands bot
        const command = interaction.client.commands.get(commandName);

        if (!command) {
            console.error(`Tidak ada perintah yang cocok dengan ${commandName} ditemukan.`);
            return;
        }

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(`Error saat menjalankan perintah ${commandName}`);
            console.error(error);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: 'Terjadi kesalahan saat menjalankan perintah ini!', ephemeral: true });
            } else {
                await interaction.reply({ content: 'Terjadi kesalahan saat menjalankan perintah ini!', ephemeral: true });
            }
        }
    },
};