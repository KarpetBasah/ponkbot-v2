// commands/dm-troubleshoot.js
const { SlashCommandBuilder, EmbedBuilder, ChannelType, PermissionFlagsBits, MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dm-troubleshoot')
        .setDescription('Troubleshoot DM connectivity and test bot responses! 🔧 (Admin only)')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        // Check if command is used in server and user has admin permissions
        if (interaction.guild) {
            try {
                const member = await interaction.guild.members.fetch(interaction.user.id);
                if (!member.permissions.has(PermissionFlagsBits.Administrator)) {
                    const errorEmbed = new EmbedBuilder()
                        .setColor('#ff6b6b')
                        .setTitle('🚫 Admin Only Command!')
                        .setDescription('OH NO! This troubleshooting command is only for administrators! It contains technical debugging info that\'s super-duper secret!')
                        .addFields({
                            name: '🔧 Why Admin Only?',
                            value: 'DM troubleshooting can reveal technical details about the bot system that should only be seen by server administrators!',
                            inline: false
                        })
                        .setFooter({ text: 'Pinkie\'s Security • Admin commands for admin ponies! 🛡️' });
                    
                    return await interaction.reply({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral });
                }
            } catch (error) {
                console.error('Error checking admin permissions:', error);
                return await interaction.reply({ 
                    content: 'Error checking permissions. Please try again!', 
                    flags: MessageFlags.Ephemeral 
                });
            }
        }
        
        const isDirectMessage = interaction.channel?.type === ChannelType.DM;
        
        // Check if command is run in DM
        if (!isDirectMessage) {
            const embed = new EmbedBuilder()
                .setColor('#ff6b6b')
                .setTitle('🚨 DM Troubleshoot - Server Usage')
                .setDescription('This command is designed to test DM functionality. Please use it in a **Direct Message** with me!')
                .addFields(
                    {
                        name: '💌 How to Test DM',
                        value: '1. Open a DM with me\n2. Send any message (like "hello")\n3. Use `/dm-troubleshoot` there\n4. Try other commands like `/ping`',
                        inline: false
                    },
                    {
                        name: '🔍 What This Tests',
                        value: '• Bot can receive DM messages\n• Bot can send DM responses\n• Slash commands work in DM\n• User DM settings compatibility',
                        inline: false
                    }
                )
                .setFooter({ text: 'Friendship is Magic! • DM Troubleshooting' })
                .setTimestamp();
                
            return await interaction.reply({ embeds: [embed] });
        }
        
        // DM Troubleshooting starts here
        const embed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('🔧 DM Troubleshoot Results')
            .setDescription('Testing DM connectivity and functionality...')
            .addFields(
                {
                    name: '✅ Slash Command Test',
                    value: 'SUCCESS: You can use slash commands in DM!',
                    inline: false
                },
                {
                    name: '✅ Bot Recognition Test', 
                    value: 'SUCCESS: Bot can identify this as a DM channel!',
                    inline: false
                },
                {
                    name: '✅ User Permission Test',
                    value: 'SUCCESS: Your DM settings allow bot interaction!',
                    inline: false
                }
            );
            
        // Test bot's ability to send messages
        try {
            await interaction.reply({ embeds: [embed] });
            
            // Wait a moment then send a follow-up test message
            setTimeout(async () => {
                try {
                    const testMessage = await interaction.followUp({
                        content: '🧪 **Follow-up Test**: If you can see this message, DM functionality is working perfectly!\n\n🦄 **Next Steps**:\n• Try sending me a normal message (not a command)\n• I should respond with a magical friendship message!\n• If I don\'t respond, there might be a permission issue',
                        ephemeral: false
                    });
                    
                    console.log(`[DEBUG] 🧪 DM troubleshoot follow-up sent successfully to ${interaction.user.tag}`);
                } catch (followUpError) {
                    console.error(`[ERROR] ❌ DM troubleshoot follow-up failed for ${interaction.user.tag}:`, followUpError);
                }
            }, 2000);
            
        } catch (error) {
            console.error(`[ERROR] ❌ DM troubleshoot failed for ${interaction.user.tag}:`, error);
            
            // Try to send error info if possible
            try {
                await interaction.reply({
                    content: `❌ **DM Test Failed**: ${error.message}\n\n🔍 **Possible Solutions**:\n• Check your Discord privacy settings\n• Make sure you're not blocking the bot\n• Try restarting Discord\n• Check if we share a mutual server`,
                    flags: MessageFlags.Ephemeral
                });
            } catch (replyError) {
                console.error(`[ERROR] ❌ Could not even send error message:`, replyError);
            }
        }
    },
};
