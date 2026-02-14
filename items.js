// FORMAT: ID: { nama, tipe, harga, deskripsi, stats (opsional) }
const ITEM_DB = {
    // --- WEAPONS (Melee & Ranged) ---
    "wpn_001": { name: "Pedang Besi Karat", type: "weapon", val: 15, desc: "Bilah tua yang tumpul.", atk: 5, dur: 50 },
    "wpn_002": { name: "Pisau Berburu", type: "weapon", val: 25, desc: "Standar pemburu Valeryn.", atk: 8, dur: 80 },
    "wpn_003": { name: "Busur Kayu Yew", type: "weapon", val: 40, desc: "Lentur dan akurat.", atk: 12, range: true },
    "wpn_004": { name: "Kapak Penebang", type: "weapon", val: 30, desc: "Berat, bisa membelah helm.", atk: 15, spd: -2 },
    "wpn_005": { name: "Tombak Milisi", type: "weapon", val: 35, desc: "Jangkauan serang lebih jauh.", atk: 10 },
    "wpn_006": { name: "Pedang Panjang Baja", type: "weapon", val: 120, desc: "Tempaan pandai besi Valeryn.", atk: 25 },
    "wpn_007": { name: "Dagger Racun", type: "weapon", val: 85, desc: "Bilahnya diolesi getah beracun.", atk: 7, effect: "poison" },
    
    // --- ARMOR (Head, Body, Legs) ---
    "arm_001": { name: "Tunik Kain Lusuh", type: "armor", slot: "body", val: 5, desc: "Lebih baik dari telanjang.", def: 1 },
    "arm_002": { name: "Rompi Kulit Serigala", type: "armor", slot: "body", val: 45, desc: "Hangat dan cukup keras.", def: 5 },
    "arm_003": { name: "Pelindung Bahu Besi", type: "armor", slot: "shoulder", val: 60, desc: "Standar prajurit.", def: 8 },
    "arm_004": { name: "Boots Pemburu", type: "armor", slot: "legs", val: 30, desc: "Kulit tebal untuk hutan.", def: 3, agi: 2 },
    "arm_005": { name: "Hood Penyamar", type: "armor", slot: "head", val: 25, desc: "Membantu bersembunyi.", def: 1, stealth: 5 },

    // --- CONSUMABLES (Potion, Food) ---
    "con_001": { name: "Roti Kering", type: "food", val: 2, desc: "Keras tapi mengenyangkan.", hunger: 10 },
    "con_002": { name: "Daging Asap", type: "food", val: 15, desc: "Enak dan bergizi.", hunger: 35, hp: 5 },
    "con_003": { name: "Ramuan Herbal Kecil", type: "potion", val: 20, desc: "Daun obat tumbuk.", hp: 20 },
    "con_004": { name: "Ramuan Darah Troll", type: "potion", val: 150, desc: "Regenerasi instan, rasa busuk.", hp: 100 },
    "con_005": { name: "Pembalut Luka", type: "med", val: 10, desc: "Kain bersih penghenti darah.", cure: "bleeding" },

    // --- MATERIALS (Loot Drop) ---
    "mat_001": { name: "Kulit Serigala", type: "material", val: 10, desc: "Bahan kerajinan dasar." },
    "mat_002": { name: "Taring Goblin", type: "material", val: 5, desc: "Sering dijadikan kalung." },
    "mat_003": { name: "Biji Besi Mentah", type: "material", val: 8, desc: "Berat dan kotor." },
    "mat_004": { name: "Sisik Naga Kecil", type: "material", val: 500, desc: "Sangat langka dan keras." },
    "mat_005": { name: "Kayu Elder", type: "material", val: 50, desc: "Kayu sihir dari hutan dalam." },
    
    // --- KEY ITEMS / SPECIAL ---
    "key_001": { name: "Lencana Pemburu", type: "key", val: 0, desc: "Bukti keanggotaan guild." },
    "key_002": { name: "Peta Avarath Kuno", type: "key", val: 200, desc: "Menunjukkan jalur rahasia." }
};

// Fungsi Helper untuk mengambil item
function getItem(id) {
    return ITEM_DB[id] ? JSON.parse(JSON.stringify(ITEM_DB[id])) : null;
}