async function panggilGemini(pesanPemain) {
    const payload = {
        contents: [{
            parts: [{
                text: "Kamu adalah Penjaga Gerbang yang tegas. Ini adalah dunia RPG medieval. Jangan menjawab lebih dari 2 kalimat."
            }, {
                text: pesanPemain
            }]
        }]
    };

    try {
        // Mengambil URL dari file api.js
        const response = await fetch(CONFIG.URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (data.error) {
            return `[Sistem Error]: ${data.error.message}`;
        }

        return data.candidates[0].content.parts[0].text;
    } catch (err) {
        return "[Sistem Error]: Gagal terhubung ke server.";
    }
}

async function kirimPesan() {
    const input = document.getElementById("player-input");
    const log = document.getElementById("chat-log");
    const btn = document.getElementById("send-btn");
    const pesan = input.value.trim();

    if (!pesan) return;

    // Tambah chat pemain
    log.innerHTML += `<div class="msg player">${pesan}</div>`;
    input.value = "";
    input.disabled = true;
    btn.disabled = true;
    log.scrollTop = log.scrollHeight;

    // Respon NPC
    const respon = await panggilGemini(pesan);
    
    const divNpc = document.createElement("div");
    divNpc.className = respon.startsWith("[Sistem") ? "msg system" : "msg npc";
    divNpc.innerHTML = respon.startsWith("[Sistem") ? respon : `<strong>Penjaga:</strong> ${respon}`;
    
    log.appendChild(divNpc);
    
    input.disabled = false;
    btn.disabled = false;
    input.focus();
    log.scrollTop = log.scrollHeight;
}

// Support tombol Enter
document.getElementById("player-input").addEventListener("keypress", (e) => {
    if (e.key === "Enter") kirimPesan();
});