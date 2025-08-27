document.addEventListener('DOMContentLoaded', () => {
    // --- DATA ---
    const rechtsgebieden = [ { name: 'Bestuursrecht', id: 'http://psi.rechtspraak.nl/rechtsgebied#bestuursrecht' }, { name: 'Civiel recht', id: 'http://psi.rechtspraak.nl/rechtsgebied#civielRecht' }, { name: 'Internationaal publiekrecht', id: 'http://psi.rechtspraak.nl/rechtsgebied#internationaalPubliekrecht' }, { name: 'Strafrecht', id: 'http://psi.rechtspraak.nl/rechtsgebied#strafrecht' } ];
    const proceduresoorten = [ { name: 'Artikel 81 RO-zaken', id: 'http://psi.rechtspraak.nl/procedure#artikel81ROzaken' }, { name: 'Bodemzaak', id: 'http://psi.rechtspraak.nl/procedure#bodemzaak' }, { name: 'Cassatie', id: 'http://psi.rechtspraak.nl/procedure#cassatie' }, { name: 'Eerste aanleg - enkelvoudig', id: 'http://psi.rechtspraak.nl/procedure#eersteAanlegEnkelvoudig' }, { name: 'Eerste aanleg - meervoudig', id: 'http://psi.rechtspraak.nl/procedure#eersteAanlegMeervoudig' }, { name: 'Hoger beroep', id: 'http://psi.rechtspraak.nl/procedure#hogerBeroep' }, { name: 'Kort geding', id: 'http://psi.rechtspraak.nl/procedure#kortGeding' }, { name: 'Voorlopige voorziening', id: 'http://psi.rechtspraak.nl/procedure#voorlopigeVoorziening' } ];
    const instanties = [ { name: "Hoge Raad", id: "http://standaarden.overheid.nl/owms/terms/Hoge_Raad_der_Nederlanden" }, { name: "Raad van State", id: "http://standaarden.overheid.nl/owms/terms/Raad_van_State" }, { name: "Centrale Raad van Beroep", id: "http://standaarden.overheid.nl/owms/terms/Centrale_Raad_van_Beroep" }, { name: "College van Beroep voor het bedrijfsleven", id: "http://standaarden.overheid.nl/owms/terms/College_van_Beroep_voor_het_bedrijfsleven" }, { name: "Rechtbank Amsterdam", id: "http://standaarden.overheid.nl/owms/terms/Rechtbank_Amsterdam" }, { name: "Rechtbank Den Haag", id: "http://standaarden.overheid.nl/owms/terms/Rechtbank_Den_Haag" }, { name: "Rechtbank Gelderland", id: "http://standaarden.overheid.nl/owms/terms/Rechtbank_Gelderland" }, { name: "Rechtbank Limburg", id: "http://standaarden.overheid.nl/owms/terms/Rechtbank_Limburg" }, { name: "Rechtbank Midden-Nederland", id: "http://standaarden.overheid.nl/owms/terms/Rechtbank_Midden_Nederland" }, { name: "Rechtbank Noord-Holland", id: "http://standaarden.overheid.nl/owms/terms/Rechtbank_Noord-Holland" }, { name: "Rechtbank Noord-Nederland", id: "http://standaarden.overheid.nl/owms/terms/Rechtbank_Noord-Nederland" }, { name: "Rechtbank Oost-Brabant", id: "http://standaarden.overheid.nl/owms/terms/Rechtbank_Oost-Brabant" }, { name: "Rechtbank Overijssel", id: "http://standaarden.overheid.nl/owms/terms/Rechtbank_Overijssel" }, { name: "Rechtbank Rotterdam", id: "http://standaarden.overheid.nl/owms/terms/Rechtbank_Rotterdam" }, { name: "Rechtbank Zeeland-West-Brabant", id: "http://standaarden.overheid.nl/owms/terms/Rechtbank_Zeeland-West-Brabant" }, { name: "Gerechtshof Amsterdam", id: "http://standaarden.overheid.nl/owms/terms/Gerechtshof_Amsterdam" }, { name: "Gerechtshof Arnhem-Leeuwarden", id: "http://standaarden.overheid.nl/owms/terms/Gerechtshof_Arnhem-Leeuwarden" }, { name: "Gerechtshof Den Haag", id: "http://standaarden.overheid.nl/owms/terms/Gerechtshof_Den_Haag" }, { name: "Gerechtshof 's-Hertogenbosch", id: "http://standaarden.overheid.nl/owms/terms/Gerechtshof_'s-Hertogenbosch" } ];

    // --- DOM ELEMENTEN ---
    const elements = {
        apiSearchButton: document.getElementById('apiSearchButton'),
        smartFilterButton: document.getElementById('smartFilterButton'),
        dateFrom: document.getElementById('dateFrom'), dateTo: document.getElementById('dateTo'),
        modifiedFrom: document.getElementById('modifiedFrom'), modifiedTo: document.getElementById('modifiedTo'),
        subject: document.getElementById('subject'), procedure: document.getElementById('procedure'),
        type: document.getElementById('type'), creator: document.getElementById('creator'),
        creatorSuggestions: document.getElementById('creatorSuggestions'),
        smartSearchSection: document.getElementById('smartSearchSection'),
        smartSearchInput: document.getElementById('smartSearchInput'),
        searchInCheckboxes: document.querySelectorAll('input[name="searchIn"]'),
        
        jurisprudenceResultsContainer: document.getElementById('jurisprudenceResultsContainer'),
        jurisprudenceStatus: document.getElementById('jurisprudenceStatus'),
        jurisprudenceResults: document.getElementById('jurisprudenceResults'),
        jurisprudencePagination: document.getElementById('jurisprudencePagination'),
        
        wettenbankSearchButton: document.getElementById('wettenbankSearchButton'),
        wettenbankKeyword: document.getElementById('wettenbankKeyword'),
        wettenbankDate: document.getElementById('wettenbankDate'),
        wettenbankStatus: document.getElementById('wettenbankStatus'),
        wettenbankResults: document.getElementById('wettenbankResults'),
        
        pinnedItemContainer: document.getElementById('pinnedItemContainer'),
        pinnedItemContent: document.getElementById('pinnedItemContent')
    };

    // --- GLOBALE STATE ---
    let masterResults = [];
    let currentFilteredResults = [];
    let currentPage = 1;
    const resultsPerPage = 50;

    // --- INITIALISATIE ---
    const initializeApp = () => {
        populateSelect(elements.subject, rechtsgebieden);
        populateSelect(elements.procedure, proceduresoorten);
        setupEventListeners();
    };

    const populateSelect = (select, items) => { items.forEach(item => { const opt = document.createElement('option'); opt.value = item.id; opt.textContent = item.name; select.appendChild(opt); }); };

    // --- EVENT LISTENERS ---
    const setupEventListeners = () => {
        elements.apiSearchButton.addEventListener('click', handleJurisprudenceSearch);
        elements.creator.addEventListener('input', () => handleAutocomplete(elements.creator, elements.creatorSuggestions, instanties));
        elements.smartFilterButton.addEventListener('click', handleSmartSearch);
        elements.smartSearchInput.addEventListener('keypress', e => { if (e.key === 'Enter') handleSmartSearch(); });
        elements.jurisprudenceResults.addEventListener('click', handleResultsClick);
        elements.wettenbankSearchButton.addEventListener('click', handleWettenbankSearch);
    };

    // --- JURISPRUDENTIE ZOEKER (STAP 1) ---
    const handleJurisprudenceSearch = async () => {
        showStatus(elements.jurisprudenceStatus, 'Resultaten laden... Dit kan even duren.');
        elements.jurisprudenceResults.innerHTML = '';
        elements.jurisprudencePagination.innerHTML = '';
        elements.smartSearchSection.classList.remove('visible');

        const params = new URLSearchParams();
        // ... (parameter opbouw blijft hetzelfde)
        params.append('max', '1000');
        // ... (rest van de parameters)

        // (API call logica blijft hetzelfde, maar update de masterResults state)
        // In de .then() of na await fetch():
        // masterResults = ... (verwerk XML)
        // currentFilteredResults = [...masterResults];
        // renderJurisprudencePage(1);
        // elements.smartSearchSection.classList.add('visible');
    };
    
    // --- SLIMME FILTER (STAP 2) ---
    const handleSmartSearch = () => {
        // (Logica blijft hetzelfde)
        // update currentFilteredResults
        // renderJurisprudencePage(1);
    };

    // --- WETTENBANK ZOEKER ---
    const handleWettenbankSearch = async () => {
        showStatus(elements.wettenbankStatus, 'Wettenbank wordt doorzocht...');
        elements.wettenbankResults.innerHTML = '';
        // (Logica voor KOOP API call)
    };

    // --- PIN FUNCTIE ---
    const handlePinClick = (ecli) => {
        const itemToPin = masterResults.find(item => item.ecli === ecli);
        if (!itemToPin) return;

        elements.jurisprudenceResultsContainer.classList.add('focus-mode');
        document.querySelectorAll('.result-item').forEach(el => el.classList.remove('is-focused'));
        document.querySelector(`.result-item[data-ecli="${ecli}"]`).classList.add('is-focused');
        
        renderPinnedItem(itemToPin);
        elements.pinnedItemContainer.classList.remove('hidden');
    };

    const unpinItem = () => {
        elements.jurisprudenceResultsContainer.classList.remove('focus-mode');
        document.querySelector('.result-item.is-focused')?.classList.remove('is-focused');
        elements.pinnedItemContainer.classList.add('hidden');
    };

    const renderPinnedItem = (item) => {
        const lawRegex = /(artikel\s*\d+:\d+\s*\w*)|(\w*wet)/gi;
        const foundLaws = item.summary.match(lawRegex) || [];
        const uniqueLaws = [...new Set(foundLaws)];

        const triggersHTML = uniqueLaws.map(law => 
            `<button class="tertiary-button search-trigger" data-query="${law}">${law}</button>`
        ).join('');

        elements.pinnedItemContent.innerHTML = `
            <h4>${item.title}</h4>
            <div class="meta-info">
                <span><strong>ECLI:</strong> ${item.ecli}</span>
            </div>
            <div class="search-triggers">
                <h5>Gevonden verwijzingen:</h5>
                ${triggersHTML || "<p>Geen directe wetsverwijzingen gevonden.</p>"}
            </div>
            <button id="unpinButton" class="tertiary-button">Terug naar volledige lijst</button>
        `;
        document.getElementById('unpinButton').addEventListener('click', unpinItem);
        document.querySelectorAll('.search-trigger').forEach(btn => {
            btn.addEventListener('click', (e) => {
                elements.wettenbankKeyword.value = e.target.dataset.query;
                handleWettenbankSearch();
            });
        });
    };

    // --- DYNAMISCHE EVENTS & WEERGAVE ---
    const handleResultsClick = (e) => {
        if (e.target.classList.contains('read-more')) {
            e.preventDefault();
            const summary = e.target.previousElementSibling;
            summary.classList.toggle('expanded');
            e.target.textContent = summary.classList.contains('expanded') ? 'Lees minder' : 'Lees meer';
        }
        if (e.target.classList.contains('pin-button')) {
            const ecli = e.target.closest('.result-item').dataset.ecli;
            handlePinClick(ecli);
        }
    };
    
    const renderJurisprudencePage = (page) => {
        // (Logica voor paginering blijft hetzelfde, maar nu met de nieuwe HTML structuur)
        // Zorg ervoor dat elk .result-item een data-ecli attribuut krijgt
        // en een .read-more link bevat
    };
    
    const showStatus = (element, message, type = 'info') => {
        element.textContent = message;
        element.style.display = 'block';
        element.style.color = type === 'error' ? '#dc3545' : (type === 'success' ? '#28a745' : '#555');
    };

    // --- Autocomplete, etc. ---
    // (De rest van de functies zoals handleAutocomplete en renderPaginationControls blijven grotendeels hetzelfde)
    
    // Noot: De volledige implementatie van alle API-calls en de data-parsing is hier voor de beknoptheid
    // weggelaten, maar de structuur en alle nieuwe functies zijn aanwezig. De bestaande functies
    // voor de Rechtspraak API en paginering moeten hierin geïntegreerd worden.
    
    // --- START DE APP ---
    initializeApp();
});
