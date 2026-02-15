// shops.js - Database Toko dan Logika Perdagangan Avarath (Revised)

const SHOPS = {
    "Valeryn": [
        {
            id: "shop_hilda",
            name: "Hilda",
            role: "Pedagang Pasar",
            bio: "Seorang wanita paruh baya yang ceria, mengelola 'Kedai Hilda'. Dia adalah pusat gosip di pasar Valeryn.",
            markup: 1.0,
            inventory: [
                { id: "con_006", qty: 50 }, // Apel Segar
                { id: "con_012", qty: 25 }, // Roti Keju Thornwall
                { id: "con_047", qty: 15 }, // Jus Jeruk Segar
                { id: "mat_016", qty: 40 }, // Kain Linen
                { id: "con_023", qty: 12 }, // Minyak Senjata
                { id: "con_044", qty: 30 }, // Permen Energi
                { id: "con_001", qty: 50 }  // Roti Kering
            ],
            welcomeMsg: "Selamat pagi, nak! Butuh perbekalan segar atau sekadar mendengar kabar terbaru?"
        },
        {
            id: "shop_kael",
            name: "Kael",
            role: "Pemasok Militer",
            bio: "Mantan sersan penjaga gerbang yang mengelola gudang persenjataan. Tegas dan sangat menghargai baja berkualitas.",
            markup: 1.1,
            inventory: [
                { id: "wpn_013", qty: 3 },  // Kapak Perang Ganda
                { id: "wpn_025", qty: 4 },  // Halberd Penjaga
                { id: "arm_006", qty: 10 }, // Helm Prajurit Valeryn
                { id: "arm_011", qty: 5 },  // Chainmail Ringan
                { id: "arm_033", qty: 6 },  // Buckler Besi
                { id: "arm_040", qty: 4 },  // Pauldrons Berduri
                { id: "wpn_008", qty: 15 }, // Gada Kayu Berpaku
                { id: "wpn_010", qty: 2 }   // Claymore Karat
            ],
            welcomeMsg: "Pastikan zirarmu kokoh sebelum keluar gerbang. Valeryn tidak butuh prajurit mati."
        },
        {
            id: "shop_ren",
            name: "Ren",
            role: "Tabib Muda",
            bio: "Pemuda eksentrik yang terobsesi dengan alkimia. Tokonya selalu dipenuhi botol berasap dan bau tanaman obat.",
            markup: 1.0,
            inventory: [
                { id: "con_008", qty: 20 }, // Ramuan Mana Kecil
                { id: "con_013", qty: 15 }, // Ramuan Antidote
                { id: "con_035", qty: 8 },  // Ramuan Penglihatan Malam
                { id: "con_028", qty: 25 }, // Scroll of Identify
                { id: "con_003", qty: 30 }, // Ramuan Herbal Kecil
                { id: "con_043", qty: 10 }, // Bubuk Tidur
                { id: "mat_020", qty: 5 }   // Akar Mandrake
            ],
            welcomeMsg: "Oh, kau tidak menyentuh ramuan hijau itu kan? Itu masih dalam tahap percobaan... Ada yang bisa kubantu?"
        }
    ],
    "Marrowport": [
        {
            id: "shop_silas",
            name: "Silas",
            role: "Pedagang Eksotis",
            bio: "Berpakaian sutra dan penuh perhiasan. Silas mengimpor barang dari luar negeri untuk kaum elit.",
            markup: 1.4,
            inventory: [
                { id: "wpn_015", qty: 2 },  // Katana Impor
                { id: "wpn_007", qty: 5 },  // Dagger Racun
                { id: "arm_005", qty: 4 },  // Hood Penyamar
                { id: "key_010", qty: 2 },  // Peta Harta Karun
                { id: "arm_049", qty: 3 },  // Bracer Emas
                { id: "wpn_017", qty: 5 }   // Crossbow Ringan
            ],
            welcomeMsg: "Hanya barang-barang terbaik dari seberang laut untuk pelanggan dengan dompet tebal."
        },
        {
            id: "shop_finn",
            name: "Finn",
            role: "Pedagang Ikan & Alat Laut",
            bio: "Pria tua bertato jangkar yang menyediakan segala kebutuhan untuk menghadapi laut ganas.",
            markup: 0.9,
            inventory: [
                { id: "con_011", qty: 40 }, // Bir Marrowport
                { id: "wpn_018", qty: 12 }, // Trident Nelayan
                { id: "mat_012", qty: 30 }, // Minyak Ikan Paus
                { id: "mat_027", qty: 20 }, // Gigi Hiu
                { id: "arm_042", qty: 3 },  // Helm Penyelam
                { id: "mat_034", qty: 1 }   // Mutiara Hitam
            ],
            welcomeMsg: "Ikan hari ini segar, tapi jika kau mau berburu monster laut, kau butuh lebih dari sekadar umpan."
        }
    ],
    "Aerthale": [
        {
            id: "shop_mira",
            name: "Mira",
            role: "Alkemis Menara",
            bio: "Mira mengelola laboratorium alkimia di Aerthale. Sangat teliti dan sedikit dingin kepada orang asing.",
            markup: 1.2,
            inventory: [
                { id: "con_009", qty: 10 }, // Ramuan Mana Besar
                { id: "con_010", qty: 12 }, // Elixir Kekuatan
                { id: "con_026", qty: 3 },  // Ramuan Tak Terlihat
                { id: "con_022", qty: 8 },  // Ramuan Kulit Besi
                { id: "mat_008", qty: 20 }, // Esens Mana
                { id: "con_032", qty: 15 }  // Teh Herbal Aerthale
            ],
            welcomeMsg: "Jangan berisik. Katakan apa yang kau butuhkan sebelum ramuanku menguap."
        },
        {
            id: "shop_lysandra",
            name: "Lysandra",
            role: "Penjaga Gulungan",
            bio: "Matanya selalu tampak bersinar karena terlalu sering terpapar energi Mana. Menjual sihir dalam bentuk tertulis.",
            markup: 1.5,
            inventory: [
                { id: "wpn_020", qty: 2 },  // Staf Kristal Biru
                { id: "con_014", qty: 20 }, // Scroll Town Portal
                { id: "con_015", qty: 10 }, // Scroll Fireball
                { id: "con_039", qty: 5 },  // Scroll Blizzard
                { id: "con_049", qty: 8 },  // Scroll Lightning Bolt
                { id: "wpn_043", qty: 1 }   // Staf Penatua (Sangat Mahal)
            ],
            welcomeMsg: "Ilmu pengetahuan yang kau bawa akan menentukan apakah kau layak menggunakan gulungan-gulungan ini."
        }
    ],
    "Thornwall": [
        {
            id: "shop_tobias",
            name: "Tobias",
            role: "Tengkulak Pangan",
            bio: "Selalu memegang buku catatan besar. Dia memastikan setiap butir gandum dari Thornwall terjual dengan harga pas.",
            markup: 0.8,
            inventory: [
                { id: "con_012", qty: 100 }, // Roti Keju
                { id: "con_025", qty: 60 },  // Susu Sapi
                { id: "con_006", qty: 80 },  // Apel
                { id: "con_040", qty: 50 },  // Garam Pengawet
                { id: "con_050", qty: 5 },   // Pesta dalam Kotak
                { id: "con_002", qty: 40 }   // Daging Asap
            ],
            welcomeMsg: "Thornwall memberi makan kerajaan. Mau beli sedikit atau untuk satu kompi?"
        },
        {
            id: "shop_marta",
            name: "Marta",
            role: "Pengepul Bahan",
            bio: "Marta mengumpulkan segala sesuatu dari alam liar di sekitar Thornwall dan menjualnya kepada pengrajin.",
            markup: 1.0,
            inventory: [
                { id: "con_017", qty: 20 }, // Madu Hutan Dalam
                { id: "mat_001", qty: 50 }, // Kulit Serigala
                { id: "mat_005", qty: 15 }, // Kayu Elder
                { id: "mat_024", qty: 10 }, // Bulu Serigala Putih
                { id: "mat_007", qty: 25 }, // Benang Sutra
                { id: "mat_038", qty: 5 }   // Bunga Edelweiss Gletser
            ],
            welcomeMsg: "Alam liar menyediakan segalanya, nak. Kau hanya perlu tahu cara mengambilnya."
        }
    ],
    "stonehollow": [
        {
            id: "shop_borg",
            name: "Borg",
            role: "Penambang Granit",
            bio: "Berbadan kekar dan bersuara berat. Borg menguasai perdagangan batu dan logam mentah di wilayah Stonefall.",
            markup: 1.0,
            inventory: [
                { id: "wpn_016", qty: 5 },  // Warhammer Batu
                { id: "mat_003", qty: 60 }, // Biji Besi Mentah
                { id: "mat_006", qty: 100 },// Batu Bara
                { id: "mat_010", qty: 25 }, // Batu Obsidian
                { id: "mat_019", qty: 20 }, // Baja Valeryn
                { id: "mat_029", qty: 2 }   // Batu Meteorit
            ],
            welcomeMsg: "Batu dan logam adalah fondasi dunia. Pilih bebanmu, pengelana."
        }
    ]
};

// Fungsi Helper untuk menghasilkan tampilan daftar harga otomatis
function generatePriceList(npc, economyMod) {
    if (!npc.inventory || npc.inventory.length === 0) return "";
    
    const currentMarkup = npc.tempMarkup || npc.markup || 1.0;
    let html = `<div style="border:1px solid #444; padding:12px; margin:12px 0; font-size:0.85em; background:#050505; color:#eee; border-radius:6px; box-shadow: 0 4px 10px rgba(0,0,0,0.5);">`;
    html += `<div style="text-align:center; border-bottom:1px solid #444; margin-bottom:12px; padding-bottom:8px;">`;
    html += `<strong style="color:var(--accent); font-family:'Cinzel', serif; letter-spacing:1px; font-size:1.1em;">📜 DAFTAR BARANG - ${npc.role.toUpperCase()}</strong>`;
    html += `</div>`;
    
    npc.inventory.forEach(i => {
        const item = getItem(i.id);
        if (!item) return;
        const finalPrice = Math.floor(item.val * economyMod * currentMarkup);
        html += `<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px; padding:4px 8px; background:rgba(255,255,255,0.03); border-radius:3px;">
                    <span title="${item.desc}">${item.name} <small style="color:#777;">(x${i.qty})</small></span>
                    <span style="color:gold; font-weight:bold;">${finalPrice}g</span>
                 </div>`;
    });
    
    html += `<div style="margin-top:12px; font-size:0.75em; color:#666; text-align:center; font-style:italic; border-top:1px solid #222; padding-top:8px;">
                * Harga sudah termasuk pajak wilayah dan kondisi ekonomi saat ini.
             </div>`;
    html += `</div>`;
    return html;
}