const API_URL = window.API_BASE || "https://h9-invest-sii.onrender.com";

// Funzione di utilità per le chiamate API
async function apiCall(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...(options.headers || {})
            },
            ...options
        });
        
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Errore di rete");
        return data;
    } catch (err) {
        console.error("API Error:", err);
        throw err;
    }
}

// Inizializzazione pulita all'avvio della pagina
document.addEventListener("DOMContentLoaded", () => {
    console.log("App avviata correttamente e collegata a Render.");
});
