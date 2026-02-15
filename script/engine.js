// ============================================================================
// GAME ENGINE & WORLD LOGIC
// ============================================================================

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

function updateNPCLiveState() {
    const loc = PLAYER.location;
    
    if (!NPC_DB[loc]) {
        const templates = NPC_TEMPLATES[loc] || [];
        const shops = (typeof SHOPS !== 'undefined' && SHOPS[loc]) ? SHOPS[loc] : []; 
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
        if (!npc.longTermSummary) npc.longTermSummary = "Belum ada sejarah panjang.";
        if (!npc.chatCount) npc.chatCount = 0;
        if (!npc.lastChatTime) npc.lastChatTime = { day: WORLD.day, hour: WORLD.hour };
        if (!npc.inventory) npc.inventory = [];
    });
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

function passTime(mins, log=true) {
    WORLD.minute += mins;
    while(WORLD.minute >= 60) { WORLD.minute -= 60; WORLD.hour++; }
    if(WORLD.hour >= 24) { WORLD.hour = 0; WORLD.day++; }
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