const CONFIG = {
    // 1. MASUKKAN API KEY KAMU DI SINI
    // Ambil dari https://aistudio.google.com/
    API_KEY: "AIzaSyDtDTium0XdpGl1whc6oiAp78BurW7ejc8",

    // 2. ENDPOINT NATIVE GOOGLE GEMINI
    // Menggunakan v1beta karena Gemini 2.5 Pro biasanya rilis di jalur beta dahulu
    URL: "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent",

    // 3. IDENTITAS MODEL
    MODEL: "gemini-2.5-pro",

    // 4. GENERATION SETTINGS (Opsional: Digunakan jika ingin dipanggil secara dinamis)
    SETTINGS: {
        temperature: 0.8,
        topP: 0.95,
        maxOutputTokens: 1024
    }
};

// Mencegah perubahan tidak sengaja pada konfigurasi saat game berjalan
Object.freeze(CONFIG);

console.log("Avarath API System: Gemini 2.5 Pro Config Loaded.");