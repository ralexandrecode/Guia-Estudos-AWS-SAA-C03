
// --- GUIA DE ESTUDO AWS v2.5 (com estrutura de diretórios) ---
console.log("--- GUIA DE ESTUDO AWS v2.5 (com estrutura de diretórios) ---");

document.addEventListener('DOMContentLoaded', () => {
    // Detecta o nível de profundidade da página atual
    const pathSegments = window.location.pathname.split('/').filter(Boolean);
    const currentPage = pathSegments[pathSegments.length - 1];
    
    let pathPrefix = '';
    let isServicePage = false;
    
    // Determina o prefixo baseado na estrutura de diretórios
    if (pathSegments.includes('services')) {
        // Estamos em services/categoria/servico.html (2 níveis acima)
        pathPrefix = '../../';
        isServicePage = true;
    } else if (pathSegments.includes('categories')) {
        // Estamos em categories/categoria.html (1 nível acima)
        pathPrefix = '../';
    } else {
        // Estamos na raiz (index.html)
        pathPrefix = '';
    }

    // Função para carregar componentes (menu e footer)
    async function loadComponent(componentName, placeholderId) {
        const placeholder = document.getElementById(placeholderId);
        if (!placeholder) return;

        try {
            const response = await fetch(`${pathPrefix}assets/components/${componentName}.html`);
            if (!response.ok) throw new Error(`${componentName} HTML not found`);
            
            let componentHTML = await response.text();
            
            // Corrige a baseURL dos links nos componentes
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
    
    // Função principal para páginas de serviços
    async function main() {
        if (!isServicePage) return; // Só executa em páginas de serviços
        
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
                cardQuestion.textContent = cardData.question;
                cardAnswer.innerHTML = cardData.answer;
                cardCategoryFront.textContent = cardData.category;
                cardCategoryBack.textContent = cardData.category;
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

    // Ponto de entrada da aplicação
    loadComponent('menu', 'menu-placeholder');
    loadComponent('footer', 'footer-placeholder');
    main();
});
