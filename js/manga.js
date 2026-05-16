/**
 * Manga Reader - MangaDex API Integration
 * Using MangaDex API (free, no key required)
 */

// API Base URL with CORS proxy pool
const CORS_PROXIES = {
    0: 'https://cors.luckydesigner.workers.dev/?',
    1: 'https://corsproxy.io/?',
    2: 'https://api.allorigins.win/raw?url=',
};
const MANGADEX_API = 'https://api.mangadex.org';
const MANGADEX_COVER = 'https://uploads.mangadex.org/covers';

// Get random CORS proxy
function getProxy() {
    const keys = Object.keys(CORS_PROXIES);
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    return CORS_PROXIES[randomKey];
}

// State
let currentManga = null;
let currentChapter = null;
let chapters = [];
let currentPageIndex = 0;
let currentPages = [];
let mangaInfo = null;
let isScrollMode = true;

// Get manga ID from URL
function getMangaId() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id') || params.get('mangaId');
}

// Get chapter ID from URL
function getChapterId() {
    const params = new URLSearchParams(window.location.search);
    return params.get('chapter');
}

// Initialize
$(document).ready(function() {
    const mangaId = getMangaId();
    const chapterId = getChapterId();
    
    if (mangaId) {
        loadManga(mangaId, chapterId);
    } else {
        showError('No manga specified');
    }
    
    setupEventListeners();
});

// Toggle sidebar - toggle chapter list and toolbar visibility
function toggleSidebar() {
    var sidebar = $('#sidebar');
    var toolbar = $('.top-toolbar');
    var readerArea = $('#readerWrapper');
    
    // Toggle sidebar
    if (window.innerWidth <= 768) {
        sidebar.toggleClass('show-mobile');
    } else {
        sidebar.toggleClass('collapsed');
    }
    
    // Show toolbar when sidebar is expanded, hide when collapsed
    var isExpanded = (window.innerWidth <= 768) ? sidebar.hasClass('show-mobile') : !sidebar.hasClass('collapsed');
    
    if (isExpanded) {
        toolbar.removeClass('hidden');
        readerArea.removeClass('expanded');
    } else {
        toolbar.addClass('hidden');
        readerArea.addClass('expanded');
    }
}

// Setup Event Listeners
function setupEventListeners() {
    // Toggle sidebar button
    $('#toggleSidebar').click(function() {
        toggleSidebar();
    });
    
    // Menu button - hides toolbar for immersive reading
    $('#menuBtn').click(function() {
        var sidebar = $('#sidebar');
        var toolbar = $('.top-toolbar');
        var readerArea = $('#readerWrapper');
        
        // Hide toolbar for immersive reading
        toolbar.addClass('hidden');
        sidebar.toggleClass('hidden');
        readerArea.addClass('expanded');
        
        // Collapse sidebar
        if (window.innerWidth <= 768) {
            sidebar.removeClass('show-mobile');
        } else {
            sidebar.addClass('collapsed');
        }
    });
    
    // Back button
    $('#backBtn').click(function() {
        window.history.back();
    });
    
    // Chapter search
    $('#chapterSearch').on('input', function() {
        const query = $(this).val().toLowerCase();
        $('.chapter-item').each(function() {
            const name = $(this).find('.chapter-name').text().toLowerCase();
            $(this).toggle(name.includes(query));
        });
    });
    
    // Navigation buttons
    $('#prevPageBtn').click(function() {
        if (currentPageIndex > 0) {
            currentPageIndex--;
            displayCurrentPage();
        }
    });
    
    $('#nextPageBtn').click(function() {
        if (currentPageIndex < currentPages.length - 1) {
            currentPageIndex++;
            displayCurrentPage();
        }
    });
    
    $('#prevChapterBtn').click(function() {
        const currentIndex = chapters.findIndex(c => c.id === currentChapter);
        if (currentIndex < chapters.length - 1) {
            loadChapter(chapters[currentIndex + 1].id);
        }
    });
    
    $('#nextChapterBtn').click(function() {
        const currentIndex = chapters.findIndex(c => c.id === currentChapter);
        if (currentIndex > 0) {
            loadChapter(chapters[currentIndex - 1].id);
        }
    });
    
    // Random chapter button
    $('#scrollModeBtn').click(function() {
        if (chapters.length > 0) {
            const randomIndex = Math.floor(Math.random() * chapters.length);
            loadChapter(chapters[randomIndex].id);
        }
    });
    
    // Info panel
    $('#infoBtn').click(function() {
        $('#mangaInfoPanel').toggleClass('show');
    });
    
    // Fullscreen
    $('#fullscreenBtn').click(function() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            $(this).find('i').removeClass('fa-expand').addClass('fa-compress');
        } else {
            document.exitFullscreen();
            $(this).find('i').removeClass('fa-compress').addClass('fa-expand');
        }
    });
    
    // GitHub
    $('#githubBtn').click(function() {
        window.open('https://github.com/zhangboheng/Easy-Web-TV-M3u8', '_blank');
    });
    
    // Keyboard navigation
    $(document).keydown(function(e) {
        if (e.key === 'ArrowLeft') {
            $('#prevPageBtn').click();
        } else if (e.key === 'ArrowRight') {
            $('#nextPageBtn').click();
        } else if (e.key === 'ArrowUp') {
            $('#prevChapterBtn').click();
        } else if (e.key === 'ArrowDown') {
            $('#nextChapterBtn').click();
        }
    });
    
    // Click on reader area to navigate
    $('#readerWrapper').click(function(e) {
        const width = $(this).width();
        const clickX = e.pageX - $(this).offset().left;
        
        if (clickX < width / 3) {
            $('#prevPageBtn').click();
        } else if (clickX > width * 2 / 3) {
            $('#nextPageBtn').click();
        }
    });
}

// Load Manga
async function loadManga(mangaId, chapterId) {
    try {
        showLoading('Loading manga...');
        
        // Get manga info
        const mangaResponse = await fetch(getProxy() + encodeURIComponent(`${MANGADEX_API}/manga/${mangaId}`));
        const mangaData = await mangaResponse.json();
        
        if (mangaData.result === 'ok') {
            currentManga = mangaData.data;
            mangaInfo = currentManga;
            updateMangaInfo();
        }
        
        // Get chapters
        const chaptersResponse = await fetch(
            getProxy() + encodeURIComponent(`${MANGADEX_API}/manga/${mangaId}/feed?translatedLanguage[]=en&order[chapter]=desc&limit=500`)
        );
        const chaptersData = await chaptersResponse.json();
        
        if (chaptersData.result === 'ok') {
            chapters = chaptersData.data;
            displayChapters();
            
            // Load first chapter or specified chapter
            if (chapterId) {
                await loadChapter(chapterId);
            } else if (chapters.length > 0) {
                await loadChapter(chapters[0].id);
            }
        }
        
    } catch (error) {
        console.error('Error loading manga:', error);
        showError('Failed to load manga: ' + error.message);
    }
}

// Update Manga Info
function updateMangaInfo() {
    if (!mangaInfo) return;
    
    const title = mangaInfo.attributes.title.en || 
                  Object.values(mangaInfo.attributes.title)[0] || 
                  'Unknown Title';
    
    $('#mangaTitle').text(title);
    $('#mangaInfoTitle').text(title);
    
    // Get cover
    const coverArt = mangaInfo.relationships.find(r => r.type === 'cover_art');
    if (coverArt) {
        const coverUrl = `${MANGADEX_COVER}/${mangaInfo.id}/${coverArt.attributes?.fileName || 'cover.jpg'}`;
        $('#mangaCover').attr('src', coverUrl);
    }
    
    // Get tags
    const tags = mangaInfo.attributes.tags
        .filter(t => t.attributes.group === 'genre')
        .map(t => t.attributes.name.en)
        .slice(0, 5);
    
    if (tags.length > 0) {
        $('#mangaTags').html(tags.map(t => `<span class="tag">${t}</span>`).join(''));
    }
    
    // Get description
    const description = mangaInfo.attributes.description.en || 
                        Object.values(mangaInfo.attributes.description)[0] || 
                        'No description available.';
    
    $('#mangaInfoContent').html(`<p>${description}</p>`);
}

// Display Chapters
function displayChapters() {
    if (chapters.length === 0) {
        $('#chapterList').html(`
            <div class="no-chapters">
                <i class="fas fa-book"></i>
                <span>No chapters available</span>
            </div>
        `);
        return;
    }
    
    $('#chapterCount').text(chapters.length);
    
    let html = '';
    chapters.forEach((chapter, index) => {
        const chapterNum = chapter.attributes.chapter || '?';
        const title = chapter.attributes.title || `Chapter ${chapterNum}`;
        const isCurrent = chapter.id === currentChapter;
        
        html += `
            <div class="chapter-item ${isCurrent ? 'active' : ''}" data-id="${chapter.id}">
                <div class="chapter-icon">
                    <i class="fas fa-book-open"></i>
                </div>
                <span class="chapter-name">Ch. ${chapterNum}: ${title}</span>
            </div>
        `;
    });
    
    $('#chapterList').html(html);
    
    // Click handler
    $('.chapter-item').click(function() {
        const id = $(this).data('id');
        loadChapter(id);
    });
}

// Load Chapter
async function loadChapter(chapterId) {
    try {
        currentChapter = chapterId;
        
        // Update active state
        $('.chapter-item').removeClass('active');
        $(`.chapter-item[data-id="${chapterId}"]`).addClass('active');
        
        showLoading('Loading chapter pages...');
        
        // Get chapter pages
        const response = await fetch(getProxy() + encodeURIComponent(`${MANGADEX_API}/at-home/server/${chapterId}`));
        const data = await response.json();
        
        if (data.result === 'ok') {
            const baseUrl = data.baseUrl;
            const chapterHash = data.chapter.hash;
            const pages = data.chapter.data;
            
            currentPages = pages.map(page => `${baseUrl}/data/${chapterHash}/${page}`);
            currentPageIndex = 0;
            
            // Update chapter title
            const chapter = chapters.find(c => c.id === chapterId);
            if (chapter) {
                const chapterNum = chapter.attributes.chapter || '?';
                const title = chapter.attributes.title || '';
                $('#currentChapter').text(`Ch. ${chapterNum}: ${title}`);
            }
            
            displayPages();
            updateNavigation();
        } else {
            throw new Error('Failed to load chapter');
        }
        
    } catch (error) {
        console.error('Error loading chapter:', error);
        showError('Failed to load chapter: ' + error.message);
    }
}

// Display Pages
function displayPages() {
    if (currentPages.length === 0) {
        $('#readerWrapper').html(`
            <div class="empty-state">
                <i class="fas fa-image"></i>
                <p>No pages available</p>
            </div>
        `);
        return;
    }
    
    $('#navButtons').show();
    
    if (isScrollMode) {
        // Scroll mode - show all pages vertically
        let html = '';
        currentPages.forEach((page, index) => {
            html += `<img src="${page}" class="manga-page" alt="Page ${index + 1}" loading="lazy">`;
        });
        $('#readerWrapper').html(html);
        $('#pageText').text(`Total: ${currentPages.length} pages`);
    } else {
        // Single page mode
        displayCurrentPage();
    }
}

// Display Current Page (for single page mode)
function displayCurrentPage() {
    if (currentPages.length === 0) return;
    
    const pageUrl = currentPages[currentPageIndex];
    $('#readerWrapper').html(`
        <img src="${pageUrl}" class="manga-page" alt="Page ${currentPageIndex + 1}">
    `);
    
    $('#pageText').text(`Page ${currentPageIndex + 1} / ${currentPages.length}`);
    updateNavigation();
}

// Update Navigation
function updateNavigation() {
    // Page navigation
    $('#prevPageBtn').prop('disabled', currentPageIndex === 0);
    $('#nextPageBtn').prop('disabled', currentPageIndex >= currentPages.length - 1);
    
    // Chapter navigation
    const currentIndex = chapters.findIndex(c => c.id === currentChapter);
    $('#prevChapterBtn').prop('disabled', currentIndex >= chapters.length - 1);
    $('#nextChapterBtn').prop('disabled', currentIndex <= 0);
}

// Show Loading
function showLoading(message) {
    $('#readerWrapper').html(`
        <div class="loading-state">
            <i class="fas fa-spinner"></i>
            <span>${message}</span>
        </div>
    `);
    $('#navButtons').hide();
}

// Show Error
function showError(message) {
    $('#readerWrapper').html(`
        <div class="empty-state">
            <i class="fas fa-exclamation-circle"></i>
            <p>${message}</p>
            <p style="font-size: 12px; margin-top: 10px;">Please try another manga or check back later.</p>
        </div>
    `);
    $('#navButtons').hide();
}
