const WORLD_LORE = `
Dunia: Avarath. Wilayah Manusia: Embercrest (1/16 dunia).
Kota Manusia:
1. Valeryn (Pusat Militer/Baja, Kaki Gunung).
2. Aerthale (Pusat Magic/Ilmu, Lereng Hutan).
3. Thornwall (Pusat Pangan/Pertanian, Dataran Subur).
4. Marrowport (Pelabuhan/Dagang, Sungai ke Laut Selatan).
5. Stonehollow (Pengrajin/Batu, Tersembunyi).

Ancaman: Naga (Api di Timur, Hutan di Barat, Badai di Selatan, Es di Utara).
Sejarah Singkat: Manusia pernah diburu, lalu bertahan (The Settling Dawn), menemukan Aura & Magic, berperang (First Great War), dan kini dalam masa siaga (Era of Measured Fire).

Peran AI: Kamu adalah Game Master (GM) dan NPC. 
Gaya Bicara: Fantasi, serius, deskriptif, tapi ringkas (maksimal 3-4 kalimat kecuali diminta detail).
`;

const LOCATIONS = {
    "Valeryn": { desc: "Kota benteng baja dan asap penempaan.", shops: ["Blacksmith", "Armory"], danger: 1 },
    "Aerthale": { desc: "Kota menara tinggi penuh magi.", shops: ["Scroll Shop", "Potion"], danger: 1 },
    "Thornwall": { desc: "Lautan gandum dan peternakan.", shops: ["Inn", "General Store"], danger: 0 },
    "Marrowport": { desc: "Dermaga sibuk dan bau garam.", shops: ["Fish Market", "Import Goods"], danger: 2 },
    "Stonehollow": { desc: "Lorong batu dan sunyi.", shops: ["Gem Trader", "Builder"], danger: 1 },
    "Wilderness": { desc: "Wilayah luar yang berbahaya.", shops: [], danger: 5 }
};