// ============================================================================
// PLAYER ACTIONS & AI INTERACTION - REVISED & INTEGRATED
// ============================================================================

/**
 * Fungsi Inti memanggil API Gemini
 */
async function callGemini(sys, user) {
    try {
        const payload = {
            contents: [
                {
                    role: "user",
                    parts: [{ text: `INSTRUKSI SISTEM: ${sys}\n\nINPUT PEMAIN: ${user}` }]
                }
            ],
            generationConfig: {
                temperature: 0.8,
                maxOutputTokens: 1024
            }
        };

        const res = await fetch(`${CONFIG.URL}?key=${CONFIG.API_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error?.message || "Gagal menghubungi Gemini");
        }

        const data = await res.json();
        if (data.candidates && data.candidates[0].content.parts[0].text) {
            return data.candidates[0].content.parts[0].text;
        } else {
            return "...";
        }
    } catch (e) {
        console.error("Error API:", e);
        return `[Sistem Terganggu]: ${e.message}`;
    }
}

/**
 * Menangani Input dari Kolom Chat
 */
async function handleInput() {
    const input = document.getElementById("input-txt");
    const val = input.value.trim();
    if (!val) return;

    // 1. Logika Khusus Lacak (Hunting)
    if (val.toLowerCase() === "lacak" && huntClue) {
        if (typeof executeHuntLogic === 'function') {
            executeHuntLogic(huntClue);
        }
        huntClue = null;
        input.value = "";
        return;
    }

    // 2. Jika Tidak Ada Target (Narator Mode)
    if (!currentTarget) {
        addLog(val, "player");
        const res = await callGemini(
            `Kamu adalah Narator RPG Avarath yang misterius. Gunakan format buku: *aksi* "ucapan". DILARANG tanda kurung (). Lokasi: ${PLAYER.location}.`, 
            val
        );
        addLog(res, "narrator");
        input.value = "";
        return;
    }

    // 3. Inisialisasi State Transaksi
    if (!currentTarget.tradeState) {
        currentTarget.tradeState = { mode: "UMUM", item: null, lastOffer: null };
    }

    let cleanMsg = val;
    let mode = currentTarget.tradeState.mode;
    let logType = "player";

    // Deteksi Mode lewat Prefix
    if (val.startsWith("/jual ")) {
        mode = "JUAL";
        cleanMsg = val.substring(6);
        currentTarget.tradeState.mode = "JUAL";
    } else if (val.startsWith("/beli ")) {
        mode = "BELI";
        cleanMsg = val.substring(6);
        currentTarget.tradeState.mode = "BELI";
    } else if (val.startsWith("/beri ")) {
        mode = "BERI";
        cleanMsg = val.substring(6);
        currentTarget.tradeState.mode = "BERI";
    }

    if (mode !== "UMUM") logType = `mode-${mode.toLowerCase()}`;
    addLog(val, logType);
    input.value = "";

    // SCAN ID ITEM: Mencari nama item yang paling cocok dari ITEM_DB
    const items = Object.values(ITEM_DB);
    const foundItem = items.find(i => cleanMsg.toLowerCase().includes(i.name.toLowerCase()));
    
    // Simpan NAMA item agar AI bisa menyebutkannya kembali
    if (foundItem) {
        currentTarget.tradeState.item = foundItem.name;
    }

    // Ambil Otak NPC
    const brain = (typeof NPC_BRAINS !== 'undefined' && NPC_BRAINS[currentTarget.id]) ? 
                  NPC_BRAINS[currentTarget.id] : 
                  { dialek: "Warga", style: "Biasa", bio: "Warga Avarath", bias: 1.0 };

    const context = `
        IDENTITAS: Kamu adalah ${currentTarget.name}. 
        KEPRIBADIAN: ${brain.style}. 
        LATAR BELAKANG: ${brain.bio}.
        DIALEK: ${brain.dialek}.
        SITUASI: Edrin sedang dalam mode ${mode}.
        ITEM: ${currentTarget.tradeState.item || "Belum ditentukan"}.

        FORMAT WAJIB: 
        - JANGAN GUNAKAN TANDA KURUNG (). 
        - Gunakan asterik untuk *aksi/suasana* dan tanda petik untuk "dialog".
        - Contoh: *Menggaruk dagunya yang kasar.* "Aku belum pernah melihat barang ini."

        TUGAS:
        - Jika JUAL/BELI, lakukan negosiasi dengan menyebutkan ANGKA koin sebagai tawaranmu.
        - Jika tawaran masuk akal, katakan setuju.
    `;

    try {
        const res = await callGemini(context, cleanMsg);
        addLog(res, "npc", currentTarget.name);

        const npcPriceMatch = res.match(/\d+/);
        
        // Mode BERI langsung eksekusi tanpa konfirmasi harga
        if (mode === "BERI" && currentTarget.tradeState.item) {
            if (typeof executeConfirmTrade === 'function') executeConfirmTrade(true); 
            return;
        }

        // Mode JUAL/BELI munculkan UI Elegan untuk Konfirmasi
        if (npcPriceMatch && mode !== "UMUM" && currentTarget.tradeState.item) {
            const offeredPrice = parseInt(npcPriceMatch[0]);
            currentTarget.tradeState.lastOffer = offeredPrice;

            const confirmHTML = `
                <div class="trade-confirm-box" style="
                    margin: 15px 0;
                    padding: 18px;
                    background: linear-gradient(145deg, #111, #1a1a1a);
                    border: 1px solid var(--accent);
                    border-left: 5px solid var(--accent);
                    border-radius: 10px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.6);
                ">
                    <div style="font-family: 'Cinzel', serif; font-size: 0.7rem; color: var(--accent); letter-spacing: 2px; margin-bottom: 8px;">PERSETUJUAN PERDAGANGAN</div>
                    <div style="font-size: 0.95rem; color: #fff; margin-bottom: 20px; line-height: 1.5;">
                        Terima tawaran <span style="color: #ffd700; font-weight: bold;">${offeredPrice} Gold</span> untuk <span style="color: #8be9fd;">${currentTarget.tradeState.item}</span>?
                    </div>
                    <div style="display: flex; gap: 12px;">
                        <button onclick="executeConfirmTrade(true)" style="flex: 1; padding: 10px; background: #27ae60; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">TERIMA</button>
                        <button onclick="executeConfirmTrade(false)" style="flex: 1; padding: 10px; background: #c0392b; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">TOLAK</button>
                    </div>
                </div>
            `;
            addLog(confirmHTML, "system");
        }

        // Simpan Memori Percakapan NPC
        if (!currentTarget.memories) currentTarget.memories = [];
        currentTarget.memories.push(`${WORLD.day}/${WORLD.hour}: Edrin ${mode} ${currentTarget.tradeState.item}`);

    } catch (e) { 
        addLog("<i>NPC tampak terdiam sejenak...</i>", "system"); 
    }
}

/**
 * Fungsi Aksi Tombol Sidebar
 */
async function generateNewNPC() {
    if (PLAYER.status.stamina < 5) { addLog("Kamu terlalu lelah.", "system"); return; }
    addLog("<i>Mencoba memanggil seseorang di sekitar...</i>", "system");
    PLAYER.status.stamina -= 5;
    
    const prompt = `Buat 1 NPC unik untuk lokasi ${PLAYER.location}. Format JSON: {"name": "nama", "role": "pekerjaan", "desc": "sifat", "bio": "sejarah", "schedule": {"work": {"s": 8, "e": 16, "l": "lokasi"}, "rest": {"s": 17, "e": 7, "l": "rumah"}}}`;
    
    try {
        const response = await callGemini(prompt, "Hasilkan data NPC baru.");
        const cleanJson = response.replace(/```json|```/gi, "").trim();
        const newNPCData = JSON.parse(cleanJson);
        newNPCData.id = "gen_" + Date.now();
        
        if (!NPC_DB[PLAYER.location]) NPC_DB[PLAYER.location] = [];
        NPC_DB[PLAYER.location].push(newNPCData);
        
        addLog(`Seseorang yang terlihat seperti <strong>${newNPCData.role}</strong> mendekat.`, "narrator");
        if (typeof updateNPCLiveState === 'function') updateNPCLiveState();
        if (typeof updateUI === 'function') updateUI();
    } catch (e) { 
        addLog("Tidak ada orang di sekitar saat ini.", "system"); 
    }
}

async function actionHunt() {
    if (PLAYER.location === "Valeryn") { addLog("🛡️ Valeryn aman dari monster. Pergilah ke Wilderness.", "system"); return; }
    if (huntClue) { addLog("🔍 Selesaikan pelacakanmu dulu (ketik 'lacak').", "system"); return; }
    if (PLAYER.status.stamina < 15) { addLog("⚠️ Kamu butuh 15 Stamina untuk berburu.", "system"); return; }
    
    PLAYER.status.stamina -= 15;
    if (typeof passTime === 'function') passTime(45, false);
    
    if (typeof spawnMonster === 'function') {
        huntClue = spawnMonster(PLAYER.location, WORLD.hour < 6 || WORLD.hour > 18);
        if (huntClue) addLog(`🐾 <strong>JEJAK:</strong> Kamu melihat tanda keberadaan <strong>${huntClue.name}</strong>.`, "narrator");
        else addLog("Hutan ini terasa sangat sunyi.", "narrator");
    }
    if (typeof updateUI === 'function') updateUI();
}

function actionTravel() {
    let menu = `<div style="padding:10px; border:1px solid #333; border-radius:5px;"><strong>🗺️ PILIH TUJUAN:</strong><br><br>`;
    const locs = [
        { id: "Valeryn", name: "🏰 Valeryn", h: 2, cost: 10 },
        { id: "greywood", name: "🌲 Greywood", h: 3, cost: 20 },
        { id: "river_karth", name: "💧 River Karth", h: 2, cost: 15 }
    ];
    locs.forEach(l => {
        if (l.id !== PLAYER.location) {
            menu += `<div class="act-btn" style="margin-bottom:5px;" onclick="startTravel('${l.id}',${l.h},${l.cost})">${l.name} (${l.cost} Stamina)</div>`;
        }
    });
    menu += `</div>`;
    addLog(menu, "system");
}

function startTravel(zone, h, cost) {
    if (PLAYER.status.stamina < cost) { addLog("Stamina tidak cukup!", "system"); return; }
    PLAYER.status.stamina -= cost;
    PLAYER.status.hygiene -= 10;
    if (typeof passTime === 'function') passTime(h * 60, false);
    PLAYER.location = zone;
    if (typeof updateNPCLiveState === 'function') updateNPCLiveState();
    addLog(`🚶 Kamu menempuh perjalanan jauh ke <strong>${zone.toUpperCase()}</strong>.`, "narrator");
    if (typeof updateUI === 'function') updateUI();
}

function actionRest() { 
    if (typeof passTime === 'function') passTime(480); 
    PLAYER.status.sleep = 0; 
    PLAYER.status.hp = PLAYER.status.maxHp;
    PLAYER.status.stamina = PLAYER.status.maxStam;
    if (PLAYER.location === "Valeryn") PLAYER.status.hygiene = 100; 
    addLog("💤 Kamu beristirahat dengan sangat lelap.", "system"); 
    if (typeof updateUI === 'function') updateUI(); 
}

function actionInventory() { 
    const items = PLAYER.inventory.map(i => `<span style="color:#8be9fd;">${i.name}</span> (x${i.qty})`).join(", ");
    addLog(`🎒 <strong>ISI TAS:</strong> ${items || "Kosong"}`, "system"); 
}

function actionStatus() { 
    addLog(`👤 <strong>STATUS:</strong> Gold: <span style="color:gold">${PLAYER.status.gold}g</span> | Kebersihan: ${Math.floor(PLAYER.status.hygiene)}% | Lapar: ${Math.floor(PLAYER.status.hunger)}%`, "system"); 
}

function actionLook() { 
    let m = WORLD.minute < 10 ? "0" + WORLD.minute : WORLD.minute;
    addLog(`👁️ <strong>OBSERVASI:</strong> Lokasi: ${PLAYER.location} | Cuaca: ${WORLD.weather} | Waktu: ${WORLD.hour}:${m}`, "system"); 
}

// Event Listener Enter Key
document.getElementById("input-txt").addEventListener("keypress", (e) => { 
    if (e.key === "Enter") handleInput(); 
});