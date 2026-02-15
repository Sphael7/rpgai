// ============================================================================
// TRADING & TRANSACTION SYSTEM - REVISED (FIXED ID LOGIC)
// ============================================================================

/**
 * Mengeksekusi transaksi setelah pemain menekan tombol TERIMA
 */
async function executeConfirmTrade(isAccepted) {
    if (!isAccepted) {
        addLog("<i>Kamu membatalkan kesepakatan tersebut.</i>", "player");
        document.querySelectorAll('.trade-confirm-box').forEach(b => b.remove());
        return;
    }

    const mode = currentTarget.tradeState.mode;
    const itemNameRaw = currentTarget.tradeState.item; 
    const price = currentTarget.tradeState.lastOffer || 0;

    // 1. Cari ID Item berdasarkan Nama dari Database (ITEM_DB)
    const itemEntry = Object.entries(ITEM_DB).find(([id, data]) => 
        data.name.toLowerCase().trim() === itemNameRaw.toLowerCase().trim()
    );
    
    if (!itemEntry) {
        addLog(`⚠️ <strong>SISTEM:</strong> Barang "${itemNameRaw}" tidak terdaftar di database.`, "system");
        document.querySelectorAll('.trade-confirm-box').forEach(b => b.remove());
        return;
    }

    const itemID = itemEntry[0]; // Mendapatkan ID asli (misal: 'con_001')
    const itemData = itemEntry[1];
    const tradeType = (mode === "JUAL" || mode === "BERI") ? "sell" : "buy";

    // 2. Jalankan Logika Pertukaran
    const success = processTrade(tradeType, itemID, price);

    if (success) {
        addLog(`🔔 <strong>SISTEM:</strong> ${mode} ${itemData.name} BERHASIL!`, "system");
    }

    // 3. Cleanup UI dan State
    document.querySelectorAll('.trade-confirm-box').forEach(b => b.remove());
    currentTarget.tradeState = { mode: "UMUM", item: null, lastOffer: null };
    updateUI();
}

/**
 * Logika internal untuk manipulasi array inventory dan gold
 */
function processTrade(type, itemID, customPrice = null) {
    const npc = currentTarget;
    if (!npc) return false;

    const detail = ITEM_DB[itemID];
    if (!detail) return false;

    if (type === "buy") {
        const itemInStock = npc.inventory.find(i => i.id === itemID);
        if (!itemInStock || itemInStock.qty <= 0) {
            addLog(`"${detail.name}" tidak tersedia di stok ${npc.name}.`, "npc", npc.name);
            return false;
        }

        const price = (customPrice !== null) ? customPrice : Math.floor(detail.val * (WORLD.economyMod || 1));

        if (PLAYER.status.gold >= price) {
            PLAYER.status.gold -= price;
            itemInStock.qty--;
            
            let pItem = PLAYER.inventory.find(pi => pi.id === itemID);
            if (pItem) pItem.qty++;
            else PLAYER.inventory.push({ id: itemID, name: detail.name, qty: 1 });
            
            addLog(`Kamu membeli <strong>${detail.name}</strong> seharga ${price}g.`, "system");
            return true;
        } else {
            addLog("Emasmu tidak cukup!", "system");
            return false;
        }
    } 
    else if (type === "sell") {
        // Mencari item di tas pemain berdasarkan ID (bukan Nama)
        const playerItemIndex = PLAYER.inventory.findIndex(pi => pi.id === itemID);
        
        if (playerItemIndex === -1 || PLAYER.inventory[playerItemIndex].qty <= 0) {
            addLog(`❌ <strong>GAGAL:</strong> Kamu tidak memiliki <strong>"${detail.name}"</strong> di tas.`, "system");
            return false;
        }

        const pItem = PLAYER.inventory[playerItemIndex];
        const sellPrice = (customPrice !== null) ? customPrice : Math.floor(detail.val * (WORLD.economyMod || 1) * 0.6);

        PLAYER.status.gold += sellPrice;
        pItem.qty--;
        
        if (pItem.qty <= 0) PLAYER.inventory.splice(playerItemIndex, 1);
        
        addLog(`Kamu menjual <strong>${detail.name}</strong> seharga ${sellPrice}g.`, "system");
        return true;
    }
    return false;
}