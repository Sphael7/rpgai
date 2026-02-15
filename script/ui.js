// ============================================================================
// UI & RENDERING SYSTEM - REVISED
// ============================================================================

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
    
    if (type === "npc") {
        const formattedHtml = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
        div.innerHTML = `<strong>${name}:</strong> ${formattedHtml}`;
    } else if (type.startsWith("mode-")) {
        div.innerHTML = `<strong>${type.replace("mode-","").toUpperCase()}:</strong> ${html}`;
    } else {
        div.innerHTML = html;
    }
    
    logArea.appendChild(div);
    setTimeout(() => { logArea.scrollTop = logArea.scrollHeight; }, 50);
}

function updateUI() {
    if (!PLAYER || !WORLD) return;
    let m = WORLD.minute < 10 ? "0"+WORLD.minute : WORLD.minute;
    document.getElementById("world-clock").innerHTML = `Hari ${WORLD.day} - ${WORLD.hour}:${m}<br><small>${WORLD.weather}</small>`;
    document.getElementById("p-level").innerText = PLAYER.stats.level;
    document.getElementById("p-name").innerText = PLAYER.identity.name;
    
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
    if (bar) bar.style.width = `${pct}%`;
}

async function startDialogue(npc) {
    if (currentTarget && currentTarget.id === npc.id) return;

    currentTarget = npc;
    document.getElementById("npc-indicator").style.display = "block";
    document.getElementById("target-name").innerText = `${npc.name}`;

    const totalHoursNow = (WORLD.day * 24) + WORLD.hour;
    const lastChat = npc.lastChatTime || { day: 0, hour: 0 };
    const totalHoursLast = (lastChat.day * 24) + lastChat.hour;
    const gap = totalHoursNow - totalHoursLast;

    let priceList = "";
    // Proteksi pemanggilan generatePriceList (dari shops.js)
    if (typeof generatePriceList === 'function') {
        priceList = generatePriceList(npc, WORLD.economyMod);
    }

    if (gap >= 1 || npc.chatCount === 0) {
        const cond = `Edrin tampak ${PLAYER.status.stamina < 30 ? 'letih' : 'bugar'}.`;
        const brain = (typeof NPC_BRAINS !== 'undefined') ? NPC_BRAINS[npc.id] : null;
        const bio = brain ? brain.bio : npc.role;
        
        const promptSapaan = `Berlakulah sebagai ${npc.name}. FORMAT: *aksi* "dialog". JANGAN kurung (). Kondisi: ${cond}. Bio: ${bio}`;
        
        try {
            const res = await callGemini(promptSapaan, "Mulai pembicaraan.");
            addLog(res + priceList, "npc", npc.name);
            npc.lastChatTime = { day: WORLD.day, hour: WORLD.hour };
            npc.chatCount = (npc.chatCount || 0) + 1;
        } catch (e) { console.error(e); }
    } else {
        addLog("<i>Melanjutkan pembicaraan...</i>" + priceList, "system");
    }
    updateUI();
}

function endDialogue() {
    currentTarget = null;
    document.getElementById("npc-indicator").style.display="none";
    addLog("Percakapan berakhir.", "system");
}