require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const OpenAI = require('openai');

// Configuration
const CONFIG = {
    commandPrefix: process.env.COMMAND_PREFIX || '\\',
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    maxTokens: parseInt(process.env.MAX_TOKENS) || 500,
    systemPrompt: process.env.SYSTEM_PROMPT || 'You are Ultron, a helpful and friendly AI assistant in a Discord server. Be concise, engaging, and helpful in your responses. You have access to real-time cryptocurrency price data.',
    contextMessages: parseInt(process.env.CONTEXT_MESSAGES) || 10,
    temperature: 0.7,
    cooldownSeconds: 3
};

// Initialize Discord client
const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent
    ] 
});

// Initialize OpenAI client (v4.x)
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Store conversation history per channel
const conversationHistory = new Map();

// Store user cooldowns
const userCooldowns = new Map();

/**
 * Get or initialize conversation history for a channel
 */
function getChannelHistory(channelId) {
    if (!conversationHistory.has(channelId)) {
        conversationHistory.set(channelId, []);
    }
    return conversationHistory.get(channelId);
}

/**
 * Add message to channel history with sliding window
 */
function addToHistory(channelId, role, content) {
    const history = getChannelHistory(channelId);
    history.push({ role, content });
    
    // Keep only the last N messages (excluding system prompt)
    if (history.length > CONFIG.contextMessages) {
        history.shift();
    }
}

/**
 * Check if user is on cooldown
 */
function isOnCooldown(userId) {
    if (!userCooldowns.has(userId)) return false;
    
    const lastMessageTime = userCooldowns.get(userId);
    const now = Date.now();
    const cooldownMs = CONFIG.cooldownSeconds * 1000;
    
    if (now - lastMessageTime < cooldownMs) {
        return true;
    }
    
    userCooldowns.delete(userId);
    return false;
}

/**
 * Set user cooldown
 */
function setCooldown(userId) {
    userCooldowns.set(userId, Date.now());
}

/**
 * Fetch cryptocurrency prices from CoinGecko API
 * @param {string[]} symbols - Array of crypto symbols (e.g., ['BTC', 'ETH'])
 * @returns {Promise<Object>} Price data for requested cryptocurrencies
 */
async function getCryptoPrices(symbols) {
    try {
        // Map common symbols to CoinGecko IDs
        const symbolMap = {
            'BTC': 'bitcoin',
            'ETH': 'ethereum',
            'USDT': 'tether',
            'BNB': 'binancecoin',
            'SOL': 'solana',
            'XRP': 'ripple',
            'ADA': 'cardano',
            'DOGE': 'dogecoin',
            'DOT': 'polkadot',
            'MATIC': 'matic-network',
            'AVAX': 'avalanche-2',
            'LINK': 'chainlink',
            'UNI': 'uniswap',
            'ATOM': 'cosmos',
            'LTC': 'litecoin'
        };

        // Convert symbols to CoinGecko IDs
        const ids = symbols.map(s => symbolMap[s.toUpperCase()] || s.toLowerCase()).join(',');
        
        const response = await fetch(
            `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true`,
            {
                headers: {
                    'Accept': 'application/json'
                }
            }
        );

        if (!response.ok) {
            throw new Error(`CoinGecko API error: ${response.status}`);
        }

        const data = await response.json();
        
        // Format the response
        const result = {};
        symbols.forEach(symbol => {
            const coinId = symbolMap[symbol.toUpperCase()] || symbol.toLowerCase();
            if (data[coinId]) {
                result[symbol.toUpperCase()] = {
                    price: data[coinId].usd,
                    change_24h: data[coinId].usd_24h_change,
                    market_cap: data[coinId].usd_market_cap
                };
            }
        });

        return result;
    } catch (error) {
        console.error('Error fetching crypto prices:', error);
        throw error;
    }
}

// Define available functions for OpenAI
const functions = [
    {
        name: 'get_crypto_prices',
        description: 'Get current cryptocurrency prices in USD. Use this when users ask about crypto prices, values, or market data.',
        parameters: {
            type: 'object',
            properties: {
                symbols: {
                    type: 'array',
                    items: {
                        type: 'string'
                    },
                    description: 'Array of cryptocurrency symbols (e.g., ["BTC", "ETH", "SOL"]). Common symbols: BTC, ETH, USDT, BNB, SOL, XRP, ADA, DOGE, DOT, MATIC, AVAX, LINK, UNI, ATOM, LTC'
                }
            },
            required: ['symbols']
        }
    }
];

// Bot ready event
client.on('clientReady', () => {
    console.log(`✅ Logged in as ${client.user.tag}`);
    console.log(`📝 Command prefix: ${CONFIG.commandPrefix || '(responds to all messages)'}`);
    console.log(`🤖 Using model: ${CONFIG.model}`);
    console.log(`💬 Context messages: ${CONFIG.contextMessages}`);
});

// Message handler
client.on("messageCreate", async function (message) {
    try {
        // Ignore bot messages
        if (message.author.bot) return;
        
        // Check for command prefix if configured
        if (CONFIG.commandPrefix) {
            if (!message.content.startsWith(CONFIG.commandPrefix)) return;
            // Remove prefix from message content
            message.content = message.content.slice(CONFIG.commandPrefix.length).trim();
        }
        
        // Ignore empty messages
        if (!message.content) return;
        
        // Check cooldown
        if (isOnCooldown(message.author.id)) {
            return; // Silently ignore to avoid spam
        }
        
        // Show typing indicator
        await message.channel.sendTyping();
        
        // Add user message to history
        addToHistory(message.channel.id, 'user', message.content);
        
        // Build messages array for API call
        const history = getChannelHistory(message.channel.id);
        const messages = [
            { role: 'system', content: CONFIG.systemPrompt },
            ...history
        ];
        
        // Call OpenAI API with chat completions and function calling
        let response = await openai.chat.completions.create({
            model: CONFIG.model,
            messages: messages,
            functions: functions,
            function_call: 'auto',
            temperature: CONFIG.temperature,
            max_tokens: CONFIG.maxTokens,
            top_p: 1.0,
            frequency_penalty: 0.5,
            presence_penalty: 0.0,
        });
        
        let assistantMessage = response.choices[0].message;
        
        // Check if the model wants to call a function
        if (assistantMessage.function_call) {
            const functionName = assistantMessage.function_call.name;
            const functionArgs = JSON.parse(assistantMessage.function_call.arguments);
            
            console.log(`🔧 Function call: ${functionName} with args:`, functionArgs);
            
            // Execute the function
            let functionResult;
            if (functionName === 'get_crypto_prices') {
                functionResult = await getCryptoPrices(functionArgs.symbols);
            }
            
            // Add function call and result to messages
            messages.push(assistantMessage);
            messages.push({
                role: 'function',
                name: functionName,
                content: JSON.stringify(functionResult)
            });
            
            // Get final response from the model
            response = await openai.chat.completions.create({
                model: CONFIG.model,
                messages: messages,
                temperature: CONFIG.temperature,
                max_tokens: CONFIG.maxTokens,
            });
            
            assistantMessage = response.choices[0].message;
        }
        
        const finalMessage = assistantMessage.content;
        
        // Add assistant response to history
        addToHistory(message.channel.id, 'assistant', finalMessage);
        
        // Reply to user
        await message.reply(finalMessage);
        
        // Set cooldown
        setCooldown(message.author.id);
        
    } catch (error) {
        console.error('❌ Error processing message:', error);
        
        // User-friendly error messages
        if (error.status === 429) {
            await message.reply('⚠️ Rate limit reached. Please try again in a moment.');
        } else if (error.status === 401) {
            await message.reply('⚠️ Authentication error. Please check the bot configuration.');
            console.error('Invalid OpenAI API key');
        } else if (error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT') {
            await message.reply('⚠️ Network error. Please try again later.');
        } else {
            await message.reply('⚠️ Sorry, I encountered an error processing your message. Please try again.');
        }
    }
});

// Error handling
client.on('error', error => {
    console.error('❌ Discord client error:', error);
});

process.on('unhandledRejection', error => {
    console.error('❌ Unhandled promise rejection:', error);
});

// Login to Discord
client.login(process.env.BOT_TOKEN).catch(error => {
    console.error('❌ Failed to login to Discord:', error);
    process.exit(1);
});