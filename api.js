// Simpan API Key dan Konfigurasi di sini
const CONFIG = {
    API_KEY: "AIzaSyBpzkr1szBO2cgPG8kiQIUCc8WsPBU6EdA",
    MODEL: "gemini-3-flash-preview",
    get URL() {
        return `https://generativelanguage.googleapis.com/v1beta/models/${this.MODEL}:generateContent?key=${this.API_KEY}`;
    }
};