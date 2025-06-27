// --- GUIA DE ESTUDO AWS v2.5 (com carregamento dinâmico de múltiplos arquivos JSON) ---
console.log("--- GUIA DE ESTUDO AWS v2.5 (com carregamento dinâmico de múltiplos arquivos JSON) ---");

document.addEventListener('DOMContentLoaded', () => {
    const isServicePage = window.location.pathname.includes('/services/');
    const pathPrefix = isServicePage ? '../' : '';

    async function loadComponent(componentName, placeholderId) {
        const placeholder = document.getElementById(placeholderId);
        if (!placeholder) return;

        try {
            const response = await fetch(`${pathPrefix}assets/components/${componentName}.html`);
            if (!response.ok) throw new Error(`${componentName} HTML not found`);

            let componentHTML = await response.text();
            const pathSegments = window.location.pathname.split('/').filter(Boolean);
            const repoName = (pathSegments.length > 0 && !pathSegments[0].endsWith('.html')) ? pathSegments[0] : '';
            const baseURL = window.location.origin + (repoName ? `/${repoName}/` : '/');

            componentHTML = componentHTML.replace(/\{\{baseURL\}\}/g, baseURL);
            placeholder.innerHTML = componentHTML;
        } catch (error) {
            console.error(`Failed to load ${componentName}:`, error);
            placeholder.innerHTML = `<p style="text-align:center; color:red;">Erro ao carregar ${componentName}.</p>`;
        }
    }

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
            if (document.getElementById('jump-container')) {
                document.getElementById('jump-container').style.display = 'none';
            }
        }
    }

    function generateHeader(serviceName, categoryName, categoryLink) {
        const header = document.getElementById('page-header');
        header.innerHTML = `
            <h1>AWS ${serviceName}</h1>
            <p>Guia de estudo interativo para o serviço ${serviceName}.</p>
            <nav class="breadcrumb">
                <a href="${pathPrefix}index.html">Categorias</a> > 
                <a href="${pathPrefix}${categoryLink}">${categoryName}</a> >
                <strong>${serviceName}</strong>
            </nav>
        `;
    }

    async function loadFlashcardData(dataFiles) {
        let allFlashcards = [];
        try {
            for (const fileName of dataFiles) {
                const response = await fetch(`${pathPrefix}data/${fileName}`);
                if (!response.ok) throw new Error(`Falha ao carregar ${fileName}`);
                const cards = await response.json();
                if (cards.quiz && Array.isArray(cards.quiz)) {
                    allFlashcards = allFlashcards.concat(cards.quiz);
                }
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
        const jumpInput = document.getElementById('jump-input');
        const jumpBtn = document.getElementById('jump-btn');

        let allCards = [...flashcardsData];
        let currentIndex = 0;

        function renderCard() {
            if (flashcard.classList.contains('is-flipped')) {
                flashcard.classList.remove('is-flipped');
            }
            setTimeout(() => {
                const cardData = allCards[currentIndex];
                cardQuestion.textContent = cardData.question || 'Sem pergunta';
                cardAnswer.innerHTML = cardData.explanation || 'Sem explicação';
                cardCategoryFront.textContent = cardData.category || '';
                cardCategoryBack.textContent = cardData.category || '';
                updateCounter();
            }, 200);
        }

        function updateCounter() {
            jumpInput.max = allCards.length;
            cardCounter.textContent = allCards.length > 0 ? `${currentIndex + 1} / ${allCards.length}` : '0 / 0';
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

        renderCard();
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

    loadComponent('menu', 'menu-placeholder');
    loadComponent('footer', 'footer-placeholder');
    main();
});
