console.log('--> Starting Discord Bot script with Web Dashboard...');

require('dotenv').config();
const { 
    Client, 
    GatewayIntentBits, 
    PermissionFlagsBits, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    ModalBuilder, 
    TextInputBuilder, 
    TextInputStyle, 
    ChannelType, 
    AttachmentBuilder,
    EmbedBuilder,
    REST,
    Routes,
    SlashCommandBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder
} = require('discord.js');
const { createCanvas, loadImage, GlobalFonts } = require('@napi-rs/canvas');
const fs = require('fs');
const path = require('path');
const express = require('express');

process.on('unhandledRejection', error => console.error('Unhandled Promise Rejection:', error));
process.on('uncaughtException', error => console.error('Uncaught Exception:', error));

const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

if (!TOKEN || !CLIENT_ID) {
    console.error('CRITICAL ERROR: DISCORD_TOKEN or CLIENT_ID is missing in your .env file!');
    process.exit(1);
}

// Register Minecrafter Font
const fontPath = path.join(__dirname, 'Minecrafter.Reg.ttf');
if (fs.existsSync(fontPath)) {
    try {
        GlobalFonts.registerFromPath(fontPath, 'Minecrafter');
        console.log('--> Successfully registered font: Minecrafter');
    } catch (e) {
        console.error('Failed to register font:', e);
    }
} else {
    console.warn('--> Minecrafter.Reg.ttf not found! Falling back to sans-serif.');
}

// Configuration IDs
const TICKET_CATEGORY_ID = '1569051322982989854';
const TICKET_STAFF_ROLE_ID = '1569051434035445780';
const TRANSCRIPT_CHANNEL_ID = '1569051770729144320';
const LEVELUP_CHANNEL_ID = '1569050414232637550';
const QUEUE_CHANNEL_ID = '1569030796600418354';
const GLOBAL_QUEUE_PING_ROLE = '1569032210252828807';
const RESULTS_CHANNEL_ID = '1569030668544118795';
const VERIFY_CHANNEL_ID = '1569099262350852146';

// High Tier Channel & Ping Role
const HIGH_TIER_RESULTS_CHANNEL_ID = '1569030576873144531';
const HIGH_TIER_PING_ROLE_ID = '1569032272240316497';

// Matchmaking System Configuration
const MATCHMAKING_CHANNEL_ID = '1569031378874671175';
const MATCHMAKING_PING_ROLE_ID = '1569034994746134718';
const MATCHMAKING_CATEGORY_ID = '1569434615951925298';

const REGION_EMOJIS = {
    EU: '<:EU:1569033417343897730>',
    AF: '<:AF:1569033252230926488>',
    US: '<:US:1569033947743260845>',
    AS: '<:AS:1569033757929902090>'
};

const REGION_ROLES = {
    EU: '1569031940546367518',
    AS: '1569032030098821235',
    AF: '1569032077540593796',
    US: '1569032016685568022'
};

// Points mapping
const TIER_POINTS = {
    'LT5': 1,
    'HT5': 2,
    'LT4': 3,
    'HT4': 4,
    'LT3': 5,
    'HT3': 6,
    'LT2': 7,
    'HT2': 8,
    'LT1': 9,
    'HT1': 10
};

// Tier Lists
const LOW_TIERS = ['LT5', 'HT5', 'LT4', 'HT4', 'LT3'];
const HIGH_TIERS = ['HT3', 'LT2', 'HT2', 'LT1', 'HT1'];

// All Tier Roles Mappings by Gamemode
const TIER_ROLES = {
    axe: {
        'LT5': '1569091470802161905',
        'HT5': '1569091457183125546',
        'LT4': '1569091461453185135',
        'HT4': '1569091456067702795',
        'LT3': '1569091460446425179',
        'HT3': '1569091454947561532',
        'LT2': '1569091459406372966',
        'HT2': '1569091453177561088',
        'LT1': '1569091458215190548',
        'HT1': '1569091451969732640'
    },
    crystal: {
        'LT5': '1569091484072935474',
        'HT5': '1569091476875645062',
        'LT4': '1569091482588291254',
        'HT4': '1569091475478679675',
        'LT3': '1569091480717496351',
        'HT3': '1569091473884971251',
        'LT2': '1569091479245430927',
        'HT2': '1569091473155170475',
        'LT1': '1569091478553362453',
        'HT1': '1569091472014188624'
    },
    mace: {
        'LT5': '1569091495364141168',
        'HT5': '1569091490330841088',
        'LT4': '1569091494361567414',
        'HT4': '1569091488955109548',
        'LT3': '1569091493384159313',
        'HT3': '1569091487696953454',
        'LT2': '1569091492486840463',
        'HT2': '1569091486149251213',
        'LT1': '1569091491090006149',
        'HT1': '1569091484802748531'
    },
    sword: {
        'LT5': '1569091511084253396',
        'HT5': '1569091503366611194',
        'LT4': '1569091508685250671',
        'HT4': '1569091502196531361',
        'LT3': '1569091507669962874',
        'HT3': '1569091500376072496',
        'LT2': '1569091506151751706',
        'HT2': '1569091498966917274',
        'LT1': '1569091505032011838',
        'HT1': '1569091497008042194'
    }
};

// Queue Category Configuration
const QUEUE_CATEGORIES = {
    axe: {
        name: 'Axe',
        testerRole: '1569063236723155227',
        pingRole: '1569063217668296706',
        emoji: '<:axe:1569064407273840640>'
    },
    crystal: {
        name: 'Crystal',
        testerRole: '1569063136886260063',
        pingRole: '1569063117152063629',
        emoji: '<:crystal:1569064375682338936>'
    },
    mace: {
        name: 'Mace',
        testerRole: '1569062972595249332',
        pingRole: '1569062902898364637',
        emoji: '<:mace:1569064343105048687>'
    },
    sword: {
        name: 'Sword',
        testerRole: '1569062872804233368',
        pingRole: '1569062857545351220',
        emoji: '<:sword:1569064310301270188>'
    }
};

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessageReactions
    ]
});

// Memory stores
const pendingHighTierTests = new Map();
const matchmakingCooldowns = new Map();
const activeMatchmakingRequests = new Map();

// JSON Databases
const dbPath = path.join(__dirname, 'levels.json');
let levels = {};
if (fs.existsSync(dbPath)) {
    try { levels = JSON.parse(fs.readFileSync(dbPath, 'utf-8')); } catch (e) {}
}
function saveLevels() { fs.writeFileSync(dbPath, JSON.stringify(levels, null, 2)); }

const verificationsPath = path.join(__dirname, 'verifications.json');
let verifications = {};
if (fs.existsSync(verificationsPath)) {
    try { verifications = JSON.parse(fs.readFileSync(verificationsPath, 'utf-8')); } catch (e) {}
}
function saveVerifications() { fs.writeFileSync(verificationsPath, JSON.stringify(verifications, null, 2)); }

const xpCooldowns = new Set();

const queueState = {
    activeTesters: { axe: new Set(), crystal: new Set(), mace: new Set(), sword: new Set() },
    queueList: [],
    panelMessageId: null
};

let isQueueSessionActive = false;

// ==========================================
// EXPRESS WEB SERVER (FOR RAILWAY)
// ==========================================
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(__dirname));

app.get('/', async (req, res) => {
    let playersData = [];

    try {
        const guild = client.guilds.cache.first();
        if (guild) {
            await guild.members.fetch();
            
            for (const [userId, vData] of Object.entries(verifications)) {
                const member = guild.members.cache.get(userId);
                if (!member) continue;

                let totalPoints = 0;
                let userTiers = { axe: 'None', crystal: 'None', mace: 'None', sword: 'None' };

                for (const [mode, tiersObj] of Object.entries(TIER_ROLES)) {
                    for (const [tierName, roleId] of Object.entries(tiersObj)) {
                        if (member.roles.cache.has(roleId)) {
                            userTiers[mode] = tierName;
                            totalPoints += (TIER_POINTS[tierName] || 0);
                            break;
                        }
                    }
                }

                playersData.push({
                    userId,
                    username: member.user.username,
                    ign: vData.ign,
                    server: vData.server,
                    avatar: member.user.displayAvatarURL({ extension: 'png', size: 128 }),
                    tiers: userTiers,
                    totalPoints
                });
            }
        }
    } catch (e) {
        console.error('Error constructing website data:', e);
    }

    playersData.sort((a, b) => b.totalPoints - a.totalPoints);

    const botInvite = `https://discord.com/oauth2/authorize?client_id=${CLIENT_ID}&permissions=8&scope=bot%20applications.commands`;

    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>GOON TIERS - Official Tier List & Rankings</title>
        <link href="https://fonts.googleapis.com/css2?family=Kanit:ital,wght@0,400;0,700;0,900;1,900&display=swap" rel="stylesheet">
        <style>
            :root {
                --bg: #0f1115;
                --card-bg: #161920;
                --accent: #57f287;
                --text: #ffffff;
                --subtext: #9aa0a6;
                --border: #242933;
            }
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body {
                background-color: var(--bg);
                color: var(--text);
                font-family: 'Kanit', sans-serif;
                padding-bottom: 50px;
            }
            header {
                background: linear-gradient(180deg, rgba(0,0,0,0.8) 0%, rgba(15,17,21,1) 100%), url('/goon tiers pfp.jpg') center/cover no-repeat;
                padding: 60px 20px;
                text-align: center;
                border-bottom: 2px solid var(--border);
            }
            .header-logo {
                max-width: 140px;
                margin-bottom: 15px;
                filter: drop-shadow(0px 4px 10px rgba(0,0,0,0.6));
            }
            h1 { font-size: 3rem; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; }
            p.sub { color: var(--subtext); margin-top: 5px; font-size: 1.1rem; }
            .invite-btn {
                display: inline-block;
                margin-top: 20px;
                background-color: #5865F2;
                color: white;
                padding: 12px 28px;
                text-decoration: none;
                font-weight: bold;
                border-radius: 8px;
                transition: 0.2s ease;
                box-shadow: 0 4px 15px rgba(88, 101, 242, 0.4);
            }
            .invite-btn:hover { background-color: #4752C4; transform: translateY(-2px); }
            
            .container {
                max-width: 1100px;
                margin: 40px auto;
                padding: 0 20px;
            }

            .table-wrapper {
                background-color: var(--card-bg);
                border-radius: 12px;
                border: 1px solid var(--border);
                overflow-x: auto;
                box-shadow: 0 10px 30px rgba(0,0,0,0.4);
            }
            table {
                width: 100%;
                border-collapse: collapse;
                text-align: left;
            }
            th, td {
                padding: 16px 20px;
                border-bottom: 1px solid var(--border);
            }
            th {
                background-color: #1a1d26;
                color: var(--subtext);
                text-transform: uppercase;
                font-size: 0.85rem;
                letter-spacing: 1px;
            }
            tr:hover { background-color: #1c202a; }

            .player-info {
                display: flex;
                align-items: center;
                gap: 12px;
            }
            .player-skin {
                width: 36px;
                height: 36px;
                border-radius: 6px;
            }

            .tier-badge {
                display: inline-block;
                padding: 4px 10px;
                border-radius: 6px;
                font-weight: bold;
                font-size: 0.85rem;
                background: #232730;
                color: #fff;
            }
            .tier-HT1 { background: #ff4757; color: white; }
            .tier-LT1 { background: #ff6b81; color: white; }
            .tier-HT2 { background: #ffa502; color: white; }
            .tier-LT2 { background: #eccc68; color: black; }
            .tier-HT3 { background: #2ed573; color: black; }
            .tier-LT3 { background: #7bed9f; color: black; }
            .tier-HT4 { background: #1e90ff; color: white; }
            .tier-LT4 { background: #70a1ff; color: black; }
            .tier-HT5 { background: #a4b0be; color: black; }
            .tier-LT5 { background: #747d8c; color: white; }
            .tier-None { opacity: 0.3; }

            .pts { font-weight: 900; color: var(--accent); font-size: 1.1rem; }
        </style>
    </head>
    <body>
        <header>
            <img src="/image_fe8e77.png" alt="Goon Tiers Logo" class="header-logo">
            <h1>Goon Tiers</h1>
            <p class="sub">Official Competitive Minecraft PvP Leaderboard & Tierlist</p>
            <a href="${botInvite}" target="_blank" class="invite-btn">🤖 Add Bot to Discord</a>
        </header>

        <div class="container">
            <div class="table-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Player</th>
                            <th>Server</th>
                            <th>Axe</th>
                            <th>Crystal</th>
                            <th>Mace</th>
                            <th>Sword</th>
                            <th>Total Pts</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${playersData.length > 0 ? playersData.map((p, index) => `
                            <tr>
                                <td><strong>#${index + 1}</strong></td>
                                <td>
                                    <div class="player-info">
                                        <img src="https://visage.surgeplay.com/bust/64/${encodeURIComponent(p.ign)}" class="player-skin" onerror="this.src='${p.avatar}'">
                                        <div>
                                            <div style="font-weight: bold;">${p.ign}</div>
                                            <div style="font-size: 0.8rem; color: var(--subtext);">@${p.username}</div>
                                        </div>
                                    </div>
                                </td>
                                <td><span style="color: var(--subtext);">${p.server}</span></td>
                                <td><span class="tier-badge tier-${p.tiers.axe}">${p.tiers.axe}</span></td>
                                <td><span class="tier-badge tier-${p.tiers.crystal}">${p.tiers.crystal}</span></td>
                                <td><span class="tier-badge tier-${p.tiers.mace}">${p.tiers.mace}</span></td>
                                <td><span class="tier-badge tier-${p.tiers.sword}">${p.tiers.sword}</span></td>
                                <td><span class="pts">${p.totalPoints} pts</span></td>
                            </tr>
                        `).join('') : `
                            <tr>
                                <td colspan="8" style="text-align: center; padding: 40px; color: var(--subtext);">No verified players found in database yet.</td>
                            </tr>
                        `}
                    </tbody>
                </table>
            </div>
        </div>
    </body>
    </html>
    `;

    res.send(html);
});

app.listen(PORT, () => {
    console.log(`--> Web Server running on port ${PORT}`);
});

// ==========================================
// DISCORD BOT INITIALIZATION
// ==========================================

client.once('clientReady', async () => {
    console.log(`--> Logged in successfully as ${client.user.tag}`);

    const commands = [
        new SlashCommandBuilder()
            .setName('poll')
            .setDescription('Create a quick yes/no poll')
            .addStringOption(opt =>
                opt.setName('question')
                    .setDescription('The question to ask')
                    .setRequired(true)
            ),

        new SlashCommandBuilder()
            .setName('say')
            .setDescription('Send a message as the bot (Staff Only)')
            .addStringOption(opt =>
                opt.setName('message')
                    .setDescription('The message content to send')
                    .setRequired(true)
            ),

        new SlashCommandBuilder()
            .setName('matchmaking')
            .setDescription('Request a matchmaking fight with players in your region')
            .addStringOption(opt =>
                opt.setName('region')
                    .setDescription('Select your region')
                    .setRequired(true)
                    .addChoices(
                        { name: 'EU (Europe)', value: 'EU' },
                        { name: 'US (North America)', value: 'US' },
                        { name: 'AS (Asia)', value: 'AS' },
                        { name: 'AF (Africa)', value: 'AF' }
                    )
            )
            .addStringOption(opt =>
                opt.setName('gamemode')
                    .setDescription('Select gamemode')
                    .setRequired(true)
                    .addChoices(
                        { name: 'Axe', value: 'axe' },
                        { name: 'Crystal', value: 'crystal' },
                        { name: 'Mace', value: 'mace' },
                        { name: 'Sword', value: 'sword' }
                    )
            ),

        new SlashCommandBuilder()
            .setName('ticketpanel')
            .setDescription('Sends the support ticket creation panel')
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

        new SlashCommandBuilder()
            .setName('hightestpanel')
            .setDescription('Sends the High Tier Test request panel')
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

        new SlashCommandBuilder()
            .setName('verifypanel')
            .setDescription('Sends the verification panel')
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

        new SlashCommandBuilder()
            .setName('ign')
            .setDescription('Lookup the registered Minecraft IGN and preferred server of a user')
            .addUserOption(opt =>
                opt.setName('user')
                    .setDescription('The user to lookup')
                    .setRequired(true)
            ),

        new SlashCommandBuilder()
            .setName('lockdown')
            .setDescription('Locks or unlocks the current channel')
            .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
            .addStringOption(opt =>
                opt.setName('action')
                    .setDescription('Choose action')
                    .setRequired(true)
                    .addChoices({ name: 'lock', value: 'lock' }, { name: 'unlock', value: 'unlock' })
            ),

        new SlashCommandBuilder()
            .setName('slowmode')
            .setDescription('Sets the slowmode for the channel')
            .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
            .addIntegerOption(opt =>
                opt.setName('seconds')
                    .setDescription('Slowmode duration in seconds')
                    .setRequired(true)
                    .setMinValue(0)
                    .setMaxValue(21600)
            ),

        new SlashCommandBuilder()
            .setName('startqueue')
            .setDescription('Open testing queue for a category')
            .addStringOption(opt =>
                opt.setName('category')
                    .setDescription('Choose category')
                    .setRequired(true)
                    .addChoices(
                        { name: 'Axe', value: 'axe' },
                        { name: 'Crystal', value: 'crystal' },
                        { name: 'Mace', value: 'mace' },
                        { name: 'Sword', value: 'sword' }
                    )
            ),

        new SlashCommandBuilder()
            .setName('closequeue')
            .setDescription('Close testing queue for a category')
            .addStringOption(opt =>
                opt.setName('category')
                    .setDescription('Choose category')
                    .setRequired(true)
                    .addChoices(
                        { name: 'Axe', value: 'axe' },
                        { name: 'Crystal', value: 'crystal' },
                        { name: 'Mace', value: 'mace' },
                        { name: 'Sword', value: 'sword' }
                    )
            ),

        new SlashCommandBuilder()
            .setName('next')
            .setDescription('Pull the next player from the queue')
            .addStringOption(opt =>
                opt.setName('category')
                    .setDescription('Specific category to pull from (optional)')
                    .setRequired(false)
                    .addChoices(
                        { name: 'Axe', value: 'axe' },
                        { name: 'Crystal', value: 'crystal' },
                        { name: 'Mace', value: 'mace' },
                        { name: 'Sword', value: 'sword' }
                    )
            )
    ];

    const rest = new REST({ version: '10' }).setToken(TOKEN);
    try {
        await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
        console.log('--> Successfully registered slash commands.');
    } catch (error) {
        console.error('Error registering slash commands:', error);
    }

    await updateQueuePanel();
});

// Helper Function: Close Channel & Send Transcript
async function closeChannelWithTranscript(channel, guild, closedByUser, isTestTicket = false, dualUsers = []) {
    const fetchedMessages = await channel.messages.fetch({ limit: 100 });
    const sortedMessages = Array.from(fetchedMessages.values()).reverse();

    let transcriptText = `--- TRANSCRIPT FOR ${channel.name} ---\n\n`;
    sortedMessages.forEach(msg => {
        transcriptText += `[${msg.createdAt.toISOString()}] ${msg.author.tag}: ${msg.content}\n`;
    });

    const transcriptBuffer = Buffer.from(transcriptText, 'utf-8');
    const attachment = new AttachmentBuilder(transcriptBuffer, { name: `${channel.name}-transcript.txt` });

    const logChannel = guild.channels.cache.get(TRANSCRIPT_CHANNEL_ID);
    if (logChannel) {
        const transcriptEmbed = new EmbedBuilder()
            .setTitle('Ticket Transcript Logged')
            .addFields(
                { name: 'Channel', value: channel.name, inline: true },
                { name: 'Closed By', value: `<@${closedByUser.id}>`, inline: true }
            )
            .setColor(0xed4245);
        await logChannel.send({ embeds: [transcriptEmbed], files: [attachment] });
    }

    if (dualUsers && dualUsers.length > 0) {
        for (const userId of dualUsers) {
            const member = await guild.members.fetch(userId).catch(() => null);
            if (member) {
                const dmEmbed = new EmbedBuilder()
                    .setTitle('Match Closed')
                    .setDescription(`Your match channel **${channel.name}** has been closed.`)
                    .setColor(0x2b2d31);
                await member.send({ embeds: [dmEmbed], files: [attachment] }).catch(() => null);
            }
        }
    } else if (!isTestTicket) {
        const topic = channel.topic || '';
        const ownerIdMatch = topic.match(/Ticket Owner: (\d+)/);
        if (ownerIdMatch) {
            const owner = await guild.members.fetch(ownerIdMatch[1]).catch(() => null);
            if (owner) {
                const dmEmbed = new EmbedBuilder()
                    .setTitle('Ticket Closed')
                    .setDescription(`Your ticket **${channel.name}** has been closed.`)
                    .setColor(0x2b2d31);
                await owner.send({ embeds: [dmEmbed], files: [attachment] }).catch(() => null);
            }
        }
    }

    setTimeout(() => channel.delete().catch(() => {}), 3000);
}

// ==========================================
// QUEUE PANEL SYSTEM
// ==========================================
async function updateQueuePanel(ghostPingCategoryKey = null) {
    const queueChannel = client.channels.cache.get(QUEUE_CHANNEL_ID);
    if (!queueChannel) return;

    const activeTesterMentions = [];
    Object.keys(queueState.activeTesters).forEach(cat => {
        queueState.activeTesters[cat].forEach(id => {
            if (!activeTesterMentions.includes(`<@${id}>`)) {
                activeTesterMentions.push(`<@${id}>`);
            }
        });
    });

    const activeTestersText = activeTesterMentions.length > 0 ? activeTesterMentions.join(' ') : 'None';
    const openCategories = Object.keys(QUEUE_CATEGORIES).filter(cat => queueState.activeTesters[cat].size > 0);
    const openModes = openCategories.map(cat => `${QUEUE_CATEGORIES[cat].emoji} **${QUEUE_CATEGORIES[cat].name}**`);
    const availableModesText = openModes.length > 0 ? openModes.join(' • ') : 'None';

    const queuedText = queueState.queueList.length > 0
        ? queueState.queueList.map((item, idx) => `${idx + 1}. <@${item.userId}> (${QUEUE_CATEGORIES[item.categoryKey].name})`).join('\n')
        : 'No players in queue.';

    const pfpPath = path.join(__dirname, 'goon tiers pfp.png');
    const files = fs.existsSync(pfpPath) ? [new AttachmentBuilder(pfpPath, { name: 'banner.png' })] : [];

    let panelPingContent = null;
    if (openCategories.length > 0) {
        const activePingRoles = [GLOBAL_QUEUE_PING_ROLE];
        openCategories.forEach(cat => {
            if (!activePingRoles.includes(QUEUE_CATEGORIES[cat].pingRole)) {
                activePingRoles.push(QUEUE_CATEGORIES[cat].pingRole);
            }
        });
        panelPingContent = activePingRoles.map(r => `<@&${r}>`).join(' ');
    }

    const queueEmbed = new EmbedBuilder()
        .setTitle('Testing Queue')
        .setDescription('Click the button below to join the waiting list.')
        .addFields(
            { name: 'Active Testers:', value: activeTestersText },
            { name: 'Available Modes:', value: availableModesText },
            { name: `Queued Players (${queueState.queueList.length}):`, value: queuedText }
        )
        .setColor(0x2b2d31)
        .setFooter({ text: 'Goon Tiers • Queue System' })
        .setTimestamp();

    if (files.length > 0) {
        queueEmbed.setImage('attachment://banner.png');
    }

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('queue_join_btn').setLabel('Join Queue').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId('queue_leave_btn').setLabel('Leave Queue').setStyle(ButtonStyle.Danger)
    );

    if (ghostPingCategoryKey) {
        try {
            const categoryPingRole = QUEUE_CATEGORIES[ghostPingCategoryKey].pingRole;
            let ghostContent = '';

            if (!isQueueSessionActive) {
                ghostContent = `<@&${GLOBAL_QUEUE_PING_ROLE}> <@&${categoryPingRole}>`;
                isQueueSessionActive = true;
            } else {
                ghostContent = `<@&${categoryPingRole}>`;
            }

            const ghostMsg = await queueChannel.send({ content: ghostContent });
            await ghostMsg.delete().catch(() => {});
        } catch (err) {
            console.error('Error sending ghost ping:', err);
        }
    }

    if (openCategories.length === 0) {
        isQueueSessionActive = false;
    }

    try {
        if (queueState.panelMessageId) {
            const msg = await queueChannel.messages.fetch(queueState.panelMessageId).catch(() => null);
            if (msg) {
                await msg.edit({ content: panelPingContent || null, embeds: [queueEmbed], components: [row], files });
            } else {
                const newMsg = await queueChannel.send({ content: panelPingContent || undefined, embeds: [queueEmbed], components: [row], files });
                queueState.panelMessageId = newMsg.id;
            }
        } else {
            const newMsg = await queueChannel.send({ content: panelPingContent || undefined, embeds: [queueEmbed], components: [row], files });
            queueState.panelMessageId = newMsg.id;
        }
    } catch (e) {
        console.error('Error updating queue panel:', e);
    }
}

// ==========================================
// 1. LEVELING SYSTEM (20x Harder)
// ==========================================
async function generateLevelCard(user, oldLevel, newLevel) {
    const width = 450;
    const height = 150;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    try {
        const bg = await loadImage(path.join(__dirname, 'goon tiers pfp.png'));
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(0, 0, width, height, 16);
        ctx.clip();
        ctx.drawImage(bg, 0, 0, width, height);
        ctx.restore();
    } catch (e) {
        ctx.fillStyle = '#2b2d31';
        ctx.beginPath();
        ctx.roundRect(0, 0, width, height, 16);
        ctx.fill();
    }

    const fontName = GlobalFonts.has('Minecrafter') ? 'Minecrafter' : 'sans-serif';

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    function drawOutlinedText(text, x, y, font, fillStyle = '#FFFFFF', strokeStyle = '#000000', lineWidth = 4) {
        ctx.save();
        ctx.font = font;

        ctx.shadowColor = 'rgba(0, 0, 0, 1.0)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetX = 3;
        ctx.shadowOffsetY = 3;

        ctx.strokeStyle = strokeStyle;
        ctx.lineWidth = lineWidth;
        ctx.lineJoin = 'miter';
        ctx.miterLimit = 2;
        ctx.strokeText(text, x, y);

        ctx.fillStyle = fillStyle;
        ctx.fillText(text, x, y);
        ctx.restore();
    }

    drawOutlinedText(`@${user.username.toUpperCase()}`, width / 2, 22, `bold 18px "${fontName}"`, '#FFFFFF', '#000000', 4);
    drawOutlinedText(`LEVEL UP!  ${oldLevel} - ${newLevel}`, width / 2, 132, `bold 20px "${fontName}"`, '#FFFFFF', '#000000', 4);

    return canvas.toBuffer('image/png');
}

client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.guild) return;

    const userId = message.author.id;

    if (xpCooldowns.has(userId)) return;
    xpCooldowns.add(userId);
    setTimeout(() => xpCooldowns.delete(userId), 5000);

    if (!levels[userId]) {
        levels[userId] = { xp: 0, level: 0 };
    }

    const xpGained = Math.floor(Math.random() * 16) + 15;
    levels[userId].xp += xpGained;

    const currentLevel = levels[userId].level;
    // 20x HARDER: 2000 XP per level requirement instead of 100
    const nextLevelXp = (currentLevel + 1) * 2000;

    if (levels[userId].xp >= nextLevelXp) {
        const oldLevel = currentLevel;
        levels[userId].level += 1;
        saveLevels();

        try {
            const imageBuffer = await generateLevelCard(message.author, oldLevel, levels[userId].level);
            const attachment = new AttachmentBuilder(imageBuffer, { name: 'levelup.png' });

            const levelChannel = message.guild.channels.cache.get(LEVELUP_CHANNEL_ID);
            const targetChannel = levelChannel || message.channel;

            await targetChannel.send({
                content: `<@${message.author.id}> has reached level **${levels[userId].level}**. GG!`,
                files: [attachment]
            });
        } catch (err) {
            console.error('Error generating level card:', err);
        }
    } else {
        saveLevels();
    }
});

// ==========================================
// 2. INTERACTION HANDLER
// ==========================================

client.on('interactionCreate', async (interaction) => {
    
    // --- SLASH COMMANDS ---
    if (interaction.isChatInputCommand()) {

        // POLL COMMAND
        if (interaction.commandName === 'poll') {
            const question = interaction.options.getString('question');

            await interaction.reply({ content: `✅ Poll created!`, flags: 64 });

            const pollMsg = await interaction.channel.send({
                content: `<@${interaction.user.id}> asks: **${question}**`
            });

            await pollMsg.react('👍');
            await pollMsg.react('👎');
            return;
        }

        // SAY COMMAND (Staff Only)
        if (interaction.commandName === 'say') {
            const isStaff = interaction.member.roles.cache.has(TICKET_STAFF_ROLE_ID) || 
                            interaction.member.permissions.has(PermissionFlagsBits.Administrator);

            if (!isStaff) {
                return interaction.reply({
                    content: '❌ Only staff members can use the `/say` command.',
                    flags: 64
                });
            }

            const messageContent = interaction.options.getString('message');

            await interaction.reply({ content: '✅ Message sent!', flags: 64 });
            await interaction.channel.send({ content: messageContent });
            return;
        }

        // MATCHMAKING COMMAND
        if (interaction.commandName === 'matchmaking') {
            if (interaction.channelId !== MATCHMAKING_CHANNEL_ID) {
                return interaction.reply({
                    content: `❌ This command can only be used in <#${MATCHMAKING_CHANNEL_ID}>.`,
                    flags: 64
                });
            }

            if (!verifications[interaction.user.id]) {
                return interaction.reply({
                    content: `❌ You must verify your Minecraft details before requesting a match!\nPlease head over to <#${VERIFY_CHANNEL_ID}> and click **Verify Account**.`,
                    flags: 64
                });
            }

            const userId = interaction.user.id;
            const now = Date.now();
            const cooldownAmount = 3 * 60 * 60 * 1000; // 3 Hours

            if (matchmakingCooldowns.has(userId)) {
                const expirationTime = matchmakingCooldowns.get(userId) + cooldownAmount;
                if (now < expirationTime) {
                    const timeLeft = Math.ceil((expirationTime - now) / (60 * 1000));
                    return interaction.reply({
                        content: `⏳ You are on cooldown for matchmaking! Please wait **${timeLeft} minutes** before requesting another fight.`,
                        flags: 64
                    });
                }
            }

            const region = interaction.options.getString('region');
            const categoryKey = interaction.options.getString('gamemode');
            const categoryData = QUEUE_CATEGORIES[categoryKey];
            const regionEmoji = REGION_EMOJIS[region] || '';

            matchmakingCooldowns.set(userId, now);

            await interaction.reply({ content: `✅ Matchmaking request sent!`, flags: 64 });

            const mmEmbed = new EmbedBuilder()
                .setTitle('Matchmaking Request')
                .setDescription(`**Player:** <@${userId}>\n**Region:** ${regionEmoji} **${region}**\n**Gamemode:** ${categoryData.emoji} **${categoryData.name}**\n\nClick the button below if you have the **${region}** region role and want to fight!`)
                .setColor(0x5865f2)
                .setTimestamp();

            const acceptRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('accept_matchmaking_btn')
                    .setLabel('Accept Match')
                    .setStyle(ButtonStyle.Success)
            );

            const channelMsg = await interaction.channel.send({
                content: `<@&${MATCHMAKING_PING_ROLE_ID}>`,
                embeds: [mmEmbed],
                components: [acceptRow]
            });

            activeMatchmakingRequests.set(channelMsg.id, {
                hostId: userId,
                region,
                categoryKey
            });
            return;
        }

        // HIGH TEST PANEL COMMAND
        if (interaction.commandName === 'hightestpanel') {
            const highEmbed = new EmbedBuilder()
                .setTitle('High Tier Test Request')
                .setDescription('If you currently hold a High Tier role (**HT3, LT2, HT2, LT1, HT1**), click the button below to request a High Tier re-test.')
                .setColor(0xfee75c)
                .setFooter({ text: 'Goon Tiers • High Tier Testing' });

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('request_high_test_btn')
                    .setLabel('Request High Test')
                    .setStyle(ButtonStyle.Primary)
            );

            await interaction.reply({ embeds: [highEmbed], components: [row] });
        }

        // VERIFY PANEL COMMAND
        if (interaction.commandName === 'verifypanel') {
            const verifyEmbed = new EmbedBuilder()
                .setTitle('Player Verification')
                .setDescription('Welcome to Goon Tiers!\n\nTo join testing queues, you must first verify your in-game details.\nClick the button below to register your Minecraft IGN and preferred server.\n\n***Note:** This is an internal verification process and **NOT** a Microsoft or OAuth login verification scam. We will never ask for your password or verification codes.*')
                .setColor(0x57f287)
                .setFooter({ text: 'Goon Tiers • Verification' });

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('open_verify_modal')
                    .setLabel('Verify Account')
                    .setStyle(ButtonStyle.Success)
            );

            await interaction.reply({ embeds: [verifyEmbed], components: [row] });
        }

        // LOOKUP IGN COMMAND
        if (interaction.commandName === 'ign') {
            const targetUser = interaction.options.getUser('user');
            const data = verifications[targetUser.id];

            if (!data) {
                return interaction.reply({ content: `User <@${targetUser.id}> is not verified yet.`, flags: 64 });
            }

            const ignEmbed = new EmbedBuilder()
                .setTitle('Verification Details')
                .addFields(
                    { name: 'Discord User:', value: `<@${targetUser.id}> (${targetUser.tag})` },
                    { name: 'Minecraft IGN:', value: `\`${data.ign}\`` },
                    { name: 'Preferred Server:', value: data.server }
                )
                .setColor(0x2b2d31)
                .setTimestamp();

            return interaction.reply({ embeds: [ignEmbed] });
        }

        // START QUEUE
        if (interaction.commandName === 'startqueue') {
            const categoryKey = interaction.options.getString('category');
            const categoryData = QUEUE_CATEGORIES[categoryKey];

            if (!interaction.member.roles.cache.has(categoryData.testerRole)) {
                return interaction.reply({ content: `You need the <@&${categoryData.testerRole}> role to start the ${categoryData.name} queue.`, flags: 64 });
            }

            queueState.activeTesters[categoryKey].add(interaction.user.id);
            await updateQueuePanel(categoryKey);

            return interaction.reply({ content: `Opened the **${categoryData.name}** queue.`, flags: 64 });
        }

        // CLOSE QUEUE
        if (interaction.commandName === 'closequeue') {
            const categoryKey = interaction.options.getString('category');
            const categoryData = QUEUE_CATEGORIES[categoryKey];

            if (!interaction.member.roles.cache.has(categoryData.testerRole)) {
                return interaction.reply({ content: `You need the <@&${categoryData.testerRole}> role to close the ${categoryData.name} queue.`, flags: 64 });
            }

            queueState.activeTesters[categoryKey].delete(interaction.user.id);

            if (queueState.activeTesters[categoryKey].size === 0) {
                const removedPlayers = queueState.queueList.filter(item => item.categoryKey === categoryKey);
                queueState.queueList = queueState.queueList.filter(item => item.categoryKey !== categoryKey);

                for (const item of removedPlayers) {
                    const member = await interaction.guild.members.fetch(item.userId).catch(() => null);
                    if (member) {
                        const dmEmbed = new EmbedBuilder()
                            .setTitle('Queue Closed')
                            .setDescription(`The **${categoryData.name}** testing queue has been closed. You have been removed from the waiting list.`)
                            .setColor(0xed4245);
                        await member.send({ embeds: [dmEmbed] }).catch(() => null);
                    }
                }
            }

            await updateQueuePanel();
            return interaction.reply({ content: `Closed your session for the **${categoryData.name}** queue.`, flags: 64 });
        }

        // NEXT
        if (interaction.commandName === 'next') {
            const specificCategory = interaction.options.getString('category');

            let indexToPull = -1;
            if (specificCategory) {
                indexToPull = queueState.queueList.findIndex(item => item.categoryKey === specificCategory);
            } else {
                indexToPull = 0;
            }

            if (indexToPull === -1 || queueState.queueList.length === 0) {
                return interaction.reply({ content: 'No players in queue for this category.', flags: 64 });
            }

            const pulledPlayer = queueState.queueList.splice(indexToPull, 1)[0];
            await updateQueuePanel();

            const guild = interaction.guild;
            const categoryData = QUEUE_CATEGORIES[pulledPlayer.categoryKey];
            const pulledMember = await guild.members.fetch(pulledPlayer.userId).catch(() => null);
            const usernameFormatted = pulledMember ? pulledMember.user.username : 'player';

            const userVerification = verifications[pulledPlayer.userId] || { ign: 'Not Provided', server: 'Not Provided' };

            const ticketChannel = await guild.channels.create({
                name: `${pulledPlayer.categoryKey}-${usernameFormatted}`,
                type: ChannelType.GuildText,
                parent: TICKET_CATEGORY_ID,
                permissionOverwrites: [
                    { id: guild.id, deny: [PermissionFlagsBits.ViewChannel] },
                    { id: pulledPlayer.userId, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.AttachFiles] },
                    { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.AttachFiles] },
                    { id: TICKET_STAFF_ROLE_ID, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.AttachFiles] }
                ]
            });

            await ticketChannel.setTopic(`Ticket Owner: ${pulledPlayer.userId} | Category: ${pulledPlayer.categoryKey} | Tester: ${interaction.user.id} | IGN: ${userVerification.ign} | Server: ${userVerification.server}`);

            const ticketEmbed = new EmbedBuilder()
                .setTitle(`${categoryData.name} Tier Test`)
                .setDescription(`Welcome <@${pulledPlayer.userId}>! Your test with <@${interaction.user.id}> is ready to start.\n\n**Tester Controls:**\n- Click **Close with Tier** to assign a new rank (LT5 to LT3) and close this ticket.\n- Click **Close** to discard without changing tiers.`)
                .addFields(
                    { name: 'Minecraft IGN:', value: `\`${userVerification.ign}\``, inline: true },
                    { name: 'Preferred Server:', value: `${userVerification.server}`, inline: true }
                )
                .setColor(0x57f287)
                .setTimestamp();

            const controlRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('test_ticket_close').setLabel('Close').setStyle(ButtonStyle.Danger),
                new ButtonBuilder().setCustomId('test_ticket_close_tier').setLabel('Close with Tier').setStyle(ButtonStyle.Success)
            );

            await ticketChannel.send({
                content: `<@${pulledPlayer.userId}> <@${interaction.user.id}>`,
                embeds: [ticketEmbed],
                components: [controlRow]
            });

            return interaction.reply({ content: `Pulled <@${pulledPlayer.userId}> into testing ticket ${ticketChannel}.`, flags: 64 });
        }

        // TICKET PANEL
        if (interaction.commandName === 'ticketpanel') {
            const panelEmbed = new EmbedBuilder()
                .setTitle('Support & Testing Tickets')
                .setDescription('Click the button below to open a ticket. Our team will assist you as soon as possible.')
                .setColor(0x2b2d31);

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('open_ticket_btn').setLabel('Open Ticket').setStyle(ButtonStyle.Primary)
            );

            await interaction.reply({ embeds: [panelEmbed], components: [row] });
        }

        // LOCKDOWN & SLOWMODE
        if (interaction.commandName === 'lockdown') {
            const action = interaction.options.getString('action');
            const channel = interaction.channel;
            const everyoneRole = interaction.guild.roles.everyone;

            if (action === 'lock') {
                await channel.permissionOverwrites.edit(everyoneRole, { SendMessages: false });
                const lockEmbed = new EmbedBuilder()
                    .setTitle('Channel Locked')
                    .setDescription('This channel has been locked down by staff. Members are currently unable to send messages.')
                    .setColor(0xed4245);
                await interaction.reply({ embeds: [lockEmbed] });
            } else {
                await channel.permissionOverwrites.edit(everyoneRole, { SendMessages: null });
                const unlockEmbed = new EmbedBuilder()
                    .setTitle('Channel Unlocked')
                    .setDescription('This channel has been unlocked. Members can send messages again.')
                    .setColor(0x57f287);
                await interaction.reply({ embeds: [unlockEmbed] });
            }
        }

        if (interaction.commandName === 'slowmode') {
            const seconds = interaction.options.getInteger('seconds');
            await interaction.channel.setRateLimitPerUser(seconds);
            const slowmodeEmbed = new EmbedBuilder()
                .setTitle('Slowmode Updated')
                .setDescription(seconds === 0 ? 'Slowmode disabled.' : `Slowmode set to **${seconds} seconds**.`)
                .setColor(0x2b2d31);
            await interaction.reply({ embeds: [slowmodeEmbed] });
        }
    }

    // --- BUTTONS ---
    if (interaction.isButton()) {

        // ACCEPT MATCHMAKING BUTTON
        if (interaction.customId === 'accept_matchmaking_btn') {
            if (!verifications[interaction.user.id]) {
                return interaction.reply({
                    content: `❌ You must verify your Minecraft details before accepting a match!\nPlease head over to <#${VERIFY_CHANNEL_ID}> and click **Verify Account**.`,
                    flags: 64
                });
            }

            const reqData = activeMatchmakingRequests.get(interaction.message.id);
            if (!reqData) {
                return interaction.reply({ content: '❌ This matchmaking request is no longer active.', flags: 64 });
            }

            if (reqData.hostId === interaction.user.id) {
                return interaction.reply({ content: '❌ You cannot accept your own matchmaking request!', flags: 64 });
            }

            const regionRoleId = REGION_ROLES[reqData.region];
            if (!interaction.member.roles.cache.has(regionRoleId)) {
                return interaction.reply({
                    content: `❌ You must have the <@&${regionRoleId}> (**${reqData.region}**) region role to accept this match!`,
                    flags: 64
                });
            }

            const guild = interaction.guild;
            const hostMember = await guild.members.fetch(reqData.hostId).catch(() => null);
            const hostName = hostMember ? hostMember.user.username : 'player1';
            const challengerName = interaction.user.username;
            const categoryData = QUEUE_CATEGORIES[reqData.categoryKey];

            const hostVerify = verifications[reqData.hostId] || { ign: 'Not Provided', server: 'Not Provided' };
            const challengerVerify = verifications[interaction.user.id] || { ign: 'Not Provided', server: 'Not Provided' };

            const disabledRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('accept_matchmaking_btn').setLabel(`Accepted by ${challengerName}`).setStyle(ButtonStyle.Secondary).setDisabled(true)
            );
            await interaction.message.edit({ components: [disabledRow] }).catch(() => {});
            activeMatchmakingRequests.delete(interaction.message.id);

            const matchChannel = await guild.channels.create({
                name: `match-${hostName}-vs-${challengerName}`,
                type: ChannelType.GuildText,
                parent: MATCHMAKING_CATEGORY_ID,
                permissionOverwrites: [
                    { id: guild.id, deny: [PermissionFlagsBits.ViewChannel] },
                    { id: reqData.hostId, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.AttachFiles] },
                    { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.AttachFiles] },
                    { id: TICKET_STAFF_ROLE_ID, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.AttachFiles] }
                ]
            });

            await matchChannel.setTopic(`Match: <@${reqData.hostId}> vs <@${interaction.user.id}> | Category: ${reqData.categoryKey} | Region: ${reqData.region}`);

            const matchEmbed = new EmbedBuilder()
                .setTitle('Matchmaking Fight Ticket')
                .setDescription(`A PvP Match has been set up!\n\n**Region:** ${REGION_EMOJIS[reqData.region]} **${reqData.region}**\n**Gamemode:** ${categoryData.emoji} **${categoryData.name}**\n\nClick **Close Match** when your fights are finished.`)
                .addFields(
                    { 
                        name: `Player 1 (Host):`, 
                        value: `<@${reqData.hostId}>\n**IGN:** \`${hostVerify.ign}\` \n**Server:** ${hostVerify.server}`, 
                        inline: true 
                    },
                    { 
                        name: `Player 2 (Challenger):`, 
                        value: `<@${interaction.user.id}>\n**IGN:** \`${challengerVerify.ign}\` \n**Server:** ${challengerVerify.server}`, 
                        inline: true 
                    }
                )
                .setColor(0x57f287)
                .setTimestamp();

            const closeRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('close_match_btn').setLabel('Close Match').setStyle(ButtonStyle.Danger)
            );

            await matchChannel.send({
                content: `<@${reqData.hostId}> <@${interaction.user.id}>`,
                embeds: [matchEmbed],
                components: [closeRow]
            });

            return interaction.reply({ content: `✅ Match created: ${matchChannel}`, flags: 64 });
        }

        // CLOSE MATCH BUTTON
        if (interaction.customId === 'close_match_btn') {
            await interaction.reply({ content: 'Closing match channel and logging transcripts...' });

            const topic = interaction.channel.topic || '';
            const mentions = topic.match(/<@(\d+)>/g) || [];
            const dualUsers = mentions.map(m => m.replace(/[<@>]/g, ''));

            await closeChannelWithTranscript(interaction.channel, interaction.guild, interaction.user, false, dualUsers);
        }

        // Request High Test Button -> Shows Dropdown Pop-up
        if (interaction.customId === 'request_high_test_btn') {
            if (!verifications[interaction.user.id]) {
                return interaction.reply({
                    content: `You must verify your Minecraft details first!\nPlease head over to <#${VERIFY_CHANNEL_ID}> and click **Verify Account**.`,
                    flags: 64
                });
            }

            const selectOptions = Object.keys(QUEUE_CATEGORIES).map(cat => 
                new StringSelectMenuOptionBuilder()
                    .setLabel(QUEUE_CATEGORIES[cat].name)
                    .setValue(cat)
            );

            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId('hightest_category_select')
                .setPlaceholder('Select category for High Tier Test...')
                .addOptions(selectOptions);

            const menuRow = new ActionRowBuilder().addComponents(selectMenu);
            return interaction.reply({ content: 'Select the gamemode category you want a High Tier Test for:', components: [menuRow], flags: 64 });
        }

        // Open Verify Modal Button
        if (interaction.customId === 'open_verify_modal') {
            const modal = new ModalBuilder()
                .setCustomId('verify_modal')
                .setTitle('Account Verification');

            const ignInput = new TextInputBuilder()
                .setCustomId('verify_ign')
                .setLabel('Minecraft In-Game Name (IGN)')
                .setStyle(TextInputStyle.Short)
                .setPlaceholder('e.g. Notch')
                .setRequired(true);

            const serverInput = new TextInputBuilder()
                .setCustomId('verify_server')
                .setLabel('Preferred Testing Server')
                .setStyle(TextInputStyle.Short)
                .setPlaceholder('e.g. Mcpvp, minemen, catpvp')
                .setRequired(true);

            modal.addComponents(
                new ActionRowBuilder().addComponents(ignInput),
                new ActionRowBuilder().addComponents(serverInput)
            );

            await interaction.showModal(modal);
        }

        // Join Queue Button (Enforces Verification)
        if (interaction.customId === 'queue_join_btn') {
            if (!verifications[interaction.user.id]) {
                return interaction.reply({
                    content: `You must verify your Minecraft details before joining the testing queue!\nPlease head over to <#${VERIFY_CHANNEL_ID}> and click **Verify Account**.`,
                    flags: 64
                });
            }

            const openCategories = Object.keys(QUEUE_CATEGORIES).filter(cat => queueState.activeTesters[cat].size > 0);

            if (openCategories.length === 0) {
                return interaction.reply({ content: 'There are currently no open testing queues.', flags: 64 });
            }

            if (queueState.queueList.some(item => item.userId === interaction.user.id)) {
                return interaction.reply({ content: 'You are already in the waiting list!', flags: 64 });
            }

            const selectOptions = openCategories.map(cat => 
                new StringSelectMenuOptionBuilder()
                    .setLabel(QUEUE_CATEGORIES[cat].name)
                    .setValue(cat)
            );

            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId('queue_category_select')
                .setPlaceholder('Select a gamemode to test...')
                .addOptions(selectOptions);

            const menuRow = new ActionRowBuilder().addComponents(selectMenu);
            return interaction.reply({ content: 'Choose which gamemode you want to queue for:', components: [menuRow], flags: 64 });
        }

        if (interaction.customId === 'queue_leave_btn') {
            const exists = queueState.queueList.some(item => item.userId === interaction.user.id);
            if (!exists) {
                return interaction.reply({ content: 'You are not in the queue.', flags: 64 });
            }

            queueState.queueList = queueState.queueList.filter(item => item.userId !== interaction.user.id);
            await updateQueuePanel();
            return interaction.reply({ content: 'You have left the testing queue.', flags: 64 });
        }

        // Support Ticket Close Button
        if (interaction.customId === 'ticket_close') {
            await interaction.reply({ content: 'Closing ticket and generating transcript...' });
            await closeChannelWithTranscript(interaction.channel, interaction.guild, interaction.user, false);
        }

        // Test Ticket Close Button (No DM)
        if (interaction.customId === 'test_ticket_close') {
            await interaction.reply({ content: 'Closing ticket and generating transcript...' });
            await closeChannelWithTranscript(interaction.channel, interaction.guild, interaction.user, true);
        }

        // Test Ticket: Close With Tier Button
        if (interaction.customId === 'test_ticket_close_tier') {
            const topic = interaction.channel.topic || '';
            const categoryMatch = topic.match(/Category: (\w+)/);
            const categoryKey = categoryMatch ? categoryMatch[1].toLowerCase() : 'axe';
            const isHighTicket = interaction.channel.name.startsWith('high-test-');

            if (!TIER_ROLES[categoryKey]) {
                return interaction.reply({ content: `Close with Tier is not configured for category: ${categoryKey}.`, flags: 64 });
            }

            const availableTiers = isHighTicket ? HIGH_TIERS : LOW_TIERS;

            const selectOptions = availableTiers.map(t => 
                new StringSelectMenuOptionBuilder().setLabel(t).setValue(t)
            );

            const tierMenu = new StringSelectMenuBuilder()
                .setCustomId('select_tier_result')
                .setPlaceholder(`Select final ${QUEUE_CATEGORIES[categoryKey].name} Tier...`)
                .addOptions(selectOptions);

            const menuRow = new ActionRowBuilder().addComponents(tierMenu);
            return interaction.reply({ content: `Select the result tier for this ${QUEUE_CATEGORIES[categoryKey].name} test:`, components: [menuRow], flags: 64 });
        }

        if (interaction.customId === 'open_ticket_btn') {
            const modal = new ModalBuilder().setCustomId('ticket_modal').setTitle('Create a Ticket');
            const reasonInput = new TextInputBuilder().setCustomId('ticket_reason').setLabel('What do you need help with?').setStyle(TextInputStyle.Paragraph).setRequired(true);
            modal.addComponents(new ActionRowBuilder().addComponents(reasonInput));
            await interaction.showModal(modal);
        }

        if (interaction.customId === 'ticket_claim') {
            if (!interaction.member.roles.cache.has(TICKET_STAFF_ROLE_ID)) {
                return interaction.reply({ content: 'Only staff can claim tickets.', flags: 64 });
            }
            const claimEmbed = new EmbedBuilder().setDescription(`Ticket claimed by <@${interaction.user.id}>.`).setColor(0x57f287);
            await interaction.reply({ embeds: [claimEmbed] });
        }

        if (interaction.customId === 'ticket_rename') {
            const renameModal = new ModalBuilder().setCustomId('ticket_rename_modal').setTitle('Rename Ticket');
            const nameInput = new TextInputBuilder().setCustomId('new_ticket_name').setLabel('New Channel Name').setStyle(TextInputStyle.Short).setRequired(true);
            renameModal.addComponents(new ActionRowBuilder().addComponents(nameInput));
            await interaction.showModal(renameModal);
        }
    }

    // --- SELECT MENU SUBMISSION ---
    if (interaction.isStringSelectMenu()) {
        
        // High Tier Test Category Selection & Automated Check
        if (interaction.customId === 'hightest_category_select') {
            const categoryKey = interaction.values[0];
            const categoryData = QUEUE_CATEGORIES[categoryKey];
            const categoryTierRoles = TIER_ROLES[categoryKey];

            const highTierRoleIds = HIGH_TIERS.map(tier => categoryTierRoles[tier]).filter(Boolean);
            const hasHighTierRole = interaction.member.roles.cache.some(role => highTierRoleIds.includes(role.id));

            if (!hasHighTierRole) {
                return interaction.update({
                    content: `❌ **Access Denied:** You do not hold a High Tier role (**HT3, LT2, HT2, LT1, HT1**) in **${categoryData.name}**. You cannot open a High Tier Test ticket.`,
                    components: []
                });
            }

            const guild = interaction.guild;
            const usernameFormatted = interaction.user.username;
            const userVerification = verifications[interaction.user.id] || { ign: 'Not Provided', server: 'Not Provided' };

            const ticketChannel = await guild.channels.create({
                name: `high-test-${categoryKey}-${usernameFormatted}`,
                type: ChannelType.GuildText,
                parent: TICKET_CATEGORY_ID,
                permissionOverwrites: [
                    { id: guild.id, deny: [PermissionFlagsBits.ViewChannel] },
                    { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.AttachFiles] },
                    { id: categoryData.testerRole, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.AttachFiles] },
                    { id: TICKET_STAFF_ROLE_ID, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.AttachFiles] }
                ]
            });

            await ticketChannel.setTopic(`Ticket Owner: ${interaction.user.id} | Category: ${categoryKey} | High Test Request | IGN: ${userVerification.ign} | Server: ${userVerification.server}`);

            const ticketEmbed = new EmbedBuilder()
                .setTitle(`High Tier Test - ${categoryData.name}`)
                .setDescription(`Welcome <@${interaction.user.id}>! You have requested a High Tier Test for **${categoryData.name}**.\n\nA <@&${categoryData.testerRole}> will be with you shortly.\n\n**Tester Controls:**\n- **Close with Tier:** Allows the tester to input score & assign high tier ranks (HT3 to HT1).\n- **Close:** Closes ticket without changes.`)
                .addFields(
                    { name: 'Minecraft IGN:', value: `\`${userVerification.ign}\``, inline: true },
                    { name: 'Preferred Server:', value: `${userVerification.server}`, inline: true }
                )
                .setColor(0xfee75c)
                .setTimestamp();

            const controlRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('test_ticket_close').setLabel('Close').setStyle(ButtonStyle.Danger),
                new ButtonBuilder().setCustomId('test_ticket_close_tier').setLabel('Close with Tier').setStyle(ButtonStyle.Success)
            );

            await ticketChannel.send({
                content: `<@${interaction.user.id}> <@&${categoryData.testerRole}>`,
                embeds: [ticketEmbed],
                components: [controlRow]
            });

            return interaction.update({ content: `✅ High Tier Test ticket created: ${ticketChannel}`, components: [] });
        }

        if (interaction.customId === 'queue_category_select') {
            const categoryKey = interaction.values[0];

            if (queueState.queueList.some(item => item.userId === interaction.user.id)) {
                return interaction.update({ content: 'You are already in the queue!', components: [] });
            }

            queueState.queueList.push({
                userId: interaction.user.id,
                categoryKey,
                timestamp: Date.now()
            });

            await updateQueuePanel();
            return interaction.update({ content: `Successfully joined the queue for **${QUEUE_CATEGORIES[categoryKey].name}**!`, components: [] });
        }

        // Select Gamemode Tier Result
        if (interaction.customId === 'select_tier_result') {
            const selectedTier = interaction.values[0];
            const channel = interaction.channel;
            const topic = channel.topic || '';

            const ownerIdMatch = topic.match(/Ticket Owner: (\d+)/);
            const testerIdMatch = topic.match(/Tester: (\d+)/);
            const categoryMatch = topic.match(/Category: (\w+)/);

            const ownerId = ownerIdMatch ? ownerIdMatch[1] : null;
            const testerId = testerIdMatch ? testerIdMatch[1] : interaction.user.id;
            const categoryKey = categoryMatch ? categoryMatch[1].toLowerCase() : 'axe';

            if (!ownerId) {
                return interaction.reply({ content: 'Could not resolve tested player from channel topic.', flags: 64 });
            }

            if (HIGH_TIERS.includes(selectedTier)) {
                pendingHighTierTests.set(interaction.user.id, {
                    selectedTier,
                    ownerId,
                    testerId,
                    categoryKey,
                    channelId: channel.id
                });

                const modal = new ModalBuilder()
                    .setCustomId('hightier_fight_modal')
                    .setTitle(`High Tier Test Details (${selectedTier})`);

                const resultInput = new TextInputBuilder()
                    .setCustomId('hightier_result_status')
                    .setLabel('Test Status (got / failed)')
                    .setStyle(TextInputStyle.Short)
                    .setPlaceholder('Type "got" or "failed"')
                    .setRequired(true);

                const scoreInput = new TextInputBuilder()
                    .setCustomId('hightier_score')
                    .setLabel('Score (Left: Player | Right: Tester)')
                    .setStyle(TextInputStyle.Short)
                    .setPlaceholder('e.g. 0 - 10 or 10 - 2')
                    .setRequired(true);

                modal.addComponents(
                    new ActionRowBuilder().addComponents(resultInput),
                    new ActionRowBuilder().addComponents(scoreInput)
                );

                return interaction.showModal(modal);
            }

            await interaction.deferUpdate();

            const targetMember = await interaction.guild.members.fetch(ownerId).catch(() => null);
            const categoryData = QUEUE_CATEGORIES[categoryKey] || QUEUE_CATEGORIES.axe;
            const categoryTierRoles = TIER_ROLES[categoryKey] || TIER_ROLES.axe;

            if (targetMember) {
                const allGamemodeRoleIds = Object.values(categoryTierRoles);
                const rolesToRemove = targetMember.roles.cache.filter(role => allGamemodeRoleIds.includes(role.id));
                if (rolesToRemove.size > 0) {
                    await targetMember.roles.remove(rolesToRemove).catch(e => console.error('Error removing old tier roles:', e));
                }

                if (categoryTierRoles[selectedTier]) {
                    await targetMember.roles.add(categoryTierRoles[selectedTier]).catch(e => console.error('Error adding new tier role:', e));
                }
            }

            const resultsChannel = interaction.guild.channels.cache.get(RESULTS_CHANNEL_ID);
            if (resultsChannel && targetMember) {
                const userIgn = (verifications[ownerId] && verifications[ownerId].ign) ? verifications[ownerId].ign : targetMember.user.username;
                const skinBustUrl = `https://visage.surgeplay.com/bust/512/${encodeURIComponent(userIgn)}`;

                const resultEmbed = new EmbedBuilder()
                    .setThumbnail(skinBustUrl)
                    .addFields(
                        { name: 'Username:', value: userIgn },
                        { name: 'Tester:', value: `<@${testerId}>` },
                        { name: 'Gamemode:', value: `${categoryData.emoji} ${categoryData.name}` },
                        { name: 'Previous Rank:', value: 'Unranked' },
                        { name: 'New Rank:', value: selectedTier }
                    )
                    .setColor(0x2b2d31)
                    .setTimestamp();

                await resultsChannel.send({
                    content: `<@${targetMember.id}>`,
                    embeds: [resultEmbed]
                });
            }

            await channel.send({ content: `Assigned **${selectedTier}** (${categoryData.name}) to <@${ownerId}>. Closing ticket...` });
            await closeChannelWithTranscript(channel, interaction.guild, interaction.user, true);
        }
    }

    // --- MODAL SUBMISSIONS ---
    if (interaction.isModalSubmit()) {
        
        // High Tier Fight Results Modal Submission
        if (interaction.customId === 'hightier_fight_modal') {
            const pendingData = pendingHighTierTests.get(interaction.user.id);
            if (!pendingData) {
                return interaction.reply({ content: 'Could not find pending test data.', flags: 64 });
            }

            const statusInput = interaction.fields.getTextInputValue('hightier_result_status').trim().toLowerCase();
            const score = interaction.fields.getTextInputValue('hightier_score').trim();

            const isPassed = statusInput.includes('got') || statusInput.includes('pass');
            const { selectedTier, ownerId, testerId, categoryKey } = pendingData;
            pendingHighTierTests.delete(interaction.user.id);

            await interaction.deferReply({ flags: 64 });

            const targetMember = await interaction.guild.members.fetch(ownerId).catch(() => null);
            const testerMember = await interaction.guild.members.fetch(testerId).catch(() => null);
            const categoryData = QUEUE_CATEGORIES[categoryKey] || QUEUE_CATEGORIES.axe;
            const categoryTierRoles = TIER_ROLES[categoryKey] || TIER_ROLES.axe;

            const userIgn = (verifications[ownerId] && verifications[ownerId].ign) ? verifications[ownerId].ign : (targetMember ? targetMember.user.username : 'Player');
            const testerIgn = (verifications[testerId] && verifications[testerId].ign) ? verifications[testerId].ign : (testerMember ? testerMember.user.username : 'Tester');
            const skinBustUrl = `https://visage.surgeplay.com/bust/512/${encodeURIComponent(userIgn)}`;

            if (isPassed && targetMember) {
                const allGamemodeRoleIds = Object.values(categoryTierRoles);
                const rolesToRemove = targetMember.roles.cache.filter(role => allGamemodeRoleIds.includes(role.id));
                if (rolesToRemove.size > 0) {
                    await targetMember.roles.remove(rolesToRemove).catch(e => console.error('Error removing old tier roles:', e));
                }

                if (categoryTierRoles[selectedTier]) {
                    await targetMember.roles.add(categoryTierRoles[selectedTier]).catch(e => console.error('Error adding new tier role:', e));
                }
            }

            const highTierChannel = interaction.guild.channels.cache.get(HIGH_TIER_RESULTS_CHANNEL_ID);
            if (highTierChannel) {
                const actionText = isPassed ? 'PASSED' : 'FAILED';
                const resultText = isPassed ? 'Won' : 'Lost';

                const descriptionText = `<@${ownerId}> - **${userIgn}** has __**${actionText}**__ their **${selectedTier}** ${categoryData.name} ${categoryData.emoji} test.\n\n__**FIGHTS ${selectedTier} :**__\n> **${resultText}** **${score}** against **${testerIgn}**\n*(Left: Player | Right: Tester)*`;

                const highTierEmbed = new EmbedBuilder()
                    .setDescription(descriptionText)
                    .setThumbnail(skinBustUrl)
                    .setColor(isPassed ? 0x57f287 : 0xed4245)
                    .setTimestamp();

                await highTierChannel.send({
                    content: `<@&${HIGH_TIER_PING_ROLE_ID}>`,
                    embeds: [highTierEmbed]
                });
            }

            const channel = interaction.channel;
            const statusMsg = isPassed 
                ? `Assigned **${selectedTier}** to <@${ownerId}>. Closing ticket...`
                : `<@${ownerId}> failed the **${selectedTier}** test. Retaining current tier role. Closing ticket...`;

            await channel.send({ content: statusMsg });
            await interaction.editReply({ content: 'Result recorded successfully.' });
            await closeChannelWithTranscript(channel, interaction.guild, interaction.user, true);
        }

        // Save Verification Data
        if (interaction.customId === 'verify_modal') {
            const ign = interaction.fields.getTextInputValue('verify_ign').trim();
            const server = interaction.fields.getTextInputValue('verify_server').trim();

            verifications[interaction.user.id] = {
                ign,
                server,
                timestamp: Date.now()
            };
            saveVerifications();

            return interaction.reply({
                content: `You have been successfully verified!\n\n**Minecraft IGN:** \`${ign}\` \n**Preferred Server:** \`${server}\` \n\nYou can now join the testing queues.`,
                flags: 64
            });
        }

        if (interaction.customId === 'ticket_modal') {
            const reason = interaction.fields.getTextInputValue('ticket_reason');
            const guild = interaction.guild;

            const ticketChannel = await guild.channels.create({
                name: `ticket-${interaction.user.username}`,
                type: ChannelType.GuildText,
                parent: TICKET_CATEGORY_ID,
                permissionOverwrites: [
                    { id: guild.id, deny: [PermissionFlagsBits.ViewChannel] },
                    { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.AttachFiles] },
                    { id: TICKET_STAFF_ROLE_ID, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.AttachFiles] }
                ]
            });

            await ticketChannel.setTopic(`Ticket Owner: ${interaction.user.id} | Reason: ${reason}`);

            const ticketEmbed = new EmbedBuilder()
                .setTitle('Ticket Support')
                .setDescription(`Hello <@${interaction.user.id}>, welcome to your support ticket.\n\n**Reason:**\n${reason}`)
                .setColor(0x2b2d31)
                .setTimestamp();

            const controlRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('ticket_claim').setLabel('Claim').setStyle(ButtonStyle.Success),
                new ButtonBuilder().setCustomId('ticket_close').setLabel('Close').setStyle(ButtonStyle.Danger),
                new ButtonBuilder().setCustomId('ticket_rename').setLabel('Rename').setStyle(ButtonStyle.Secondary)
            );

            await ticketChannel.send({ content: '@everyone', embeds: [ticketEmbed], components: [controlRow] });
            await interaction.reply({ content: `Ticket created: ${ticketChannel}`, flags: 64 });
        }

        if (interaction.customId === 'ticket_rename_modal') {
            const newName = interaction.fields.getTextInputValue('new_ticket_name');
            await interaction.channel.setName(newName);
            const renameEmbed = new EmbedBuilder().setDescription(`Ticket renamed to **${newName}**.`).setColor(0x5865f2);
            await interaction.reply({ embeds: [renameEmbed] });
        }
    }
});

console.log('--> Connecting to Discord gateway...');
client.login(TOKEN);
