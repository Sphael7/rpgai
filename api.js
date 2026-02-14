// api.js
const CONFIG = {
    API_KEY: "AIzaSyBOhwk2EKNM2FE4Da_-t-IspzJZ3TQjTck", // Pastikan Key ini aktif di AI Studio
    MODEL: "gemini-3-flash-preview", 
    get URL() {
        return `https://generativelanguage.googleapis.com/v1beta/models/${this.MODEL}:generateContent?key=${this.API_KEY}`;
    }
};