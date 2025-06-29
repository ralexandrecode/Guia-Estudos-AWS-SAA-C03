// --- GUIA DE ESTUDO AWS v2.7 (carregamento dinâmico e escalável até 1000 arquivos) ---
console.log("--- GUIA DE ESTUDO AWS v2.7 ---");

document.addEventListener('DOMContentLoaded', () => {
    const pathSegments = window.location.pathname.split('/').filter(Boolean);
    const currentPage = pathSegments[pathSegments.length - 1];

    let pathPrefix = '';
    let isServicePage = false;

    if (pathSegments.includes('services')) {
        pathPrefix = '../../';
        isServicePage = true;
    } else if (pathSegments.includes('categories')) {
        pathPrefix = '../';
    } else {
        pathPrefix = '';
    }

    async function loadComponent(componentName, placeholderId) {
        const placeholder = document.getElementById(placeholderId);
        if (!placeholder) return;

        try {
            const response = await fetch(`${pathPrefix}assets/components/${componentName}.html`);
            if (!response.ok) throw new Error(`${componentName} HTML not found`);

            let html = await response.text();
            const repo = (pathSegments.length > 0 && !pathSegments[0].endsWith('.html')) ? pathSegments[0] : '';
            const base = window.location.origin + (repo ? `/${repo}/` : '/');
            placeholder.innerHTML = html.replace(/\{\{baseURL\}\}/g, base);
        } catch (err) {
            console.error(`Erro ao carregar ${componentName}:`, err);
            placeholder.innerHTML = `<p style="text-align:center; color:red;">Erro ao carregar ${componentName}.</p>`;
        }
    }

    async function main() {
        if (!isServicePage) return;
        const container = document.getElementById('flashcard-container');
        if (!container) return;

        const serviceName = document.querySelector('meta[name="aws-service-name"]').content;
        const categoryName = document.querySelector('meta[name="aws-service-category"]').content;
        const categoryLink = document.querySelector('meta[name="aws-service-category-link"]').content;
        const serviceSlug = currentPage.replace('.html', '');

        generateHeader(serviceName, categoryName, categoryLink);

        const flashcardData = await loadFlashcardData(serviceSlug);
        if (flashcardData && flashcardData.length > 0) {
            initializeFlashcards(flashcardData);
        } else {
            document.getElementById('card-question').textContent = 'Erro ao carregar dados.';
            document.getElementById('card-answer').innerHTML = `<p>Não foi possível carregar os flashcards. Verifique o console (F12) para erros.</p>`;
            const jump = document.getElementById('jump-container');
            if (jump) jump.style.display = 'none';
        }
    }

    function generateHeader(service, category, link) {
        const header = document.getElementById('page-header');
        header.innerHTML = `
            <h1>AWS ${service}</h1>
            <p>Guia de estudo interativo para o serviço ${service}.</p>
            <nav class="breadcrumb">
                <a href="${pathPrefix}index.html">Categorias</a> > 
                <a href="${pathPrefix}${link}">${category}</a> >
                <strong>${service}</strong>
            </nav>
        `;
    }

    async function loadFlashcardData(serviceSlug) {
        let allFlashcards = [];
        for (let i = 1; i <= 1000; i++) {
            const filePath = `${pathPrefix}data/${serviceSlug}/${serviceSlug}-cards-${i}.json`;
            try {
                const response = await fetch(filePath);
                if (!response.ok) break;
                const data = await response.json();
                allFlashcards = allFlashcards.concat(data);
            } catch (err) {
                break;
            }
        }
        console.log(`Flashcards carregados para "${serviceSlug}": ${allFlashcards.length}`);
        return allFlashcards;
    }

    function initializeFlashcards(cards) {
        const flashcard = document.getElementById('flashcard');
        const q = document.getElementById('card-question');
        const a = document.getElementById('card-answer');
        const cf = document.getElementById('card-category-front');
        const cb = document.getElementById('card-category-back');
        const count = document.getElementById('card-counter');
        const prev = document.getElementById('prev-btn');
        const next = document.getElementById('next-btn');
        const jumpInput = document.getElementById('jump-input');
        const jumpBtn = document.getElementById('jump-btn');

        let index = 0;

        function renderCard() {
            if (flashcard.classList.contains('is-flipped')) flashcard.classList.remove('is-flipped');
            setTimeout(() => {
                const card = cards[index];
                q.textContent = card.question;
                a.innerHTML = card.answer;
                cf.textContent = card.category;
                cb.textContent = card.category;
                count.textContent = `${index + 1} / ${cards.length}`;
                jumpInput.max = cards.length;
            }, 200);
        }

        function nextCard() {
            index = (index + 1) % cards.length;
            renderCard();
        }

        function prevCard() {
            index = (index - 1 + cards.length) % cards.length;
            renderCard();
        }

        function jumpTo() {
            const i = parseInt(jumpInput.value, 10);
            if (!isNaN(i) && i >= 1 && i <= cards.length) {
                index = i - 1;
                renderCard();
                jumpInput.value = '';
            } else {
                alert(`Insira um número de 1 a ${cards.length}.`);
                jumpInput.value = '';
            }
        }

        renderCard();
        flashcard.addEventListener('click', () => flashcard.classList.toggle('is-flipped'));
        prev.addEventListener('click', prevCard);
        next.addEventListener('click', nextCard);
        jumpBtn.addEventListener('click', jumpTo);
        jumpInput.addEventListener('keydown', e => { if (e.key === 'Enter') jumpTo(); });

        document.addEventListener('keydown', e => {
            if (document.activeElement === jumpInput) return;
            if (e.key === 'ArrowRight') nextCard();
            if (e.key === 'ArrowLeft') prevCard();
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
