// commands/pinkie-pic.js
const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const rateLimiter = require('../rate-limiter');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pinkie-pic')
        .setDescription('Get a random cute and safe Pinkie Pie picture from Derpibooru! 🎉🧁')
        .addStringOption(option =>
            option.setName('mood')
                .setDescription('What kind of Pinkie Pie picture do you want?')
                .setRequired(false)
                .addChoices(
                    { name: '🧁 Cute Pinkie', value: 'cute' },
                    { name: '🎉 Party Pinkie', value: 'party' },
                    { name: '😊 Happy Pinkie', value: 'happy' },
                    { name: '🍰 Baker Pinkie', value: 'baking' },
                    { name: '🎈 Random Pinkie', value: 'random' }
                )),
    async execute(interaction) {
        try {
            await interaction.deferReply(); // This might take a moment to fetch

            // Check rate limit first
            try {
                await rateLimiter.checkGeneralLimit();
                await rateLimiter.checkSearchLimit();
            } catch (rateLimitError) {
                const rateLimitEmbed = new EmbedBuilder()
                    .setColor('#ffaa00')
                    .setTitle('⏰ Slow Down There, Speedy!')
                    .setDescription(`Whoa there! Even I need to catch my breath sometimes! ${rateLimitError.message}`)
                    .addFields({
                        name: '🎪 Why the Wait?',
                        value: 'Derpibooru has limits on how many pictures we can fetch to keep their servers happy! Just like how I can\'t eat cupcakes TOO fast (well, I can, but shouldn\'t!).',
                        inline: false
                    })
                    .setFooter({ text: 'Pinkie\'s Picture Finder • Taking a quick breather! ⏰' });

                return await interaction.editReply({ embeds: [rateLimitEmbed] });
            }

            const mood = interaction.options.getString('mood') || 'random';
            
            // Build search query based on mood
            let searchTags = 'safe, pony, pinkie pie';
            
            switch (mood) {
                case 'cute':
                    searchTags += ', cute';
                    break;
                case 'party':
                    searchTags += ', party, confetti';
                    break;
                case 'happy':
                    searchTags += ', happy, smiling';
                    break;
                case 'baking':
                    searchTags += ', baking, cupcake, kitchen';
                    break;
                case 'random':
                default:
                    searchTags += ', cute'; // Default to cute for safety
                    break;
            }

            // Derpibooru API endpoint
            const apiUrl = `https://derpibooru.org/api/v1/json/search/images`;
            
            // Parameters for the API request
            const params = new URLSearchParams({
                q: searchTags,
                filter_id: '56027', // Default filter ID for safe content
                per_page: '50',     // Get 50 results to choose from
                sf: 'score',        // Sort by score to get better quality images
                sd: 'desc'          // Sort direction
            });

            // Add timeout for fetch request
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

            const response = await fetch(`${apiUrl}?${params}`, {
                signal: controller.signal,
                headers: {
                    'User-Agent': 'PonkBot-v2/1.0 (Discord Bot)'
                }
            });
            
            clearTimeout(timeoutId); // Clear timeout if request completes

            if (!response.ok) {
                if (response.status === 429) {
                    throw new Error('Rate limited by Derpibooru. Please try again later!');
                }
                throw new Error(`Derpibooru API error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            
            if (!data.images || data.images.length === 0) {
                const noResultsEmbed = new EmbedBuilder()
                    .setColor('#ff6b6b')
                    .setTitle('🚫 No Pictures Found!')
                    .setDescription('OH NO! I couldn\'t find any Pinkie Pie pictures with those tags! This is like a party with no cake!')
                    .addFields({
                        name: '🎪 What Happened?',
                        value: 'The Derpibooru search didn\'t return any results. Maybe try a different mood, or the internet ponies are taking a nap!',
                        inline: false
                    })
                    .setFooter({ text: 'Pinkie\'s Picture Finder • No pictures today! 😢' });

                return await interaction.editReply({ embeds: [noResultsEmbed] });
            }

            // Randomly select an image from the results
            const randomIndex = Math.floor(Math.random() * data.images.length);
            const image = data.images[randomIndex];

            // Validate that the image has necessary properties
            if (!image.representations || !image.representations.large) {
                throw new Error('Image data incomplete - missing representations');
            }

            // Build the artist credit string
            let artistCredit = 'Unknown Artist';
            if (image.tags && image.tags.length > 0) {
                const artistTags = image.tags.filter(tag => tag.includes('artist:'));
                if (artistTags.length > 0) {
                    artistCredit = artistTags.map(tag => 
                        tag.replace('artist:', '')
                           .replace(/[_-]/g, ' ')
                           .split(' ')
                           .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                           .join(' ')
                    ).join(', ');
                }
            }

            // Get a nice selection of tags for display (exclude metadata tags)
            let displayTags = 'No tags available';
            if (image.tags && image.tags.length > 0) {
                const filteredTags = image.tags
                    .filter(tag => !tag.includes('artist:') && !tag.includes('safe') && !tag.includes('explicit') && !tag.includes('questionable'))
                    .slice(0, 8); // Show up to 8 relevant tags
                
                if (filteredTags.length > 0) {
                    displayTags = filteredTags.join(', ') + (image.tags.length > 10 ? '...' : '');
                }
            }

            // Mood-based Pinkie responses
            const moodResponses = {
                cute: '🧁 AWWW! Look at this absolutely ADORABLE picture of me! I\'m so cute I could just hug myself!',
                party: '🎉 PARTY TIME! This picture perfectly captures my party spirit! WHEEEEE!',
                happy: '😊 This picture shows just how HAPPY I am! Smiling is my favorite thing to do!',
                baking: '🍰 OH BOY! A picture of me doing what I love most - baking yummy treats for my friends!',
                random: '🎈 SURPRISE! Here\'s a random picture of me being absolutely AMAZING!'
            };

            const pinkieResponse = moodResponses[mood] || moodResponses.random;

            // Create the embed
            const embed = new EmbedBuilder()
                .setColor('#ff1493')
                .setTitle('🎉 PINKIE PIE PICTURE TIME! 🎉')
                .setDescription(`*bounces excitedly*\n\n${pinkieResponse}`)
                .setImage(image.representations.large)
                .addFields(
                    { name: '🎨 Artist', value: artistCredit, inline: true },
                    { name: '🏷️ Tags', value: displayTags, inline: false },
                    { name: '⭐ Score', value: `${image.score || 0} (${image.upvotes || 0}👍 ${image.downvotes || 0}👎)`, inline: true },
                    { name: '💖 Faves', value: image.faves?.toString() || '0', inline: true },
                    { name: '📊 Size', value: `${image.width}x${image.height}`, inline: true }
                )
                .setFooter({ 
                    text: `Derpibooru ID: ${image.id} • Pinkie's Picture Party! 🎂`,
                    iconURL: 'https://derpicdn.net/img/view/2017/3/4/1379385.gif'
                })
                .setTimestamp();

            // Add source information
            if (image.source_urls && image.source_urls.length > 0) {
                embed.addFields({
                    name: '🔗 Original Source',
                    value: image.source_urls[0],
                    inline: false
                });
            }

            // Add Derpibooru link
            embed.addFields({
                name: '🌐 View on Derpibooru',
                value: `https://derpibooru.org/images/${image.id}`,
                inline: false
            });

            await interaction.editReply({ embeds: [embed] });

            // Log successful fetch
            console.log(`🎉 Fetched Pinkie Pie image ${image.id} for ${interaction.user.username} (mood: ${mood})`);

        } catch (error) {
            console.error('Error in pinkie-pic command:', error);
            
            let errorTitle = '🎪 Picture Fetch Failed!';
            let errorDescription = 'OH NO! Something went wrong while trying to get a Pinkie Pie picture!';
            let errorDetails = 'There was an error connecting to Derpibooru or processing the image data. Don\'t worry, we can try again!';

            // Handle specific error types
            if (error.name === 'AbortError') {
                errorTitle = '⏰ Request Timed Out!';
                errorDescription = 'The picture search took too long! Even I get impatient sometimes!';
                errorDetails = 'The request to Derpibooru timed out. The servers might be busy having their own party!';
            } else if (error.message.includes('Rate limited')) {
                errorTitle = '🚦 Too Fast There, Speedster!';
                errorDescription = 'Whoa! We\'re asking for pictures too quickly!';
                errorDetails = 'Derpibooru is asking us to slow down a bit. Just like how I sometimes eat cupcakes too fast!';
            } else if (error.message.includes('fetch')) {
                errorTitle = '🌐 Connection Problem!';
                errorDescription = 'I couldn\'t connect to Derpibooru! The internet might be having a hiccup!';
                errorDetails = 'There was a network error while trying to fetch the picture. Check your internet connection and try again!';
            }
            
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff6b6b')
                .setTitle(errorTitle)
                .setDescription(errorDescription)
                .addFields({
                    name: '🔧 What Happened?',
                    value: errorDetails,
                    inline: false
                })
                .setFooter({ text: 'Pinkie\'s Picture Finder • Technical difficulties! 🛠️' });

            if (interaction.deferred) {
                await interaction.editReply({ embeds: [errorEmbed] });
            } else {
                await interaction.reply({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral });
            }
        }
    },
};
