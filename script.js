// script.js - Hantering av artiklar med localStorage

// Funktioner för artiklar
function loadArticles() {
    const articles = JSON.parse(localStorage.getItem('articles')) || [];
    const container = document.getElementById('articles-container');
    if (!container) return;

    container.innerHTML = '';

    if (articles.length === 0) {
        container.innerHTML = '<p class="text-muted">Inga artiklar ännu. Skapa den första!</p>';
        return;
    }

    articles.forEach((article, index) => {
        const articleElement = createArticleElement(article, index);
        container.appendChild(articleElement);
    });
}

function createArticleElement(article, index) {
    const div = document.createElement('div');
    div.className = 'card mb-4 overflow-hidden position-relative';

    if (article.imageUrl) {
        // Med bild - använd samma layout som gamla artiklar, alternera vänster/höger
        const isReversed = index % 2 === 1; // Varannan artikel har bilden på höger sida
        const rowClass = isReversed ? 'flex-md-row-reverse' : '';
        
        div.innerHTML = `
            <div class="row g-0 ${rowClass}">
                <div class="col-md-5">
                    <img src="${article.imageUrl}" class="img-fluid rounded h-100 object-fit-cover w-100" alt="${article.title}" onerror="this.style.display='none'">
                </div>
                <div class="col-md-7">
                    <div class="card-body">
                        <span class="badge bg-primary mb-2">NYHET</span>
                        <h3 class="card-title h4">${article.title}</h3>
                        <p class="card-text">${getPreviewText(article.content)}</p>
                        <small class="text-muted">${new Date(article.date).toLocaleDateString('sv-SE')}</small>
                        <div class="mt-2">
                            <button class="btn btn-success btn-sm me-2" onclick="selectArticle('${article.id}')">Läs mer</button>
                            <button class="btn btn-danger btn-sm" onclick="deleteArticle('${article.id}')">Radera</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    } else {
        // Utan bild - enkel layout med badge
        div.innerHTML = `
            <div class="card-body">
                <span class="badge bg-secondary mb-2">ARTIKEL</span>
                <h3 class="card-title h4">${article.title}</h3>
                <p class="card-text">${getPreviewText(article.content)}</p>
                <small class="text-muted">${new Date(article.date).toLocaleDateString('sv-SE')}</small>
                <div class="mt-2">
                    <button class="btn btn-success btn-sm me-2" onclick="selectArticle('${article.id}')">Läs mer</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteArticle('${article.id}')">Radera</button>
                </div>
            </div>
        `;
    }

    return div;
}

function saveArticle(title, content, imageUrl) {
    const articles = JSON.parse(localStorage.getItem('articles')) || [];
    const newArticle = {
        id: Date.now().toString(),
        title: title,
        content: content,
        imageUrl: imageUrl || '',
        date: new Date().toISOString()
    };
    articles.unshift(newArticle); // Lägg till först
    localStorage.setItem('articles', JSON.stringify(articles));
    loadArticles();
    showToast('Artikel sparad!');
}

function deleteArticle(id) {
    const articles = JSON.parse(localStorage.getItem('articles')) || [];
    const filteredArticles = articles.filter(article => article.id !== id);
    localStorage.setItem('articles', JSON.stringify(filteredArticles));
    loadArticles();
    showToast('Artikel raderad!');
}

function selectArticle(id) {
    const articles = JSON.parse(localStorage.getItem('articles')) || [];
    const article = articles.find(a => a.id === id);
    if (article) {
        localStorage.setItem('selectedArticle', JSON.stringify(article));
        window.location.href = 'article.html';
    }
}

// Funktioner för kommentarer (för article.html)
function loadComments(articleId) {
    const comments = JSON.parse(localStorage.getItem(`comments_${articleId}`)) || [];
    const container = document.getElementById('comments-container');
    if (!container) return;

    container.innerHTML = '';
    comments.forEach(comment => {
        const commentElement = document.createElement('div');
        commentElement.className = 'mb-3 p-3 bg-light rounded';
        commentElement.innerHTML = `
            <div class="comment-text">${comment.text.replace(/\n/g, '<br>')}</div>
            <small class="text-muted">${new Date(comment.date).toLocaleDateString('sv-SE')}</small>
        `;
        container.appendChild(commentElement);
    });
}

function saveComment(articleId, text) {
    const comments = JSON.parse(localStorage.getItem(`comments_${articleId}`)) || [];
    const newComment = {
        text: text,
        date: new Date().toISOString()
    };
    comments.push(newComment);
    localStorage.setItem(`comments_${articleId}`, JSON.stringify(comments));
    loadComments(articleId);
    document.getElementById('comment-form').reset();
    showToast('Kommentar sparad!');
}

// Funktioner för likes/dislikes (för article.html)
function loadLikesDislikes(articleId) {
    const data = JSON.parse(localStorage.getItem(`likes_${articleId}`)) || { likes: 0, dislikes: 0 };
    document.getElementById('likes-count').textContent = data.likes;
    document.getElementById('dislikes-count').textContent = data.dislikes;
}

function handleLike(articleId) {
    const data = JSON.parse(localStorage.getItem(`likes_${articleId}`)) || { likes: 0, dislikes: 0 };
    data.likes++;
    localStorage.setItem(`likes_${articleId}`, JSON.stringify(data));
    loadLikesDislikes(articleId);
    showToast('Gillar!');
}

function handleDislike(articleId) {
    const data = JSON.parse(localStorage.getItem(`likes_${articleId}`)) || { likes: 0, dislikes: 0 };
    data.dislikes++;
    localStorage.setItem(`likes_${articleId}`, JSON.stringify(data));
    loadLikesDislikes(articleId);
    showToast('Ogillar!');
}

// Funktion för toast-notifikationer
function showToast(message) {
    const toastContainer = document.getElementById('toast-container');
    if (!toastContainer) return;

    const toast = document.createElement('div');
    toast.className = 'toast align-items-center text-white bg-success border-0 show';
    toast.setAttribute('role', 'alert');
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">${message}</div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" onclick="this.parentElement.parentElement.remove()"></button>
        </div>
    `;
    toastContainer.appendChild(toast);

    // Ta bort efter 3 sekunder
    setTimeout(() => {
        if (toast.parentElement) {
            toast.remove();
        }
    }, 3000);
}

// Funktion för att skapa förhandsvisning av artikelinnehåll
function getPreviewText(content) {
    // Ta första 150 tecken och hitta sista hela meningen
    const preview = content.substring(0, 150);
    const lastSentenceEnd = Math.max(
        preview.lastIndexOf('.'),
        preview.lastIndexOf('!'),
        preview.lastIndexOf('?'),
        preview.lastIndexOf('\n')
    );
    
    const cleanPreview = lastSentenceEnd > 0 ? preview.substring(0, lastSentenceEnd + 1) : preview;
    return cleanPreview + (content.length > cleanPreview.length ? '...' : '');
}

// Funktion för att ladda vald artikel (för article.html)
function loadSelectedArticle() {
    const article = JSON.parse(localStorage.getItem('selectedArticle'));
    if (!article) {
        document.body.innerHTML = '<p>Artikel hittades inte.</p>';
        return;
    }

    document.getElementById('article-title').textContent = article.title;
    document.getElementById('article-content').innerHTML = formatArticleContent(article.content);
    document.getElementById('article-date').textContent = new Date(article.date).toLocaleDateString('sv-SE');

    const articleImage = document.getElementById('article-image');
    if (article.imageUrl && articleImage) {
        articleImage.src = article.imageUrl;
        articleImage.style.display = 'block';
        articleImage.onerror = function() {
            this.style.display = 'none';
        };
    } else if (articleImage) {
        articleImage.style.display = 'none';
    }

    loadComments(article.id);
    loadLikesDislikes(article.id);

    // Spara articleId för kommentarer och likes
    window.currentArticleId = article.id;
}

// Funktion för att formatera artikelinnehåll med bättre spacing
function formatArticleContent(content) {
    // Konvertera radbrytningar till paragrafer
    const paragraphs = content.split('\n\n').filter(p => p.trim());
    return paragraphs.map(p => `<p>${p.trim().replace(/\n/g, '<br>')}</p>`).join('');
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // För index.html
    if (document.getElementById('articles-container')) {
        loadArticles();
    }

    // För article.html
    if (document.getElementById('article-title')) {
        loadSelectedArticle();
    }

    // Formulär för ny artikel
    const articleForm = document.getElementById('article-form');
    if (articleForm) {
        articleForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const title = document.getElementById('article-title-input').value.trim();
            const content = document.getElementById('article-content-input').value.trim();
            const imageUrl = document.getElementById('article-image-input').value.trim();
            if (title && content) {
                saveArticle(title, content, imageUrl);
                articleForm.reset();
            } else {
                showToast('Fyll i titel och innehåll!');
            }
        });
    }

    // Formulär för kommentarer
    const commentForm = document.getElementById('comment-form');
    if (commentForm) {
        commentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const text = document.getElementById('comment-text').value.trim();
            if (text && window.currentArticleId) {
                saveComment(window.currentArticleId, text);
            } else {
                showToast('Skriv en kommentar!');
            }
        });
    }
});