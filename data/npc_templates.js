// ============================================================================
// DATA: NPC TEMPLATES
// ============================================================================

const NPC_TEMPLATES = {
    "Valeryn": [
        { 
            id: "npc_garrick", 
            name: "Garrick", 
            role: "Mentor", 
            desc: "Tua, satu mata.", 
            relations: ["npc_elara"], 
            schedule: { 
                work: { s: 8, e: 17, l: "Bengkel Pandai Besi" }, 
                rest: { s: 18, e: 23, l: "Penginapan (Inn)" } 
            },
            inventory: [ 
                { id: "wpn_001", qty: 2 },
                { id: "mat_003", qty: 5 }
            ],
            bio: "Seorang veteran perang yang kini menempa baja.",
            longTermSummary: "Sudah mengenal Edrin sejak kecil.",
            affinity: 50
        },
        { 
            id: "npc_elara", 
            name: "Elara", 
            role: "Pelayan", 
            desc: "Ramah namun teliti.", 
            relations: ["npc_garrick"],
            schedule: { 
                work: { s: 7, e: 22, l: "Penginapan (Inn)" }, 
                rest: { s: 23, e: 6, l: "Rumah Pribadi" } 
            },
            inventory: [ 
                { id: "con_001", qty: 10 },
                { id: "con_002", qty: 3 }
            ],
            bio: "Pemilik penginapan yang tahu banyak gosip.",
            longTermSummary: "Menganggap Edrin pelanggan tetap yang sopan.",
            affinity: 20
        }
    ],
    "greywood": [], 
    "stonefall": [],
    "river_karth": [],
    "ashplain": []
};

console.log("Avarath Data: NPC Templates Loaded.");