// api.js
const CONFIG = {
    API_KEY: "AIzaSyBOhwk2EKNM2FE4Da_-t-IspzJZ3TQjTck", // Pastikan Key ini aktif di AI Studio
    MODEL: "gemma-3-27b-it", 
    get URL() {
        return `https://generativelanguage.googleapis.com/v1beta/models/${this.MODEL}:generateContent?key=${this.API_KEY}`;
    }
};