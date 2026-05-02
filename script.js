// script.js - Här sköter jag allt som har med artiklar och localStorage att göra

// Här laddar jag in alla artiklar från webbläsarens minne
function loadArticles() {
    // Hämtar artiklarna eller skapar en tom lista om det inte finns några
    const articles = JSON.parse(localStorage.getItem('articles')) || [];
    const container = document.getElementById('articles-container');
    
    // Om vi inte är på startsidan (där containern finns) så gör vi inget mer
    if (!container) return;

    // Rensar containern innan jag lägger till artiklarna igen
    container.innerHTML = '';

    // Om det är tomt visar jag ett litet meddelande
    if (articles.length === 0) {
        container.innerHTML = '<p class="text-muted">Inga artiklar ännu. Skapa den första!</p>';
        return;
    }

    // Går igenom varje artikel och skapar HTML för den
    articles.forEach((article, index) => {
        const articleElement = createArticleElement(article, index);
        container.appendChild(articleElement);
    });
}

// Den här funktionen skapar själva HTML-koden för varje artikelkort
function createArticleElement(article, index) {
    const div = document.createElement('div');
    div.className = 'card mb-4 overflow-hidden position-relative';

    // Om artikeln har en bildadress så bygger jag upp kortet med en bild
    if (article.imageUrl) {
        // Jag kollar om det är en jämn eller udda artikel för att snyggt skifta sida på bilden
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
        // Om det inte finns någon bild gör jag ett enklare kort utan bildrutan
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

// Här sparar jag ner en ny artikel till webbläsarens minne
function saveArticle(title, content, imageUrl) {
    const articles = JSON.parse(localStorage.getItem('articles')) || [];
    
    // Skapar ett nytt artikel-objekt med ett unikt ID (tiden just nu)
    const newArticle = {
        id: Date.now().toString(),
        title: title,
        content: content,
        imageUrl: imageUrl || '',
        date: new Date().toISOString()
    };
    
    // Lägger den nya artikeln först i listan
    articles.unshift(newArticle);
    
    // Sparar tillbaka hela listan som en textsträng
    localStorage.setItem('articles', JSON.stringify(articles));
    
    // Uppdaterar listan på sidan och visar en liten bekräftelse
    loadArticles();
    showToast('Artikel sparad!');
}

// Funktion för att ta bort en artikel baserat på dess ID
function deleteArticle(id) {
    const articles = JSON.parse(localStorage.getItem('articles')) || [];
    
    // Skapar en ny lista där den valda artikeln inte är med
    const filteredArticles = articles.filter(article => article.id !== id);
    
    // Sparar den nya listan
    localStorage.setItem('articles', JSON.stringify(filteredArticles));
    
    // Uppdaterar sidan och visar att det är raderat
    loadArticles();
    showToast('Artikel raderad!');
}

// När man klickar på "Läs mer" så sparar jag vilken artikel som valts och skickar vidare användaren
function selectArticle(id) {
    const articles = JSON.parse(localStorage.getItem('articles')) || [];
    const article = articles.find(a => a.id === id);
    if (article) {
        // Sparar den valda artikeln separat så att article.html kan läsa in den
        localStorage.setItem('selectedArticle', JSON.stringify(article));
        window.location.href = 'article.html';
    }
}

// Här sköter jag kommentarerna för en specifik artikel
function loadComments(articleId) {
    // Hämtar kommentarer som är kopplade till just det här artikel-ID:t
    const comments = JSON.parse(localStorage.getItem(`comments_${articleId}`)) || [];
    const container = document.getElementById('comments-container');
    if (!container) return;

    // Rensar och ritar upp alla kommentarer på nytt
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

// Sparar en ny kommentar till en artikel
function saveComment(articleId, text) {
    const comments = JSON.parse(localStorage.getItem(`comments_${articleId}`)) || [];
    const newComment = {
        text: text,
        date: new Date().toISOString()
    };
    
    // Lägger till kommentaren sist i listan
    comments.push(newComment);
    localStorage.setItem(`comments_${articleId}`, JSON.stringify(comments));
    
    // Uppdaterar kommentarsfältet, rensar formuläret och visar en bekräftelse
    loadComments(articleId);
    document.getElementById('comment-form').reset();
    showToast('Kommentar sparad!');
}

// Laddar in hur många likes och dislikes en artikel har fått
function loadLikesDislikes(articleId) {
    const data = JSON.parse(localStorage.getItem(`likes_${articleId}`)) || { likes: 0, dislikes: 0 };
    document.getElementById('likes-count').textContent = data.likes;
    document.getElementById('dislikes-count').textContent = data.dislikes;
}

// Funktion för när någon klickar på Like
function handleLike(articleId) {
    const data = JSON.parse(localStorage.getItem(`likes_${articleId}`)) || { likes: 0, dislikes: 0 };
    data.likes++;
    localStorage.setItem(`likes_${articleId}`, JSON.stringify(data));
    loadLikesDislikes(articleId);
    showToast('Gillar!');
}

// Funktion för när någon klickar på Dislike
function handleDislike(articleId) {
    const data = JSON.parse(localStorage.getItem(`likes_${articleId}`)) || { likes: 0, dislikes: 0 };
    data.dislikes++;
    localStorage.setItem(`likes_${articleId}`, JSON.stringify(data));
    loadLikesDislikes(articleId);
    showToast('Ogillar!');
}

// Min egna funktion för att visa små popup-meddelanden (toasts)
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

    // Ser till att meddelandet försvinner av sig självt efter 3 sekunder
    setTimeout(() => {
        if (toast.parentElement) {
            toast.remove();
        }
    }, 3000);
}

// Här kortar jag ner texten så att bara de första 60 tecknen visas på startsidan
function getPreviewText(content) {
    if (content.length <= 60) return content;
    
    const preview = content.substring(0, 60);
    return preview + '...';
}

// Den här funktionen körs på article.html för att visa hela innehållet i en artikel
function loadSelectedArticle() {
    // Hämtar artikeln som jag sparade ner när man klickade på "Läs mer"
    const article = JSON.parse(localStorage.getItem('selectedArticle'));
    if (!article) {
        document.body.innerHTML = '<p>Artikel hittades inte.</p>';
        return;
    }

    // Fyller i rubrik, innehåll och datum på sidan
    document.getElementById('article-title').textContent = article.title;
    document.getElementById('article-content').innerHTML = formatArticleContent(article.content);
    document.getElementById('article-date').textContent = new Date(article.date).toLocaleDateString('sv-SE');

    // Hanterar bilden om det finns någon
    const articleImage = document.getElementById('article-image');
    if (article.imageUrl && articleImage) {
        articleImage.src = article.imageUrl;
        articleImage.style.display = 'block';
        // Om bilden inte går att ladda så döljer jag den helt
        articleImage.onerror = function() {
            this.style.display = 'none';
        };
    } else if (articleImage) {
        articleImage.style.display = 'none';
    }

    // Laddar även in kommentarer och likes för just denna artikel
    loadComments(article.id);
    loadLikesDislikes(article.id);

    // Sparar ID:t globalt så att kommentar-funktionen vet vilken artikel vi pratar om
    window.currentArticleId = article.id;
}

// Gör om texten så att radbrytningar blir snygga <p>-taggar i HTML
function formatArticleContent(content) {
    // Delar upp texten vid dubbla radbrytningar
    const paragraphs = content.split('\n\n').filter(p => p.trim());
    return paragraphs.map(p => `<p>${p.trim().replace(/\n/g, '<br>')}</p>`).join('');
}

// Här samlar jag alla "lyssnare" som väntar på att saker ska hända på sidan
document.addEventListener('DOMContentLoaded', function() {
    // Om vi är på startsidan så laddar jag in alla artiklar direkt
    if (document.getElementById('articles-container')) {
        loadArticles();
    }

    // Om vi är på artikelsidan så laddar jag in den valda artikeln
    if (document.getElementById('article-title')) {
        loadSelectedArticle();
    }

    // Lyssnar på när formuläret för en ny artikel skickas in
    const articleForm = document.getElementById('article-form');
    if (articleForm) {
        articleForm.addEventListener('submit', function(e) {
            e.preventDefault(); // Hindrar sidan från att laddas om
            
            // Hämtar värdena från alla fält
            const title = document.getElementById('article-title-input').value.trim();
            const content = document.getElementById('article-content-input').value.trim();
            const imageUrl = document.getElementById('article-image-input').value.trim();
            
            // Ser till att det finns åtminstone en rubrik och text innan jag sparar
            if (title && content) {
                saveArticle(title, content, imageUrl);
                articleForm.reset();
                
                // Om vi använder en Bootstrap-modal så stänger jag den efteråt
                const modalElement = document.getElementById('createArticleModal');
                if (modalElement) {
                    const modal = bootstrap.Modal.getInstance(modalElement);
                    if (modal) {
                        modal.hide();
                    }
                }
            } else {
                // Visar ett felmeddelande om man glömt fylla i något
                showToast('Fyll i titel och innehåll!');
            }
        });
    }

    // Lyssnar på när någon vill skriva en kommentar
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