document.addEventListener('DOMContentLoaded', () => {
    const searchButton = document.getElementById('searchButton');
    const searchInput = document.getElementById('searchInput');
    const resultsContainer = document.getElementById('results');
    const statusContainer = document.getElementById('status');

    const handleSearch = async () => {
        const query = searchInput.value.trim();
        if (!query) {
            alert('Voer een zoekterm in.');
            return;
        }

        // Toon laadindicator en maak vorige resultaten leeg
        statusContainer.textContent = 'Resultaten laden...';
        statusContainer.style.display = 'block';
        resultsContainer.innerHTML = '';

        // API configuratie gebaseerd op de documentatie
        // We gebruiken een publieke CORS proxy om de app te kunnen testen zonder eigen server.
        const proxyUrl = 'https://corsproxy.io/?';
        const baseUrl = 'http://data.rechtspraak.nl/uitspraken/zoeken';
        

          // Parameters: q voor zoekterm, max voor aantal resultaten, en sord om te sorteren.
        const params = new URLSearchParams({
            q: query,
            max: '20',
            sord: 'DESC' // Correcte parameter is 'sord'. Toegestane waarden: "ASC" of "DESC"
        });
        
        const requestUrl = `${proxyUrl}${baseUrl}?${params.toString()}`;

        try {
            const response = await fetch(requestUrl);

            if (!response.ok) {
                throw new Error(`Fout bij het verzoek: ${response.status} ${response.statusText}`);
            }

            const xmlString = await response.text();
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlString, "application/xml");
            
            displayResults(xmlDoc);

        } catch (error) {
            statusContainer.textContent = `Er is een fout opgetreden: ${error.message}`;
            console.error('Fout bij het ophalen van data:', error);
        }
    };
    
    // Functie om de resultaten te tonen
    const displayResults = (xmlDoc) => {
        const entries = xmlDoc.getElementsByTagName('entry');
        
        // Controleer of er resultaten zijn
        const subtitle = xmlDoc.querySelector('subtitle')?.textContent || '';
        if (entries.length === 0 || subtitle.includes("resultaat = 0")) {
            statusContainer.textContent = 'Geen resultaten gevonden voor deze zoekterm.';
            return;
        }
        
        statusContainer.style.display = 'none'; // Verberg status
        
        // Bouw HTML voor elk resultaat
        Array.from(entries).forEach(entry => {
            const title = entry.querySelector('title')?.textContent || 'Geen titel';
            const ecli = entry.querySelector('id')?.textContent || '';
            let summary = entry.querySelector('summary')?.textContent || 'Geen samenvatting beschikbaar.';
            const updatedDate = new Date(entry.querySelector('updated')?.textContent).toLocaleDateString('nl-NL');
            
            // Creëer de deeplink URL zoals beschreven in de documentatie
            [cite_start]const deeplink = `http://deeplink.rechtspraak.nl/uitspraak?id=${encodeURIComponent(ecli)}`; // [cite: 458]

            const resultItem = document.createElement('div');
            resultItem.className = 'result-item';
            resultItem.innerHTML = `
                <h2><a href="${deeplink}" target="_blank" rel="noopener noreferrer">${title}</a></h2>
                <div class="meta-info">
                    <span><strong>ECLI:</strong> ${ecli}</span>
                    <span><strong>Laatst gewijzigd:</strong> ${updatedDate}</span>
                </div>
                <p class="summary">${summary}</p>
            `;
            resultsContainer.appendChild(resultItem);
        });
    };

    // Koppel de zoekfunctie aan de knop en de Enter-toets
    searchButton.addEventListener('click', handleSearch);
    searchInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            handleSearch();
        }
    });
});
