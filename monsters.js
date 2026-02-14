const MONSTER_DB = {
    // 1. GREYWOOD FRINGE (Lvl 1-3) - Wilayah Utama Edrin
    "greywood": [
        // Hewan Biasa
        { id: "gw_rat", name: "Tikus Lumut Besar", lvl: 1, hp: 15, atk: 2, exp: 5, drops: [{id:"mat_001", chance:0.5}] },
        { id: "gw_rabbit", name: "Kelinci Bertanduk", lvl: 1, hp: 10, atk: 1, exp: 5, drops: [{id:"con_002", chance:0.6}] },
        { id: "gw_fox", name: "Rubah Merah", lvl: 2, hp: 25, atk: 4, exp: 10, drops: [{id:"mat_001", chance:0.4}] },
        { id: "gw_boar_s", name: "Babi Hutan Kecil", lvl: 2, hp: 30, atk: 5, exp: 12, drops: [{id:"con_002", chance: 0.5}] },
        { id: "gw_boar_l", name: "Induk Babi Hutan", lvl: 4, hp: 60, atk: 10, exp: 25, drops: [{id:"mat_001", chance: 0.8}] },
        { id: "gw_stag", name: "Rusa Hutan", lvl: 3, hp: 40, atk: 4, exp: 15, drops: [{id:"con_002", chance: 0.7}] },
        // Monster Rendah
        { id: "gw_gob_scout", name: "Goblin Pengintai", lvl: 3, hp: 35, atk: 6, exp: 18, drops: [{id:"mat_002", chance: 0.4}] },
        { id: "gw_gob_war", name: "Goblin Penjarrah", lvl: 4, hp: 50, atk: 8, exp: 25, drops: [{id:"wpn_001", chance: 0.1}] },
        { id: "gw_slime", name: "Lendir Hijau", lvl: 1, hp: 20, atk: 2, exp: 8, drops: [] },
        { id: "gw_spider_s", name: "Laba-laba Akar", lvl: 2, hp: 25, atk: 5, exp: 12, drops: [{id:"mat_003", chance: 0.3}] },
        { id: "gw_spider_l", name: "Penenun Racun", lvl: 5, hp: 70, atk: 12, exp: 35, drops: [{id:"wpn_007", chance: 0.05}] },
        { id: "gw_wolf_lone", name: "Serigala Terbuang", lvl: 3, hp: 45, atk: 9, exp: 20, drops: [{id:"mat_001", chance: 0.6}] },
        { id: "gw_wolf_pack", name: "Serigala Greywood", lvl: 4, hp: 55, atk: 11, exp: 28, drops: [{id:"mat_001", chance: 0.7}] },
        { id: "gw_wolf_alpha", name: "Alpha Greywood", lvl: 6, hp: 100, atk: 15, exp: 60, drops: [{id:"arm_002", chance: 0.1}] },
        { id: "gw_ent_s", name: "Anakan Ent (Kayu Hidup)", lvl: 5, hp: 80, atk: 8, exp: 40, drops: [{id:"mat_005", chance: 0.5}] },
        { id: "gw_bandit", name: "Bandit Pinggiran", lvl: 4, hp: 50, atk: 7, exp: 22, drops: [{id:"con_001", chance: 0.3}] },
        { id: "gw_bear", name: "Beruang Coklat", lvl: 7, hp: 150, atk: 20, exp: 80, drops: [{id:"mat_001", chance: 1.0}] },
        { id: "gw_plant", name: "Tanaman Karnivora", lvl: 3, hp: 40, atk: 6, exp: 15, drops: [{id:"con_003", chance: 0.4}] },
        { id: "gw_crow", name: "Gagak Mata Merah", lvl: 1, hp: 10, atk: 3, exp: 5, drops: [] },
        { id: "gw_ghost", name: "Arwah Tersesat", lvl: 5, hp: 40, atk: 10, exp: 30, drops: [] }
    ],

    // 2. STONEFALL RAVINE (Lvl 4-8) - Berisiko Tinggi
    "stonefall": [
        { id: "sf_goat", name: "Kambing Gunung", lvl: 3, hp: 40, atk: 5, exp: 15, drops: [{id:"con_002", chance: 0.5}] },
        { id: "sf_eagle", name: "Elang Batu", lvl: 5, hp: 60, atk: 12, exp: 30, drops: [{id:"mat_002", chance: 0.3}] },
        { id: "sf_harpy", name: "Harpy Muda", lvl: 6, hp: 70, atk: 14, exp: 40, drops: [{id:"mat_002", chance: 0.4}] },
        { id: "sf_harpy_q", name: "Matriark Harpy", lvl: 9, hp: 120, atk: 18, exp: 80, drops: [{id:"wpn_007", chance: 0.1}] },
        { id: "sf_lizard", name: "Kadal Granit", lvl: 4, hp: 50, atk: 8, exp: 20, drops: [{id:"mat_003", chance: 0.2}] },
        { id: "sf_golem_s", name: "Kerikil Hidup", lvl: 4, hp: 80, atk: 5, exp: 25, drops: [{id:"mat_003", chance: 0.8}] },
        { id: "sf_golem_m", name: "Golem Batu", lvl: 8, hp: 200, atk: 20, exp: 100, drops: [{id:"mat_003", chance: 1.0}] },
        { id: "sf_kobold", name: "Kobold Penambang", lvl: 4, hp: 45, atk: 7, exp: 20, drops: [{id:"con_005", chance: 0.2}] },
        { id: "sf_kobold_w", name: "Kobold Pelempar", lvl: 5, hp: 50, atk: 9, exp: 25, drops: [{id:"mat_003", chance: 0.3}] },
        { id: "sf_bat", name: "Kelelawar Gua", lvl: 2, hp: 20, atk: 4, exp: 8, drops: [] },
        { id: "sf_bat_l", name: "Kelelawar Raksasa", lvl: 5, hp: 60, atk: 10, exp: 30, drops: [{id:"mat_001", chance: 0.4}] },
        { id: "sf_bandit_h", name: "Bandit Pegunungan", lvl: 6, hp: 90, atk: 12, exp: 45, drops: [{id:"wpn_004", chance: 0.1}] },
        { id: "sf_elemental", name: "Roh Angin", lvl: 7, hp: 60, atk: 15, exp: 50, drops: [] },
        { id: "sf_spider_c", name: "Laba-laba Celah", lvl: 5, hp: 70, atk: 11, exp: 35, drops: [{id:"con_003", chance: 0.2}] },
        { id: "sf_wyrm", name: "Cacing Batu", lvl: 6, hp: 100, atk: 10, exp: 50, drops: [{id:"mat_003", chance: 0.5}] },
        { id: "sf_orc", name: "Orc Pemburu", lvl: 8, hp: 130, atk: 18, exp: 70, drops: [{id:"wpn_005", chance: 0.2}] },
        { id: "sf_troll", name: "Troll Gua Kecil", lvl: 10, hp: 250, atk: 25, exp: 150, drops: [{id:"con_004", chance: 0.8}] },
        { id: "sf_griffin", name: "Anak Griffin", lvl: 9, hp: 180, atk: 22, exp: 120, drops: [{id:"mat_002", chance: 0.6}] },
        { id: "sf_beetle", name: "Kumbang Besi", lvl: 5, hp: 100, atk: 6, exp: 30, drops: [{id:"arm_003", chance: 0.05}] },
        { id: "sf_dummy", name: "Patung Latihan Kuno", lvl: 1, hp: 500, atk: 0, exp: 0, drops: [] }
    ],

    // 3. ASHPLAIN EDGE (Lvl 8+) - Wilayah Naga/Mayat Hidup
    "ashplain": [
        { id: "ap_skel", name: "Tengkorak Prajurit", lvl: 8, hp: 100, atk: 15, exp: 50, drops: [{id:"wpn_001", chance: 0.3}] },
        { id: "ap_skel_arch", name: "Tengkorak Pemanah", lvl: 8, hp: 80, atk: 18, exp: 55, drops: [{id:"wpn_002", chance: 0.2}] },
        { id: "ap_zombie", name: "Mayat Hangus", lvl: 7, hp: 150, atk: 12, exp: 45, drops: [] },
        { id: "ap_imp", name: "Imp Api", lvl: 6, hp: 60, atk: 20, exp: 40, drops: [{id:"mat_003", chance: 0.2}] },
        { id: "ap_rat", name: "Tikus Abu", lvl: 4, hp: 40, atk: 8, exp: 15, drops: [] },
        { id: "ap_hound", name: "Anjing Neraka", lvl: 9, hp: 120, atk: 22, exp: 70, drops: [{id:"mat_002", chance: 0.5}] },
        { id: "ap_wisp", name: "Wisp Panas", lvl: 5, hp: 30, atk: 25, exp: 30, drops: [] },
        { id: "ap_golem", name: "Golem Magma", lvl: 12, hp: 300, atk: 30, exp: 200, drops: [{id:"mat_003", chance: 1.0}] },
        { id: "ap_drake", name: "Drake (Naga Kecil)", lvl: 15, hp: 400, atk: 40, exp: 500, drops: [{id:"mat_004", chance: 1.0}] },
        { id: "ap_cultist", name: "Pemuja Naga", lvl: 10, hp: 110, atk: 18, exp: 80, drops: [{id:"con_003", chance: 0.5}] },
        { id: "ap_spirit", name: "Roh Dendam", lvl: 9, hp: 90, atk: 20, exp: 65, drops: [] },
        { id: "ap_vulture", name: "Burung Bangkai", lvl: 6, hp: 70, atk: 12, exp: 35, drops: [{id:"mat_002", chance: 0.3}] },
        { id: "ap_scorp", name: "Kalajengking Pasir", lvl: 7, hp: 80, atk: 15, exp: 45, drops: [{id:"wpn_007", chance: 0.1}] },
        { id: "ap_knight", name: "Ksatria Jatuh", lvl: 13, hp: 200, atk: 25, exp: 150, drops: [{id:"wpn_006", chance: 0.1}] },
        { id: "ap_worm", name: "Cacing Abu", lvl: 8, hp: 150, atk: 14, exp: 60, drops: [] },
        { id: "ap_elemental", name: "Elemental Debu", lvl: 10, hp: 180, atk: 18, exp: 90, drops: [] },
        { id: "ap_mimic", name: "Peti Harta (Mimic)", lvl: 11, hp: 250, atk: 30, exp: 180, drops: [{id:"key_002", chance: 1.0}] },
        { id: "ap_boss", name: "Jenderal Tengkorak", lvl: 18, hp: 600, atk: 45, exp: 800, drops: [{id:"wpn_006", chance: 0.5}] },
        { id: "ap_shade", name: "Bayangan", lvl: 9, hp: 50, atk: 28, exp: 70, drops: [] },
        { id: "ap_bird", name: "Phoenix Mati", lvl: 14, hp: 350, atk: 35, exp: 300, drops: [{id:"mat_004", chance: 0.2}] }
    ],

    // 4. RIVER KARTH LOWLANDS (Lvl 1-2) - Aman / Makanan
    "river_karth": [
        { id: "rk_duck", name: "Bebek Liar", lvl: 1, hp: 10, atk: 0, exp: 5, drops: [{id:"con_002", chance: 0.8}] },
        { id: "rk_fish", name: "Ikan Sungai", lvl: 1, hp: 5, atk: 0, exp: 2, drops: [{id:"con_001", chance: 0.9}] },
        { id: "rk_frog", name: "Katak Raksasa", lvl: 2, hp: 20, atk: 3, exp: 8, drops: [{id:"mat_001", chance: 0.2}] },
        { id: "rk_crab", name: "Kepiting Lumpur", lvl: 2, hp: 30, atk: 4, exp: 10, drops: [{id:"con_001", chance: 0.5}] },
        { id: "rk_snake", name: "Ular Air", lvl: 3, hp: 25, atk: 6, exp: 12, drops: [{id:"mat_002", chance: 0.3}] },
        { id: "rk_croc", name: "Buaya Sungai", lvl: 6, hp: 120, atk: 15, exp: 50, drops: [{id:"mat_001", chance: 0.8}] },
        { id: "rk_turtle", name: "Kura-kura Batu", lvl: 3, hp: 80, atk: 2, exp: 15, drops: [{id:"arm_003", chance: 0.1}] },
        { id: "rk_mosquito", name: "Nyamuk Rawa", lvl: 1, hp: 5, atk: 1, exp: 2, drops: [] },
        { id: "rk_leech", name: "Lintah Raksasa", lvl: 2, hp: 15, atk: 3, exp: 6, drops: [{id:"con_005", chance: 0.2}] },
        { id: "rk_slime", name: "Lendir Biru", lvl: 2, hp: 25, atk: 3, exp: 8, drops: [] },
        { id: "rk_spirit", name: "Roh Air Kecil", lvl: 4, hp: 40, atk: 8, exp: 20, drops: [] },
        { id: "rk_bandit", name: "Penyelundup Sungai", lvl: 5, hp: 60, atk: 10, exp: 30, drops: [{id:"wpn_002", chance: 0.2}] },
        { id: "rk_deer", name: "Rusa Minum", lvl: 2, hp: 35, atk: 2, exp: 10, drops: [{id:"con_002", chance: 0.8}] },
        { id: "rk_rat", name: "Tikus Rawa", lvl: 1, hp: 12, atk: 2, exp: 4, drops: [] },
        { id: "rk_plant", name: "Teratai Berduri", lvl: 3, hp: 50, atk: 5, exp: 15, drops: [{id:"con_003", chance: 0.5}] },
        { id: "rk_lizard", name: "Biawak", lvl: 4, hp: 60, atk: 8, exp: 25, drops: [{id:"mat_001", chance: 0.4}] },
        { id: "rk_toad", name: "Kodok Racun", lvl: 5, hp: 45, atk: 7, exp: 20, drops: [{id:"wpn_007", chance: 0.05}] },
        { id: "rk_merchant", name: "Pedagang Keliling (NPC)", lvl: 10, hp: 200, atk: 20, exp: 0, drops: [] }, // Jangan dibunuh
        { id: "rk_gull", name: "Burung Camar", lvl: 1, hp: 10, atk: 2, exp: 5, drops: [] },
        { id: "rk_naga", name: "Naga Air (Mitos)", lvl: 20, hp: 1000, atk: 100, exp: 5000, drops: [] }
    ]
};

function spawnMonster(zone) {
    const list = MONSTER_DB[zone];
    if (!list) return null;
    const template = list[Math.floor(Math.random() * list.length)];
    return JSON.parse(JSON.stringify(template));
}