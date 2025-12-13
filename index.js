// index.js
require('dotenv').config();
const fs = require('node:fs'); // Modul untuk membaca file sistem
const path = require('node:path'); // Modul untuk bekerja dengan jalur file
const { Client, GatewayIntentBits, Collection } = require('discord.js'); // Collection untuk menyimpan commands
const { startBirthdayChecker } = require('./birthday-checker'); // Import Pinkie's birthday system

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,        // Intent ini WAJIB untuk messageCreate
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent,       // Intent ini untuk membaca isi pesan
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.DirectMessages,       // Opsional: untuk DM
    ],
});

// Membuat Collection untuk menyimpan commands bot
client.commands = new Collection();

// --- Memuat Commands ---
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    // Set item baru di Collection dengan kunci nama perintah dan nilai modul yang diekspor
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
    } else {
        console.log(`[WARNING] Perintah di ${filePath} tidak memiliki properti "data" atau "execute" yang diperlukan.`);
    }
}

// --- Memuat Events ---
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, client));
    } else {
        // Ini adalah baris yang sangat penting untuk messageCreate
        client.on(event.name, (...args) => event.execute(...args, client));
    }
}

// Start Pinkie's automatic birthday celebration system
client.once('ready', () => {
    startBirthdayChecker(client);
});

// Masuk ke Discord dengan token bot Anda
client.login(process.env.DISCORD_TOKEN);