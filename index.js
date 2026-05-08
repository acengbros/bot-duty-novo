const { Client, GatewayIntentBits, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

// Masukkan Token Bot kamu di sini
const TOKEN = process.env.TOKEN;
const PREFIX = '!';
const FILE_PATH = './database.json';

function loadData() {
    if (!fs.existsSync(FILE_PATH)) return {};
    try {
        return JSON.parse(fs.readFileSync(FILE_PATH, 'utf8'));
    } catch (e) { return {}; }
}

function saveData(data) {
    fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2));
}

let dataDuty = loadData();

client.on('ready', () => {
    console.log(`✅ Bot ${client.user.tag} Online!`);
});

client.on('messageCreate', async (message) => {
    if (!message.content.startsWith(PREFIX) || message.author.bot) return;

    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();
    const userId = message.author.id;

    if (!dataDuty[userId]) {
        dataDuty[userId] = { totalTime: 0, startTime: null, isOnDuty: false };
    }

    // --- COMMAND !ON ---
    if (command === 'on') {
        if (dataDuty[userId].isOnDuty) return message.reply('Status kamu sudah **On Duty**!');
        dataDuty[userId].startTime = Date.now();
        dataDuty[userId].isOnDuty = true;
        saveData(dataDuty);
        message.reply(`🟢 **On Duty dimulai.** Semangat bertugas, <@${userId}>!`);
    }

    // --- COMMAND !OFF ---
    if (command === 'off') {
        if (!dataDuty[userId].isOnDuty) return message.reply('Kamu belum mulai On Duty.');
        const durasi = Date.now() - dataDuty[userId].startTime;
        dataDuty[userId].totalTime += durasi;
        dataDuty[userId].isOnDuty = false;
        dataDuty[userId].startTime = null;
        saveData(dataDuty);
        const totalMenit = Math.floor(dataDuty[userId].totalTime / 60000);
        message.reply(`🔴 **Off Duty.** Total waktu kamu: **${totalMenit} menit**.`);
    }

    // --- COMMAND !LIST ---
    if (command === 'list') {
        let laporan = "📋 **DAFTAR WAKTU TUGAS:**\n";
        for (const [id, user] of Object.entries(dataDuty)) {
            let total = user.totalTime;
            if (user.isOnDuty) total += (Date.now() - user.startTime);
            const menit = Math.floor(total / 60000);
            const status = user.isOnDuty ? "🟢 Aktif" : "🔴 Off";
            laporan += `<@${id}>: **${menit} menit** | ${status}\n`;
        }
        message.channel.send(laporan || "Belum ada data.");
    }

    // --- COMMAND !RESET (Khusus Admin) ---
    if (command === 'reset') {
        // Cek apakah pengirim pesan adalah Admin server
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return message.reply('❌ Kamu tidak punya izin (Administrator) untuk mereset data!');
        }
        
        dataDuty = {}; // Hapus semua data di memori
        saveData(dataDuty); // Simpan perubahan ke file database.json
        message.reply('♻️ **Database Berhasil Direset.** Semua waktu kembali ke 0.');
    }
});

client.login(TOKEN);
