// commands/debug-dm.js
const { SlashCommandBuilder, EmbedBuilder, ChannelType, PermissionFlagsBits, MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('debug-dm')
        .setDescription('Advanced DM debugging with detailed logs! 🔍 (Admin only)')
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
                        .setDescription('WHOA THERE! This advanced debugging command is only for administrators! It shows super-detailed technical logs!')
                        .addFields({
                            name: '🔍 Advanced Debugging',
                            value: 'This command generates detailed system logs and technical information that should only be accessed by server administrators for troubleshooting purposes.',
                            inline: false
                        })
                        .setFooter({ text: 'Pinkie\'s Debug Security • Advanced tech stuff! 🛡️' });
                    
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
        
        console.log('[DEBUG-CMD] /debug-dm command executed');
        console.log('[DEBUG-CMD] User:', interaction.user.tag);
        console.log('[DEBUG-CMD] Guild:', interaction.guild ? interaction.guild.name : 'DM');
        console.log('[DEBUG-CMD] Channel:', interaction.channel ? `${interaction.channel.id} (type: ${interaction.channel.type})` : 'null');
        
        const isDirectMessage = interaction.guild === null;
        const isDMByChannelType = interaction.channel && interaction.channel.type === ChannelType.DM;
        
        const embed = new EmbedBuilder()
            .setColor(isDirectMessage ? '#00ff00' : '#ff9900')
            .setTitle('🔍 Advanced DM Debug Report')
            .addFields(
                { name: '🎯 Detection Method 1', value: `Guild === null: ${isDirectMessage ? '✅ DM' : '❌ Server'}`, inline: true },
                { name: '🎯 Detection Method 2', value: `ChannelType.DM: ${isDMByChannelType ? '✅ DM' : '❌ Server'}`, inline: true },
                { name: '📊 Final Result', value: isDirectMessage ? '✅ **DIRECT MESSAGE**' : '❌ **SERVER CHANNEL**', inline: false },
                { 
                    name: '🔧 Technical Details', 
                    value: `• User ID: ${interaction.user.id}\n• Channel ID: ${interaction.channel ? interaction.channel.id : 'null'}\n• Guild ID: ${interaction.guild ? interaction.guild.id : 'null'}\n• Interaction ID: ${interaction.id}`, 
                    inline: false 
                }
            );

        if (isDirectMessage) {
            embed.addFields(
                { 
                    name: '✅ DM Test Results', 
                    value: '• Slash commands: **WORKING** ✅\n• DM detection: **WORKING** ✅\n• Next test: Send regular message', 
                    inline: false 
                },
                { 
                    name: '📝 Next Steps', 
                    value: '1. Send me a regular message (like "hello")\n2. Check console for `[DEBUG] ✅ DM terdeteksi`\n3. Bot should auto-respond', 
                    inline: false 
                }
            );
        } else {
            embed.addFields(
                { 
                    name: '⚠️ Server Test', 
                    value: 'This command is running in a server channel.\nFor DM testing, use this command in my DMs!', 
                    inline: false 
                }
            );
        }

        embed.setFooter({ text: 'Advanced debugging completed' })
             .setTimestamp();

        await interaction.reply({ embeds: [embed] });
        
        // Additional logging for DM case
        if (isDirectMessage) {
            console.log('[DEBUG-CMD] ✅ DM command executed successfully');
            console.log('[DEBUG-CMD] User should now test regular message');
        }
    },
};
