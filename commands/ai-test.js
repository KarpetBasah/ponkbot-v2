// commands/ai-test.js
const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const pinkieAI = require('../gemini-helper');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ai-test')
        .setDescription('Test AI functionality and check available models! 🤖')
        .setDefaultMemberPermissions('0') // Admin only
        .setDMPermission(false),
    
    async execute(interaction) {
        // Check if user is admin
        if (!interaction.member.permissions.has('Administrator')) {
            const noPermEmbed = new EmbedBuilder()
                .setColor('#ff6b6b')
                .setTitle('🚫 No Permission!')
                .setDescription('Only administrators can test my AI brain! *giggles* It\'s like a super-secret cupcake recipe!')
                .setFooter({ text: 'Admin-only command! 🔒' });

            return await interaction.reply({ embeds: [noPermEmbed], flags: MessageFlags.Ephemeral });
        }

        await interaction.deferReply({ ephemeral: true });

        try {
            const embed = new EmbedBuilder()
                .setColor('#FF69B4')
                .setTitle('🤖 Pinkie\'s AI Brain Test!')
                .setDescription('Let me check my super-duper smart thinking system!')
                .setTimestamp();

            // Test AI availability
            if (!pinkieAI.isAvailable()) {
                embed.addFields(
                    { name: '❌ AI Status', value: 'Not Available - API Key missing!', inline: true },
                    { name: '🔧 Fix', value: 'Check GEMINI_API_KEY in .env file', inline: true }
                );
            } else {
                embed.addFields(
                    { name: '✅ AI Status', value: 'Available and ready!', inline: true },
                    { name: '🧠 Current Model', value: pinkieAI.modelNames[pinkieAI.currentModelIndex], inline: true }
                );

                // Test with simple message
                const testResult = await pinkieAI.generateResponse("Hello! Just testing if you're working!", {
                    user: interaction.user,
                    guild: interaction.guild,
                    channelType: 'test'
                });

                if (testResult.success) {
                    embed.addFields(
                        { name: '🎉 Test Result', value: 'SUCCESS!', inline: true },
                        { name: '🤖 Model Used', value: testResult.model || 'Unknown', inline: true },
                        { name: '💬 Sample Response', value: testResult.response.substring(0, 200) + '...', inline: false }
                    );
                    embed.setColor('#00ff00');
                } else {
                    embed.addFields(
                        { name: '⚠️ Test Result', value: 'Failed - Using Fallback', inline: true },
                        { name: '❌ Error', value: testResult.error || 'Unknown error', inline: true },
                        { name: '🎪 Fallback Response', value: testResult.response.substring(0, 200) + '...', inline: false }
                    );
                    embed.setColor('#ffaa00');
                }
            }

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('Error in ai-test command:', error);
            
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff6b6b')
                .setTitle('🚨 Test Failed!')
                .setDescription('Something went wrong while testing my AI brain!')
                .addFields({
                    name: '🔧 Error Details',
                    value: error.message.substring(0, 500),
                    inline: false
                })
                .setFooter({ text: 'AI Test Command Error' });

            await interaction.editReply({ embeds: [errorEmbed] });
        }
    },
};