// commands/birthday-list.js
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

function getDaysUntilBirthday(day, month) {
    const today = new Date();
    const currentYear = today.getFullYear();
    
    let birthdayThisYear = new Date(currentYear, month - 1, day);
    
    // If birthday already passed this year, calculate for next year
    if (birthdayThisYear < today) {
        birthdayThisYear = new Date(currentYear + 1, month - 1, day);
    }
    
    const timeDiff = birthdayThisYear.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    return daysDiff;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('birthday-list')
        .setDescription('See upcoming birthdays! Time to plan some AMAZING parties! 🎉📅')
        .addStringOption(option =>
            option.setName('filter')
                .setDescription('Filter birthdays')
                .setRequired(false)
                .addChoices(
                    { name: '🎂 This Month', value: 'this_month' },
                    { name: '🎈 Next 30 Days', value: 'next_30' },
                    { name: '🎪 Today!', value: 'today' },
                    { name: '🧁 All Birthdays', value: 'all' }
                )),
    async execute(interaction) {
        const filter = interaction.options.getString('filter') || 'next_30';
        
        try {
            const birthdays = loadBirthdays();
            const guildId = interaction.guild?.id || 'dm';
            const guildBirthdays = birthdays[guildId] || {};
            
            if (Object.keys(guildBirthdays).length === 0) {
                const noBirthdaysEmbed = new EmbedBuilder()
                    .setColor('#ff69b4')
                    .setTitle('🎂 NO BIRTHDAYS YET!')
                    .setDescription('*gasps dramatically* OH MY GOSH! There are no birthdays registered yet!')
                    .addFields({
                        name: '🎈 How to Fix This',
                        value: 'Use `/birthday-set` to register your birthday and I\'ll throw you the most SPECTACULAR party when your special day comes!',
                        inline: false
                    })
                    .setFooter({ text: 'Pinkie\'s Birthday Calendar • Empty but ready for parties! 🎪' })
                    .setTimestamp();

                return await interaction.reply({ embeds: [noBirthdaysEmbed] });
            }
            
            const today = new Date();
            const currentMonth = today.getMonth() + 1;
            const currentDay = today.getDate();
            
            // Month names for display
            const monthNames = [
                'January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'
            ];
            
            // Filter and sort birthdays
            let filteredBirthdays = [];
            
            for (const [userId, birthdayData] of Object.entries(guildBirthdays)) {
                const daysUntil = getDaysUntilBirthday(birthdayData.day, birthdayData.month);
                const isToday = birthdayData.day === currentDay && birthdayData.month === currentMonth;
                const isThisMonth = birthdayData.month === currentMonth;
                
                let shouldInclude = false;
                
                switch (filter) {
                    case 'today':
                        shouldInclude = isToday;
                        break;
                    case 'this_month':
                        shouldInclude = isThisMonth;
                        break;
                    case 'next_30':
                        shouldInclude = daysUntil <= 30;
                        break;
                    case 'all':
                        shouldInclude = true;
                        break;
                }
                
                if (shouldInclude) {
                    filteredBirthdays.push({
                        userId,
                        username: birthdayData.username,
                        day: birthdayData.day,
                        month: birthdayData.month,
                        year: birthdayData.year,
                        daysUntil,
                        isToday
                    });
                }
            }
            
            // Sort by days until birthday
            filteredBirthdays.sort((a, b) => a.daysUntil - b.daysUntil);
            
            if (filteredBirthdays.length === 0) {
                const noFilteredEmbed = new EmbedBuilder()
                    .setColor('#ff69b4')
                    .setTitle('🎪 No Birthdays in This Time Period!')
                    .setDescription('Aww, no birthdays found for your selected filter! But don\'t worry, there\'s always something to celebrate!')
                    .setFooter({ text: 'Pinkie\'s Birthday Calendar • Try a different filter! 🎈' });

                return await interaction.reply({ embeds: [noFilteredEmbed], flags: MessageFlags.Ephemeral });
            }
            
            // Create birthday list
            let birthdayList = '';
            let todaysBirthdays = '';
            
            for (const birthday of filteredBirthdays) {
                const dateStr = `${monthNames[birthday.month - 1]} ${birthday.day}`;
                const ageStr = birthday.year ? ` (born ${birthday.year})` : '';
                
                if (birthday.isToday) {
                    todaysBirthdays += `🎉 **${birthday.username}** - ${dateStr}${ageStr} - **TODAY! PARTY TIME!** 🎂\n`;
                } else {
                    const daysText = birthday.daysUntil === 1 ? 'TOMORROW!' : `${birthday.daysUntil} days`;
                    birthdayList += `🎈 **${birthday.username}** - ${dateStr}${ageStr} - *${daysText}*\n`;
                }
            }
            
            // Filter title
            const filterTitles = {
                'today': '🎂 TODAY\'S BIRTHDAY PARTIES!',
                'this_month': '🎈 THIS MONTH\'S BIRTHDAY BONANZA!',
                'next_30': '🎪 UPCOMING BIRTHDAY PARTIES (Next 30 Days)!',
                'all': '🧁 ALL REGISTERED BIRTHDAYS!'
            };
            
            const embed = new EmbedBuilder()
                .setColor('#ff1493')
                .setTitle(filterTitles[filter])
                .setDescription('*bounces excitedly while holding a party planning clipboard*\n\nHere are all the AMAZING birthday parties I\'m planning!');
            
            if (todaysBirthdays) {
                embed.addFields({
                    name: '🎉 BIRTHDAY PONIES TODAY! 🎉',
                    value: todaysBirthdays,
                    inline: false
                });
            }
            
            if (birthdayList) {
                embed.addFields({
                    name: '📅 Upcoming Birthday Parties',
                    value: birthdayList,
                    inline: false
                });
            }
            
            embed.addFields(
                {
                    name: '🎂 Party Planner\'s Notes',
                    value: `Total birthdays: ${filteredBirthdays.length}\nI\'ve got ${filteredBirthdays.filter(b => b.daysUntil <= 7).length} parties to prepare this week!`,
                    inline: true
                },
                {
                    name: '🧁 Pinkie\'s Tip',
                    value: 'Use `/birthday-set` to add your birthday if it\'s not here! Every birthday deserves a SPECTACULAR celebration!',
                    inline: false
                }
            )
            .setFooter({ text: `Pinkie\'s Birthday Calendar • ${filteredBirthdays.length} parties to plan! 🎪` })
            .setTimestamp();

            await interaction.reply({ embeds: [embed] });
            
        } catch (error) {
            console.error('Error in birthday-list command:', error);
            
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff6b6b')
                .setTitle('🎪 Birthday List Error!')
                .setDescription('OH NO! Something went wrong while getting the birthday list! But don\'t worry, the parties will still be amazing!')
                .setFooter({ text: 'Pinkie\'s Birthday Calendar • Error Handling' });

            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral });
            } else {
                await interaction.reply({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral });
            }
        }
    },
};
