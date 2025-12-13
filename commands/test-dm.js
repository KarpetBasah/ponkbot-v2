// commands/test-dm.js
const { SlashCommandBuilder, EmbedBuilder, ChannelType, PermissionFlagsBits, MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('test-dm')
        .setDescription('Test DM functionality and debug! 🔧 (Admin only)')
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
                        .setDescription('OOPSIE! This DM testing command is only for administrators! It shows technical debugging information!')
                        .addFields({
                            name: '🔧 Admin Debugging Tool',
                            value: 'This command reveals detailed technical information about DM functionality that should only be accessed by server administrators.',
                            inline: false
                        })
                        .setFooter({ text: 'Pinkie\'s DM Security • Technical stuff for tech ponies! 🛡️' });
                    
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
        
        const isDirectMessage = interaction.guild === null;
        const channelType = interaction.channel ? interaction.channel.type : 'Unknown';
        const channelTypeName = interaction.channel && interaction.channel.type === ChannelType.DM ? 'DM' : (channelType || 'Unknown');
        
        const embed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('🔧 DM Test Results')
            .addFields(
                { name: '📍 Location', value: isDirectMessage ? '✅ Direct Message' : '❌ Server Channel', inline: true },
                { name: '🤖 Bot Status', value: '✅ Online and Responding', inline: true },
                { name: '🎯 Command Function', value: '✅ Slash Commands Working', inline: true },
                { 
                    name: '💌 DM Message Test', 
                    value: isDirectMessage 
                        ? '✅ If you see this, DMs are working!\n📝 Now try sending a regular message (not a command) to test auto-response.' 
                        : '⚠️ Use this command in my DMs to test message responses!', 
                    inline: false 
                },
                { 
                    name: '🔍 Debug Info', 
                    value: `User: ${interaction.user.tag}\nChannel Type: ${channelTypeName}\nGuild: ${interaction.guild ? interaction.guild.name : 'None (DM)'}\nChannel ID: ${interaction.channel ? interaction.channel.id : 'None'}`, 
                    inline: false 
                }
            )
            .setFooter({ text: 'Debug command for DM testing' })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
        
        // If in DM, also send a follow-up message
        if (isDirectMessage) {
            setTimeout(async () => {
                try {
                    await interaction.followUp({
                        content: '🧪 **Follow-up Test**: If you see this message, DM follow-ups work too!\n\n💡 **Next Step**: Send me any regular message (like "hello") to test auto-response.'
                    });
                } catch (error) {
                    console.error('[ERROR] Follow-up test failed:', error);
                }
            }, 2000);
        }
    },
};
