document.addEventListener('DOMContentLoaded', () => {
    // Verifica se estamos em uma página de serviço (que tem um flashcard container)
    if (!document.getElementById('flashcard-container')) {
        return; // Não executa o resto do script se não for uma página de serviço
    }

    // 1. Ler os metadados do HTML
    const serviceName = document.querySelector('meta[name="aws-service-name"]').content;
    const categoryName = document.querySelector('meta[name="aws-service-category"]').content;
    const categoryLink = document.querySelector('meta[name="aws-service-category-link"]').content;
    const dataFiles = document.querySelector('meta[name="aws-service-data-files"]').content.split(',').map(f => f.trim());

    // 2. Elementos do DOM
    const header = document.getElementById('page-header');
    
    function generateHeader() {
        header.innerHTML = `
            <h1>AWS ${serviceName}</h1>
            <p>Guia de estudo interativo para o serviço ${serviceName}.</p>
            <nav class="breadcrumb">
                <a href="../index.html">Categorias</a> > 
                <a href="${categoryLink}">${categoryName}</a> >
                <strong>${serviceName}</strong>
            </nav>
        `;
    }

    async function loadFlashcardData() {
        let allFlashcards = [];
        try {
            for (const fileName of dataFiles) {
                // O caminho é relativo ao HTML, que está na pasta /services/
                const response = await fetch(`../data/${fileName}`);
                if (!response.ok) {
                    throw new Error(`Falha ao carregar ${fileName}: ${response.statusText}`);
                }
                const cards = await response.json();
                allFlashcards = allFlashcards.concat(cards);
            }
            return allFlashcards;
        } catch (error) {
            console.error("Erro ao carregar os dados dos flashcards:", error);
            document.getElementById('card-question').textContent = 'Erro ao carregar dados.';
            document.getElementById('card-answer').innerHTML = `<p>Não foi possível encontrar o(s) arquivo(s) de dados: ${dataFiles.join(', ')}. Verifique se o arquivo existe em /data/ e se o nome está correto na meta tag do HTML. Lembre-se de rodar isso em um servidor web (como a extensão Live Server do VSCode).</p>`;
            return [];
        }
    }

    async function main() {
        generateHeader();
        const flashcardData = await loadFlashcardData();
        if (flashcardData.length > 0) {
            initializeFlashcards(flashcardData);
        }
    }
    
    function initializeFlashcards(flashcardsData) {
        const flashcard = document.getElementById('flashcard');
        const cardQuestion = document.getElementById('card-question');
        const cardAnswer = document.getElementById('card-answer');
        const cardCategoryFront = document.getElementById('card-category-front');
        const cardCategoryBack = document.getElementById('card-category-back');
        const cardCounter = document.getElementById('card-counter');
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');
        const categoryFiltersContainer = document.getElementById('category-filters');

        let currentFilter = 'Todos';
        let filteredData = [];
        let currentIndex = 0;

        function initialize() {
            createCategoryFilters();
            filterAndRender();
            flashcard.addEventListener('click', () => flashcard.classList.toggle('is-flipped'));
            prevBtn.addEventListener('click', showPrevCard);
            nextBtn.addEventListener('click', showNextCard);
            document.addEventListener('keydown', (e) => {
                if(e.key === 'ArrowRight') showNextCard();
                if(e.key === 'ArrowLeft') showPrevCard();
                if(e.key === ' ') {
                    e.preventDefault(); // Impede a rolagem da página
                    flashcard.classList.toggle('is-flipped');
                }
            });
        }

        function createCategoryFilters() {
            const categories = ['Todos', ...new Set(flashcardsData.map(card => card.category))];
            categoryFiltersContainer.innerHTML = '';
            categories.forEach(category => {
                const btn = document.createElement('button');
                btn.className = 'filter-btn';
                btn.dataset.category = category;
                btn.textContent = category;
                if (category === 'Todos') { btn.classList.add('active'); }
                btn.addEventListener('click', (e) => {
                    e.stopPropagation(); // Impede que o clique no botão vire o card
                    currentFilter = category;
                    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    filterAndRender();
                });
                categoryFiltersContainer.appendChild(btn);
            });
        }
        
        function filterAndRender() {
            if (currentFilter === 'Todos') {
                filteredData = [...flashcardsData];
            } else {
                filteredData = flashcardsData.filter(card => card.category === currentFilter);
            }
            currentIndex = 0;
            if (filteredData.length > 0) {
                renderCard();
            } else {
                cardQuestion.textContent = 'Nenhum card encontrado.';
                cardAnswer.innerHTML = 'Selecione outra categoria.';
                cardCategoryFront.textContent = '';
                cardCategoryBack.textContent = '';
                updateCounter();
            }
        }

        function renderCard() {
            if (flashcard.classList.contains('is-flipped')) {
                flashcard.classList.remove('is-flipped');
            }
            setTimeout(() => {
                if (!filteredData[currentIndex]) return;
                const cardData = filteredData[currentIndex];
                cardQuestion.textContent = cardData.question;
                cardAnswer.innerHTML = cardData.answer;
                cardCategoryFront.textContent = cardData.category;
                cardCategoryBack.textContent = cardData.category;
                updateCounter();
            }, 200);
        }
        
        function updateCounter() {
            if (filteredData.length > 0) {
                cardCounter.textContent = `${currentIndex + 1} / ${filteredData.length}`;
            } else {
                cardCounter.textContent = '0 / 0';
            }
        }

        function showNextCard() {
            if (filteredData.length === 0) return;
            currentIndex = (currentIndex + 1) % filteredData.length;
            renderCard();
        }

        function showPrevCard() {
            if (filteredData.length === 0) return;
            currentIndex = (currentIndex - 1 + filteredData.length) % filteredData.length;
            renderCard();
        }

        initialize();
    }
    
    main();
});
