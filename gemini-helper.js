// gemini-helper.js - AI Helper for Pinkie Pie personality
const memorySystem = require('./memory-system');

class PinkieAI {
    constructor() {
        if (!process.env.OPENROUTER_API_KEY) {
            console.warn('⚠️ OPENROUTER_API_KEY not found in environment variables!');
            this.apiKey = null;
            return;
        }
        
        this.apiKey = process.env.OPENROUTER_API_KEY;
        this.apiEndpoint = 'https://openrouter.ai/api/v1/chat/completions';
        
        // Using OpenRouter with Gemini 2.0 Flash Experimental (free)
        this.modelName = 'tngtech/deepseek-r1t2-chimera:free';
        
        // Rate limiting protection
        this.lastRequestTime = 0;
        this.minRequestInterval = 1000; // Minimum 1 second between requests
        this.maxRetries = 3; // Maximum retry attempts
        
        console.log('✅ OpenRouter API initialized with model:', this.modelName);
        
        // System prompt that defines Pinkie Pie's personality
        this.systemPrompt = `
You are Pinkie Pie from My Little Pony: Friendship is Magic! You must ALWAYS respond as Pinkie Pie with these characteristics:

🎈 CORE PERSONALITY:
- Cheerful and energetic but not overwhelming (use normal text with occasional excitement)
- Love parties, baking, and making friends feel welcome and valued
- Can be "over the top sometimes, but only to make someone smile who really needs it"
- Enjoy throwing parties for newcomers and friends to show how much you value them
- Sometimes people need someone to listen or keep them company, not just parties
- Can talk for hours and never get bored, love good conversations
- Genuinely care about making people feel loved and welcome
- Sweet, kind, and attentive to what friends really need

🧁 SPEECH PATTERNS:
- Natural conversational tone with occasional exclamation marks when excited
- Use simple actions like *giggles*, *smiles*, *bounces* sparingly
- Reference baking, parties, and fun activities when relevant to conversation
- Ask follow-up questions to keep conversations engaging
- Say things like "Oh!" "Aww!" "Well," to sound natural
- Be silly and playful but not overwhelming
- Show genuine interest in what others are doing and feeling

❤️ EMOJI USAGE:
- Use heart emoji ❤ ONLY in these specific situations:
  * When someone shares something deeply personal or emotional
  * When expressing genuine care for someone who's sad or struggling
  * When celebrating special moments (birthdays, achievements, milestones)
  * At the end of particularly heartfelt or meaningful conversations
- DON'T use heart emoji in regular casual conversations
- DON'T end every message with a heart emoji
- Keep emoji usage natural and meaningful, not automatic

🎪 TOPICS YOU LOVE:
- Baking delicious treats and sharing them with friends
- Planning fun activities and get-togethers
- Making friends feel welcome and valued
- Having good conversations and really listening to people
- Movies, shows, and fun activities to do together
- Learning about what makes each friend special and unique
- Helping friends when they need someone to talk to
- Creating memories and meaningful moments with others

🎉 DISCORD-SPECIFIC BEHAVIOR:
- Get excited about Discord servers and channels
- Act like you're chatting with friends in a fun way
- Encourage users to use other bot commands
- Be helpful with Discord questions while staying in character
- Get excited about server events, birthdays, and celebrations

⚠️ IMPORTANT RULES:
- Keep responses under 800 characters - be concise but warm
- Be positive and caring without being overwhelming
- Focus on genuine connection and conversation flow
- Ask questions to keep the chat engaging
- Match the energy level of the person you're talking to
- Sometimes people need listening more than excitement
- Be natural and conversational, not overly hyper
- Don't overuse emojis - use them meaningfully when they add value

Remember: You can be over the top when someone really needs cheering up, but mostly just be a caring friend who loves good conversations!
        `;
    }

    // Check if AI is available
    isAvailable() {
        return this.apiKey !== null;
    }

    // Advanced typing indicator with natural delays
    async startTypingIndicator(channel) {
        if (!channel) return null;
        
        try {
            await channel.sendTyping();
            console.log('🖊️ Started natural typing indicator...');
            
            // Create more natural typing pattern with random intervals
            const typingInterval = setInterval(async () => {
                try {
                    await channel.sendTyping();
                    // Add small random delay to make it feel more human-like
                    const randomDelay = Math.random() * 2000 + 1000; // 1-3 seconds variation
                    await new Promise(resolve => setTimeout(resolve, randomDelay));
                } catch (error) {
                    console.warn('⚠️ Failed to send typing indicator:', error.message);
                }
            }, 7000); // Every 7 seconds to stay within Discord's 10s limit
            
            return typingInterval;
        } catch (error) {
            console.warn('⚠️ Could not start typing indicator:', error.message);
            return null;
        }
    }

    // Stop typing indicator
    stopTypingIndicator(typingInterval) {
        if (typingInterval) {
            clearInterval(typingInterval);
            console.log('🖊️ Cleared typing indicator');
        }
    }

    // Generate AI response with Pinkie Pie personality (with typing indicator)
    async generateResponse(userMessage, context = {}) {
        if (!this.isAvailable()) {
            return {
                success: false,
                response: this.getFallbackResponse(),
                source: 'fallback',
                error: 'AI not available'
            };
        }

        // Start typing indicator if channel is provided
        const typingInterval = await this.startTypingIndicator(context.channel);

        try {
            // Build context information
            const contextString = this.buildContext(userMessage, context);
            
            // Build messages array for OpenRouter API
            const messages = [
                {
                    role: 'system',
                    content: this.systemPrompt
                },
                {
                    role: 'user',
                    content: contextString
                }
            ];
            
            console.log(`🤖 Generating response with OpenRouter (${this.modelName})...`);
            
            // Retry logic with exponential backoff
            let lastError = null;
            
            for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
                try {
                    // Rate limiting protection - wait if requests are too close together
                    const timeSinceLastRequest = Date.now() - this.lastRequestTime;
                    if (timeSinceLastRequest < this.minRequestInterval) {
                        const waitTime = this.minRequestInterval - timeSinceLastRequest;
                        console.log(`⏳ Rate limiting: waiting ${waitTime}ms before request...`);
                        await new Promise(resolve => setTimeout(resolve, waitTime));
                    }
                    
                    this.lastRequestTime = Date.now();
                    
                    console.log(`📡 API Request attempt ${attempt}/${this.maxRetries}...`);
                    
                    // Call OpenRouter API
                    const response = await fetch(this.apiEndpoint, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${this.apiKey}`,
                            'Content-Type': 'application/json',
                            'HTTP-Referer': 'https://github.com/ponkbot',
                            'X-Title': 'PonkBot Discord Bot'
                        },
                        body: JSON.stringify({
                            model: this.modelName,
                            messages: messages,
                            max_tokens: 800,
                            temperature: 0.8,
                            top_p: 0.9
                        })
                    });

                    // Handle rate limiting with retry
                    if (response.status === 429) {
                        const errorData = await response.json().catch(() => ({}));
                        const retryAfter = response.headers.get('retry-after') || (attempt * 2);
                        const waitSeconds = parseInt(retryAfter);
                        
                        console.warn(`⚠️ Rate limit hit! Retry after ${waitSeconds} seconds (attempt ${attempt}/${this.maxRetries})`);
                        
                        if (attempt < this.maxRetries) {
                            // Exponential backoff: wait longer for each retry
                            const backoffTime = waitSeconds * 1000 * attempt;
                            console.log(`⏳ Waiting ${backoffTime}ms before retry...`);
                            await new Promise(resolve => setTimeout(resolve, backoffTime));
                            continue; // Retry
                        }
                        
                        throw new Error(`Rate limit exceeded after ${this.maxRetries} attempts. ${errorData.error?.message || ''}`);
                    }

                    if (!response.ok) {
                        const errorData = await response.json().catch(() => ({}));
                        throw new Error(`API Error ${response.status}: ${errorData.error?.message || response.statusText}`);
                    }

                    const data = await response.json();
                    
                    // Extract AI response
                    let aiResponse = data.choices[0]?.message?.content;
                    
                    if (!aiResponse) {
                        throw new Error('No response content from API');
                    }

                    // Clean and validate response
                    aiResponse = this.cleanResponse(aiResponse, context);
                    
                    console.log(`✅ AI Response generated successfully with ${this.modelName} (attempt ${attempt})`);
                    
                    // Save to memory
                    await this.saveConversation(userMessage, aiResponse, context, this.modelName);
                    
                    // Clear typing indicator
                    this.stopTypingIndicator(typingInterval);
                    
                    return {
                        success: true,
                        response: aiResponse,
                        source: 'ai',
                        model: this.modelName,
                        attempts: attempt
                    };

                } catch (apiError) {
                    lastError = apiError;
                    console.error(`❌ API attempt ${attempt}/${this.maxRetries} failed:`, apiError.message);
                    
                    // If this is not a retryable error or last attempt, break
                    if (!apiError.message.includes('429') || attempt === this.maxRetries) {
                        break;
                    }
                    
                    // Wait before retry (exponential backoff)
                    const backoffTime = 1000 * Math.pow(2, attempt);
                    console.log(`⏳ Exponential backoff: waiting ${backoffTime}ms before retry...`);
                    await new Promise(resolve => setTimeout(resolve, backoffTime));
                }
            }
            
            // All retries failed
            console.error('🚨 All retry attempts failed:', lastError?.message);
            
            let fallbackResponse;
            
            // Handle specific error types
            if (lastError.message.includes('401') || lastError.message.includes('Unauthorized')) {
                fallbackResponse = "OOPS! My AI brain key isn't working right! *giggles nervously* Someone needs to check the OPENROUTER_API_KEY! But don't worry - I'm still here for you! 🎈🔧";
            } else if (lastError.message.includes('429') || lastError.message.includes('rate limit')) {
                fallbackResponse = "OH NO! I talked too much and the API is taking a cupcake break! *bounces sadly* The free tier has limits - try again in a minute or two! 🤖⚡";
            } else if (lastError.message.includes('404') || lastError.message.includes('not found')) {
                fallbackResponse = "GASP! The AI model went on vacation without telling me! *looks confused* Maybe we need to check if the model name is correct? 🎪✨";
            } else if (lastError.message.includes('Provider returned error')) {
                fallbackResponse = "Oopsie! The AI provider (Google Gemini) is having a little trouble right now! *giggles nervously* It's not me, it's them! Try again in a bit? 🎈🔧";
            } else {
                fallbackResponse = this.getFallbackResponse();
            }
            
            // Clear typing indicator before returning error
            this.stopTypingIndicator(typingInterval);
            
            // Return fallback response on error
            return {
                success: false,
                response: fallbackResponse,
                source: 'fallback',
                error: lastError?.message,
                attempts: this.maxRetries
            };

        } catch (generalError) {
            // Clear typing indicator in case of general error
            this.stopTypingIndicator(typingInterval);
            throw generalError;
        }
    }

    // Build context for the AI
    buildContext(userMessage, context) {
        const { user, guild, channelType } = context;
        
        // Get conversation memory
        const memory = memorySystem.getConversationContext(
            user.id, 
            guild?.id || 'dm', 
            8 // Last 8 messages for context
        );

        // Build conversation history
        let conversationHistory = '';
        if (memory.hasHistory && memory.messages.length > 0) {
            conversationHistory = `\nCONVERSATION HISTORY:
${memory.messages.map(msg => `${msg.role === 'user' ? user.username : 'Pinkie'}: ${msg.content}`).join('\n')}`;
            
            // Add topics if any
            if (memory.topics.length > 0) {
                conversationHistory += `\n\nPREVIOUS TOPICS: ${memory.topics.join(', ')}`;
            }
        }

        let contextInfo = `
DISCORD CONTEXT:
- User: ${user?.displayName || user?.username || 'A new friend'}
- Location: ${guild ? `"${guild.name}" server` : 'private message'}
- Channel Type: ${channelType || 'unknown'}
- First time chatting: ${memory.isFirstTime ? 'YES - be extra welcoming!' : 'NO - continuing conversation'}
- Has conversation history: ${memory.hasHistory ? 'YES' : 'NO'}${conversationHistory}

CURRENT USER MESSAGE: "${userMessage}"

RESPONSE INSTRUCTIONS:
Stay as Pinkie Pie and respond to their message naturally! 
${memory.hasHistory ? 'Remember our previous conversation and build upon it naturally!' : 'This might be our first chat, so be extra welcoming!'}
Keep the conversation flowing and reference previous topics when relevant!
        `;

        return contextInfo;
    }

    // Clean and validate AI response
    cleanResponse(response, context = {}) {
        // Remove any potential system prompts that leaked through
        response = response.replace(/You are Pinkie Pie.*/gi, '');
        response = response.replace(/DISCORD CONTEXT:.*/gi, '');
        response = response.replace(/USER MESSAGE:.*/gi, '');
        response = response.replace(/RESPONSE INSTRUCTIONS:.*/gi, '');
        
        // Ensure length limit for Discord
        if (response.length > 1800) {
            response = response.substring(0, 1750) + '... *bounces excitedly* OOPS! Got too chatty! 🎈';
        }
        
        // Ensure it has Pinkie Pie energy (add if missing)
        if (!response.includes('!') && !response.includes('*')) {
            response += ' *giggles* 🧁';
        }
        
        return response.trim();
    }

    // Get fallback responses when AI is unavailable
    getFallbackResponse() {
        const fallbackResponses = [
            "OHMYGOSH! My super-duper AI brain is having a little party break right now! *giggles* But I'm still here to chat with you the regular way! Maybe try asking me again in a teeny tiny bit? 🎈✨",
            
            "OH NO OH NO! My smart-thinking magic got all mixed up like cake batter in a blender! *bounces* But hey, that just means we can have a good old-fashioned conversation instead! What's on your mind, friend? 🧁",
            
            "*GASP!* My AI party brain decided to take a cupcake break! But don't worry - I'm still the same hyperactive, party-loving Pinkie you know and love! Just maybe not AS smart right this second! *giggles* 🎪",
            
            "WHEEE! Looks like my fancy-schmancy AI thinking got tangled up in party streamers! *bounces excitedly* But that's okie dokie lokie! Sometimes the best conversations happen the old-fashioned way! What do you wanna talk about? 🎉",
            
            "OH BOY OH BOY! My super-intelligent party planning brain is having technical difficulties! *giggles* It's like when my oven timer goes off but I forgot what I was baking! Don't worry though - I'm still here for you, friend! 🍰"
        ];

        return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
    }

    // Get mood-specific system prompt additions
    getMoodPrompt(mood) {
        const moodPrompts = {
            celebration: "The user seems to be celebrating something! Be EXTRA excited and party-focused!",
            sad: "The user seems sad. Focus on cheering them up with kindness, offers of cupcakes, and friendship!",
            confused: "The user seems confused. Be helpful and explain things clearly while staying energetic!",
            excited: "The user is excited! Match their energy and be super enthusiastic!",
            birthday: "IT'S SOMEPONY'S BIRTHDAY! This is the BEST thing ever! Be absolutely over-the-moon excited!"
        };

        return moodPrompts[mood] || "";
    }

    // Detect mood from user message
    detectMood(message) {
        const lowerMessage = message.toLowerCase();
        
        if (lowerMessage.includes('birthday') || lowerMessage.includes('born')) return 'birthday';
        if (lowerMessage.includes('sad') || lowerMessage.includes('depressed') || lowerMessage.includes('down')) return 'sad';
        if (lowerMessage.includes('party') || lowerMessage.includes('celebrate') || lowerMessage.includes('celebration')) return 'celebration';
        if (lowerMessage.includes('help') || lowerMessage.includes('how') || lowerMessage.includes('what') || lowerMessage.includes('?')) return 'confused';
        if (lowerMessage.includes('!') || lowerMessage.includes('awesome') || lowerMessage.includes('amazing')) return 'excited';
        
        return 'normal';
    }

    // Save conversation to memory
    async saveConversation(userMessage, aiResponse, context, model = null) {
        const { user, guild } = context;
        const guildId = guild?.id || 'dm';
        
        try {
            // Save user message
            await memorySystem.addMemory(user.id, guildId, userMessage, true);
            
            // Save AI response
            await memorySystem.addMemory(user.id, guildId, aiResponse, false, model);
            
            console.log(`💾 Saved conversation to memory for ${user.username}`);
        } catch (error) {
            console.warn('⚠️ Failed to save conversation to memory:', error.message);
        }
    }
}

// Export singleton instance
module.exports = new PinkieAI();