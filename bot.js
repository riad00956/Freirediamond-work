const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');

const token = process.env.BOT_TOKEN;
const adminId = parseInt(process.env.ADMIN_ID);
const bot = new TelegramBot(token, { polling: true });

let plans = require('./plans.json');
let orders = require('./orders.json');

bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, '👋 Welcome to CORE TOP UP BOT!\n\nUse /plans to view available packages.\nUse /order to place your order.');
});

bot.onText(/\/plans/, (msg) => {
    let reply = '📦 Available Plans:\n';
    plans.forEach((p, i) => {
        reply += `\n${i + 1}. ${p.name} = ${p.price} TK`;
    });
    bot.sendMessage(msg.chat.id, reply);
});

bot.onText(/\/order (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const parts = match[1].split(',');
    if (parts.length !== 4) {
        bot.sendMessage(chatId, '❌ Invalid format.\nUse:\n/order UID, Plan Name, Payment Method, TXN ID');
        return;
    }

    const [uid, planName, paymentMethod, txnId] = parts.map(x => x.trim());
    const order = {
        user: chatId,
        uid,
        plan: planName,
        method: paymentMethod,
        txnId,
        status: "Pending"
    };

    orders.push(order);
    fs.writeFileSync('./orders.json', JSON.stringify(orders, null, 2));
    bot.sendMessage(adminId, `📥 New Order:\nUID: ${uid}\nPlan: ${planName}\nMethod: ${paymentMethod}\nTXN ID: ${txnId}`);
    bot.sendMessage(chatId, '✅ Your order has been received and is pending confirmation.');
});
