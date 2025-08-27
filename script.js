document.addEventListener('DOMContentLoaded', () => {
    // --- DATA (uit de XML-bestanden) ---
    const rechtsgebieden = [
        { name: 'Bestuursrecht', id: 'http://psi.rechtspraak.nl/rechtsgebied#bestuursrecht' },
        { name: 'Civiel recht', id: 'http://psi.rechtspraak.nl/rechtsgebied#civielRecht' },
        { name: 'Internationaal publiekrecht', id: 'http://psi.rechtspraak.nl/rechtsgebied#internationaalPubliekrecht' },
        { name: 'Strafrecht', id: 'http://psi.rechtspraak.nl/rechtsgebied#strafrecht' }
    ];

    const proceduresoorten = [
        { name: 'Artikel 81 RO-zaken', id: 'http://psi.rechtspraak.nl/procedure#artikel81ROzaken' },
        { name: 'Bodemzaak', id: 'http://psi.rechtspraak.nl/procedure#bodemzaak' },
        { name: 'Cassatie', id: 'http://psi.rechtspraak.nl/procedure#cassatie' },
        { name: 'Eerste aanleg - enkelvoudig', id: 'http://psi.rechtspraak.nl/procedure#eersteAanlegEnkelvoudig' },
        { name: 'Eerste aanleg - meervoudig', id: 'http://psi.rechtspraak.nl/procedure#eersteAanlegMeervoudig' },
        { name: 'Hoger beroep', id: 'http://psi.rechtspraak.nl/procedure#hogerBeroep' },
        { name: 'Kort geding', id: 'http://psi.rechtspraak.nl/procedure#kortGeding' },
        { name: 'Voorlopige voorziening', id: 'http://psi.rechtspraak.nl/procedure#voorlopigeVoorziening' }
    ];
    
    // Een kleine selectie van instanties voor de demo; een volledige lijst zou het script te groot maken.
    // In een echte applicatie zou dit bestand apart geladen worden.
    const instanties = [
        { name: "Hoge Raad", id: "http://standaarden.overheid.nl/owms/terms/Hoge_Raad_der_Nederlanden" },
        { name: "Raad van State", id: "http://standaarden.overheid.nl/owms/terms/Raad_van_State" },
        { name: "Centrale Raad van Beroep", id: "http://standaarden.overheid.nl/owms/terms/Centrale_Raad_van_Beroep" },
        { name: "College van Beroep voor het bedrijfsleven", id: "http://standaarden.overheid.nl/owms/terms/College_van_Beroep_voor_het_bedrijfsleven" },
        { name: "Rechtbank Amsterdam", id: "http://standaarden.overheid.nl/owms/terms/Rechtbank_Amsterdam" },
        { name: "Rechtbank Den Haag", id: "http://standaarden.overheid.nl/owms/terms/Rechtbank_Den_Haag" },
        { name: "Rechtbank Gelderland", id: "http://standaarden.overheid.nl/owms/terms/Rechtbank_Gelderland" },
        { name: "Rechtbank Limburg", id: "http://standaarden.overheid.nl/owms/terms/Rechtbank_Limburg" },
        { name: "Rechtbank Midden-Nederland", id: "http://standaarden.overheid.nl/owms/terms/Rechtbank_Midden-Nederland" },
        { name: "Rechtbank Noord-Holland", id: "http://standaarden.overheid.nl/owms/terms/Rechtbank_Noord-Holland" },
        { name: "Rechtbank Noord-Nederland", id: "http://standaarden.overheid.nl/owms/terms/Rechtbank_Noord-Nederland" },
        { name: "Rechtbank Oost-Brabant", id: "http://standaarden.overheid.nl/owms/terms/Rechtbank_Oost-Brabant" },
        { name: "Rechtbank Overijssel", id: "http://standaarden.overheid.nl/owms/terms/Rechtbank_Overijssel" },
        { name: "Rechtbank Rotterdam", id: "http://standaarden.overheid.nl/owms/terms/Rechtbank_Rotterdam" },
        { name: "Rechtbank Zeeland-West-Brabant", id: "http://standaarden.overheid.nl/owms/terms/Rechtbank_Zeeland-West-Brabant" },
        { name: "Gerechtshof Amsterdam", id: "http://standaarden.overheid.nl/owms/terms/Gerechtshof_Amsterdam" },
        { name: "Gerechtshof Arnhem-Leeuwarden", id: "http://standaarden.overheid.nl/owms/terms/Gerechtshof_Arnhem-Leeuwarden" },
        { name: "Gerechtshof Den Haag", id: "http://standaarden.overheid.nl/owms/terms/Gerechtshof_Den_Haag" },
        { name: "Gerechtshof 's-Hertogenbosch", id: "http://standaarden.overheid.nl/owms/terms/Gerechtshof_'s-Hertogenbosch" }
    ];

    // --- DOM ELEMENTEN ---
    const elements = {
        apiSearchButton: document.getElementById('apiSearchButton'),
        smartFilterButton: document.getElementById('smartFilterButton'),
        dateFrom: document.getElementById('dateFrom'),
        dateTo: document.getElementById('dateTo'),
        modifiedFrom: document.getElementById('modifiedFrom'),
        modifiedTo: document.getElementById('modifiedTo'),
        subject: document.getElementById('subject'),
        procedure: document.getElementById('procedure'),
        type: document.getElementById('type'),
        creator: document.getElementById('creator'),
        creatorSuggestions: document.getElementById('creatorSuggestions'),
        smartSearchSection: document.getElementById('smartSearchSection'),
        smartSearchInput: document.getElementById('smartSearchInput'),
        status: document.getElementById('status'),
        results: document.getElementById('results'),
        paginationControls: document.getElementById('paginationControls'),
        searchInCheckboxes: document.querySelectorAll('input[name="searchIn"]')
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

    const populateSelect = (selectElement, items) => {
        items.forEach(item => {
            const option = document.createElement('option');
            option.value = item.id;
            option.textContent = item.name;
            selectElement.appendChild(option);
        });
    };

    // --- EVENT LISTENERS ---
    const setupEventListeners = () => {
        elements.apiSearchButton.addEventListener('click', handleApiSearch);
        elements.creator.addEventListener('input', () => handleAutocomplete(elements.creator, elements.creatorSuggestions, instanties));
        elements.creatorSuggestions.addEventListener('click', (e) => {
            if (e.target.tagName === 'DIV') {
                const selectedItem = instanties.find(item => item.name === e.target.textContent);
                if (selectedItem) {
                    elements.creator.value = selectedItem.name;
                    elements.creator.dataset.id = selectedItem.id;
                    elements.creatorSuggestions.innerHTML = '';
                }
            }
        });
        document.addEventListener('click', (e) => { // Sluit suggesties als ergens anders geklikt wordt
            if (!elements.creator.contains(e.target) && !elements.creatorSuggestions.contains(e.target)) {
                elements.creatorSuggestions.innerHTML = '';
            }
        });

        elements.smartFilterButton.addEventListener('click', handleSmartSearch);
        elements.smartSearchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleSmartSearch();
        });
    };

    // --- API ZOEKFUNCTIE (STAP 1) ---
    const handleApiSearch = async () => {
        elements.status.textContent = 'Resultaten laden... Dit kan even duren.';
        elements.status.style.display = 'block';
        elements.results.innerHTML = '';
        elements.paginationControls.innerHTML = '';
        elements.smartSearchSection.classList.remove('visible');
        elements.smartSearchSection.classList.add('hidden');

        const params = new URLSearchParams();
        if (elements.dateFrom.value) params.append('date', elements.dateFrom.value);
        if (elements.dateTo.value) params.append('date', elements.dateTo.value);
        if (elements.modifiedFrom.value) params.append('modified', elements.modifiedFrom.value);
        if (elements.modifiedTo.value) params.append('modified', elements.modifiedTo.value);
        if (elements.subject.value) params.append('subject', elements.subject.value);
        if (elements.procedure.value) params.append('procedure', elements.procedure.value);
        if (elements.type.value) params.append('type', elements.type.value);
        if (elements.creator.dataset.id) params.append('creator', elements.creator.dataset.id);

        params.append('return', 'DOC');
        params.append('max', '1000');
        params.append('sort', 'DESC');

        // Check of er minimaal één filter is ingesteld (naast de defaults)
        const activeFilters = Array.from(params.entries()).filter(([key, value]) => 
            !['return', 'max', 'sort'].includes(key) && value !== ''
        );

        if (activeFilters.length === 0) {
            elements.status.textContent = 'Selecteer ten minste één filter (bijv. datum of rechtsgebied).';
            elements.status.style.color = '#dc3545'; // Rood voor foutmelding
            return;
        } else {
             elements.status.style.color = '#555'; // Reset kleur
        }


        const proxyUrl = 'https://api.allorigins.win/raw?url=';
        const baseUrl = 'https://data.rechtspraak.nl/uitspraken/zoeken';
        const requestUrl = `${proxyUrl}${encodeURIComponent(`${baseUrl}?${params.toString()}`)}`;

        try {
            const response = await fetch(requestUrl);
            if (!response.ok) throw new Error(`Fout bij API-verzoek: ${response.status}`);
            
            const xmlString = await response.text();
            const xmlDoc = new DOMParser().parseFromString(xmlString, "application/xml");
            
            const entries = xmlDoc.getElementsByTagName('entry');
            
            masterResults = Array.from(entries).map(entry => ({
                title: entry.querySelector('title')?.textContent || 'Geen titel',
                ecli: entry.querySelector('id')?.textContent || '',
                summary: entry.querySelector('summary')?.textContent || 'Geen samenvatting.',
                updated: new Date(entry.querySelector('updated')?.textContent),
                zaaknummer: entry.querySelector('zaaknummer')?.textContent || 'Niet gevonden'
            }));

            currentFilteredResults = [...masterResults];
            
            if (masterResults.length === 0) {
                elements.status.textContent = 'Geen resultaten gevonden voor deze filters.';
                elements.status.style.color = '#28a745'; // Groen voor succes/info
                return;
            }

            elements.status.textContent = `Totaal ${masterResults.length} resultaten gevonden.`;
            elements.status.style.color = '#28a745'; // Groen voor succes/info
            currentPage = 1;
            renderPage(currentPage);
            elements.smartSearchSection.classList.remove('hidden');
            elements.smartSearchSection.classList.add('visible');

        } catch (error) {
            elements.status.textContent = `Fout: ${error.message}. Probeer het opnieuw.`;
            elements.status.style.color = '#dc3545'; // Rood voor foutmelding
            console.error(error);
        }
    };

    // --- SLIMME FILTER (STAP 2) ---
    const handleSmartSearch = () => {
        const keyword = elements.smartSearchInput.value.toLowerCase().trim();
        const searchIn = Array.from(elements.searchInCheckboxes)
                              .filter(cb => cb.checked)
                              .map(cb => cb.value);

        if (!keyword) {
            currentFilteredResults = [...masterResults];
        } else {
            currentFilteredResults = masterResults.filter(item => {
                const searchTargets = [];
                if (searchIn.includes('title')) searchTargets.push(item.title.toLowerCase());
                if (searchIn.includes('summary')) searchTargets.push(item.summary.toLowerCase());
                if (searchIn.includes('ecli')) searchTargets.push(item.ecli.toLowerCase());
                if (searchIn.includes('zaaknummer')) searchTargets.push(item.zaaknummer.toLowerCase());
                
                return searchTargets.some(target => target.includes(keyword));
            });
        }
        
        elements.status.textContent = `${currentFilteredResults.length} van de ${masterResults.length} resultaten komen overeen.`;
        elements.status.style.color = '#28a745'; // Groen voor succes/info
        currentPage = 1;
        renderPage(currentPage);
    };

    // --- WEERGAVE & PAGINERING ---
    const renderPage = (page) => {
        elements.results.innerHTML = '';
        if (currentFilteredResults.length === 0) {
            elements.paginationControls.innerHTML = '';
            return;
        }

        const start = (page - 1) * resultsPerPage;
        const end = start + resultsPerPage;
        const paginatedItems = currentFilteredResults.slice(start, end);

        const keyword = elements.smartSearchInput.value.trim();

        paginatedItems.forEach(item => {
            const resultItem = document.createElement('div');
            resultItem.className = 'result-item';

            const deeplink = `http://deeplink.rechtspraak.nl/uitspraak?id=${encodeURIComponent(item.ecli)}`;

            let titleHTML = item.title;
            let summaryHTML = item.summary;
            let ecliHTML = item.ecli;
            let zaaknummerHTML = item.zaaknummer;

            if (keyword) {
                // Maak een regex die speciale karakters escapet
                const escapedKeyword = keyword.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
                const regex = new RegExp(escapedKeyword, 'gi');
                
                titleHTML = titleHTML.replace(regex, (match) => `<mark>${match}</mark>`);
                summaryHTML = summaryHTML.replace(regex, (match) => `<mark>${match}</mark>`);
                ecliHTML = ecliHTML.replace(regex, (match) => `<mark>${match}</mark>`);
                zaaknummerHTML = zaaknummerHTML.replace(regex, (match) => `<mark>${match}</mark>`);
            }

            resultItem.innerHTML = `
                <h3><a href="${deeplink}" target="_blank" rel="noopener noreferrer">${titleHTML}</a></h3>
                <div class="meta-info">
                    <span><strong>ECLI:</strong> ${ecliHTML}</span>
                    <span><strong>Zaaknr:</strong> ${zaaknummerHTML}</span>
                    <span><strong>Laatst gewijzigd:</strong> ${item.updated.toLocaleDateString('nl-NL')}</span>
                </div>
                <p class="summary">${summaryHTML}</p>
            `;
            elements.results.appendChild(resultItem);
        });

        renderPaginationControls();
    };

    const renderPaginationControls = () => {
        elements.paginationControls.innerHTML = '';
        const pageCount = Math.ceil(currentFilteredResults.length / resultsPerPage);

        if (pageCount <= 1) return;

        const prevButton = document.createElement('button');
        prevButton.textContent = '< Vorige';
        prevButton.disabled = currentPage === 1;
        prevButton.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                renderPage(currentPage);
            }
        });

        const pageIndicator = document.createElement('span');
        pageIndicator.id = 'pageIndicator';
        pageIndicator.textContent = `Pagina ${currentPage} van ${pageCount}`;

        const nextButton = document.createElement('button');
        nextButton.textContent = 'Volgende >';
        nextButton.disabled = currentPage === pageCount;
        nextButton.addEventListener('click', () => {
            if (currentPage < pageCount) {
                currentPage++;
                renderPage(currentPage);
            }
        });
        
        elements.paginationControls.append(prevButton, pageIndicator, nextButton);
    };

    // --- AUTOCOMPLETE FUNCTIE ---
    const handleAutocomplete = (inputElement, suggestionsElement, items) => {
        const value = inputElement.value.toLowerCase();
        suggestionsElement.innerHTML = '';
        // Reset de dataset.id als de input leeg is of niet overeenkomt met een geselecteerde item
        if (!value) {
            inputElement.dataset.id = '';
            return;
        }

        const filteredItems = items
            .filter(item => item.name.toLowerCase().includes(value))
            .slice(0, 5); // Toon max 5 suggesties

        filteredItems.forEach(item => {
            const div = document.createElement('div');
            div.textContent = item.name;
            div.addEventListener('click', () => {
                inputElement.value = item.name;
                inputElement.dataset.id = item.id; // Sla de ID op voor de API call
                suggestionsElement.innerHTML = '';
            });
            suggestionsElement.appendChild(div);
        });
    };

    // --- START DE APP ---
    initializeApp();
});
