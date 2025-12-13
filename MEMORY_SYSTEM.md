# 💾 Conversation Memory System Documentation

## Overview
Pinkie Pie sekarang memiliki memory system yang memungkinkannya mengingat percakapan sebelumnya dan melanjutkan konteks dengan setiap user secara individual!

## How It Works

### 🧠 Memory Architecture
- **Per-User Memory**: Setiap user punya file memory terpisah per server/DM
- **Conversation History**: Menyimpan 20 pesan terakhir per user
- **Topic Extraction**: Otomatis mengekstrak topik dari percakapan
- **Context Integration**: AI mendapat history conversation sebelum generate response

### 📁 File Structure
```
data/
└── memory/
    ├── dm_userID.json          # DM memories
    ├── guildID_userID.json     # Server-specific memories
    └── ...
```

### 💾 Memory Data Format
```json
{
  "userId": "123456789",
  "guildId": "987654321",
  "messages": [
    {
      "content": "Hello Pinkie!",
      "timestamp": 1640995200000,
      "isUser": true,
      "aiModel": null,
      "id": "1640995200000"
    }
  ],
  "lastActive": 1640995200000,
  "preferences": {},
  "topics": ["greeting", "party"],
  "mentionedUsers": ["123456789"]
}
```

## Features

### 🤖 AI Integration
- **Context Building**: History otomatis disertakan dalam AI prompt
- **Continuation**: AI dapat melanjutkan topik dari percakapan sebelumnya
- **Reference**: AI bisa merujuk ke chat yang lalu
- **Topic Memory**: AI ingat topik yang pernah dibahas

### 📝 Automatic Saving
- **User Messages**: Setiap pesan user otomatis disimpan
- **AI Responses**: Response AI juga disimpan dengan model info
- **Topic Extraction**: Otomatis extract topik (party, birthday, help, etc.)
- **Mentioned Users**: Track users yang pernah di-mention

### 🕐 Time Management
- **Age Limit**: Memory otomatis terhapus setelah 7 hari tidak aktif
- **Message Limit**: Maksimal 20 pesan terakhir per user
- **Auto Cleanup**: Cleanup otomatis setiap jam

## Commands

### `/memory show`
View conversation history dengan Pinkie
- **Options**: 
  - `limit` (1-20): Jumlah pesan yang ditampilkan
- **Features**:
  - Menampilkan recent conversations
  - Showing topics discussed
  - Last active timestamp

### `/memory clear`
Clear conversation history
- **Options**:
  - `confirm` (required): Must be `true` untuk confirm
- **Warning**: Action ini tidak bisa di-undo!
- **Effect**: Delete semua memory untuk user di server/DM tersebut

### `/memory stats` (Admin only)
View system-wide memory statistics
- **Info Displayed**:
  - Total users with memories
  - Total messages stored
  - Active users (24h)
  - Memory retention settings

## Examples

### First Conversation:
**User**: "Hi Pinkie!"  
**AI**: "OHMYGOSH! A new friend! Welcome to our super-duper party! *bounces excitedly*"

### Continuing Conversation:
**User**: "How are you today?"  
**AI**: "OH BOY OH BOY! I'm AMAZING! Remember when we talked about parties yesterday? I've been planning even MORE fun activities! *giggles*"

### Topic Continuation:
**Previous**: User asked about cupcakes  
**Current**: "What about cookies?"  
**AI**: "WHEEE! First cupcakes, now cookies! You really love sweet treats just like me! *bounces* Let me tell you about my FAVORITE cookie recipe!"

## Technical Details

### Memory Collection Process:
1. User sends message → Save to memory
2. AI generates response → Save to memory with model info  
3. Extract topics from both messages
4. Update last active timestamp
5. Trim old messages if over limit

### Context Building for AI:
```
CONVERSATION HISTORY:
User: Hi Pinkie!
Pinkie: Hello there, friend!
User: Tell me about parties
Pinkie: OH BOY! Parties are the BEST!

PREVIOUS TOPICS: greeting, party, celebration
```

### Storage & Performance:
- **JSON Files**: Human-readable, easy to backup
- **In-Memory Cache**: Fast access to recent memories
- **Lazy Loading**: Files loaded only when needed
- **Auto-Cleanup**: Prevents storage bloat

## Privacy & Safety

### Data Protection:
- **Local Storage**: All memories stored locally, not cloud
- **User Control**: Users can clear their own memories
- **Auto-Expiry**: Old conversations automatically deleted
- **No Sensitive Data**: Only conversation content stored

### Safety Features:
- **Size Limits**: Prevents excessive memory usage
- **Error Handling**: Graceful fallback if memory fails
- **Admin Controls**: Admins can view stats but not user conversations
- **GDPR Friendly**: Users have full control over their data

## Benefits

### 🎯 Enhanced User Experience:
✅ **Personalized Conversations**: AI remembers what you talked about  
✅ **Context Continuity**: No need to repeat information  
✅ **Topic Evolution**: Conversations can develop over time  
✅ **Relationship Building**: Feels like talking to a friend who remembers you  

### 🤖 Improved AI Responses:
✅ **Better Context**: AI has full conversation background  
✅ **Relevant References**: Can refer to previous discussions  
✅ **Topic Awareness**: Knows what user is interested in  
✅ **Natural Flow**: Conversations feel more human-like  

### 🔧 System Benefits:
✅ **Scalable**: Works with unlimited users  
✅ **Efficient**: Smart caching and cleanup  
✅ **Reliable**: Robust error handling  
✅ **Maintainable**: Clear file structure and logging  

## Usage Tips

### 🎪 Best Practices:
- Let conversations develop naturally over multiple sessions
- Use `/memory show` to see what Pinkie remembers
- Topics like "party", "birthday", "cupcakes" work great
- Memory works in both DMs and server channels

### 🚫 Limitations:
- Memory is per-server (Guild A ≠ Guild B)
- 7-day auto-expiry for inactive conversations
- 20 message limit per user
- No cross-user memory sharing

## Future Enhancements

### 🔮 Planned Features:
- **Preferences System**: Remember user likes/dislikes
- **Cross-Server Memory**: Optional shared memory across servers
- **Memory Search**: Find specific past conversations
- **Memory Backup**: Export/import conversation history
- **Smart Summaries**: Condense long conversations
- **Mood Tracking**: Remember user's typical mood patterns

## Troubleshooting

### Common Issues:
- **Memory not working**: Check if memory system initialized in logs
- **Old conversations lost**: Check if 7-day limit exceeded
- **Performance slow**: Memory auto-cleanup may be running
- **Missing context**: User may have cleared memory

### Debug Commands:
- `/memory show` - View current memory status
- `/memory stats` - Check system health (admin)
- Check console logs for memory-related messages