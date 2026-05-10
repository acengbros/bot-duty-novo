const { Client, GatewayIntentBits, PermissionFlagsBits } = require('discord.js');
const axios = require('axios');

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

// ISI DATA DI BAWAH INI:
const URL_SCRIPT = process.env.URL_SCRIPT;
const ID_CHANNEL_KHUSUS = process.env.ID_CHANNEL_KHUSUS;
const LINK_SPREADSHEET = process.env.LINK_SPREADSHEET;
const TOKEN_BOT = process.env.TOKEN_BOT;

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    const cmd = message.content.toLowerCase();

    if (cmd === '!on') {
        await axios.post(URL_SCRIPT, { action: 'on', userId: message.author.id, username: message.author.username });
        message.reply(`🛠️ **${message.author.username}** On Duty!`);
    } 
    else if (cmd === '!off') {
        const res = await axios.post(URL_SCRIPT, { action: 'off', userId: message.author.id });
        if (res.data === "BelumOn") return message.reply("Kamu belum !on sebelumnya!");
        message.reply(`✅ **${message.author.username}** Off Duty. Total duty kali ini: **${res.data} menit**.`);
    } 
    else if (cmd === '!list') {
        const res = await axios.post(URL_SCRIPT, { action: 'list' });
        message.reply(`📋 **Data Duty Mekanik:**\n${res.data}`);
    } 
    else if (cmd === '!link') {
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) return;
        message.reply(`🔗 **Link Spreadsheet:** ${LINK_SPREADSHEET}`);
    } 
    else if (cmd === '!reset') {
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) return;
        await axios.post(URL_SCRIPT, { action: 'reset' });
        message.reply("🧹 Data waktu telah direset!");
    }
});

client.login(TOKEN_BOT);
