// events/ready.js
const { Events, GatewayIntentBits, ActivityType } = require('discord.js');

module.exports = {
    name: Events.ClientReady, // Nama event yang didengarkan
    once: true, // Event ini hanya dijalankan sekali
    async execute(client) {
        console.log(`Bot ${client.user.tag} sudah online!`);

        // --- TAMBAH DEBUG INI ---
        console.log('🔍 Checking Message Content Intent status...');
        console.log('Intents yang diterima bot:');
        for (const intentName in GatewayIntentBits) {
            if (typeof GatewayIntentBits[intentName] === 'number') { // Pastikan itu adalah nilai intent
                if ((client.options.intents & GatewayIntentBits[intentName]) === GatewayIntentBits[intentName]) {
                    console.log(`- ${intentName}`);
                    
                    // Special check for MessageContent
                    if (intentName === 'MessageContent') {
                        console.log('✅ MESSAGE CONTENT INTENT IS ENABLED!');
                    }
                }
            }
        }
        
        // Check if MessageContent intent is missing
        if ((client.options.intents & GatewayIntentBits.MessageContent) !== GatewayIntentBits.MessageContent) {
            console.log('❌ WARNING: MESSAGE CONTENT INTENT IS DISABLED!');
            console.log('🔧 Please enable it in Discord Developer Portal:');
            console.log('   https://discord.com/developers/applications');
            console.log('   Bot > Privileged Gateway Intents > MESSAGE CONTENT INTENT');
        }
        // --- AKHIR DEBUG ---

        // Pinkie Pie themed status messages
        const pinkieStatuses = [
            "🎉 Throwing parties for everypony!",
            "🧁 Baking friendship cupcakes!",
            "🎈 Bouncing around Ponyville!",
            "🎪 Planning the next big party!",
            "🍰 Spreading smiles and giggles!",
            "🎭 Making friends everywhere!",
            "🌈 Sharing the magic of laughter!",
            "🎊 Ready for a surprise party!"
        ];
        
        const randomStatus = pinkieStatuses[Math.floor(Math.random() * pinkieStatuses.length)];
        
        client.user.setPresence({
            activities: [{
                name: 'Custom Status', 
                state: randomStatus,
                type: ActivityType.Custom,
            }],
            status: 'online',
        });
        console.log(`🎈 Pinkie's status set to: ${randomStatus}`);

        // --- AUTOMATIC SLASH COMMAND REGISTRATION ---
        // Menggunakan sistem otomatis berdasarkan file di folder /commands/
        // Ini akan menggunakan deskripsi yang sudah diperbaiki ke Bahasa Inggris
        
        const fs = require('fs');
        const path = require('path');
        
        const commands = [];
        const foldersPath = path.join(__dirname, '..', 'commands');
        const commandFiles = fs.readdirSync(foldersPath).filter(file => file.endsWith('.js'));
        
        for (const file of commandFiles) {
            const filePath = path.join(foldersPath, file);
            const command = require(filePath);
            if ('data' in command && 'execute' in command) {
                commands.push(command.data.toJSON());
            }
        }

        // REGISTRATION STRATEGY
        // Set mode: 'development', 'production', atau 'hybrid'
        const registrationMode = 'production'; // Ubah ke 'production' untuk production
        const testGuildId = '1124372810257674290'; // Guild untuk development testing

        try {
            if (registrationMode === 'development') {
                // MODE DEVELOPMENT: Hanya guild commands (instant, no duplicates)
                console.log('🛠️ DEVELOPMENT MODE: Mendaftarkan commands di guild test...');
                const guild = client.guilds.cache.get(testGuildId);
                if (guild) {
                    await guild.commands.set(commands);
                    console.log('✅ Commands terdaftar di guild test (instant, no duplicates!)');
                    console.log(`📍 Server: ${guild.name}`);
                    console.log('⚡ Gunakan mode ini untuk development & testing');
                } else {
                    console.log('⚠️ Guild test tidak ditemukan! Fallback ke global...');
                    await client.application.commands.set(commands);
                    console.log('✅ Fallback: Commands terdaftar global');
                }
            } else if (registrationMode === 'production') {
                // MODE PRODUCTION: Hanya global commands (1-24 jam, no duplicates)
                console.log('🌍 PRODUCTION MODE: Mendaftarkan commands secara global...');
                await client.application.commands.set(commands);
                console.log('✅ Commands terdaftar global (1-24 jam untuk propagasi)');
                console.log('🌐 Tersedia di semua server + DM setelah propagasi');
                
                // Bersihkan guild commands untuk menghindari duplikasi
                const guild = client.guilds.cache.get(testGuildId);
                if (guild) {
                    await guild.commands.set([]);
                    console.log('🧹 Guild commands dibersihkan untuk menghindari duplikasi');
                }
            } else if (registrationMode === 'hybrid') {
                // MODE HYBRID: Global + guild, tapi dengan peringatan duplikasi
                console.log('⚠️ HYBRID MODE: Commands akan duplikat!');
                await client.application.commands.set(commands);
                const guild = client.guilds.cache.get(testGuildId);
                if (guild) {
                    await guild.commands.set(commands);
                    console.log('🔄 Commands terdaftar global + guild (akan duplikat!)');
                }
            }
        } catch (error) {
            console.error('❌ Gagal mendaftarkan slash commands:', error);
        }
        // --- AKHIR DAFTAR SLASH COMMAND ---
    },
};