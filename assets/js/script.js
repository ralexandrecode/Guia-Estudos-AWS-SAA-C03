// --- GUIA DE ESTUDO AWS v2.1 CARREGADO (versão sem filtros) ---
console.log("--- GUIA DE ESTUDO AWS v2.1 CARREGADO (versão sem filtros) ---");

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
        // Elementos da Interface
        const flashcard = document.getElementById('flashcard');
        const cardQuestion = document.getElementById('card-question');
        const cardAnswer = document.getElementById('card-answer');
        const cardCategoryFront = document.getElementById('card-category-front');
        const cardCategoryBack = document.getElementById('card-category-back');
        const cardCounter = document.getElementById('card-counter');
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');
        const jumpInput = document.getElementById('jump-input');
        const jumpBtn = document.getElementById('jump-btn');

        // Variáveis de Estado
        let allCards = [...flashcardsData]; // Agora só temos uma lista
        let currentIndex = 0;

        function renderCard() {
            if (flashcard.classList.contains('is-flipped')) {
                flashcard.classList.remove('is-flipped');
            }

            setTimeout(() => {
                const cardData = allCards[currentIndex];
                cardQuestion.textContent = cardData.question;
                cardAnswer.innerHTML = cardData.answer;
                // A categoria ainda é útil para aparecer no próprio card
                cardCategoryFront.textContent = cardData.category;
                cardCategoryBack.textContent = cardData.category;
                updateCounter();
            }, 200);
        }
        
        function updateCounter() {
            jumpInput.max = allCards.length;
            cardCounter.textContent = allCards.length > 0
                ? `${currentIndex + 1} / ${allCards.length}`
                : '0 / 0';
        }

        function showNextCard() {
            if (allCards.length === 0) return;
            currentIndex = (currentIndex + 1) % allCards.length;
            renderCard();
        }

        function showPrevCard() {
            if (allCards.length === 0) return;
            currentIndex = (currentIndex - 1 + allCards.length) % allCards.length;
            renderCard();
        }

        function jumpToCard() {
            const pageNum = parseInt(jumpInput.value, 10);
            if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= allCards.length) {
                currentIndex = pageNum - 1;
                renderCard();
                jumpInput.value = '';
            } else {
                alert(`Por favor, insira um número entre 1 e ${allCards.length}.`);
                jumpInput.value = '';
            }
        }
        
        // Ponto de entrada da inicialização
        renderCard();
        
        // Adicionar Listeners de evento
        flashcard.addEventListener('click', () => flashcard.classList.toggle('is-flipped'));
        prevBtn.addEventListener('click', showPrevCard);
        nextBtn.addEventListener('click', showNextCard);
        jumpBtn.addEventListener('click', jumpToCard);
        jumpInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') jumpToCard();
        });
        
        document.addEventListener('keydown', (e) => {
            if (document.activeElement === jumpInput) return;
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
