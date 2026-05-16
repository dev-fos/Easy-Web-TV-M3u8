// Manga List Page JS - MangaDex API Version
// MangaDex API base URL with CORS proxy pool
const CORS_PROXIES = {
    0: 'https://cors.luckydesigner.workers.dev/?',
    1: 'https://corsproxy.io/?',
    2: 'https://api.allorigins.win/raw?url=',
};
const MANGADEX_API = 'https://api.mangadex.org';

// Get random CORS proxy
function getProxy() {
    const keys = Object.keys(CORS_PROXIES);
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    return CORS_PROXIES[randomKey];
}

// Global variables
let pnum = 1;
let currentCategory = '';
let currentSource = 'mangadex';
let isLoading = false;
let searchKeyword = '';
let totalMangas = [];

// Toast notification
function showToast(message, type = 'info') {
    const iconMap = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        info: 'fa-info-circle',
        warning: 'fa-exclamation-triangle'
    };
    
    // Remove existing toasts
    $('.toast-notification').remove();
    
    const toast = $(`
        <div class="toast-notification ${type}" style="
            position: fixed;
            top: 80px;
            right: 20px;
            padding: 15px 20px;
            background: rgba(0,0,0,0.9);
            border: 2px solid ${type === 'error' ? '#dc3545' : type === 'success' ? '#28a745' : '#a3001b'};
            border-radius: 10px;
            color: #fff;
            z-index: 9999;
            display: flex;
            align-items: center;
            gap: 10px;
            animation: slideIn 0.3s ease;
        ">
            <i class="fas ${iconMap[type]}" style="color: ${type === 'error' ? '#dc3545' : type === 'success' ? '#28a745' : '#a3001b'}"></i>
            <span>${message}</span>
        </div>
    `);
    
    $('body').append(toast);
    
    setTimeout(function() {
        toast.fadeOut(300, function() {
            $(this).remove();
        });
    }, 3000);
}

// Show/Hide loading
function showLoading(show = true) {
    if (show) {
        $('#loadMoreIndicator').show();
        if ($('#contentGrid').children().length === 0 || !$('#contentGrid').hasClass('has-results')) {
            $('#contentGrid').html('<div class="loading-state"><i class="fas fa-spinner"></i><span>Loading manga...</span></div>');
        }
    } else {
        $('#loadMoreIndicator').hide();
    }
}

// Toggle sidebar
function toggleSidebar() {
    const sidebar = $('#sidebar');
    
    if (window.innerWidth <= 768) {
        sidebar.toggleClass('show-mobile');
    } else {
        sidebar.toggleClass('collapsed');
    }
}

// Get cover art URL from MangaDex
function getCoverUrl(mangaId, coverArt) {
    if (!coverArt || !coverArt.attributes) {
        return '../images/noimage.jpeg';
    }
    const fileName = coverArt.attributes.fileName;
    return `https://uploads.mangadex.org/covers/${mangaId}/${fileName}.256.jpg`;
}

// Render manga cards
function renderMangas(mangas, append = false) {
    const grid = $('#contentGrid');
    
    if (!append) {
        grid.empty();
        grid.addClass('has-results');
    }
    
    if (mangas.length === 0 && !append) {
        grid.html('<div class="empty-state"><i class="fas fa-book-open"></i><p>No manga found</p></div>');
        return;
    }
    
    mangas.forEach(function(manga) {
        const title = manga.attributes.title.en || 
                     manga.attributes.title['ja-ro'] || 
                     manga.attributes.title.ja || 
                     Object.values(manga.attributes.title)[0] || 
                     'Unknown Title';
        
        const coverUrl = manga.coverUrl || '../images/noimage.jpeg';
        const mangaId = manga.id;
        
        const card = $(`
            <a href="../catalogues/mangaplay.html?id=${mangaId}" class="card-item">
                <img class="card-image" src="${coverUrl}" alt="${title}" onerror="this.src='../images/noimage.jpeg'">
                <div class="card-overlay"></div>
                <div class="card-play-icon">
                    <i class="fas fa-book-open"></i>
                </div>
                <div class="card-info">
                    <div class="card-type">Manga</div>
                    <h3 class="card-title">${title}</h3>
                    <p class="card-chapter">${manga.attributes.status || 'Ongoing'}</p>
                </div>
            </a>
        `);
        grid.append(card);
    });
}

// Render categories (MangaDex tags/genres)
function renderCategories(categories) {
    const list = $('#categoryList');
    list.empty();
    
    // Add "All" category first
    list.append(`
        <div class="category-item active" data-id="" data-name="All">
            <i class="fas fa-globe"></i>
            <span>All Manga</span>
        </div>
    `);
    
    categories.forEach(function(cat) {
        const item = $(`
            <div class="category-item" data-id="${cat.id}" data-name="${cat.name}">
                <i class="fas fa-bookmark"></i>
                <span>${cat.name}</span>
            </div>
        `);
        list.append(item);
    });
    
    // Bind click events
    $('.category-item').on('click', function() {
        $('.category-item').removeClass('active');
        $(this).addClass('active');
        
        const tagId = $(this).data('id');
        currentCategory = tagId;
        pnum = 1;
        searchKeyword = '';
        loadMangas(tagId, false);
        
        // Hide sidebar on mobile
        if (window.innerWidth <= 768) {
            $('#sidebar').removeClass('show-mobile');
        }
    });
}

// Load manga tags/genres from MangaDex API
async function loadTags() {
    $('#categoryList').html('<div class="loading-state"><i class="fas fa-spinner"></i><span>Loading categories...</span></div>');
    
    try {
        const response = await fetch(getProxy() + encodeURIComponent(`${MANGADEX_API}/manga/tag`));
        const data = await response.json();
        
        if (data.result === 'ok' && data.data) {
            // Filter for genre-type tags (group: 'genre')
            const genres = data.data.filter(tag => tag.attributes.group === 'genre');
            
            const categories = genres.map(tag => ({
                id: tag.id,
                name: tag.attributes.name.en || Object.values(tag.attributes.name)[0] || 'Unknown'
            })).sort((a, b) => a.name.localeCompare(b.name));
            
            renderCategories(categories);
            
            // Load initial manga list
            loadMangas('', false);
        } else {
            showToast('Failed to load categories', 'error');
            // Still try to load manga
            renderCategories([]);
            loadMangas('', false);
        }
    } catch (error) {
        console.error('Error loading tags:', error);
        showToast('Failed to load categories', 'error');
        renderCategories([]);
        loadMangas('', false);
    }
}

// Load mangas from MangaDex API
async function loadMangas(tagId, append = true) {
    if (isLoading) return;
    isLoading = true;
    showLoading(true);
    
    const limit = 20;
    const offset = append ? (pnum - 1) * limit : 0;
    
    try {
        // Build API URL
        let apiUrl = `${MANGADEX_API}/manga?limit=${limit}&offset=${offset}&order[rating]=desc&includes[]=cover_art&contentRating[]=safe&contentRating[]=suggestive`;
        
        if (tagId) {
            apiUrl += `&includedTags[]=${tagId}`;
        }
        
        if (searchKeyword) {
            apiUrl += `&title=${encodeURIComponent(searchKeyword)}`;
        }
        
        const response = await fetch(getProxy() + encodeURIComponent(apiUrl));
        const data = await response.json();
        
        if (data.result === 'ok' && data.data) {
            // Process manga data and get cover URLs
            const mangas = data.data.map(manga => {
                // Find cover art from relationships
                const coverArt = manga.relationships.find(rel => rel.type === 'cover_art');
                manga.coverUrl = getCoverUrl(manga.id, coverArt);
                return manga;
            });
            
            renderMangas(mangas, append);
            
            // Check if there are more results
            if (data.total > offset + limit) {
                pnum++;
            }
        } else {
            if (!append) {
                $('#contentGrid').html('<div class="empty-state"><i class="fas fa-exclamation-circle"></i><p>Failed to load manga</p></div>');
            }
            showToast('Failed to load manga', 'error');
        }
    } catch (error) {
        console.error('Error loading manga:', error);
        if (!append) {
            $('#contentGrid').html('<div class="empty-state"><i class="fas fa-exclamation-circle"></i><p>Failed to load manga</p></div>');
        }
        showToast('Network error occurred', 'error');
    }
    
    isLoading = false;
    showLoading(false);
}

// Search mangas
function searchMangas(keyword) {
    if (!keyword) {
        searchKeyword = '';
        pnum = 1;
        loadMangas(currentCategory, false);
        return;
    }
    
    searchKeyword = keyword;
    pnum = 1;
    loadMangas(currentCategory, false);
}

// Initialize
$(document).ready(function() {
    console.log('=== Manga List Page Loaded (MangaDex API) ===');
    
    // Load source options
    $('#sourceSelect').append('<option value="mangadex">MangaDex</option>');
    
    // Load initial data
    loadTags();
    
    // Source change handler
    $('#sourceSelect').on('change', function() {
        currentSource = $(this).val();
        pnum = 1;
        currentCategory = '';
        searchKeyword = '';
        loadTags();
    });
    
    // Back button
    $('#backBtn').on('click', function() {
        window.history.back();
    });
    
    // Menu toggle
    $('#menuBtn').on('click', function() {
        toggleSidebar();
    });
    
    $('#toggleSidebar').on('click', function() {
        toggleSidebar();
    });
    
    // Search handler
    $('#searchInput').on('keypress', function(e) {
        if (e.which === 13) {
            const keyword = $(this).val().trim();
            searchMangas(keyword);
        }
    });
    
    // Scroll to load more
    $('#contentArea').on('scroll', function() {
        const scrollTop = $(this).scrollTop();
        const scrollHeight = $(this)[0].scrollHeight;
        const height = $(this).height();
        
        if (scrollTop + height >= scrollHeight - 100) {
            if (!isLoading) {
                loadMangas(currentCategory, true);
            }
        }
    });
});
