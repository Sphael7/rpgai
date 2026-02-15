// ============================================================================
// STATE & SAVE SYSTEM - REVISED
// ============================================================================

const KEY_MAIN = "avarath_save_main_v6"; 
const KEY_AUTO = "avarath_save_auto_v6";

const INITIAL_STATE = {
    player: {
        identity: { name: "Edrin Hale", role: "Hunter", origin: "Valeryn" },
        stats: { level: 1, exp: 0, maxExp: 100, str: 12, agi: 14, int: 10, per: 15 },
        status: { 
            hp: 100, maxHp: 100, stamina: 80, maxStam: 100, hunger: 20, gold: 45,
            sleep: 0, hygiene: 100 
        },
        reputation: { valeryn: 10, global: 0 },
        location: "Valeryn",
        inventory: [
            { id: "wpn_003", name: "Busur Kayu Yew", qty: 1 },
            { id: "wpn_002", name: "Pisau Berburu", qty: 1 },
            { id: "con_001", name: "Roti Kering", qty: 2 }
        ]
    },
    world: {
        day: 1, hour: 8, minute: 0,
        weather: "Cerah",
        economyMod: 1.0 
    },
    npcs: {}, 
    logs: [] 
};

let PLAYER, WORLD, NPC_DB, CHAT_LOGS;
let currentTarget = null;
let gameInterval; 
let huntClue = null;

/**
 * FUNGSI KRUSIAL: getItem
 * Mengambil data barang dari ITEM_DB (yang ada di data/items.js)
 */
function getItem(id) {
    if (typeof ITEM_DB !== 'undefined' && ITEM_DB[id]) {
        return ITEM_DB[id];
    }
    return null;
}

function loadGame(source = "main") {
    const key = source === "auto" ? KEY_AUTO : KEY_MAIN;
    const savedJSON = localStorage.getItem(key);

    if (savedJSON) {
        try {
            const savedData = JSON.parse(savedJSON);
            PLAYER = { ...INITIAL_STATE.player, ...savedData.player };
            PLAYER.stats = { ...INITIAL_STATE.player.stats, ...savedData.player.stats }; 
            PLAYER.status = { ...INITIAL_STATE.player.status, ...savedData.player.status };
            PLAYER.reputation = { ...INITIAL_STATE.player.reputation, ...savedData.player.reputation };
            PLAYER.inventory = savedData.player.inventory || INITIAL_STATE.player.inventory;
            WORLD = { ...INITIAL_STATE.world, ...savedData.world };
            
            NPC_DB = savedData.npcs || {};
            
            CHAT_LOGS = savedData.logs || [];
            const logArea = document.getElementById("chat-history");
            if (logArea) {
                logArea.innerHTML = "";
                CHAT_LOGS.forEach(log => renderLog(log.html, log.type, log.name));
            }
            addLog(`<i>Data dimuat: ${source.toUpperCase()}.</i>`, "system");
        } catch (e) { hardReset(); }
    } else {
        hardReset();
        addLog("Selamat datang di Avarath.", "system");
    }
    if (typeof updateNPCLiveState === 'function') updateNPCLiveState();
    if (typeof updateUI === 'function') updateUI();
}

function hardReset() {
    PLAYER = JSON.parse(JSON.stringify(INITIAL_STATE.player));
    WORLD = JSON.parse(JSON.stringify(INITIAL_STATE.world));
    NPC_DB = {}; 
    CHAT_LOGS = [];
    saveGame("main");
}

function saveGame(source = "main") {
    const data = { player: PLAYER, world: WORLD, npcs: NPC_DB, logs: CHAT_LOGS };
    localStorage.setItem(source === "auto" ? KEY_AUTO : KEY_MAIN, JSON.stringify(data));
}