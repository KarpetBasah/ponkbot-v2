// commands/birthday-remove.js
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

module.exports = {
    data: new SlashCommandBuilder()
        .setName('birthday-remove')
        .setDescription('Remove your birthday from Pinkie\'s party calendar 😢')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Remove someone else\'s birthday (admin only)')
                .setRequired(false)),
    async execute(interaction) {
        const targetUser = interaction.options.getUser('user') || interaction.user;
        const isRemovingOthers = targetUser.id !== interaction.user.id;
        
        try {
            // Check if user is trying to remove someone else's birthday
            if (isRemovingOthers) {
                if (!interaction.member?.permissions.has('ADMINISTRATOR')) {
                    const errorEmbed = new EmbedBuilder()
                        .setColor('#ff6b6b')
                        .setTitle('🚫 Permission Denied!')
                        .setDescription('OH NO! You can only remove your own birthday! Only administrators can remove other ponies\' birthdays!')
                        .setFooter({ text: 'Pinkie\'s Birthday Security • Protecting party plans! 🎂' });
                    
                    return await interaction.reply({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral });
                }
            }
            
            // Load birthdays
            const birthdays = loadBirthdays();
            const guildId = interaction.guild?.id || 'dm';
            
            if (!birthdays[guildId] || !birthdays[guildId][targetUser.id]) {
                const notFoundEmbed = new EmbedBuilder()
                    .setColor('#ff69b4')
                    .setTitle('🤔 Birthday Not Found!')
                    .setDescription(`*looks through party planning notes*\n\nOh! ${targetUser.username}'s birthday isn't in my party calendar yet!`)
                    .addFields({
                        name: '🎈 How to Add Birthday',
                        value: 'Use `/birthday-set` to register a birthday so I can throw the most AMAZING party when the special day comes!',
                        inline: false
                    })
                    .setFooter({ text: 'Pinkie\'s Birthday Calendar • No party to cancel! 🎪' });
                
                return await interaction.reply({ embeds: [notFoundEmbed], flags: MessageFlags.Ephemeral });
            }
            
            // Get birthday info before removing
            const birthdayInfo = birthdays[guildId][targetUser.id];
            const monthNames = [
                'January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'
            ];
            const birthdayDate = `${monthNames[birthdayInfo.month - 1]} ${birthdayInfo.day}`;
            
            // Remove birthday
            delete birthdays[guildId][targetUser.id];
            saveBirthdays(birthdays);
            
            // Create sad but understanding response
            const removeEmbed = new EmbedBuilder()
                .setColor('#ff69b4')
                .setTitle('😢 Birthday Removed from Party Calendar')
                .setDescription(`*sniffles sadly but understandingly*\n\nOkay... I've removed ${targetUser.username}'s birthday from my party planning calendar...`)
                .addFields(
                    { name: '🎂 Removed Birthday', value: birthdayDate, inline: true },
                    { name: '💔 Pinkie\'s Feelings', value: 'I\'m a little sad we won\'t be throwing that party, but I understand everypony has their reasons!', inline: false },
                    { name: '🎈 Always Welcome Back', value: 'If you ever change your mind, you can always use `/birthday-set` again! I\'ll be ready to plan the most SPECTACULAR celebration!', inline: false },
                    { name: '🧁 Pinkie\'s Promise', value: 'Even without the birthday party, you\'re still an AMAZING friend and I\'ll always be here to spread smiles and giggles!', inline: false }
                )
                .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
                .setFooter({ text: 'Pinkie\'s Birthday Calendar • Always understanding! 💖' })
                .setTimestamp();

            await interaction.reply({ embeds: [removeEmbed] });
            
            // Log removal if in server
            if (interaction.guild) {
                const logChannel = interaction.guild.channels.cache.find(ch => 
                    ch.name.includes('general') || ch.name.includes('birthday') || ch.name.includes('party')
                );
                
                if (logChannel && logChannel.isTextBased()) {
                    const logEmbed = new EmbedBuilder()
                        .setColor('#ffadd6')
                        .setTitle('📝 Birthday Removed')
                        .setDescription(`${targetUser.username} removed their birthday (${birthdayDate}) from the party calendar.`)
                        .setFooter({ text: 'Pinkie\'s Birthday Log • Respecting privacy!' })
                        .setTimestamp();
                    
                    try {
                        await logChannel.send({ embeds: [logEmbed] });
                    } catch (logError) {
                        console.log('Could not send birthday removal log');
                    }
                }
            }
            
        } catch (error) {
            console.error('Error in birthday-remove command:', error);
            
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff6b6b')
                .setTitle('🎪 Birthday Removal Failed!')
                .setDescription('OH NO! Something went wrong while removing the birthday! But don\'t worry, we can try again!')
                .setFooter({ text: 'Pinkie\'s Birthday System • Error Handling' });

            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral });
            } else {
                await interaction.reply({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral });
            }
        }
    },
};
