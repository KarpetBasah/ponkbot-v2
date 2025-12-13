// commands/birthday-schedule.js
const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');

function getCurrentUTCTime() {
    const now = new Date();
    return {
        hours: now.getUTCHours(),
        minutes: now.getUTCMinutes(),
        seconds: now.getUTCSeconds(),
        dateString: now.toISOString().split('T')[0],
        fullString: now.toISOString()
    };
}

function calculateTimeUntilMidnightUTC() {
    const now = new Date();
    const nextMidnight = new Date(now);
    nextMidnight.setUTCHours(24, 0, 0, 0);
    
    const timeDiff = nextMidnight.getTime() - now.getTime();
    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
    
    return { hours, minutes, seconds, totalMs: timeDiff };
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('birthday-schedule')
        .setDescription('Check Pinkie\'s birthday checker schedule and next run time! ⏰🎂')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        try {
            // Check if command is used in DM
            if (!interaction.guild) {
                const errorEmbed = new EmbedBuilder()
                    .setColor('#ff6b6b')
                    .setTitle('🚫 Server Only Command!')
                    .setDescription('This command can only be used in servers, not in DMs!')
                    .setFooter({ text: 'Pinkie\'s Birthday Schedule • Server info only! 🎪' });
                
                return await interaction.reply({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral });
            }

            const executorMember = await interaction.guild.members.fetch(interaction.user.id);

            // Check permissions
            if (!executorMember.permissions.has(PermissionFlagsBits.Administrator)) {
                const errorEmbed = new EmbedBuilder()
                    .setColor('#ff6b6b')
                    .setTitle('🚫 Admin Only!')
                    .setDescription('Only administrators can check my birthday schedule! This is super-secret party planning info!')
                    .setFooter({ text: 'Pinkie\'s Birthday Schedule • Admin security! 🎂' });
                
                return await interaction.reply({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral });
            }

            const currentUTC = getCurrentUTCTime();
            const timeUntilMidnight = calculateTimeUntilMidnightUTC();
            
            // Format next midnight time
            const nextMidnight = new Date();
            nextMidnight.setUTCHours(24, 0, 0, 0);
            const nextMidnightString = nextMidnight.toISOString().split('T')[0];
            
            const scheduleEmbed = new EmbedBuilder()
                .setColor('#ff1493')
                .setTitle('⏰ PINKIE\'S BIRTHDAY CHECKER SCHEDULE! ⏰')
                .setDescription('*looks at party planning calendar with excitement*\n\nHere\'s when I check for birthdays to throw AMAZING parties!')
                .addFields(
                    { 
                        name: '🕐 Current UTC Time', 
                        value: `${currentUTC.hours.toString().padStart(2, '0')}:${currentUTC.minutes.toString().padStart(2, '0')}:${currentUTC.seconds.toString().padStart(2, '0')} UTC\n📅 ${currentUTC.dateString}`, 
                        inline: true 
                    },
                    { 
                        name: '⏰ Next Birthday Check', 
                        value: `Tomorrow at 00:00 UTC\n📅 ${nextMidnightString}`, 
                        inline: true 
                    },
                    { 
                        name: '⏳ Time Until Next Check', 
                        value: `${timeUntilMidnight.hours}h ${timeUntilMidnight.minutes}m ${timeUntilMidnight.seconds}s`, 
                        inline: true 
                    },
                    { 
                        name: '🎂 Check Schedule', 
                        value: '• **Daily at 00:00 UTC** (midnight worldwide!)\n• **Startup Check** (when bot restarts)\n• **Manual Test** (with `/birthday-test`)', 
                        inline: false 
                    },
                    { 
                        name: '🎪 Why 00:00 UTC?', 
                        value: 'This ensures birthday celebrations happen at the START of each day! No matter what timezone ponies are in, they get celebrated as soon as their birthday arrives somewhere in the world!', 
                        inline: false 
                    },
                    { 
                        name: '🧁 Optimization Benefits', 
                        value: '✅ Reduced server load (once daily vs hourly)\n✅ Precise timing at day start\n✅ Better battery life for hosting\n✅ More organized party planning!\n✅ Consistent celebration timing', 
                        inline: false 
                    },
                    {
                        name: '🌍 UTC Time Zones Reference',
                        value: '🇬🇧 London: UTC+0\n🇺🇸 New York: UTC-5\n🇺🇸 Los Angeles: UTC-8\n🇯🇵 Tokyo: UTC+9\n🇦🇺 Sydney: UTC+10',
                        inline: false
                    }
                )
                .setFooter({ text: 'Pinkie\'s Birthday Scheduler • Perfectly timed parties! 🎂' })
                .setTimestamp();

            await interaction.reply({ embeds: [scheduleEmbed], flags: MessageFlags.Ephemeral });

        } catch (error) {
            console.error('Error in birthday-schedule command:', error);
            
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff6b6b')
                .setTitle('⏰ Schedule Check Failed!')
                .setDescription('OH NO! Something went wrong while checking my birthday schedule! But don\'t worry, the parties will still happen!')
                .setFooter({ text: 'Pinkie\'s Birthday Schedule • Error in timing!' });

            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral });
            } else {
                await interaction.reply({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral });
            }
        }
    },
};
