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
    const shuffleBtn = document.getElementById('shuffle-btn');

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

    function shuffleCards() {
        cards.sort(() => Math.random() - 0.5);
        index = 0;
        renderCard();
    }

    renderCard();
    flashcard.addEventListener('click', () => flashcard.classList.toggle('is-flipped'));
    prev.addEventListener('click', prevCard);
    next.addEventListener('click', nextCard);
    jumpBtn.addEventListener('click', jumpTo);
    jumpInput.addEventListener('keydown', e => { if (e.key === 'Enter') jumpTo(); });
    if (shuffleBtn) shuffleBtn.addEventListener('click', shuffleCards);

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
