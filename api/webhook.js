// api/webhook.js
const BOT_TOKEN = process.env.BOT_TOKEN;
const APP_URL = process.env.APP_URL;

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(200).json({ ok: true, message: 'Webhook is running' });
    }

    const update = req.body;

    try {
        if (update.message) {
            await handleMessage(update.message);
        }

        if (update.callback_query) {
            await handleCallbackQuery(update.callback_query);
        }

        res.status(200).json({ ok: true });
    } catch (error) {
        console.error('Error:', error);
        res.status(200).json({ ok: true });
    }
}

async function handleMessage(message) {
    const chatId = message.chat.id;
    const text = message.text || '';
    const firstName = message.from.first_name || 'Player';

    if (text === '/start' || text.startsWith('/start ')) {
        await sendWelcomeMessage(chatId, firstName);
    } else if (text === '/help') {
        await sendHowToPlay(chatId);
    } else {
        await sendMessage(chatId, 
            `Hey ${firstName}! 👋 Tap the button below to start playing! 🎮`,
            getPlayButton()
        );
    }
}

async function handleCallbackQuery(callbackQuery) {
    const chatId = callbackQuery.message.chat.id;
    const data = callbackQuery.data;

    await answerCallbackQuery(callbackQuery.id);

    if (data === 'how_to_play') {
        await sendHowToPlay(chatId);
    }
}

async function sendWelcomeMessage(chatId, firstName) {
    const message = 
        `🎮 *Welcome to Tic-Tac-Toe, ${firstName}!*\n\n` +
        `Challenge your friends to the classic game of X's and O's — right inside Telegram!\n\n` +
        `✨ *Features:*\n` +
        `• Play vs Computer (Easy or Hard mode)\n` +
        `• Pass & play with a friend on the same device\n` +
        `• 🔥 Challenge any friend online!\n\n` +
        `Tap *Play Now* to get started 👇`;

    const keyboard = {
        inline_keyboard: [
            [
                {
                    text: '🎮 Play Now',
                    web_app: { url: APP_URL }
                }
            ],
            [
                {
                    text: '❓ How to Play',
                    callback_data: 'how_to_play'
                }
            ]
        ]
    };

    await sendMessage(chatId, message, keyboard);
}

async function sendHowToPlay(chatId) {
    const message =
        `📖 *How to Play Tic-Tac-Toe*\n\n` +
        `*The Basics:*\n` +
        `• The board is a 3x3 grid\n` +
        `• You are X, opponent is O\n` +
        `• Take turns placing your symbol\n` +
        `• First to get 3 in a row wins!\n\n` +
        `*Game Modes:*\n` +
        `🤖 *vs Computer Easy* — Random moves\n` +
        `🧠 *vs Computer Hard* — Unbeatable AI\n` +
        `👥 *2 Player* — Pass the phone\n` +
        `🌐 *Challenge Friend* — Play online!\n\n` +
        `Ready? Let's play! 👇`;

    const keyboard = {
        inline_keyboard: [
            [
                {
                    text: '🎮 Play Now',
                    web_app: { url: APP_URL }
                }
            ]
        ]
    };

    await sendMessage(chatId, message, keyboard);
}

function getPlayButton() {
    return {
        inline_keyboard: [
            [
                {
                    text: '🎮 Play Now',
                    web_app: { url: APP_URL }
                }
            ]
        ]
    };
}

async function sendMessage(chatId, text, replyMarkup = null) {
    const body = {
        chat_id: chatId,
        text: text,
        parse_mode: 'Markdown'
    };

    if (replyMarkup) {
        body.reply_markup = replyMarkup;
    }

    const response = await fetch(
        `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        }
    );

    return response.json();
}

async function answerCallbackQuery(callbackQueryId, text = '') {
    await fetch(
        `https://api.telegram.org/bot${BOT_TOKEN}/answerCallbackQuery`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                callback_query_id: callbackQueryId,
                text: text
            })
        }
    );
}
