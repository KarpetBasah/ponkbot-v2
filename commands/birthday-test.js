// commands/birthday-test.js
const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, MessageFlags } = require('discord.js');
const { checkBirthdays } = require('../birthday-checker');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('birthday-test')
        .setDescription('Test Pinkie\'s birthday celebration system! (Admin only) 🧪🎉')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Test birthday celebration for specific user')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        try {
            // Check if command is used in DM
            if (!interaction.guild) {
                const errorEmbed = new EmbedBuilder()
                    .setColor('#ff6b6b')
                    .setTitle('🚫 Server Only Command!')
                    .setDescription('This command can only be used in servers, not in DMs!')
                    .setFooter({ text: 'Pinkie\'s Birthday Test • Server parties only! 🎪' });
                
                return await interaction.reply({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral });
            }

            const executorMember = await interaction.guild.members.fetch(interaction.user.id);

            // Check permissions
            if (!executorMember.permissions.has(PermissionFlagsBits.Administrator)) {
                const errorEmbed = new EmbedBuilder()
                    .setColor('#ff6b6b')
                    .setTitle('🚫 Admin Only!')
                    .setDescription('Only administrators can test my birthday system! You need admin permissions to throw test parties!')
                    .setFooter({ text: 'Pinkie\'s Birthday Test • Admin security! 🎂' });
                
                return await interaction.reply({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral });
            }

            const testUser = interaction.options.getUser('user');

            if (testUser) {
                // Test specific user birthday celebration
                const testEmbed = new EmbedBuilder()
                    .setColor('#ff1493')
                    .setTitle('🧪 BIRTHDAY TEST MODE ACTIVATED! 🧪')
                    .setDescription(`*puts on party planning hat*\n\nTesting birthday celebration for ${testUser.username}! This is just a test, but the party is REAL!`)
                    .addFields(
                        { name: '🎂 Test Subject', value: testUser.username, inline: true },
                        { name: '🧪 Test Status', value: 'Running party simulation...', inline: true },
                        { name: '🎈 Note', value: 'This is a test birthday celebration! The real one will happen on their actual birthday!', inline: false }
                    )
                    .setThumbnail(testUser.displayAvatarURL({ dynamic: true }))
                    .setFooter({ text: 'Pinkie\'s Birthday Test Lab • Testing party systems! 🎪' })
                    .setTimestamp();

                await interaction.reply({ embeds: [testEmbed], flags: MessageFlags.Ephemeral });

                // Simulate birthday celebration
                setTimeout(async () => {
                    const celebrationEmbed = new EmbedBuilder()
                        .setColor('#ff1493')
                        .setTitle('🎉 TEST BIRTHDAY CELEBRATION! 🎉')
                        .setDescription(`*throws confetti everywhere*\n\n🧪 **THIS IS A TEST!** 🧪\n\nPretend it's ${testUser.username}'s birthday! WHEEEEE!`)
                        .addFields(
                            { name: '🎂 Birthday Pony (TEST)', value: testUser.username, inline: true },
                            { name: '🎈 Party Status', value: 'TEST CELEBRATION MODE!', inline: true },
                            { name: '🧁 Test Results', value: '✅ Party system working perfectly!\n✅ Confetti dispensers operational!\n✅ Cupcake distribution system ready!\n✅ Celebration protocols activated!', inline: false },
                            { name: '🎪 Test Notes', value: 'This proves that when a REAL birthday comes, the party will be SPECTACULAR! The automatic system is ready to make everypony\'s special day amazing!', inline: false }
                        )
                        .setThumbnail(testUser.displayAvatarURL({ dynamic: true }))
                        .setFooter({ text: 'Pinkie\'s Birthday Test • Test celebration complete! 🧪' })
                        .setTimestamp();

                    await interaction.followUp({ embeds: [celebrationEmbed] });
                }, 2000);

            } else {
                // Run full birthday check system
                await interaction.reply({ 
                    content: '🧪 Running full birthday check system... Pinkie is looking for any birthdays today!', 
                    flags: MessageFlags.Ephemeral 
                });

                // Run the actual birthday checker
                await checkBirthdays(interaction.client);

                const systemTestEmbed = new EmbedBuilder()
                    .setColor('#ff1493')
                    .setTitle('🧪 BIRTHDAY SYSTEM TEST COMPLETE! 🧪')
                    .setDescription('*adjusts party planning glasses*\n\nI just ran my full birthday checking system!')
                    .addFields(
                        { name: '🔍 System Status', value: '✅ Birthday database checked\n✅ Date calculations working\n✅ Party protocols ready\n✅ Celebration systems operational', inline: false },
                        { name: '🎂 Test Results', value: 'If there were any birthdays today, they would have been celebrated! If not, the system is ready and waiting for the next special day!', inline: false },
                        { name: '🎈 Next Steps', value: 'The automatic system runs every hour, so I\'ll never miss a birthday party opportunity!', inline: false }
                    )
                    .setFooter({ text: 'Pinkie\'s Birthday System • Ready for celebrations! 🎪' })
                    .setTimestamp();

                await interaction.followUp({ embeds: [systemTestEmbed], flags: MessageFlags.Ephemeral });
            }

        } catch (error) {
            console.error('Error in birthday-test command:', error);
            
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff6b6b')
                .setTitle('🧪 Test Failed!')
                .setDescription('OH NO! Something went wrong with the birthday test! But don\'t worry, the real system should still work!')
                .setFooter({ text: 'Pinkie\'s Birthday Test • Error in testing!' });

            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral });
            } else {
                await interaction.reply({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral });
            }
        }
    },
};
