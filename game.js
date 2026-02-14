// ============================================================================
// GAME ENGINE - AVARATH RPG (Living World & Reputation Update)
// ============================================================================

const KEY_MAIN = "avarath_save_main_v6"; 
const KEY_AUTO = "avarath_save_auto_v6";

const INITIAL_STATE = {
    player: {
        identity: { name: "Edrin Hale", role: "Hunter", origin: "Valeryn" },
        stats: { level: 1, exp: 0, maxExp: 100, str: 12, agi: 14, int: 10, per: 15 },
        status: { hp: 100, maxHp: 100, stamina: 80, maxStam: 100, hunger: 20, gold: 45 },
        reputation: { valeryn: 10, global: 0 }, // Tambahan Reputasi
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
        economyMod: 1.0 // Tambahan Modifikator Ekonomi
    },
    npcs: {
        "Valeryn": [
            { id: "npc_garrick", name: "Garrick", role: "Mentor", desc: "Tua, satu mata.", affinity: 50, memories: [], chatCount: 0 },
            { id: "npc_elara", name: "Elara", role: "Pelayan", desc: "Ramah.", affinity: 30, memories: [], chatCount: 0 }
        ],
        "Wilderness": []
    },
    logs: [] 
};

let PLAYER, WORLD, NPC_DB, CHAT_LOGS;
let currentTarget = null;
let gameInterval; 
let huntClue = null; // Menyimpan monster yang sedang dilacak

window.onload = function() {
    loadGame("main");
    startGameLoop();
};

// --- SYSTEM: SAVE, LOAD & MERGE ---
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
            NPC_DB = JSON.parse(JSON.stringify(INITIAL_STATE.npcs)); 
            for (const city in savedData.npcs) {
                if (NPC_DB[city]) {
                    savedData.npcs[city].forEach(savedNPC => {
                        const targetNPC = NPC_DB[city].find(n => n.id === savedNPC.id);
                        if (targetNPC) {
                            targetNPC.memories = savedNPC.memories || [];
                            targetNPC.chatCount = savedNPC.chatCount || 0;
                            targetNPC.affinity = savedNPC.affinity || (INITIAL_STATE.npcs[city].find(i => i.id === savedNPC.id).affinity);
                        }
                    });
                }
            }
            CHAT_LOGS = savedData.logs || [];
            const logArea = document.getElementById("chat-history");
            if (logArea) {
                logArea.innerHTML = "";
                CHAT_LOGS.forEach(log => renderLog(log.html, log.type));
            }
            addLog(`<i>Data dimuat: ${source.toUpperCase()}.</i>`, "system");
        } catch (e) { hardReset(); }
    } else {
        hardReset();
        addLog("Selamat datang di Avarath.", "system");
    }
    updateUI();
}

function hardReset() {
    PLAYER = JSON.parse(JSON.stringify(INITIAL_STATE.player));
    WORLD = JSON.parse(JSON.stringify(INITIAL_STATE.world));
    NPC_DB = JSON.parse(JSON.stringify(INITIAL_STATE.npcs));
    CHAT_LOGS = [];
}

function saveGame(source = "main") {
    const data = { player: PLAYER, world: WORLD, npcs: NPC_DB, logs: CHAT_LOGS };
    localStorage.setItem(source === "auto" ? KEY_AUTO : KEY_MAIN, JSON.stringify(data));
}

// --- LOGGING ---
function addLog(html, type, name = "") {
    const logItem = { html, type, name };
    if (!CHAT_LOGS) CHAT_LOGS = [];
    CHAT_LOGS.push(logItem);
    if (CHAT_LOGS.length > 50) CHAT_LOGS.shift();
    renderLog(html, type, name);
    saveGame("main");
}

function renderLog(html, type, name = "") {
    const logArea = document.getElementById("chat-history");
    if (!logArea) return;
    const div = document.createElement("div");
    div.className = `msg ${type}`;
    div.innerHTML = type === "npc" ? `<strong>${name}</strong>${html}` : html;
    logArea.appendChild(div);
    setTimeout(() => { logArea.scrollTop = logArea.scrollHeight; }, 50);
}

// --- ENGINE: LOOP & TICK ---
function startGameLoop() {
    if (gameInterval) clearInterval(gameInterval);
    gameInterval = setInterval(() => {
        let oldHour = WORLD.hour;
        passTime(8, false); 
        
        // Hunger & Weather Impact
        let hungerRate = (WORLD.weather === "Hujan" || WORLD.weather === "Badai") ? 1.0 : 0.5;
        PLAYER.status.hunger += hungerRate;
        if (PLAYER.status.hunger < 100) PLAYER.status.stamina = Math.min(PLAYER.status.maxStam, PLAYER.status.stamina + 1);

        if (Math.random() < 0.1) changeWeather();
        triggerRandomEvent();

        if ((oldHour === 11 && WORLD.hour === 12) || (oldHour === 23 && WORLD.hour === 0)) {
            addLog("💾 <strong>AUTO-SAVE</strong>", "system");
            saveGame("auto");
            updateDynamicEconomy(); // Update harga pasar tiap 12 jam
        }
        saveGame("main"); 
        updateUI();
    }, 10000); 
}

function updateDynamicEconomy() {
    WORLD.economyMod = 0.8 + (Math.random() * 0.6); 
    if (WORLD.economyMod > 1.3) addLog("📢 <strong>EKONOMI:</strong> Harga barang di pasar melonjak karena gangguan suplai.", "system");
}

function changeWeather() {
    const weathers = ["Cerah", "Berawan", "Hujan", "Badai", "Kabut"];
    WORLD.weather = weathers[Math.floor(Math.random() * weathers.length)];
    addLog(`🌦️ <strong>CUACA:</strong> Sekarang ${WORLD.weather}.`, "system");
}

function triggerRandomEvent() {
    let type = PLAYER.location === "Valeryn" ? "city" : "wild";
    if (Math.random() < 0.3) type = "lore";
    if (typeof getRandomNotif === 'function') {
        const msg = getRandomNotif(type); 
        let m = WORLD.minute < 10 ? "0"+WORLD.minute : WORLD.minute;
        addLog(`<span style="color:#555; font-size:0.8em;">[${WORLD.hour}:${m}] ${msg}</span>`, "system");
    }
}

// --- ACTIONS: HUNTING (Dinamis & Taktis) ---
async function actionHunt() {
    if (PLAYER.location === "Valeryn") { addLog("🛡️ Aman di kota. Travel-lah ke wilayah luar.", "system"); return; }
    if (huntClue) { addLog("🔍 Kamu sudah menemukan jejak. Ketik <strong>'lacak'</strong> untuk menyergap.", "system"); return; }
    if (PLAYER.status.stamina < 15) { addLog("⚠️ Butuh 15 Stamina.", "system"); return; }

    // Kalkulasi Durasi
    let duration = 20 + Math.floor(Math.random() * 30);
    if (WORLD.weather === "Hujan") duration += 15;
    if (WORLD.hour < 6 || WORLD.hour > 18) duration += 20; // Malam

    PLAYER.status.stamina -= 15;
    passTime(duration, false);
    
    // Day/Night Cycle Monster
    let isNight = WORLD.hour < 6 || WORLD.hour > 18;
    huntClue = spawnMonster(PLAYER.location, isNight);

    if (huntClue) {
        addLog(`🐾 <strong>JEJAK DITEMUKAN:</strong> Kamu melihat tanda keberadaan <strong>${huntClue.name}</strong>.`, "narrator");
        addLog(`Gunakan perintah <strong>'lacak'</strong> untuk memulai serangan.`, "system");
    } else {
        addLog("Hutan terasa sunyi, tidak ada monster terlihat.", "narrator");
    }
    updateUI();
}

async function handleInput() {
    const input = document.getElementById("input-txt");
    const val = input.value.trim();
    if (!val) return;

    // Perintah Khusus: Lacak
    if (val.toLowerCase() === "lacak" && huntClue) {
        executeHuntLogic(huntClue);
        huntClue = null;
        input.value = "";
        return;
    }

    addLog(val, "player");
    input.value = "";

    // Context AI yang sadar kondisi pemain
    const aiAwareness = `Edrin Hale (HP:${PLAYER.status.hp}, Stamina:${PLAYER.status.stamina}, Lokasi:${PLAYER.location}, Cuaca:${WORLD.weather}). NPC Affinity: ${currentTarget ? currentTarget.affinity : 0}. Jika Edrin terluka parah, NPC bereaksi khawatir.`;
    
    if (currentTarget) {
        const context = `Role: ${currentTarget.name}. ${aiAwareness}. Jawab Edrin: "${val}"`;
        const res = await callGemini(context, val);
        addLog(res, "npc", currentTarget.name);
        currentTarget.chatCount++;
        if (currentTarget.chatCount % 3 === 0) summarizeMemory(currentTarget, val, res);
    } else {
        const res = await callGemini(`Narator RPG. ${aiAwareness}. Aksi: ${val}`, val);
        addLog(res, "narrator");
    }
}

function executeHuntLogic(monster) {
    addLog(`⚔️ Kamu mengendap-endap menggunakan <strong>Silent Step</strong> dan menyerang ${monster.name}!`, "narrator");

    // Efek Cuaca pada Combat
    let agilityMod = WORLD.weather === "Hujan" ? -3 : (WORLD.weather === "Kabut" ? 5 : 0);
    let pPower = PLAYER.stats.agi + agilityMod + (Math.random() * 10);
    let mPower = monster.lvl * 2.5;

    if (pPower >= mPower) {
        let hpLoss = (pPower - mPower < 5) ? Math.floor(monster.atk / 2) : 0;
        PLAYER.status.hp -= hpLoss;
        gainExp(monster.exp);
        addLog(`✅ <strong>SUKSES:</strong> ${monster.name} tumbang! ${hpLoss > 0 ? `Kamu tergores (-${hpLoss} HP).` : "Tanpa luka."}`, "system");
        
        // Part Breaking
        if (monster.lvl > 5 && Math.random() > 0.7) {
            addLog("💥 <strong>PART BREAK:</strong> Kamu menghancurkan bagian keras monster, material ekstra didapat!", "system");
        }
        
        if (monster.drops) {
            monster.drops.forEach(d => {
                if(Math.random() <= d.chance) {
                    const itm = getItem(d.id);
                    if(itm) {
                        PLAYER.inventory.push({id:d.id, name:itm.name, qty:1});
                        addLog(`Loot: <span style="color:gold">${itm.name}</span>`, "system");
                    }
                }
            });
        }
    } else {
        let hpLoss = Math.floor(monster.atk * (WORLD.weather === "Badai" ? 1.5 : 1.2));
        PLAYER.status.hp -= hpLoss;
        addLog(`❌ <strong>GAGAL:</strong> ${monster.name} menyerang balik dengan ganas! (-${hpLoss} HP). Kamu mundur.`, "system");
    }

    if (PLAYER.status.hp <= 0) {
        alert("EDRIN HALE TUMBANG. Loading Auto-save...");
        loadGame("auto");
    }
    updateUI();
}

// --- TRAVEL & UTILS ---
function actionTravel() {
    if (PLAYER.status.stamina < 15) { addLog("⚠️ Butuh 15 Stamina.", "system"); return; }
    let menu = `<strong>🗺️ PILIH TUJUAN:</strong><br><br>`;
    const locs = [
        { id: "Valeryn", name: "🏰 Valeryn", h: 2, cost: 10 },
        { id: "greywood", name: "🌲 Greywood", h: 3, cost: 20 },
        { id: "river_karth", name: "💧 River Karth", h: 2, cost: 15 },
        { id: "stonefall", name: "⛰️ Stonefall", h: 5, cost: 40 },
        { id: "ashplain", name: "🔥 Ashplain", h: 7, cost: 60 }
    ];
    locs.forEach(l => {
        if (l.id !== PLAYER.location) {
            menu += `<div class="act-btn" onclick="startTravel('${l.id}',${l.h},${l.cost})">${l.name} (${l.h}j)</div><br>`;
        }
    });
    addLog(menu, "system");
}

function startTravel(zone, h, cost) {
    PLAYER.status.stamina -= cost;
    passTime(h * 60, false);
    PLAYER.location = zone;
    addLog(`🚶 Kamu menempuh perjalanan ke <strong>${zone.toUpperCase()}</strong>.`, "narrator");
    updateUI();
}

function updateUI() {
    if (!PLAYER || !WORLD) return;
    let m = WORLD.minute < 10 ? "0"+WORLD.minute : WORLD.minute;
    document.getElementById("world-clock").innerHTML = `Hari ${WORLD.day} - ${WORLD.hour}:${m}<br><span style="color:var(--accent)">${WORLD.weather}</span>`;
    document.getElementById("p-level").innerText = PLAYER.stats.level;
    document.getElementById("p-name").innerText = PLAYER.identity.name;
    document.getElementById("p-class").innerText = PLAYER.identity.role;
    setBar("hp", PLAYER.status.hp, PLAYER.status.maxHp);
    setBar("stam", PLAYER.status.stamina, PLAYER.status.maxStam);
    setBar("exp", PLAYER.stats.exp, PLAYER.stats.maxExp);
    document.getElementById("val-str").innerText = PLAYER.stats.str;
    document.getElementById("val-agi").innerText = PLAYER.stats.agi;
    document.getElementById("val-int").innerText = PLAYER.stats.int;
    document.getElementById("val-per").innerText = PLAYER.stats.per;
    
    const list = document.getElementById("npc-list-ui");
    list.innerHTML = "";
    if (PLAYER.location === "Valeryn") {
        const npcs = NPC_DB["Valeryn"] || [];
        npcs.forEach(n => {
            let btn = document.createElement("div");
            btn.className = "act-btn";
            btn.innerHTML = `💬 ${n.name} (Aff:${n.affinity})`;
            btn.onclick = () => startDialogue(n);
            list.appendChild(btn);
        });
    } else {
        list.innerHTML = `<div style="text-align:center; padding:5px; color:#aaa; font-size:0.8em;">Wilayah: ${PLAYER.location.replace("_"," ").toUpperCase()}</div>`;
    }
}

function setBar(id, cur, max) {
    const pct = Math.min(100, Math.max(0, (cur/max)*100));
    const bar = document.getElementById(`${id}-bar`);
    const txt = document.getElementById(`${id}-txt`);
    if(bar) bar.style.width = `${pct}%`;
    if(txt) txt.innerText = `${cur}/${max}`;
}

function gainExp(amt) {
    PLAYER.stats.exp += amt;
    if (PLAYER.stats.exp >= PLAYER.stats.maxExp) {
        PLAYER.stats.level++;
        PLAYER.stats.exp = 0;
        PLAYER.stats.maxExp = Math.floor(PLAYER.stats.maxExp * 1.5);
        PLAYER.status.maxHp += 15;
        PLAYER.status.hp = PLAYER.status.maxHp;
        PLAYER.stats.str++; PLAYER.stats.agi++;
        addLog(`🎉 <strong>LEVEL UP: ${PLAYER.stats.level}</strong>`, "system");
    }
}

function passTime(mins, log=true) {
    WORLD.minute += mins;
    while(WORLD.minute >= 60) { WORLD.minute -= 60; WORLD.hour++; }
    if(WORLD.hour >= 24) { WORLD.hour = 0; WORLD.day++; }
}

async function startDialogue(npc) {
    if(currentTarget) return;
    currentTarget = npc;
    document.getElementById("npc-indicator").style.display="block";
    document.getElementById("target-name").innerText=npc.name;
    const res = await callGemini(`Role:${npc.name}. Affinity:${npc.affinity}. Memori:${npc.memories.join(". ")}`, "Sapa Edrin.");
    addLog(res, "npc", npc.name);
}

function endDialogue() {
    if(currentTarget) {
        addLog("Mengakhiri percakapan.", "system");
        currentTarget=null;
        document.getElementById("npc-indicator").style.display="none";
    }
}

async function callGemini(sys, user) {
    try {
        const payload = { contents: [{ parts: [{ text: sys }, { text: user }] }] };
        const res = await fetch(CONFIG.URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        const data = await res.json();
        return data.candidates[0].content.parts[0].text;
    } catch (e) { return "..."; }
}

async function summarizeMemory(npc, inp, res) {
    try {
        const mem = await callGemini("Rangkum 1 fakta penting.", `Pemain:${inp}, NPC:${res}`);
        npc.memories.push(mem);
        if(npc.memories.length > 5) npc.memories.shift();
    } catch(e){}
}

function actionInventory() { addLog(`Tas: ${PLAYER.inventory.map(i=>i.name).join(", ") || "Kosong"}`, "system"); }
function actionStatus() { addLog(`Edrin Hale | Reputasi Valeryn: ${PLAYER.reputation.valeryn}`, "system"); }
function actionLook() { addLog(`Lokasi: ${PLAYER.location} | Cuaca: ${WORLD.weather}`, "system"); }
function actionRest() { passTime(120); PLAYER.status.hp+=20; PLAYER.status.stamina+=40; addLog("Istirahat selesai.", "system"); updateUI(); }

document.getElementById("input-txt").addEventListener("keypress", (e) => { if (e.key === "Enter") handleInput(); });