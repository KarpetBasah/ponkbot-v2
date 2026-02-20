// commands/birthday-set.js
const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const fs = require('fs');
const path = require('path');

const birthdaysFile = path.join(__dirname, '..', 'data', 'birthdays.json');

function loadBirthdays() {
    try {
        if (fs.existsSync(birthdaysFile)) {
            const data = fs.readFileSync(birthdaysFile, 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('Error loading birthdays:', error);
    }
    return {};
}

function saveBirthdays(birthdays) {
    try {
        // Ensure data directory exists
        const dataDir = path.dirname(birthdaysFile);
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
        fs.writeFileSync(birthdaysFile, JSON.stringify(birthdays, null, 2));
    } catch (error) {
        console.error('Error saving birthdays:', error);
    }
}

function isValidDate(day, month) {
    const daysInMonth = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]; // Including leap year Feb
    
    if (month < 1 || month > 12) return false;
    if (day < 1 || day > daysInMonth[month - 1]) return false;
    
    return true;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('birthday-set')
        .setDescription('Register your birthday so Pinkie can throw you the BEST party ever!')
        .addIntegerOption(option =>
            option.setName('day')
                .setDescription('Your birthday day (1-31)')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(31))
        .addIntegerOption(option =>
            option.setName('month')
                .setDescription('Your birthday month (1-12)')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(12))
        .addIntegerOption(option =>
            option.setName('year')
                .setDescription('Your birth year (optional - for age calculation)')
                .setRequired(false)
                .setMinValue(1900)
                .setMaxValue(2025)),
    async execute(interaction) {
        const day = interaction.options.getInteger('day');
        const month = interaction.options.getInteger('month');
        const year = interaction.options.getInteger('year');
        const user = interaction.user;
        
        try {
            // Validate date
            if (!isValidDate(day, month)) {
                const errorEmbed = new EmbedBuilder()
                    .setColor('#ff6b6b')
                    .setTitle('🎂 OOPSIE! Invalid Birthday Date!')
                    .setDescription('OH NO! That date doesn\'t exist! Even Pinkie\'s party magic can\'t make impossible dates real!')
                    .addFields({
                        name: '📅 Valid Dates',
                        value: 'Please check your day and month values:\n• Day: 1-31\n• Month: 1-12\n• Make sure the day exists in that month!',
                        inline: false
                    })
                    .setFooter({ text: 'Pinkie\'s Birthday Registry • Let\'s try again! 🎈' });
                
                return await interaction.reply({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral });
            }
            
            // Load existing birthdays
            const birthdays = loadBirthdays();
            const guildId = interaction.guild?.id || 'dm';
            
            if (!birthdays[guildId]) {
                birthdays[guildId] = {};
            }
            
            // Month names for display
            const monthNames = [
                'January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'
            ];
            
            // Save birthday
            birthdays[guildId][user.id] = {
                day: day,
                month: month,
                year: year || null,
                username: user.username,
                registeredAt: Date.now()
            };
            
            saveBirthdays(birthdays);
            
            // Create celebration embed
            const birthdayDate = `${monthNames[month - 1]} ${day}`;
            const ageText = year ? ` (born in ${year})` : '';
            
            const successEmbed = new EmbedBuilder()
                .setColor('#ff1493')
                .setTitle('🎉 BIRTHDAY REGISTERED! PARTY TIME! 🎉')
                .setDescription(`*bounces excitedly with confetti everywhere*\n\nWHEEEE! ${user.username}! I\'ve added your birthday to my super-special party calendar!`)
                .addFields(
                    { name: '🎂 Your Birthday', value: `${birthdayDate}${ageText}`, inline: true },
                    { name: '🎈 Party Preparation', value: 'I\'m already planning the most AMAZING celebration for you!', inline: true },
                    { name: '🧁 Pinkie\'s Promise', value: 'I PROMISE to throw you the most spectacular birthday party when your special day arrives! With cupcakes, streamers, and SO MUCH FUN!', inline: false },
                    { name: '🎪 What Happens Next?', value: '• I\'ll automatically wish you happy birthday on your special day!\n• Everyone in the server will know it\'s party time!\n• You\'ll get a super-special birthday role (if admins set it up)!\n• CUPCAKES FOR EVERYONE! 🧁', inline: false }
                )
                .setThumbnail(user.displayAvatarURL({ dynamic: true }))
                .setFooter({ text: 'Pinkie\'s Birthday Party Planning • Every birthday deserves a celebration! 🎂' })
                .setTimestamp();

            await interaction.reply({ embeds: [successEmbed] });
            
            // Log to channel if in server
            if (interaction.guild) {
                const logChannel = interaction.guild.channels.cache.find(ch => 
                    ch.name.includes('general') || ch.name.includes('birthday') || ch.name.includes('party')
                );
                
                if (logChannel && logChannel.isTextBased()) {
                    const logEmbed = new EmbedBuilder()
                        .setColor('#ff69b4')
                        .setTitle('🎂 New Birthday Added!')
                        .setDescription(`${user.username} just registered their birthday! Mark your calendars for ${birthdayDate}! 🎉`)
                        .setThumbnail(user.displayAvatarURL({ dynamic: true }))
                        .setFooter({ text: 'Pinkie\'s Birthday Calendar • More friends to celebrate!' })
                        .setTimestamp();
                    
                    try {
                        await logChannel.send({ embeds: [logEmbed] });
                    } catch (logError) {
                        console.log('Could not send birthday registration log');
                    }
                }
            }
            
        } catch (error) {
            console.error('Error in birthday-set command:', error);
            
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff6b6b')
                .setTitle('🎪 Birthday Registration Failed!')
                .setDescription('OH NO! Something went wrong while registering your birthday! But don\'t worry, we can try again!')
                .setFooter({ text: 'Pinkie\'s Birthday Registry • Error Handling' });

            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral });
            } else {
                await interaction.reply({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral });
            }
        }
    },
};
