# Ultron Discord Bot

A Discord bot powered by OpenAI's GPT models that provides intelligent, context-aware responses to messages in your Discord server.

## Features

- 🤖 **Modern OpenAI Integration** - Uses OpenAI's latest chat completions API (v4.x)
- 💰 **Real-Time Crypto Prices** - Get live cryptocurrency prices using OpenAI function calling
- 💬 **Conversation Memory** - Maintains context across multiple messages per channel
- ⚡ **Configurable Command Prefix** - Optionally respond only to messages with a specific prefix (default: backslash `\`)
- 🎨 **Customizable Personality** - Define your bot's personality through system prompts
- 🛡️ **Rate Limiting** - Built-in cooldown system to prevent spam
- 📝 **Typing Indicators** - Shows typing status while generating responses
- ⚠️ **Error Handling** - User-friendly error messages and robust error handling
- 🔧 **Fully Configurable** - Customize model, tokens, temperature, and more

## Prerequisites

- Node.js 18.0.0 or higher
- A Discord Bot Token ([Get one here](https://discord.com/developers/applications))
- An OpenAI API Key ([Get one here](https://platform.openai.com/api-keys))

## Installation

1. **Clone or download this repository**

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your credentials:
   ```env
   BOT_TOKEN=your_discord_bot_token_here
   OPENAI_API_KEY=your_openai_api_key_here
   ```

4. **Configure bot settings (optional)**
   
   Customize the bot behavior in `.env`:
   - `COMMAND_PREFIX` - Prefix for bot commands (default: `\`). Leave empty to respond to all messages.
   - `OPENAI_MODEL` - Model to use (default: `gpt-4o-mini`)
   - `MAX_TOKENS` - Maximum response length (default: `500`)
   - `SYSTEM_PROMPT` - Bot personality/instructions
   - `CONTEXT_MESSAGES` - Number of previous messages to remember (default: `10`)

## Discord Bot Setup

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application or select an existing one
3. Go to the "Bot" section and create a bot
4. Copy the bot token and add it to your `.env` file
5. Enable the following **Privileged Gateway Intents**:
   - ✅ Message Content Intent
6. Go to "OAuth2" → "URL Generator"
7. Select scopes:
   - ✅ `bot`
8. Select bot permissions:
   - ✅ Send Messages
   - ✅ Read Messages/View Channels
   - ✅ Read Message History
9. Copy the generated URL and open it in your browser to invite the bot to your server

## Usage

**Start the bot:**
```bash
npm start
```

**With command prefix (default: backslash `\`):**
```
\what's the price of BTC and ETH?
\explain quantum computing
\help me debug this code
```

**Without command prefix (set `COMMAND_PREFIX=` to empty):**
```
Hey bot, can you help me with something?
```

**Crypto price queries:**
```
\what are the current prices for BTC and ETH?
\how much is Solana worth?
\show me prices for BTC, ETH, SOL, and ADA
```

The bot will:
- Show a typing indicator while processing
- Fetch real-time crypto prices when asked
- Remember the last 10 messages in each channel for context
- Apply a 3-second cooldown per user to prevent spam
- Provide helpful error messages if something goes wrong

## Configuration Options

| Variable | Default | Description |
|----------|---------|-------------|
| `BOT_TOKEN` | *Required* | Discord bot token |
| `OPENAI_API_KEY` | *Required* | OpenAI API key |
| `COMMAND_PREFIX` | `\` (backslash) | Command prefix (empty = respond to all messages) |
| `OPENAI_MODEL` | `gpt-4o-mini` | OpenAI model to use |
| `MAX_TOKENS` | `500` | Maximum tokens in response |
| `SYSTEM_PROMPT` | Default personality | Instructions for bot behavior |
| `CONTEXT_MESSAGES` | `10` | Number of messages to remember per channel |

## Available Models

- `gpt-4o-mini` - Fast and cost-effective (recommended)
- `gpt-4o` - Most capable model
- `gpt-3.5-turbo` - Legacy model, still capable

## Troubleshooting

**Bot doesn't respond:**
- Ensure Message Content Intent is enabled in Discord Developer Portal
- Check that the bot has permission to read and send messages in the channel
- Verify your `.env` file has correct credentials

**Authentication errors:**
- Double-check your `OPENAI_API_KEY` is valid
- Ensure your OpenAI account has available credits

**Rate limit errors:**
- The bot has built-in cooldowns, but OpenAI may still rate limit
- Consider upgrading your OpenAI plan or reducing usage

## Project Structure

```
ultron/
├── ultron.js           # Main bot script
├── package.json        # Dependencies and scripts
├── .env                # Environment variables (create from .env.example)
├── .env.example        # Environment template
└── README.md          # This file
```

## Contributing

Feel free to submit issues, fork the repository, and create pull requests for any improvements.

## License

ISC

## Supported Cryptocurrencies

The bot can fetch real-time prices for:
- **BTC** (Bitcoin)
- **ETH** (Ethereum)
- **SOL** (Solana)
- **BNB** (Binance Coin)
- **XRP** (Ripple)
- **ADA** (Cardano)
- **DOGE** (Dogecoin)
- **DOT** (Polkadot)
- **MATIC** (Polygon)
- **AVAX** (Avalanche)
- **LINK** (Chainlink)
- **UNI** (Uniswap)
- **ATOM** (Cosmos)
- **LTC** (Litecoin)
- And many more!

Data is provided by the free [CoinGecko API](https://www.coingecko.com/en/api) - no API key required.

## Changelog

### Version 2.1.0
- ✅ **Added real-time cryptocurrency prices** via OpenAI function calling
- ✅ Changed default command prefix to backslash (`\`)
- ✅ Integrated CoinGecko API for crypto data
- ✅ Added support for 15+ popular cryptocurrencies

### Version 2.0.0
- ✅ Updated to OpenAI v4.x API
- ✅ Migrated from completions to chat completions
- ✅ Added conversation memory per channel
- ✅ Added configurable command prefix
- ✅ Added typing indicators
- ✅ Added user cooldown system
- ✅ Improved error handling
- ✅ Added comprehensive logging
- ✅ Fully configurable via environment variables
