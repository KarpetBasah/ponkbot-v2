// birthday-checker.js
const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const birthdaysFile = path.join(__dirname, 'data', 'birthdays.json');

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

function calculateAge(birthYear) {
    if (!birthYear) return null;
    return new Date().getFullYear() - birthYear;
}

async function checkBirthdays(client) {
    try {
        const birthdays = loadBirthdays();
        const today = new Date();
        const currentDay = today.getDate();
        const currentMonth = today.getMonth() + 1; // JavaScript months are 0-indexed
        const utcTime = getCurrentUTCTime();
        
        console.log(`🎂 Checking birthdays for ${currentDay}/${currentMonth} at ${utcTime.hours.toString().padStart(2, '0')}:${utcTime.minutes.toString().padStart(2, '0')} UTC...`);
        
        let totalBirthdaysFound = 0;
        let totalGuildsChecked = 0;
        
        for (const [guildId, guildBirthdays] of Object.entries(birthdays)) {
            if (guildId === 'dm') continue; // Skip DM birthdays for server celebrations
            
            totalGuildsChecked++;
            const guild = client.guilds.cache.get(guildId);
            if (!guild) {
                console.log(`⚠️ Guild ${guildId} not found, skipping...`);
                continue;
            }
            
            // Find birthday channel or general channel
            const birthdayChannel = guild.channels.cache.find(ch => 
                ch.name.includes('birthday') || 
                ch.name.includes('party') || 
                ch.name.includes('general') ||
                ch.name.includes('celebration')
            );
            
            if (!birthdayChannel || !birthdayChannel.isTextBased()) continue;
            
            // Check for today's birthdays
            for (const [userId, birthdayData] of Object.entries(guildBirthdays)) {
                if (birthdayData.day === currentDay && birthdayData.month === currentMonth) {
                    totalBirthdaysFound++;
                    console.log(`🎉 Found birthday #${totalBirthdaysFound}: ${birthdayData.username} in ${guild.name}!`);
                    
                    try {
                        const user = await client.users.fetch(userId);
                        const member = await guild.members.fetch(userId).catch(() => null);
                        
                        if (!member) {
                            console.log(`⚠️ ${birthdayData.username} is no longer in the server`);
                            continue;
                        }
                        
                        const age = calculateAge(birthdayData.year);
                        const ageText = age ? ` (turning ${age} today!)` : '';
                        
                        // Pinkie's SUPER excited birthday messages
                        const birthdayMessages = [
                            `🎉 SURPRISE! IT'S ${user.username.toUpperCase()}'S BIRTHDAY! 🎉`,
                            `🎂 BIRTHDAY PARTY ALERT! ${user.username.toUpperCase()} IS THE BIRTHDAY PONY TODAY! 🎂`,
                            `🎈 OH MY GOSH OH MY GOSH! IT'S ${user.username.toUpperCase()}'S SPECIAL DAY! 🎈`,
                            `🧁 CUPCAKE TIME! ${user.username.toUpperCase()} IS HAVING A BIRTHDAY! 🧁`,
                            `🎪 BIRTHDAY CARNIVAL FOR ${user.username.toUpperCase()}! LET'S CELEBRATE! 🎪`
                        ];
                        
                        const randomMessage = birthdayMessages[Math.floor(Math.random() * birthdayMessages.length)];
                        
                        const birthdayEmbed = new EmbedBuilder()
                            .setColor('#ff1493')
                            .setTitle('🎉 PINKIE\'S BIRTHDAY CELEBRATION! 🎉')
                            .setDescription(`*throws confetti everywhere and bounces uncontrollably*\n\n${randomMessage}`)
                            .addFields(
                                { 
                                    name: '🎂 Birthday Pony', 
                                    value: `${user.username}${ageText}`, 
                                    inline: true 
                                },
                                { 
                                    name: '🎈 Party Status', 
                                    value: 'MAXIMUM CELEBRATION MODE!', 
                                    inline: true 
                                },
                                { 
                                    name: '🧁 Birthday Treats', 
                                    value: '*hands out cupcakes to everyone*\nCupcakes for everypony! This calls for the biggest party EVER!', 
                                    inline: false 
                                },
                                { 
                                    name: '🎪 Pinkie\'s Birthday Wishes', 
                                    value: `Happy happy birthday ${user.username}! May your day be filled with laughter, joy, and ALL the cake you can eat! You\'re AMAZING and deserve the most SPECTACULAR day ever!`, 
                                    inline: false 
                                },
                                {
                                    name: '🌈 Birthday Fun Facts',
                                    value: '🎭 Every birthday is a reason to throw a party!\n🍰 Birthdays taste better with friends!\n🎊 You\'re now officially one year more AWESOME!\n🎵 Time for the birthday song! *starts singing*',
                                    inline: false
                                }
                            )
                            .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 256 }))
                            .setImage('https://derpicdn.net/img/view/2012/7/15/45675.gif') // Pinkie party GIF
                            .setFooter({ text: 'Pinkie\'s Automatic Birthday Party System • Every birthday is special! 🎂' })
                            .setTimestamp();

                        // Send birthday message
                        await birthdayChannel.send({ 
                            content: `🎉 ${user} 🎉 @everyone BIRTHDAY PARTY TIME! 🎉`,
                            embeds: [birthdayEmbed] 
                        });
                        
                        // Try to give birthday role if it exists
                        const birthdayRole = guild.roles.cache.find(role => 
                            role.name.toLowerCase().includes('birthday') ||
                            role.name.toLowerCase().includes('party')
                        );
                        
                        if (birthdayRole && member) {
                            try {
                                await member.roles.add(birthdayRole);
                                console.log(`🎭 Added birthday role to ${user.username}`);
                                
                                // Set timeout to remove role after 24 hours
                                setTimeout(async () => {
                                    try {
                                        await member.roles.remove(birthdayRole);
                                        console.log(`🎭 Removed birthday role from ${user.username} after 24 hours`);
                                    } catch (removeError) {
                                        console.log(`Could not remove birthday role from ${user.username}`);
                                    }
                                }, 24 * 60 * 60 * 1000); // 24 hours
                            } catch (roleError) {
                                console.log(`Could not add birthday role to ${user.username}`);
                            }
                        }
                        
                        // Try to send birthday DM
                        try {
                            const dmEmbed = new EmbedBuilder()
                                .setColor('#ff1493')
                                .setTitle('🎂 HAPPY BIRTHDAY FROM PINKIE PIE! 🎂')
                                .setDescription(`*bounces excitedly with a huge birthday cake*\n\nHAPPY BIRTHDAY ${user.username}! 🎉🎈`)
                                .addFields(
                                    { 
                                        name: '🧁 Personal Birthday Message', 
                                        value: `OH MY GOSH! It\'s your SPECIAL day! I hope you have the most AMAZING, SPECTACULAR, SUPER-DUPER birthday ever! You deserve ALL the cake, ALL the presents, and ALL the happiness in Equestria!`, 
                                        inline: false 
                                    },
                                    { 
                                        name: '🎪 Birthday Wishes from Pinkie', 
                                        value: `May your birthday be filled with:\n🎈 Endless laughter and giggles\n🧁 The yummiest cake ever\n🎉 Wonderful surprises\n💖 Love from all your friends\n🌈 Magical moments that make you smile!`, 
                                        inline: false 
                                    },
                                    {
                                        name: '🎂 Special Birthday Quote',
                                        value: '*"Birthdays are nature\'s way of telling us to eat more cake!"* - Pinkie Pie wisdom! 🍰',
                                        inline: false
                                    }
                                )
                                .setThumbnail('https://derpicdn.net/img/view/2017/3/4/1379385.gif') // Pinkie celebration
                                .setFooter({ text: `Love from Pinkie Pie • Birthday wishes from ${guild.name} 💖` })
                                .setTimestamp();

                            await user.send({ embeds: [dmEmbed] });
                            console.log(`💌 Sent birthday DM to ${user.username}`);
                        } catch (dmError) {
                            console.log(`Could not send birthday DM to ${user.username}`);
                        }
                        
                    } catch (userError) {
                        console.error(`Error celebrating birthday for ${birthdayData.username}:`, userError);
                    }
                }
            }
        }
        
        // Summary log
        console.log(`📊 Birthday check complete!`);
        console.log(`   • Guilds checked: ${totalGuildsChecked}`);
        console.log(`   • Birthdays found: ${totalBirthdaysFound}`);
        console.log(`   • Next check: ${totalBirthdaysFound > 0 ? 'Tomorrow at 00:00 UTC' : 'Tomorrow at 00:00 UTC (no birthdays today)'}`);
        
    } catch (error) {
        console.error('Error in birthday checker:', error);
    }
}

function calculateTimeUntilMidnightUTC() {
    const now = new Date();
    const nextMidnight = new Date(now);
    nextMidnight.setUTCHours(24, 0, 0, 0); // Next 00:00 UTC
    
    return nextMidnight.getTime() - now.getTime();
}

function getCurrentUTCTime() {
    const now = new Date();
    return {
        hours: now.getUTCHours(),
        minutes: now.getUTCMinutes(),
        seconds: now.getUTCSeconds(),
        dateString: now.toISOString().split('T')[0]
    };
}

function startBirthdayChecker(client) {
    console.log('🎂 Starting Pinkie\'s Optimized Birthday Checker...');
    
    const utcTime = getCurrentUTCTime();
    console.log(`⏰ Current UTC time: ${utcTime.hours.toString().padStart(2, '0')}:${utcTime.minutes.toString().padStart(2, '0')}:${utcTime.seconds.toString().padStart(2, '0')}`);
    
    // Check immediately on startup (after 5 seconds)
    console.log('🚀 Scheduling startup birthday check...');
    setTimeout(() => {
        console.log('🎉 Running startup birthday check...');
        checkBirthdays(client);
    }, 5000);
    
    // Calculate time until next midnight UTC
    const timeUntilMidnight = calculateTimeUntilMidnightUTC();
    const hoursUntilMidnight = Math.floor(timeUntilMidnight / (1000 * 60 * 60));
    const minutesUntilMidnight = Math.floor((timeUntilMidnight % (1000 * 60 * 60)) / (1000 * 60));
    
    console.log(`⏰ Next birthday check scheduled for 00:00 UTC (in ${hoursUntilMidnight}h ${minutesUntilMidnight}m)`);
    
    // Set timeout for first midnight check
    setTimeout(() => {
        console.log('🎂 It\'s midnight UTC! Running daily birthday check...');
        checkBirthdays(client);
        
        // Set up daily interval (every 24 hours) starting from midnight UTC
        setInterval(() => {
            const currentUTC = getCurrentUTCTime();
            console.log(`🎂 Daily birthday check at ${currentUTC.hours.toString().padStart(2, '0')}:${currentUTC.minutes.toString().padStart(2, '0')} UTC`);
            checkBirthdays(client);
        }, 24 * 60 * 60 * 1000); // 24 hours
        
    }, timeUntilMidnight);
    
    console.log('✅ Birthday checker optimized! Pinkie will check birthdays at 00:00 UTC daily! 🎉');
    console.log('📅 This ensures birthday celebrations happen at the start of each day worldwide!');
}

module.exports = { startBirthdayChecker, checkBirthdays };
