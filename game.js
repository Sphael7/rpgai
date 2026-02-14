// ============================================================================
// GAME ENGINE - AVARATH RPG (FIXED: AddLog & RenderLog restored)
// ============================================================================

// --- 1. CONFIG & KEYS ---
const KEY_MAIN = "avarath_save_main_v6"; // Key baru biar bersih
const KEY_AUTO = "avarath_save_auto_v6";

// STATE AWAL (Blueprint)
const INITIAL_STATE = {
    player: {
        identity: { name: "Edrin Hale", role: "Hunter", origin: "Valeryn" },
        stats: { 
            level: 1, 
            exp: 0, maxExp: 100, 
            str: 12, agi: 14, int: 10, per: 15
        },
        status: { 
            hp: 100, maxHp: 100, 
            stamina: 80, maxStam: 100, 
            hunger: 20, 
            gold: 45 
        },
        location: "Valeryn",
        inventory: [
            { id: "wpn_003", name: "Busur Kayu Yew", qty: 1 },
            { id: "wpn_002", name: "Pisau Berburu", qty: 1 },
            { id: "con_001", name: "Roti Kering", qty: 2 }
        ]
    },
    world: {
        day: 1, hour: 8, minute: 0,
        weather: "Cerah"
    },
    npcs: {
        "Valeryn": [
            { id: "npc_garrick", name: "Garrick", role: "Mentor", desc: "Tua, satu mata.", memories: [], chatCount: 0 },
            { id: "npc_elara", name: "Elara", role: "Pelayan", desc: "Ramah.", memories: [], chatCount: 0 }
        ],
        "Wilderness": []
    },
    logs: [] 
};

// Global Variables
let PLAYER, WORLD, NPC_DB, CHAT_LOGS;
let currentTarget = null;
let gameInterval; 

// --- 2. SYSTEM STARTUP & SMART LOAD ---
window.onload = function() {
    loadGame("main");
    startGameLoop();
};

function loadGame(source = "main") {
    const key = source === "auto" ? KEY_AUTO : KEY_MAIN;
    const savedJSON = localStorage.getItem(key);

    if (savedJSON) {
        try {
            const savedData = JSON.parse(savedJSON);
            
            // MERGING DATA (Agar update code tidak merusak save lama)
            PLAYER = { ...INITIAL_STATE.player, ...savedData.player };
            PLAYER.stats = { ...INITIAL_STATE.player.stats, ...savedData.player.stats }; 
            PLAYER.status = { ...INITIAL_STATE.player.status, ...savedData.player.status };
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
                        }
                    });
                }
            }

            CHAT_LOGS = savedData.logs || [];

            // RENDER LOG
            const logArea = document.getElementById("chat-history");
            if (logArea) {
                logArea.innerHTML = "";
                CHAT_LOGS.forEach(log => renderLog(log.html, log.type));
            }

            addLog(`<i>Data dimuat: ${source.toUpperCase()}.</i>`, "system");

        } catch (e) {
            console.error("Save Error", e);
            hardReset();
        }
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
    const key = source === "auto" ? KEY_AUTO : KEY_MAIN;
    localStorage.setItem(key, JSON.stringify(data));
}

function clearSave() {
    if(confirm("HAPUS PERMANEN?")) {
        localStorage.removeItem(KEY_MAIN);
        localStorage.removeItem(KEY_AUTO);
        location.reload();
    }
}

// --- 3. LOGGING SYSTEM (INI YANG TADI HILANG) ---
function addLog(html, type, name = "") {
    const logItem = { html, type, name };
    
    // Pastikan CHAT_LOGS ada sebelum di-push
    if (!CHAT_LOGS) CHAT_LOGS = [];
    
    CHAT_LOGS.push(logItem);
    if (CHAT_LOGS.length > 50) CHAT_LOGS.shift();

    renderLog(html, type, name);
    saveGame("main");
}

function renderLog(html, type, name = "") {
    const logArea = document.getElementById("chat-history");
    if (!logArea) return; // Mencegah error jika elemen belum siap

    const div = document.createElement("div");
    div.className = `msg ${type}`;
    
    if (type === "npc") {
        div.innerHTML = `<strong>${name}</strong>${html}`;
    } else {
        div.innerHTML = html;
    }
    
    logArea.appendChild(div);
    setTimeout(() => { logArea.scrollTop = logArea.scrollHeight; }, 50);
}

// --- 4. GAME LOOP & TIME SYSTEM ---
function startGameLoop() {
    if (gameInterval) clearInterval(gameInterval);
    gameInterval = setInterval(() => {
        processGameTick();
    }, 10000); // 10 detik = 8 menit game
}

function processGameTick() {
    let oldHour = WORLD.hour;
    passTime(8, false); 

    if (PLAYER.status.hunger < 100) PLAYER.status.stamina = Math.min(PLAYER.status.maxStam, PLAYER.status.stamina + 1);
    PLAYER.status.hunger += 0.5;

    if (Math.random() < 0.1) changeWeather();
    triggerRandomEvent();

    // Auto Save jam 12 Siang & Malam
    if ((oldHour === 11 && WORLD.hour === 12) || (oldHour === 23 && WORLD.hour === 0)) {
        addLog("💾 <strong>AUTO-SAVE</strong>", "system");
        saveGame("auto");
    }
    saveGame("main"); 
    updateUI();
}

function triggerRandomEvent() {
    let notifType = "wild";
    if (PLAYER.location === "Valeryn") notifType = "city";
    if (Math.random() < 0.3) notifType = "lore";
    
    if (typeof getRandomNotif === 'function') {
        const msg = getRandomNotif(notifType); 
        let m = WORLD.minute < 10 ? "0"+WORLD.minute : WORLD.minute;
        addLog(`<span style="color:#555; font-size:0.8em;">[${WORLD.hour}:${m}] ${msg}</span>`, "system");
    }
}

function changeWeather() {
    const weathers = ["Cerah", "Berawan", "Hujan", "Badai", "Kabut"];
    const newWeather = weathers[Math.floor(Math.random() * weathers.length)];
    if (newWeather !== WORLD.weather) {
        WORLD.weather = newWeather;
        addLog(`🌦️ <strong>CUACA:</strong> ${WORLD.weather}.`, "system");
    }
}

// --- 5. ACTIONS: TRAVEL & HUNT ---
function actionTravel() {
    if (PLAYER.status.stamina < 15) { addLog("⚠️ Butuh 15 Stamina.", "system"); return; }
    let menu = `<strong>🗺️ PILIH TUJUAN:</strong><br><br>`;
    const locs = [
        { id: "Valeryn", name: "🏰 Valeryn", time: 2, cost: 10 },
        { id: "greywood", name: "🌲 Greywood", time: 3, cost: 20 },
        { id: "river_karth", name: "💧 River Karth", time: 2, cost: 15 },
        { id: "stonefall", name: "⛰️ Stonefall", time: 5, cost: 40 },
        { id: "ashplain", name: "🔥 Ashplain", time: 7, cost: 60 }
    ];
    locs.forEach(l => {
        if (l.id !== PLAYER.location) {
            let color = PLAYER.status.stamina >= l.cost ? "#ccc" : "#555";
            let click = PLAYER.status.stamina >= l.cost ? `startTravel('${l.id}', ${l.time}, ${l.cost})` : "";
            menu += `<div class="act-btn" onclick="${click}" style="color:${color}; border-color:${color}">${l.name} (${l.time}j)</div><br>`;
        }
    });
    addLog(menu, "system");
}

function startTravel(zone, hours, cost) {
    PLAYER.status.stamina -= cost;
    passTime(hours * 60, false);
    PLAYER.location = zone;
    let zoneName = zone === "Valeryn" ? "Valeryn" : zone.replace("_", " ").toUpperCase();
    addLog(`🚶 Perjalanan ${hours} jam ke <strong>${zoneName}</strong>.`, "narrator");
    updateUI();
}

function actionHunt() {
    if (PLAYER.location === "Valeryn") { addLog("🛡️ Di kota aman. Travel dulu.", "system"); return; }
    if (PLAYER.status.stamina < 10) { addLog("⚠️ Stamina habis.", "system"); return; }

    let duration = 30;
    let reasons = [];
    if (PLAYER.stats.per > 15) { duration -= 10; reasons.push("Perception"); }
    if (WORLD.weather === "Hujan") { duration += 15; reasons.push("Hujan"); }
    if (WORLD.hour > 18 || WORLD.hour < 6) { duration += 15; reasons.push("Malam"); }
    let luck = Math.floor(Math.random() * 20) - 10;
    duration += luck;
    if (duration < 10) duration = 10;

    PLAYER.status.stamina -= 10;
    passTime(duration, false);
    
    addLog(`⚔️ <strong>BERBURU (${duration}mnt)</strong> <small>(${reasons.join(",")})</small>`, "system");
    updateUI();

    setTimeout(() => executeHuntLogic(), 1500);
}

function executeHuntLogic() {
    if (typeof spawnMonster !== 'function') return;
    const monster = spawnMonster(PLAYER.location);
    if (!monster) { addLog("Tidak ada buruan.", "system"); return; }

    addLog(`⚠️ <strong>${monster.name}</strong> (Lvl ${monster.lvl}) muncul!`, "system");

    let wpnBonus = 2;
    if (PLAYER.inventory.some(i => i.id === 'wpn_003')) wpnBonus = 12;
    else if (PLAYER.inventory.some(i => i.id === 'wpn_002')) wpnBonus = 8;
    
    let pPower = PLAYER.stats.str + PLAYER.stats.agi + wpnBonus + (Math.random()*5);
    let mPower = monster.atk + (monster.hp/4);

    if (pPower >= mPower) {
        let hpLoss = (pPower - mPower < 10) ? Math.floor(monster.atk/2) : 0;
        PLAYER.status.hp -= hpLoss;
        gainExp(monster.exp);
        addLog(`✅ Menang! ${hpLoss > 0 ? `Luka -${hpLoss}HP` : "Tanpa luka."}`, "system");
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
        let hpLoss = Math.floor(monster.atk * 1.2);
        PLAYER.status.hp -= hpLoss;
        addLog(`❌ Kalah! Mundur dengan luka parah (-${hpLoss} HP).`, "system");
    }

    if (PLAYER.status.hp <= 0) {
        alert("EDRIN HALE TUMBANG. Loading Auto-save...");
        loadGame("auto");
    }
    updateUI();
}

// --- 6. UTILS, UI & CHAT ---
function gainExp(amt) {
    PLAYER.stats.exp += amt;
    if (PLAYER.stats.exp >= PLAYER.stats.maxExp) {
        PLAYER.stats.level++;
        PLAYER.stats.exp = 0;
        PLAYER.stats.maxExp = Math.floor(PLAYER.stats.maxExp * 1.5);
        PLAYER.status.maxHp += 15;
        PLAYER.status.hp = PLAYER.status.maxHp;
        PLAYER.stats.str++;
        PLAYER.stats.agi++;
        addLog(`🎉 <strong>LEVEL UP: ${PLAYER.stats.level}</strong>`, "system");
    }
}

function passTime(mins, log=true) {
    WORLD.minute += mins;
    while(WORLD.minute >= 60) { WORLD.minute -= 60; WORLD.hour++; }
    if(WORLD.hour >= 24) { WORLD.hour = 0; WORLD.day++; }
    if(log) addLog(`🕒 ${mins} menit berlalu.`, "system");
}

function updateUI() {
    if (!PLAYER || !WORLD) return; // Safety check

    let m = WORLD.minute < 10 ? "0"+WORLD.minute : WORLD.minute;
    const clockEl = document.getElementById("world-clock");
    if(clockEl) clockEl.innerHTML = `Hari ${WORLD.day} - ${WORLD.hour}:${m}<br><span style="color:var(--accent)">${WORLD.weather}</span>`;
    
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
            btn.innerHTML = `💬 ${n.name}`;
            btn.onclick = () => startDialogue(n);
            list.appendChild(btn);
        });
    } else {
        list.innerHTML = `<div style="text-align:center; padding:5px; color:#aaa; font-size:0.8em;">Lokasi: ${PLAYER.location.replace("_", " ").toUpperCase()}</div>`;
    }
}

function setBar(id, cur, max) {
    const pct = Math.min(100, Math.max(0, (cur/max)*100));
    const bar = document.getElementById(`${id}-bar`);
    const txt = document.getElementById(`${id}-txt`);
    if(bar) bar.style.width = `${pct}%`;
    if(txt) txt.innerText = `${cur}/${max}`;
}

// HELPER ACTIONS
function actionInventory() {
    let msg = `Tas (${PLAYER.status.gold}G): ${PLAYER.inventory.map(i=>i.name).join(", ") || "Kosong"}`;
    addLog(msg, "system");
}
function actionStatus() { addLog(`Status: Lvl ${PLAYER.stats.level} | Lapar ${PLAYER.status.hunger}%`, "system"); }
function actionLook() { addLog(`Lokasi: ${PLAYER.location} | Cuaca: ${WORLD.weather}`, "system"); }
function actionRest() { passTime(120); PLAYER.status.hp+=20; PLAYER.status.stamina+=40; addLog("Istirahat.", "system"); updateUI(); }

// CHAT & AI
async function startDialogue(npc) {
    if(currentTarget) return;
    currentTarget = npc;
    document.getElementById("npc-indicator").style.display="block";
    document.getElementById("target-name").innerText=npc.name;
    const res = await callGemini(`Role:${npc.name}. Player:Edrin. Memori:${npc.memories.join(". ")}`, "Sapa");
    addLog(res, "npc", npc.name);
}
function endDialogue() {
    if(currentTarget) {
        addLog("Bye.", "system");
        currentTarget=null;
        document.getElementById("npc-indicator").style.display="none";
    }
}
async function handleInput() {
    const input = document.getElementById("input-txt");
    const text = input.value.trim();
    if (!text) return;
    addLog(text, "player");
    input.value = "";
    if (currentTarget) {
        const context = `Role: ${currentTarget.name}. Ingatan: ${currentTarget.memories.join(" ")}. Jawab: "${text}"`;
        const res = await callGemini(context, text);
        addLog(res, "npc", currentTarget.name);
        currentTarget.chatCount++;
        if (currentTarget.chatCount % 3 === 0) summarizeMemory(currentTarget, text, res);
    } else {
        const res = await callGemini(`GM RPG. Lokasi: ${PLAYER.location}. Aksi: ${text}`, text);
        addLog(res, "narrator");
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
        const mem = await callGemini("Rangkum 1 fakta.", `User:${inp}, NPC:${res}`);
        npc.memories.push(mem);
        if(npc.memories.length > 5) npc.memories.shift();
    } catch(e){}
}
document.getElementById("input-txt").addEventListener("keypress", (e) => { if (e.key === "Enter") handleInput(); });