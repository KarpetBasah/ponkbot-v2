// commands/weather.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// Get weather emoji based on condition
function getWeatherEmoji(condition) {
    const emojiMap = {
        'Clear': '☀️',
        'Clouds': '☁️',
        'Rain': '🌧️',
        'Drizzle': '🌦️',
        'Thunderstorm': '⛈️',
        'Snow': '❄️',
        'Mist': '🌫️',
        'Fog': '🌫️',
        'Haze': '🌫️',
        'Smoke': '🌫️',
        'Dust': '🌪️',
        'Sand': '🌪️',
        'Ash': '🌋',
        'Squall': '💨',
        'Tornado': '🌪️'
    };
    return emojiMap[condition] || '🌤️';
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('weather')
        .setDescription('🌦️ Check real-time weather for any city in the world!')
        .addStringOption(option =>
            option.setName('city')
                .setDescription('Name of the city (e.g., London, Tokyo, New York)')
                .setRequired(true)),
    async execute(interaction) {
        const city = interaction.options.getString('city');
        
        // Defer reply because API call might take time
        await interaction.deferReply();

        try {
            // Check if API key is available
            if (!process.env.OPENWEATHER_API_KEY) {
                const embed = new EmbedBuilder()
                    .setColor('#ff6b6b')
                    .setTitle('⚠️ Weather API Not Configured')
                    .setDescription('Oopsie! The weather API key is missing! *giggles nervously*\n\nTo use this feature, you need to:\n1. Get a free API key from [OpenWeatherMap](https://openweathermap.org/api)\n2. Add it to your `.env` file as `OPENWEATHER_API_KEY=your_key_here`\n3. Restart the bot!')
                    .setFooter({ text: `Requested by ${interaction.user.username}` })
                    .setTimestamp();
                
                return await interaction.editReply({ embeds: [embed] });
            }

            // Fetch weather data from OpenWeatherMap API
            const apiKey = process.env.OPENWEATHER_API_KEY;
            const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`;
            
            const response = await fetch(url);
            const data = await response.json();

            // Handle city not found
            if (data.cod === '404') {
                const embed = new EmbedBuilder()
                    .setColor('#ff6b6b')
                    .setTitle('🔍 City Not Found')
                    .setDescription(`Oh no! I couldn't find weather data for **${city}**! *bounces sadly*\n\nMaybe try:\n- Checking the spelling\n- Using the full city name\n- Adding the country (e.g., "London, UK")`)
                    .setFooter({ text: `Requested by ${interaction.user.username}` })
                    .setTimestamp();
                
                return await interaction.editReply({ embeds: [embed] });
            }

            // Handle other API errors
            if (data.cod !== 200) {
                throw new Error(`API returned status ${data.cod}: ${data.message}`);
            }

            // Extract weather information
            const weatherMain = data.weather[0].main;
            const weatherDescription = data.weather[0].description;
            const weatherEmoji = getWeatherEmoji(weatherMain);
            const temp = Math.round(data.main.temp);
            const feelsLike = Math.round(data.main.feels_like);
            const humidity = data.main.humidity;
            const windSpeed = Math.round(data.wind.speed * 3.6); // Convert m/s to km/h
            const pressure = data.main.pressure;
            const visibility = data.visibility ? Math.round(data.visibility / 1000) : 'N/A';
            const cloudiness = data.clouds.all;
            
            // Get sunrise and sunset times
            const sunrise = new Date(data.sys.sunrise * 1000).toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                timeZone: 'UTC'
            });
            const sunset = new Date(data.sys.sunset * 1000).toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                timeZone: 'UTC'
            });

            // Build embed with real weather data
            const embed = new EmbedBuilder()
                .setColor('#87ceeb')
                .setTitle(`${weatherEmoji} Weather in ${data.name}, ${data.sys.country}`)
                .setDescription(`**${weatherDescription.charAt(0).toUpperCase() + weatherDescription.slice(1)}**`)
                .addFields(
                    { name: '🌡️ Temperature', value: `${temp}°C`, inline: true },
                    { name: '🤔 Feels Like', value: `${feelsLike}°C`, inline: true },
                    { name: '💧 Humidity', value: `${humidity}%`, inline: true },
                    { name: '💨 Wind Speed', value: `${windSpeed} km/h`, inline: true },
                    { name: '☁️ Cloudiness', value: `${cloudiness}%`, inline: true },
                    { name: '👁️ Visibility', value: `${visibility} km`, inline: true },
                    { name: '📊 Pressure', value: `${pressure} hPa`, inline: true },
                    { name: '🌅 Sunrise', value: sunrise, inline: true },
                    { name: '🌇 Sunset', value: sunset, inline: true }
                )
                .setFooter({ text: `Real-time data from OpenWeatherMap | Requested by ${interaction.user.username}` })
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('❌ Weather API Error:', error);
            
            const embed = new EmbedBuilder()
                .setColor('#ff6b6b')
                .setTitle('❌ Weather Error')
                .setDescription(`OOPS! Something went wrong while checking the weather! *giggles nervously*\n\nError: ${error.message}`)
                .setFooter({ text: `Requested by ${interaction.user.username}` })
                .setTimestamp();
            
            await interaction.editReply({ embeds: [embed] });
        }
    },
};
