document.addEventListener('DOMContentLoaded', () => {
    // A função principal agora é assíncrona para lidar com o carregamento de dados
    async function main() {
        // Verifica se estamos em uma página de serviço (que tem um flashcard container)
        const flashcardContainer = document.getElementById('flashcard-container');
        if (!flashcardContainer) {
            return; // Não executa o resto do script se não for uma página de serviço
        }

        // 1. Ler os metadados do HTML
        const serviceName = document.querySelector('meta[name="aws-service-name"]').content;
        const categoryName = document.querySelector('meta[name="aws-service-category"]').content;
        const categoryLink = document.querySelector('meta[name="aws-service-category-link"]').content;
        const dataFiles = document.querySelector('meta[name="aws-service-data-files"]').content.split(',').map(f => f.trim());

        // 2. Gerar o cabeçalho da página dinamicamente
        generateHeader(serviceName, categoryName, categoryLink);

        // 3. Carregar TODOS os dados dos arquivos JSON
        const flashcardData = await loadFlashcardData(dataFiles);

        // 4. SÓ DEPOIS de carregar os dados, inicializar a interface
        if (flashcardData && flashcardData.length > 0) {
            initializeFlashcards(flashcardData);
        } else {
            // Exibe mensagem de erro se nenhum dado for carregado
            document.getElementById('card-question').textContent = 'Erro ou nenhum dado encontrado.';
            document.getElementById('card-answer').innerHTML = `<p>Não foi possível carregar os flashcards. Verifique se os arquivos JSON em /data/ estão corretos e se os nomes correspondem aos da meta tag no HTML.</p>`;
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
                if (!response.ok) {
                    throw new Error(`Falha ao carregar ${fileName}: ${response.statusText}`);
                }
                const cards = await response.json();
                allFlashcards = allFlashcards.concat(cards);
            }
            return allFlashcards;
        } catch (error) {
            console.error("Erro ao carregar os dados dos flashcards:", error);
            return null; // Retorna null em caso de erro
        }
    }
    
    function initializeFlashcards(flashcardsData) {
        // Elementos da Interface
        const flashcard = document.getElementById('flashcard');
        const cardQuestion = document.getElementById('card-question');
        const cardAnswer = document.getElementById('card-answer');
        const cardCategoryFront = document.getElementById('card-category-front');
        const cardCategoryBack = document.getElementById('card-category-back');
        const cardCounter = document.getElementById('card-counter');
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');
        const categoryFiltersContainer = document.getElementById('category-filters');

        // Variáveis de Estado
        let currentFilter = 'Todos';
        let filteredData = [];
        let currentIndex = 0;

        function createCategoryFilters() {
            // ESTA É A LÓGICA CORRIGIDA: Usa o 'flashcardsData' completo para criar as categorias
            const categories = ['Todos', ...new Set(flashcardsData.map(card => card.category))];
            categoryFiltersContainer.innerHTML = ''; // Limpa quaisquer botões antigos
            
            categories.forEach(category => {
                const btn = document.createElement('button');
                btn.className = 'filter-btn';
                btn.dataset.category = category;
                btn.textContent = category;
                if (category === 'Todos') { btn.classList.add('active'); }
                
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
            if (currentFilter === 'Todos') {
                filteredData = [...flashcardsData];
            } else {
                filteredData = flashcardsData.filter(card => card.category === currentFilter);
            }
            currentIndex = 0;
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
        
        // Ponto de entrada da inicialização dos flashcards
        createCategoryFilters();
        filterAndRender();
        
        // Adicionar Listeners de evento
        flashcard.addEventListener('click', () => flashcard.classList.toggle('is-flipped'));
        prevBtn.addEventListener('click', showNextCard); // Corrigido para ir para o próximo
        nextBtn.addEventListener('click', showNextCard); // Mantido como próximo (o anterior pode ser confuso)
        prevBtn.addEventListener('click', showPrevCard); // Corrigido para ir para o anterior
        
        document.addEventListener('keydown', (e) => {
            if(e.key === 'ArrowRight') showNextCard();
            if(e.key === 'ArrowLeft') showPrevCard();
            if(e.key === ' ') {
                e.preventDefault();
                flashcard.classList.toggle('is-flipped');
            }
        });
    }

    // Inicia a execução do script
    main();
});
