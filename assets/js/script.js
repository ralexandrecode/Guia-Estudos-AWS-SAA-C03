// --- GUIA DE ESTUDO AWS v2.6 (dinâmico por pasta /data/serviço) ---
console.log("--- GUIA DE ESTUDO AWS v2.6 (com estrutura de diretórios) ---");

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

            let componentHTML = await response.text();

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
        if (!isServicePage) return;

        const flashcardContainer = document.getElementById('flashcard-container');
        if (!flashcardContainer) return;

        const serviceName = document.querySelector('meta[name="aws-service-name"]').content;
        const categoryName = document.querySelector('meta[name="aws-service-category"]').content;
        const categoryLink = document.querySelector('meta[name="aws-service-category-link"]').content;

        const serviceSlug = window.location.pathname.split('/').pop().replace('.html', '');
        const dataFiles = [`${serviceSlug}/${serviceSlug}-cards-1.json`]; // pronto para expandir!

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

    // (Função initializeFlashcards permanece igual ao seu original)

    loadComponent('menu', 'menu-placeholder');
    loadComponent('footer', 'footer-placeholder');
    main();
});
