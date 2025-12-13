# 🎈 PonkBot v2 - Pinkie Pie Discord Bot

*"Hi! I'm Pinkie Pie, and I'm here to make your day 20% cooler! Well, actually that's Rainbow Dash's thing... but I can make it 200% more FUN!"* 🎉

A super-duper fun Discord bot featuring **Pinkie Pie** from My Little Pony: Friendship is Magic! Bringing parties, cupcakes, and friendship to your Discord server with AI-powered conversations! *bounces excitedly*

## � Commands List

### 🤖 AI Conversation Commands
- `/chat-pinkie <message>` - Have a conversation with Pinkie Pie powered by AI! She remembers your chats! 💬
- **Mention @PonkBot** - Mention Pinkie in any channel and she'll respond with AI magic! 🎈
- **Send DM** - Send Pinkie a direct message and have a personal chat! She responds to everything! 💌

### 💾 Memory System
- `/memory show` - View your conversation history with Pinkie Pie! 📚
- `/memory clear` - Start fresh! Clear all your memories with Pinkie 🗑️
- `/memory stats` - (Admin only) See bot-wide memory statistics 📊

### 🎂 Birthday System
- `/birthday set <date>` - Register your birthday! Pinkie will throw you a party! 🎉
- `/birthday check [user]` - Check someone's birthday (or your own!) 🎈
- `/birthday list` - See all upcoming birthdays in the server! 📅
- `/birthday remove` - Remove your birthday from the list 🗑️
- **Automatic Celebrations** - Pinkie automatically celebrates birthdays at midnight UTC! 🎊

### 🖼️ Derpibooru Integration
- `/mlp-image [search]` - Search for My Little Pony artwork from Derpibooru! 🦄
- `/mlp-random` - Get a random safe MLP image! 🎲
- Automatic safe content filtering and quality control! ✅

### 🔧 Utility Commands
- `/ping` - Check if Pinkie's party cannon is loaded and ready! 🎉
- `/serverinfo` - Learn all about your server with party stats! 📊
- `/userinfo [user]` - Get fun info about a user! 👤
- `/avatar [user]` - See a user's avatar in party-sized resolution! 🖼️

### 🎮 Fun & Games
- `/dice [sides] [count]` - Roll dice for party games! 🎲
- `/coinflip` - Flip a coin! Heads or tails? 🪙
- `/8ball <question>` - Ask Pinkie's Magic 8-Ball! 🔮
- `/meme` - Get funny MLP programming memes! 😂

### 🦄 Pony Features
- `/cutie-mark` - Discover your special cutie mark! ⭐
- `/pony-trivia` - Test your MLP knowledge! 🧠
- `/element-of-harmony` - Find your Element of Harmony! 💎
- `/pony-name [type]` - Generate your magical pony name! 🌟
- `/friendship-lesson` - Learn friendship lessons from Pinkie and friends! 📚

### 💭 More Fun Stuff
- `/quote` - Get inspiring pony quotes! 💖
- `/poll <question> <options>` - Create fun polls for your server! 📊
- `/weather <city>` - Check real-time weather for any city! ☁️

### 🛡️ Moderation (Admin Only)
- `/clear <amount>` - Clear messages from a channel 🧹
- `/kick <user> [reason]` - Kick a user from the server 👢
- `/ban <user> [reason]` - Ban a user from the server 🚫
- `/timeout <user> <duration> [reason]` - Timeout a user 🔇

## ✨ Special Features

### 🤖 **AI-Powered Pinkie Pie!**
- **🧠 Smart Conversations**: Powered by OpenRouter with Gemini 2.0 Flash Experimental
- **💭 Memory System**: Pinkie remembers your past conversations (up to 20 messages)!
- **🎭 True Personality**: Natural, caring Pinkie Pie personality - not overly hyper
- **📚 Context Aware**: References previous topics and builds ongoing conversations
- **⏳ Automatic Cleanup**: Old memories auto-delete after 7 days

### 🎂 **Automatic Birthday Celebrations!**
- **🎉 Midnight Parties**: Automatic birthday announcements at 00:00 UTC
- **🎈 Party Messages**: Pinkie throws personalized parties for birthday ponies
- **📅 Smart Scheduling**: Optimized checker runs once daily at midnight
- **🌍 Worldwide Support**: Works for all timezones with UTC standardization

### 🖼️ **Derpibooru Art Integration!**
- **🎨 Safe Content**: Automatic filtering for SFW content only
- **🔍 Smart Search**: Search by tags, characters, or get random images
- **⭐ Quality Control**: Only shows upvoted, non-downvoted content
- **🌈 Rich Embeds**: Beautiful display with artist credits and source links

### 🌦️ **Real Weather Data!**
- **📡 OpenWeatherMap API**: Real-time weather from around the world
- **🌡️ Detailed Info**: Temperature, humidity, wind, visibility, and more
- **🌅 Sun Times**: Sunrise and sunset information for any city
- **🌈 Weather Emojis**: Dynamic emojis based on current conditions

### 💾 **Persistent Memory System!**
- **📝 Conversation Storage**: Per-user memories saved to JSON files
- **🎯 Topic Tracking**: Automatically identifies conversation topics
- **👥 User Commands**: View, clear, or manage your conversation history
- **🔒 Privacy**: Each user's memories are separate and secure

### 🎪 **Classic Pinkie Features!**
- **💌 DM Support**: Chat with Pinkie privately! She responds to all DMs
- **🎭 Natural Personality**: Cheerful but not overwhelming, like the real Pinkie
- **🎨 Beautiful Embeds**: Colorful, emoji-filled responses
- **⌨️ Typing Indicators**: Pinkie shows she's "typing" for realistic feel
- **🎉 Fun Commands**: Tons of pony-themed games and activities

## 🚀 Getting Started

### 1️⃣ Clone the Party Repository!
```bash
git clone [your-repo-url]
cd ponkbot-v2
```

### 2️⃣ Install Dependencies
```bash
npm install
```

### 3️⃣ Setup Environment Variables
Create a `.env` file in the root directory with these keys:

```env
# Required - Discord Bot
DISCORD_TOKEN=your_discord_bot_token_here
CLIENT_ID=your_bot_client_id
TEST_GUILD_ID=your_test_server_id

# Required - AI Conversations
OPENROUTER_API_KEY=your_openrouter_api_key

# Optional - Weather Feature
OPENWEATHER_API_KEY=your_openweather_api_key

# Development Mode
NODE_ENV=development
```

### 4️⃣ Get Your API Keys

#### Discord Bot Token:
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Go to "Bot" section and create a bot
4. Copy the token and put it in `.env`
5. Enable "Message Content Intent" in Bot settings!

#### OpenRouter API (Required for AI):
1. Sign up at [OpenRouter](https://openrouter.ai/)
2. Get your free API key
3. Add to `.env` as `OPENROUTER_API_KEY`
4. Uses free model: `google/gemini-2.0-flash-exp:free`

#### OpenWeatherMap API (Optional):
1. Sign up at [OpenWeatherMap](https://openweathermap.org/api)
2. Get free API key (60 calls/minute)
3. Add to `.env` as `OPENWEATHER_API_KEY`

### 5️⃣ Run the Bot!
```bash
node index.js
```

### 6️⃣ Invite to Your Server
Use this URL (replace CLIENT_ID):
```
https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=8&scope=bot%20applications.commands
```

## 📝 Example Usage

### 🤖 AI Conversations:
```
/chat-pinkie message:"Hi Pinkie! How are you today?"
@PonkBot What should I bake today?
(In DMs) Hey Pinkie! I need someone to talk to...
```

### 🎂 Birthday System:
```
/birthday set date:15/03
/birthday list
(Automatic at midnight) 🎉 HAPPY BIRTHDAY @User! 🎂
```

### 🖼️ MLP Images:
```
/mlp-image search:pinkie pie party
/mlp-random
/mlp-image search:rainbow dash flying
```

### 💾 Memory Management:
```
/memory show
/memory clear
/memory stats (Admin only)
```

### 🌦️ Weather Check:
```
/weather city:London
/weather city:Tokyo
/weather city:New York
```

## 💌 Server vs DM Features

| Feature | In Servers | In DMs |
|---------|------------|--------|
| All slash commands | ✅ Works | ✅ Works |
| AI Chat with `/chat-pinkie` | ✅ Public chat | ✅ Private chat |
| Mention @PonkBot | ✅ AI responds | ❌ Not needed |
| Auto-response | ❌ Only on mention | ✅ Every message! |
| Memory system | ✅ Remembers you | ✅ Remembers you |
| Birthday parties | ✅ Public celebration | ❌ Server only |
| Moderation commands | ✅ Available | ❌ Server only |

## � The Pinkie Promise

This bot is all about spreading joy and making friends, just like Pinkie Pie! 

### Pinkie's Core Values:
- **🎉 Fun & Joy** - Every conversation should bring a smile!
- **💖 Genuine Care** - Being there when friends need listening
- **🎂 Celebrations** - Making birthdays and special moments magical
- **🤝 Friendship** - Building real connections through AI conversations
- **🌈 Positivity** - Spreading good vibes everywhere!

### Why Pinkie Pie?
*"I can be pretty over the top sometimes, but if only to make someone smile who really needs it! I love to throw parties for newcomers and friends alike, just to show them how much I value them or to make them feel welcome or loved!"*

Pinkie Pie represents:
- **Natural Conversations** - Not just random responses, but real talks
- **Memory & Care** - Remembering what you talked about before
- **Balanced Energy** - Cheerful but not overwhelming
- **True Listening** - Sometimes friends just need someone to listen
- **Party Planning** - Making every day a little more special!

## 🛠️ Technical Stack

- **Discord.js v14** - Modern Discord bot framework
- **OpenRouter API** - AI conversation engine
- **Gemini 2.0 Flash Exp** - Free, powerful language model
- **OpenWeatherMap API** - Real-time weather data
- **Derpibooru API** - MLP artwork integration
- **JSON Storage** - Simple, reliable data persistence
- **Node.js** - Fast, event-driven backend

## 📚 Project Structure

```
ponkbot-v2/
├── commands/          # Slash command implementations
│   ├── chat-pinkie.js # AI conversation command
│   ├── birthday.js    # Birthday system
│   ├── memory.js      # Memory management
│   ├── mlp-image.js   # Derpibooru integration
│   └── ...           # Other commands
├── events/           # Discord event handlers
│   ├── ready.js      # Bot startup
│   ├── messageCreate.js # Message handling
│   └── ...
├── gemini-helper.js  # AI conversation engine
├── memory-system.js  # Conversation memory
├── birthday-manager.js # Birthday automation
├── data/            # JSON data storage
│   ├── birthdays/   # Birthday data
│   └── memory/      # Conversation history
└── index.js         # Main bot file
```

## 🤝 Contributing

Want to make PonkBot even more awesome? Feel free to:
- 🐛 Report bugs or issues
- 💡 Suggest new features
- 🎨 Improve Pinkie's personality
- 📝 Fix typos or improve docs
- 🎉 Add more party commands!

## 📄 License

This project is open source and available for anypony to use! Just remember to throw a party once in a while! 🎊

---

*"You know what this calls for? A PARTY!"* 🎈🎉🎂

**Built with love, cupcakes, and lots of party cannons!** 💖

Made with Discord.js v14 | Powered by OpenRouter & Gemini 2.0 | Inspired by Friendship is Magic ✨
