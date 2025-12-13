// commands/memory.js
const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const memorySystem = require('../memory-system');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('memory')
        .setDescription('Manage conversation memory with Pinkie Pie! 💾')
        .addSubcommand(subcommand =>
            subcommand
                .setName('show')
                .setDescription('View your conversation history with Pinkie!')
                .addIntegerOption(option =>
                    option.setName('limit')
                        .setDescription('Number of messages to show (max 20)')
                        .setMinValue(1)
                        .setMaxValue(20)
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('clear')
                .setDescription('Clear your conversation history with Pinkie')
                .addBooleanOption(option =>
                    option.setName('confirm')
                        .setDescription('Are you sure? This cannot be undone!')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('stats')
                .setDescription('View memory system statistics (Admin only)'))
        .setDMPermission(true),
    
    async execute(interaction) {
        try {
            const subcommand = interaction.options.getSubcommand();

            switch (subcommand) {
                case 'show':
                    await this.handleShow(interaction);
                    break;
                case 'clear':
                    await this.handleClear(interaction);
                    break;
                case 'stats':
                    await this.handleStats(interaction);
                    break;
            }
        } catch (error) {
            console.error('Error in memory command:', error);
            
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff6b6b')
                .setTitle('🚨 Memory System Error!')
                .setDescription('OH NO! Something went wrong with my memory system!')
                .addFields({
                    name: '🔧 Error Details',
                    value: error.message.substring(0, 500),
                    inline: false
                })
                .setFooter({ text: 'Memory System Error' });

            if (interaction.deferred) {
                await interaction.editReply({ embeds: [errorEmbed] });
            } else {
                await interaction.reply({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral });
            }
        }
    },

    async handleShow(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const limit = interaction.options.getInteger('limit') || 10;
        const user = interaction.user;
        const guildId = interaction.guild?.id || 'dm';

        // Get conversation context
        const memory = memorySystem.getConversationContext(user.id, guildId, limit);

        if (!memory.hasHistory || memory.messages.length === 0) {
            const noMemoryEmbed = new EmbedBuilder()
                .setColor('#ffaa00')
                .setTitle('📝 No Conversation History!')
                .setDescription('OH BOY OH BOY! We haven\'t chatted yet! *bounces excitedly* This means we get to start a brand new friendship conversation!')
                .addFields({
                    name: '🎪 Start Chatting!',
                    value: 'Use `/chat-pinkie`, mention me, or send me a DM to start building our conversation memory!',
                    inline: false
                })
                .setFooter({ text: 'Memory System - No history yet!' });

            return await interaction.editReply({ embeds: [noMemoryEmbed] });
        }

        // Format conversation history
        const conversationText = memory.messages
            .map(msg => `**${msg.role === 'user' ? user.displayName || user.username : 'Pinkie Pie'}**: ${msg.content.substring(0, 200)}${msg.content.length > 200 ? '...' : ''}`)
            .join('\n\n');

        const embed = new EmbedBuilder()
            .setColor('#FF69B4')
            .setTitle('💾 Our Conversation Memory!')
            .setDescription(`WHEEE! Here's what I remember about our chats! *giggles*`)
            .addFields(
                {
                    name: '💬 Recent Conversations',
                    value: conversationText.substring(0, 1000) + (conversationText.length > 1000 ? '\n\n*...and more!*' : ''),
                    inline: false
                }
            )
            .setFooter({ text: `💾 Showing ${memory.messages.length} messages | Last active: ${memory.lastActive}` })
            .setTimestamp();

        // Add topics if available
        if (memory.topics.length > 0) {
            embed.addFields({
                name: '🎪 Topics We\'ve Discussed',
                value: memory.topics.join(', '),
                inline: false
            });
        }

        await interaction.editReply({ embeds: [embed] });
    },

    async handleClear(interaction) {
        const confirm = interaction.options.getBoolean('confirm');
        
        if (!confirm) {
            const confirmEmbed = new EmbedBuilder()
                .setColor('#ffaa00')
                .setTitle('⚠️ Confirmation Required!')
                .setDescription('You need to set `confirm` to `true` if you really want to clear our conversation memory!')
                .addFields({
                    name: '🤔 Are you sure?',
                    value: 'This will delete all our chat history and I won\'t remember our previous conversations!',
                    inline: false
                })
                .setFooter({ text: 'Memory clear cancelled' });

            return await interaction.reply({ embeds: [confirmEmbed], flags: MessageFlags.Ephemeral });
        }

        await interaction.deferReply({ ephemeral: true });

        const user = interaction.user;
        const guildId = interaction.guild?.id || 'dm';

        // Clear user memory
        const cleared = await memorySystem.clearUserMemory(user.id, guildId);

        if (cleared) {
            const successEmbed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('🗑️ Memory Cleared!')
                .setDescription('Okie dokie lokie! I\'ve cleared all our conversation memories! *bounces sadly* But hey, that just means we get to make NEW super-fun memories together!')
                .addFields({
                    name: '🎉 Fresh Start!',
                    value: 'Our next conversation will be like meeting for the first time all over again!',
                    inline: false
                })
                .setFooter({ text: 'Memory cleared successfully!' });

            await interaction.editReply({ embeds: [successEmbed] });
        } else {
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff6b6b')
                .setTitle('❌ Clear Failed!')
                .setDescription('OH NO! I couldn\'t clear our memories! Maybe we didn\'t have any to begin with?')
                .setFooter({ text: 'Nothing to clear or error occurred' });

            await interaction.editReply({ embeds: [errorEmbed] });
        }
    },

    async handleStats(interaction) {
        // Check if user is admin
        if (!interaction.guild || !interaction.member.permissions.has('Administrator')) {
            const noPermEmbed = new EmbedBuilder()
                .setColor('#ff6b6b')
                .setTitle('🚫 No Permission!')
                .setDescription('Only server administrators can view memory system stats! *giggles* It\'s like a super-secret cupcake recipe!')
                .setFooter({ text: 'Admin-only command! 🔒' });

            return await interaction.reply({ embeds: [noPermEmbed], flags: MessageFlags.Ephemeral });
        }

        await interaction.deferReply({ ephemeral: true });

        // Get memory stats
        const stats = memorySystem.getStats();

        const embed = new EmbedBuilder()
            .setColor('#FF69B4')
            .setTitle('💾 Memory System Statistics')
            .setDescription('Here\'s how my super-duper memory brain is doing! *bounces excitedly*')
            .addFields(
                { name: '👥 Total Users', value: stats.totalUsers.toString(), inline: true },
                { name: '💬 Total Messages', value: stats.totalMessages.toString(), inline: true },
                { name: '⚡ Active Users (24h)', value: stats.activeUsers.toString(), inline: true },
                { name: '📅 Memory Duration', value: `${Math.round(stats.memoryAge / (24 * 60 * 60 * 1000))} days`, inline: true },
                { name: '📝 Max Messages/User', value: stats.maxMemoryPerUser.toString(), inline: true },
                { name: '🎪 Status', value: '✅ Active & Healthy!', inline: true }
            )
            .setFooter({ text: 'Memory System Statistics - Admin View' })
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
    }
};