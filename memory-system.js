// memory-system.js - Conversation Memory System for Pinkie Pie
const fs = require('fs').promises;
const path = require('path');

class MemorySystem {
    constructor() {
        this.memoryDir = path.join(__dirname, 'data', 'memory');
        this.userMemories = new Map(); // In-memory cache
        this.maxMemoryPerUser = 20; // Last 20 messages
        this.maxMemoryAge = 7 * 24 * 60 * 60 * 1000; // 7 days
        this.initialized = false;
        
        // Initialize memory system
        this.init();
    }

    async init() {
        try {
            // Create memory directory if it doesn't exist
            await fs.mkdir(this.memoryDir, { recursive: true });
            console.log('💾 Memory system initialized!');
            this.initialized = true;
            
            // Load existing memories
            await this.loadAllMemories();
            
            // Clean old memories periodically
            setInterval(() => this.cleanOldMemories(), 60 * 60 * 1000); // Every hour
        } catch (error) {
            console.error('❌ Failed to initialize memory system:', error);
        }
    }

    // Get memory file path for a user
    getMemoryPath(userId, guildId = 'dm') {
        return path.join(this.memoryDir, `${guildId}_${userId}.json`);
    }

    // Create memory key for user+guild combination
    getMemoryKey(userId, guildId = 'dm') {
        return `${guildId}_${userId}`;
    }

    // Add a message to user's memory
    async addMemory(userId, guildId, message, isUser = true, aiModel = null) {
        if (!this.initialized) return;

        const memoryKey = this.getMemoryKey(userId, guildId);
        
        // Get or create user memory
        if (!this.userMemories.has(memoryKey)) {
            this.userMemories.set(memoryKey, {
                userId: userId,
                guildId: guildId,
                messages: [],
                lastActive: Date.now(),
                preferences: {},
                topics: new Set()
            });
        }

        const userMemory = this.userMemories.get(memoryKey);
        
        // Add new message to memory
        const memoryEntry = {
            content: message,
            timestamp: Date.now(),
            isUser: isUser,
            aiModel: aiModel,
            id: Date.now().toString()
        };

        userMemory.messages.push(memoryEntry);
        userMemory.lastActive = Date.now();

        // Extract topics and mentioned users
        this.extractContextFromMessage(message, userMemory);

        // Keep only recent messages
        if (userMemory.messages.length > this.maxMemoryPerUser) {
            userMemory.messages = userMemory.messages.slice(-this.maxMemoryPerUser);
        }

        // Save to file
        await this.saveUserMemory(userId, guildId, userMemory);
        
        console.log(`💾 Added memory for ${userId} in ${guildId}: "${message.substring(0, 50)}..."`);
    }

    // Extract topics and context from message
    extractContextFromMessage(message, userMemory) {
        const lowerMessage = message.toLowerCase();
        
        // Extract topics
        const topics = [
            'birthday', 'party', 'cupcake', 'baking', 'celebration', 'friendship',
            'sad', 'happy', 'excited', 'help', 'question', 'welcome', 'new'
        ];
        
        topics.forEach(topic => {
            if (lowerMessage.includes(topic)) {
                userMemory.topics.add(topic);
            }
        });

        // Keep topics set reasonable size
        if (userMemory.topics.size > 10) {
            const topicsArray = Array.from(userMemory.topics);
            userMemory.topics = new Set(topicsArray.slice(-10));
        }
    }

    // Get conversation history for a user
    getMemory(userId, guildId = 'dm') {
        const memoryKey = this.getMemoryKey(userId, guildId);
        return this.userMemories.get(memoryKey) || null;
    }

    // Get conversation context for AI
    getConversationContext(userId, guildId = 'dm', limit = 10) {
        const memory = this.getMemory(userId, guildId);
        if (!memory || memory.messages.length === 0) {
            return {
                hasHistory: false,
                messages: [],
                topics: [],
                preferences: {},
                isFirstTime: true
            };
        }

        // Get recent messages
        const recentMessages = memory.messages.slice(-limit);
        
        // Format for AI context
        const formattedMessages = recentMessages.map(msg => ({
            role: msg.isUser ? 'user' : 'assistant',
            content: msg.content,
            timestamp: new Date(msg.timestamp).toISOString()
        }));

        return {
            hasHistory: true,
            messages: formattedMessages,
            topics: Array.from(memory.topics),
            preferences: memory.preferences,
            lastActive: new Date(memory.lastActive).toISOString(),
            isFirstTime: false
        };
    }

    // Save user memory to file
    async saveUserMemory(userId, guildId, userMemory) {
        if (!this.initialized) return;

        try {
            const filePath = this.getMemoryPath(userId, guildId);
            const data = {
                ...userMemory,
                topics: Array.from(userMemory.topics)
            };
            
            await fs.writeFile(filePath, JSON.stringify(data, null, 2));
        } catch (error) {
            console.error(`❌ Failed to save memory for ${userId}:`, error);
        }
    }

    // Load all memories from files
    async loadAllMemories() {
        try {
            const files = await fs.readdir(this.memoryDir);
            const memoryFiles = files.filter(file => file.endsWith('.json'));
            
            console.log(`💾 Loading ${memoryFiles.length} memory files...`);

            for (const file of memoryFiles) {
                try {
                    const filePath = path.join(this.memoryDir, file);
                    const data = await fs.readFile(filePath, 'utf8');
                    const memory = JSON.parse(data);
                    
                    // Convert arrays back to sets
                    memory.topics = new Set(memory.topics || []);
                    
                    const memoryKey = this.getMemoryKey(memory.userId, memory.guildId);
                    this.userMemories.set(memoryKey, memory);
                } catch (fileError) {
                    console.warn(`⚠️ Failed to load memory file ${file}:`, fileError.message);
                }
            }

            console.log(`✅ Loaded ${this.userMemories.size} user memories!`);
        } catch (error) {
            console.warn('⚠️ Failed to load memories:', error.message);
        }
    }

    // Clean old memories
    async cleanOldMemories() {
        const now = Date.now();
        let cleaned = 0;

        for (const [key, memory] of this.userMemories.entries()) {
            // Remove memories older than maxMemoryAge
            if (now - memory.lastActive > this.maxMemoryAge) {
                this.userMemories.delete(key);
                
                // Delete file
                try {
                    const filePath = this.getMemoryPath(memory.userId, memory.guildId);
                    await fs.unlink(filePath);
                    cleaned++;
                } catch (error) {
                    console.warn(`⚠️ Failed to delete old memory file:`, error.message);
                }
            }
        }

        if (cleaned > 0) {
            console.log(`🧹 Cleaned ${cleaned} old memories`);
        }
    }

    // Get memory stats
    getStats() {
        const totalUsers = this.userMemories.size;
        const totalMessages = Array.from(this.userMemories.values())
            .reduce((sum, memory) => sum + memory.messages.length, 0);
        
        const activeUsers = Array.from(this.userMemories.values())
            .filter(memory => Date.now() - memory.lastActive < 24 * 60 * 60 * 1000).length;

        return {
            totalUsers,
            totalMessages,
            activeUsers,
            memoryAge: this.maxMemoryAge,
            maxMemoryPerUser: this.maxMemoryPerUser
        };
    }

    // Clear memory for specific user
    async clearUserMemory(userId, guildId = 'dm') {
        const memoryKey = this.getMemoryKey(userId, guildId);
        
        if (this.userMemories.has(memoryKey)) {
            this.userMemories.delete(memoryKey);
            
            // Delete file
            try {
                const filePath = this.getMemoryPath(userId, guildId);
                await fs.unlink(filePath);
                console.log(`🗑️ Cleared memory for ${userId} in ${guildId}`);
                return true;
            } catch (error) {
                console.warn(`⚠️ Failed to delete memory file:`, error.message);
                return false;
            }
        }
        
        return false;
    }
}

// Export singleton instance
module.exports = new MemorySystem();