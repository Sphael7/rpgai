// ============================================================================
// GAME ENGINE - AVARATH RPG (Full Revised: Survival, Trading & AI NPCs Generation)
// ============================================================================

const KEY_MAIN = "avarath_save_main_v6"; 
const KEY_AUTO = "avarath_save_auto_v6";

// Poin 4: Master Template untuk ribuan NPC (Lazy Loading)
const NPC_TEMPLATES = {
    "Valeryn": [
        { 
            id: "npc_garrick", 
            name: "Garrick", 
            role: "Mentor", 
            desc: "Tua, satu mata.", 
            relations: ["npc_elara"], 
            schedule: { 
                work: { s: 8, e: 17, l: "Bengkel Pandai Besi" }, 
                rest: { s: 18, e: 23, l: "Penginapan (Inn)" } 
            },
            inventory: [ 
                { id: "wpn_001", qty: 2 },
                { id: "mat_003", qty: 5 }
            ]
        },
        { 
            id: "npc_elara", 
            name: "Elara", 
            role: "Pelayan", 
            desc: "Ramah.", 
            relations: ["npc_garrick"],
            schedule: { 
                work: { s: 7, e: 22, l: "Penginapan (Inn)" }, 
                rest: { s: 23, e: 6, l: "Rumah Pribadi" } 
            },
            inventory: [ 
                { id: "con_001", qty: 10 },
                { id: "con_002", qty: 3 }
            ]
        }
    ],
    "greywood": [], 
    "stonefall": [],
    "river_karth": [],
    "ashplain": []
};

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
    updateNPCLiveState();
    updateUI();
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

// --- SYSTEM: AI NPC GENERATION (NEW) ---
async function generateNewNPC() {
    if (PLAYER.status.stamina < 5) { addLog("Kamu terlalu lelah untuk mencari orang baru.", "system"); return; }
    
    addLog("<i>Mencoba berinteraksi dengan orang asing di sekitar...</i>", "system");
    PLAYER.status.stamina -= 5;

    const prompt = `Buat 1 NPC baru untuk dunia RPG medieval Avarath di lokasi ${PLAYER.location}. 
    Berikan format JSON murni tanpa markdown: 
    {"name": "nama", "role": "pekerjaan", "desc": "deskripsi singkat", "schedule": {"work": {"s": 8, "e": 16, "l": "tempat kerja"}, "rest": {"s": 17, "e": 7, "l": "tempat istirahat"}}}`;

    try {
        const response = await callGemini(prompt, "Hasilkan data NPC.");
        const cleanJson = response.replace(/```json|```/gi, "").trim();
        const newNPCData = JSON.parse(cleanJson);
        
        newNPCData.id = "gen_" + Date.now();
        newNPCData.affinity = 0;
        newNPCData.chatCount = 0;
        newNPCData.memories = [];
        newNPCData.isKnown = false; 
        newNPCData.inventory = [];

        if (!NPC_DB[PLAYER.location]) NPC_DB[PLAYER.location] = [];
        NPC_DB[PLAYER.location].push(newNPCData);
        
        addLog(`Kamu melihat seseorang yang terlihat seperti <strong>${newNPCData.role}</strong>.`, "narrator");
        updateNPCLiveState();
        updateUI();
    } catch (e) {
        addLog("Gagal menemukan orang baru saat ini.", "system");
    }
}

// --- SYSTEM: AUTO UPDATE NPC ---
function updateNPCLiveState() {
    const loc = PLAYER.location;
    
    if (!NPC_DB[loc]) {
        const templates = NPC_TEMPLATES[loc] || [];
        const shops = SHOPS[loc] || []; // Load dari shops.js
        NPC_DB[loc] = JSON.parse(JSON.stringify([...templates, ...shops]));
    }

    NPC_DB[loc].forEach(npc => {
        if (npc.schedule) {
            const isWork = WORLD.hour >= npc.schedule.work.s && WORLD.hour < npc.schedule.work.e;
            npc.currentLoc = isWork ? npc.schedule.work.l : npc.schedule.rest.l;
        } else {
            npc.currentLoc = npc.currentLoc || "Sekitar " + loc;
        }

        if (PLAYER.status.hygiene < 30) npc.mood = "Risih";
        else if (PLAYER.status.hp < 40) npc.mood = "Cemas"; 
        else if (WORLD.weather === "Badai") npc.mood = "Waspada";
        else if (WORLD.hour > 21 || WORLD.hour < 6) npc.mood = "Lelah";
        else npc.mood = "Normal";

        if (!npc.affinity) npc.affinity = 10;
        if (!npc.memories) npc.memories = [];
        if (!npc.chatCount) npc.chatCount = 0;
        if (!npc.inventory) npc.inventory = [];
    });
}

// --- LOGGING ---
function addLog(html, type, name = "") {
    const logItem = { html, type, name };
    if (!CHAT_LOGS) CHAT_LOGS = [];
    CHAT_LOGS.push(logItem);
    if (CHAT_LOGS.length > 50) CHAT_LOGS.shift();
    renderLog(html, type, name);
}

function renderLog(html, type, name = "") {
    const logArea = document.getElementById("chat-history");
    if (!logArea) return;
    const div = document.createElement("div");
    div.className = `msg ${type}`;
    div.innerHTML = type === "npc" ? `<strong>${name}:</strong> ${html}` : html;
    logArea.appendChild(div);
    setTimeout(() => { logArea.scrollTop = logArea.scrollHeight; }, 50);
}

// --- ENGINE: LOOP & TICK ---
function startGameLoop() {
    if (gameInterval) clearInterval(gameInterval);
    gameInterval = setInterval(() => {
        let oldHour = WORLD.hour;
        passTime(8, false); 
        
        updateNPCLiveState();

        PLAYER.status.sleep += 0.5;
        PLAYER.status.hygiene -= 0.3;
        
        if (PLAYER.status.sleep >= 24) {
            PLAYER.status.maxStam = Math.max(20, PLAYER.status.maxStam - 5);
            addLog("<i>Matamu terasa berat, fokusmu mulai kabur.</i>", "system");
        }

        let hungerRate = (WORLD.weather === "Hujan" || WORLD.weather === "Badai") ? 1.0 : 0.5;
        PLAYER.status.hunger += hungerRate;
        if (PLAYER.status.hunger < 100) PLAYER.status.stamina = Math.min(PLAYER.status.maxStam, PLAYER.status.stamina + 1);

        if (Math.random() < 0.1) changeWeather();
        triggerRandomEvent();

        if ((oldHour === 11 && WORLD.hour === 12) || (oldHour === 23 && WORLD.hour === 0)) {
            saveGame("auto");
            updateDynamicEconomy();
        }
        saveGame("main"); 
        updateUI();
    }, 10000); 
}

function updateDynamicEconomy() {
    WORLD.economyMod = 0.8 + (Math.random() * 0.6); 
    
    for (let loc in NPC_DB) {
        NPC_DB[loc].forEach(npc => {
            if (npc.inventory) {
                npc.inventory.forEach(item => {
                    if (Math.random() > 0.5) item.qty += Math.floor(Math.random() * 3);
                });
            }
        });
    }

    if (WORLD.economyMod > 1.3) addLog("📢 <strong>EKONOMI:</strong> Harga pasar sedang melonjak.", "system");
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

// --- ACTIONS: HUNTING ---
async function actionHunt() {
    if (PLAYER.location === "Valeryn") { addLog("🛡️ Aman di kota. Pergilah ke Wilderness untuk berburu.", "system"); return; }
    if (huntClue) { addLog("🔍 Gunakan perintah <strong>'lacak'</strong>.", "system"); return; }
    if (PLAYER.status.stamina < 15) { addLog("⚠️ Butuh 15 Stamina.", "system"); return; }

    let duration = 30 + Math.floor(Math.random() * 30);
    PLAYER.status.stamina -= 15;
    PLAYER.status.hygiene -= 5;
    passTime(duration, false);
    
    let isNight = WORLD.hour < 6 || WORLD.hour > 18;
    huntClue = spawnMonster(PLAYER.location, isNight);

    if (huntClue) {
        addLog(`🐾 <strong>JEJAK:</strong> Kamu melihat tanda keberadaan <strong>${huntClue.name}</strong>.`, "narrator");
    } else {
        addLog("Hutan terasa sunyi, tidak ada monster terlihat.", "narrator");
    }
    updateUI();
}

// --- INPUT & AI INTERACTION ---
async function handleInput() {
    const input = document.getElementById("input-txt");
    const val = input.value.trim();
    if (!val) return;

    if (val.toLowerCase() === "lacak" && huntClue) {
        executeHuntLogic(huntClue);
        huntClue = null;
        input.value = "";
        return;
    }

    if (currentTarget) {
        if (val.toLowerCase().startsWith("beli ")) {
            processTrade("buy", val.substring(5));
            input.value = "";
            return;
        }
        if (val.toLowerCase().startsWith("jual ")) {
            processTrade("sell", val.substring(5));
            input.value = "";
            return;
        }
    }

    addLog(val, "player");
    input.value = "";

    if (currentTarget) {
        const intimacy = currentTarget.chatCount > 10 ? "Sangat Akrab & Perhatian" : "Kenalan";
        const worldCtx = `JAM: ${WORLD.hour}:${WORLD.minute}, CUACA: ${WORLD.weather}, EDRIN: HP ${PLAYER.status.hp}, HYG ${PLAYER.status.hygiene}%`;
        
        const context = `
            Kamu adalah ${currentTarget.name} (${currentTarget.role}). ${currentTarget.bio || ""}
            Mood: ${currentTarget.mood}. Kedekatan: ${intimacy}.
            Status Dunia: ${worldCtx}. Memori: ${currentTarget.memories.join(". ")}
            
            Tugas: 
            1. Balas Edrin: "${val}". Jika kotor (<30 HYG), tegur.
            2. Ciptakan tugas dinamis (minta bahan/bantuan) sesuai situasi.
            3. Jika Edrin menawar, tentukan harga (price_mod).
            4. Ingat 1 fakta baru.
            
            Format JSON murni: {"reply": "...", "new_fact": "...", "price_mod": 1.0}
        `;
        try {
            const raw = await callGemini(context, val);
            const data = JSON.parse(raw.replace(/```json|```/gi, "").trim());
            addLog(data.reply, "npc", currentTarget.name);
            
            if (data.price_mod) currentTarget.tempMarkup = data.price_mod;
            if (data.new_fact) {
                currentTarget.memories.push(data.new_fact);
                if (currentTarget.memories.length > 15) {
                    const summary = await callGemini("Ringkas ingatan jadi biografi padat.", currentTarget.memories.join(". "));
                    currentTarget.memories = [summary];
                }
            }
            currentTarget.chatCount++;
        } catch (e) {
            addLog("...", "npc", currentTarget.name);
        }
    } else {
        const res = await callGemini(`Narator RPG. Lokasi: ${PLAYER.location}. Aksi: ${val}`, val);
        addLog(res, "narrator");
    }
}

function processTrade(type, itemName) {
    const npc = currentTarget;

    if (type === "buy") {
        const itemInStock = npc.inventory.find(i => {
            const detail = getItem(i.id);
            return detail && detail.name.toLowerCase() === itemName.toLowerCase();
        });

        if (!itemInStock || itemInStock.qty <= 0) {
            addLog(`"${itemName}" tidak tersedia.`, "npc", npc.name);
            return;
        }

        const detail = getItem(itemInStock.id);
        const currentMarkup = npc.tempMarkup || npc.markup || 1.0;
        const price = Math.floor(detail.val * WORLD.economyMod * currentMarkup);

        if (PLAYER.status.gold >= price) {
            PLAYER.status.gold -= price;
            itemInStock.qty--;
            
            const pItem = PLAYER.inventory.find(pi => pi.id === itemInStock.id);
            if (pItem) pItem.qty++;
            else PLAYER.inventory.push({ id: itemInStock.id, name: detail.name, qty: 1 });
            
            addLog(`Kamu membeli ${detail.name} seharga ${price} koin.`, "system");
        } else {
            addLog("Emasmu tidak cukup.", "system");
        }
    } 
    else if (type === "sell") {
        const playerItemIndex = PLAYER.inventory.findIndex(pi => pi.name.toLowerCase() === itemName.toLowerCase());
        
        if (playerItemIndex === -1) {
            addLog(`Kamu tidak memiliki "${itemName}".`, "system");
            return;
        }

        const pItem = PLAYER.inventory[playerItemIndex];
        const detail = getItem(pItem.id);
        const sellPrice = Math.floor((detail.val * WORLD.economyMod) * 0.6);

        PLAYER.status.gold += sellPrice;
        pItem.qty--;
        
        if (pItem.qty <= 0) PLAYER.inventory.splice(playerItemIndex, 1);
        addLog(`Kamu menjual ${detail.name} seharga ${sellPrice} koin.`, "system");
    }
    updateUI();
}

function executeHuntLogic(monster) {
    addLog(`⚔️ Kamu menyerang ${monster.name}!`, "narrator");
    
    let agilityMod = WORLD.weather === "Hujan" ? -3 : 0;
    let pPower = PLAYER.stats.agi + agilityMod + (Math.random() * 10);
    let mPower = monster.lvl * 2;

    if (pPower >= mPower) {
        let hpLoss = Math.floor(Math.random() * 5);
        PLAYER.status.hp -= hpLoss;
        gainExp(monster.exp);
        addLog(`✅ Sukses! ${monster.name} dikalahkan.`, "system");
        
        if (monster.drops) {
            monster.drops.forEach(d => {
                if(Math.random() <= d.chance) {
                    const itm = getItem(d.id);
                    if(itm) {
                        const pItem = PLAYER.inventory.find(pi => pi.id === d.id);
                        if (pItem) pItem.qty++;
                        else PLAYER.inventory.push({id:d.id, name:itm.name, qty:1});
                        addLog(`Loot: <span style="color:gold">${itm.name}</span>`, "system");
                    }
                }
            });
        }
    } else {
        let hpLoss = monster.atk;
        PLAYER.status.hp -= hpLoss;
        addLog(`❌ Gagal! Kamu terluka parah oleh ${monster.name} (-${hpLoss} HP).`, "system");
    }

    if (PLAYER.status.hp <= 0) {
        alert("EDRIN TUMBANG.");
        loadGame("auto");
    }
    updateUI();
}

function actionTravel() {
    if (PLAYER.status.stamina < 15) { addLog("⚠️ Butuh 15 Stamina.", "system"); return; }
    let menu = `<strong>🗺️ PILIH TUJUAN:</strong><br>`;
    const locs = [
        { id: "Valeryn", name: "🏰 Valeryn", h: 2, cost: 10 },
        { id: "greywood", name: "🌲 Greywood", h: 3, cost: 20 },
        { id: "river_karth", name: "💧 River Karth", h: 2, cost: 15 }
    ];
    locs.forEach(l => {
        if (l.id !== PLAYER.location) {
            menu += `<div class="act-btn" onclick="startTravel('${l.id}',${l.h},${l.cost})">${l.name}</div>`;
        }
    });
    addLog(menu, "system");
}

function startTravel(zone, h, cost) {
    PLAYER.status.stamina -= cost;
    PLAYER.status.hygiene -= 10;
    passTime(h * 60, false);
    PLAYER.location = zone;
    updateNPCLiveState();
    addLog(`🚶 Kamu menempuh perjalanan ke <strong>${zone.toUpperCase()}</strong>.`, "narrator");
    updateUI();
}

function updateUI() {
    if (!PLAYER || !WORLD) return;
    let m = WORLD.minute < 10 ? "0"+WORLD.minute : WORLD.minute;
    document.getElementById("world-clock").innerHTML = `Hari ${WORLD.day} - ${WORLD.hour}:${m}<br><small>${WORLD.weather}</small>`;
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
    const npcs = NPC_DB[PLAYER.location] || [];
    npcs.forEach(n => {
        let btn = document.createElement("div");
        btn.className = "act-btn";
        btn.innerHTML = `💬 ${n.name} <br><small>${n.role}</small>`;
        btn.onclick = () => startDialogue(n);
        list.appendChild(btn);
    });
}

function setBar(id, cur, max) {
    const pct = Math.min(100, Math.max(0, (cur/max)*100));
    const bar = document.getElementById(`${id}-bar`);
    if(bar) bar.style.width = `${pct}%`;
}

function gainExp(amt) {
    PLAYER.stats.exp += amt;
    if (PLAYER.stats.exp >= PLAYER.stats.maxExp) {
        PLAYER.stats.level++;
        PLAYER.stats.exp = 0;
        PLAYER.stats.maxExp = Math.floor(PLAYER.stats.maxExp * 1.5);
        PLAYER.status.maxHp += 15;
        PLAYER.status.hp = PLAYER.status.maxHp;
        addLog(`🎉 <strong>LEVEL UP!</strong>`, "system");
    }
}

function passTime(mins, log=true) {
    WORLD.minute += mins;
    while(WORLD.minute >= 60) { WORLD.minute -= 60; WORLD.hour++; }
    if(WORLD.hour >= 24) { WORLD.hour = 0; WORLD.day++; }
}

async function startDialogue(npc) {
    if(currentTarget) return;
    if (npc.id.startsWith("gen_") && !npc.isKnown) { npc.isKnown = true; addLog(`Berkenalan dengan ${npc.name}.`, "narrator"); }

    currentTarget = npc;
    document.getElementById("npc-indicator").style.display="block";
    document.getElementById("target-name").innerText = `${npc.name} (${npc.currentLoc})`;
    
    const priceList = generatePriceList(npc, WORLD.economyMod); // Dari shops.js
    const res = await callGemini(`Sapa Edrin. Mood: ${npc.mood}`, "Halo.");
    addLog(res + priceList, "npc", npc.name);
}

function endDialogue() {
    currentTarget = null;
    document.getElementById("npc-indicator").style.display="none";
    addLog("Percakapan berakhir.", "system");
}

async function callGemini(sys, user) {
    try {
        const payload = { contents: [{ parts: [{ text: sys }, { text: user }] }] };
        const res = await fetch(CONFIG.URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        const data = await res.json();
        return data.candidates[0].content.parts[0].text;
    } catch (e) { return "..."; }
}

function actionLook() {
    if (PLAYER.location !== "Valeryn" && Math.random() < 0.3) {
        addLog(`👁️ Kamu mengamati sekitar di ${PLAYER.location}.`, "narrator");
    } else {
        addLog(`Lokasi: ${PLAYER.location} | Cuaca: ${WORLD.weather}`, "system");
    }
}

function actionRest() { 
    passTime(480); 
    PLAYER.status.sleep = 0; 
    PLAYER.status.hp = PLAYER.status.maxHp;
    PLAYER.status.stamina = PLAYER.status.maxStam;
    if (PLAYER.location === "Valeryn") PLAYER.status.hygiene = 100; 
    addLog("Istirahat selesai.", "system"); 
    updateUI(); 
}

function actionInventory() { addLog(`Tas: ${PLAYER.inventory.map(i=>i.name + " (x"+i.qty+")").join(", ") || "Kosong"}`, "system"); }
function actionStatus() { addLog(`Gold: ${PLAYER.status.gold} | Tidur: ${Math.floor(PLAYER.status.sleep)}j | Kebersihan: ${Math.floor(PLAYER.status.hygiene)}%`, "system"); }

document.getElementById("input-txt").addEventListener("keypress", (e) => { if (e.key === "Enter") handleInput(); });