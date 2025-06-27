// PROVA FINAL: SE VOCÊ VIR ESTA MENSAGEM NO CONSOLE (F12), O SCRIPT NOVO CARREGOU.
console.log("--- GUIA DE ESTUDO AWS v2.0 CARREGADO ---");

document.addEventListener('DOMContentLoaded', () => {
    async function main() {
        const flashcardContainer = document.getElementById('flashcard-container');
        if (!flashcardContainer) return;

        const serviceName = document.querySelector('meta[name="aws-service-name"]').content;
        const categoryName = document.querySelector('meta[name="aws-service-category"]').content;
        const categoryLink = document.querySelector('meta[name="aws-service-category-link"]').content;
        const dataFiles = document.querySelector('meta[name="aws-service-data-files"]').content.split(',').map(f => f.trim());

        generateHeader(serviceName, categoryName, categoryLink);
        
        const flashcardData = await loadFlashcardData(dataFiles);

        if (flashcardData && flashcardData.length > 0) {
            initializeFlashcards(flashcardData);
        } else {
            document.getElementById('card-question').textContent = 'Erro ao carregar dados.';
            document.getElementById('card-answer').innerHTML = `<p>Não foi possível carregar os flashcards. Verifique o console (F12) para erros.</p>`;
            document.getElementById('jump-container').style.display = 'none';
        }
    }

    function generateHeader(serviceName, categoryName, categoryLink) {
        const header = document.getElementById('page-header');
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

    async function loadFlashcardData(dataFiles) {
        let allFlashcards = [];
        try {
            for (const fileName of dataFiles) {
                const response = await fetch(`../data/${fileName}`);
                if (!response.ok) throw new Error(`Falha ao carregar ${fileName}`);
                const cards = await response.json();
                allFlashcards = allFlashcards.concat(cards);
            }
            console.log(`Carregados ${allFlashcards.length} flashcards de ${dataFiles.length} arquivo(s).`);
            return allFlashcards;
        } catch (error) {
            console.error("ERRO CRÍTICO AO CARREGAR JSON:", error);
            return null;
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
        const jumpInput = document.getElementById('jump-input');
        const jumpBtn = document.getElementById('jump-btn');

        let currentFilter = 'Todos';
        let filteredData = [];
        let currentIndex = 0;

        function createCategoryFilters() {
            const categories = ['Todos', ...new Set(flashcardsData.map(card => card.category))];
            categoryFiltersContainer.innerHTML = ''; 
            console.log("Criando filtros para as categorias:", categories); // Log para depuração
            
            categories.forEach(category => {
                const btn = document.createElement('button');
                btn.className = 'filter-btn';
                btn.dataset.category = category;
                btn.textContent = category;
                if (category === 'Todos') btn.classList.add('active');
                
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    currentFilter = category;
                    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    filterAndRender();
                });
                categoryFiltersContainer.appendChild(btn);
            });
        }
        
        function filterAndRender() {
            filteredData = (currentFilter === 'Todos') 
                ? [...flashcardsData] 
                : flashcardsData.filter(card => card.category === currentFilter);
            
            currentIndex = 0;
            jumpInput.value = '';
            jumpInput.max = filteredData.length;
            renderCard();
        }

        function renderCard() {
            if (flashcard.classList.contains('is-flipped')) {
                flashcard.classList.remove('is-flipped');
            }

            setTimeout(() => {
                if (filteredData.length === 0) {
                    cardQuestion.textContent = 'Nenhum card encontrado para este filtro.';
                    cardAnswer.innerHTML = '';
                    cardCategoryFront.textContent = currentFilter;
                    cardCategoryBack.textContent = currentFilter;
                    updateCounter();
                    return;
                }

                const cardData = filteredData[currentIndex];
                cardQuestion.textContent = cardData.question;
                cardAnswer.innerHTML = cardData.answer;
                cardCategoryFront.textContent = cardData.category;
                cardCategoryBack.textContent = cardData.category;
                updateCounter();
            }, 200);
        }
        
        function updateCounter() {
            cardCounter.textContent = filteredData.length > 0
                ? `${currentIndex + 1} / ${filteredData.length}`
                : '0 / 0';
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

        function jumpToCard() {
            const pageNum = parseInt(jumpInput.value, 10);
            if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= filteredData.length) {
                currentIndex = pageNum - 1;
                renderCard();
                jumpInput.value = '';
            } else {
                alert(`Por favor, insira um número entre 1 e ${filteredData.length}.`);
                jumpInput.value = '';
            }
        }
        
        // Ponto de entrada da inicialização
        createCategoryFilters();
        filterAndRender();
        
        flashcard.addEventListener('click', () => flashcard.classList.toggle('is-flipped'));
        prevBtn.addEventListener('click', showPrevCard);
        nextBtn.addEventListener('click', showNextCard);
        jumpBtn.addEventListener('click', jumpToCard);
        jumpInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') jumpToCard();
        });
        
        document.addEventListener('keydown', (e) => {
            if (document.activeElement === jumpInput) return; // Não interfere se estiver digitando
            if (e.key === 'ArrowRight') showNextCard();
            if (e.key === 'ArrowLeft') showPrevCard();
            if (e.key === ' ') {
                e.preventDefault();
                flashcard.classList.toggle('is-flipped');
            }
        });
    }

    main();
});
