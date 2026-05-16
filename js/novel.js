// Novel Reader JS - Modern UI Version
// Proxy for CORS
var proxy = {
    0: 'https://cors.luckydesigner.workers.dev/?',
    1: 'https://corsproxy.io/?',
    2: 'https://api.allorigins.win/raw?url=',
};

// Get random proxy for each request
function getRandomProxy() {
    var rand = Math.floor(Math.random() * Object.keys(proxy).length);
    return proxy[rand];
}

// Favorite prefix for localStorage
const FAV_PREFIX = 'fav_novel_';

// Global variables
var chapters = [];
var currentChapterIndex = -1;
var currentNovelTitle = '';
var novelInfo = '';
var originUrl = '';
var prevChapterUrl = '';
var nextChapterUrl = '';

// Toast notification system
function showToast(message, type = 'info') {
    var iconMap = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        info: 'fa-info-circle',
        warning: 'fa-exclamation-triangle'
    };
    
    var toast = $(`
        <div class="toast ${type}">
            <i class="fas ${iconMap[type]}"></i>
            <span class="toast-message">${message}</span>
            <button class="toast-close"><i class="fas fa-times"></i></button>
        </div>
    `);
    
    $('#toastContainer').append(toast);
    
    toast.find('.toast-close').on('click', function() {
        toast.remove();
    });
    
    // Auto remove after 3 seconds
    setTimeout(function() {
        toast.fadeOut(300, function() {
            $(this).remove();
        });
    }, 3000);
}

// Modal dialog system
function showModal(title, message, onConfirm, type = 'warning') {
    $('#modalTitle').text(title);
    $('#modalBody').text(message);
    
    var iconClass = type === 'error' ? 'error' : 'warning';
    $('#modalOverlay .modal-icon').removeClass('warning error').addClass(iconClass);
    $('#modalOverlay .modal-icon i').removeClass('fa-exclamation-triangle fa-exclamation-circle');
    $('#modalOverlay .modal-icon i').addClass(type === 'error' ? 'fa-exclamation-circle' : 'fa-exclamation-triangle');
    
    $('#modalOverlay').removeClass('hidden');
    
    // Remove previous handlers
    $('#modalConfirm').off('click');
    $('#modalCancel').off('click');
    
    $('#modalConfirm').on('click', function() {
        $('#modalOverlay').addClass('hidden');
        if (onConfirm) onConfirm();
    });
    
    $('#modalCancel').on('click', function() {
        $('#modalOverlay').addClass('hidden');
    });
}

// Loading control
function showLoading(show = true) {
    if (show) {
        $('#loadingOverlay').removeClass('hidden');
    } else {
        $('#loadingOverlay').addClass('hidden');
    }
}

// Toggle sidebar - toggle chapter list and toolbar visibility
function toggleSidebar() {
    var sidebar = $('#sidebar');
    var toolbar = $('.top-toolbar');
    var readerArea = $('#readerArea');
    
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

// Load favorites
function loadFavorites() {
    var favList = $('#favList');
    favList.empty();
    
    var hasFavorites = false;
    
    for (var key of Object.keys(localStorage)) {
        if (key.startsWith(FAV_PREFIX)) {
            hasFavorites = true;
            var url = key.replace(FAV_PREFIX, '');
            var name = localStorage.getItem(key);
            
            favList.append(`
                <div class="fav-item" data-url="${url}">
                    <div class="fav-item-info">
                        <div class="fav-item-name">${name}</div>
                    </div>
                    <button class="fav-item-remove" title="Remove">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `);
        }
    }
    
    if (!hasFavorites) {
        favList.html(`
            <div class="no-favorites">
                <i class="fas fa-heart-broken"></i>
                <p>No favorites yet</p>
            </div>
        `);
    }
    
    // Bind click events
    $('.fav-item').on('click', function(e) {
        if (!$(e.target).closest('.fav-item-remove').length) {
            var url = $(this).data('url');
            var name = $(this).find('.fav-item-name').text();
            $('#favPanel').removeClass('show');
            loadChapter(url, name);
        }
    });
    
    $('.fav-item-remove').on('click', function(e) {
        e.stopPropagation();
        var item = $(this).closest('.fav-item');
        var url = item.data('url');
        
        showModal('Remove Favorite', 'Are you sure you want to remove this from favorites?', function() {
            localStorage.removeItem(FAV_PREFIX + url);
            loadFavorites();
            updateChapterFavorites();
            showToast('Removed from favorites', 'success');
        });
    });
}

// Toggle favorite
function toggleFavorite(url, name) {
    var favKey = FAV_PREFIX + url;
    var isFavorited = localStorage.getItem(favKey) === name;
    
    if (isFavorited) {
        localStorage.removeItem(favKey);
        showToast('Removed from favorites', 'success');
    } else {
        localStorage.setItem(favKey, name);
        showToast('Added to favorites', 'success');
    }
    
    loadFavorites();
    updateChapterFavorites();
}

// Update chapter list favorite icons
function updateChapterFavorites() {
    $('.chapter-item').each(function() {
        var url = $(this).data('url');
        var name = $(this).data('name');
        var favKey = FAV_PREFIX + url;
        var isFav = localStorage.getItem(favKey) === name;
        
        $(this).find('.fav-btn').toggleClass('active', isFav);
    });
}

// Render chapter list
function renderChapters(chapterData) {
    var list = $('#chapterList');
    list.empty();
    
    chapters = chapterData;
    
    for (var i = 0; i < chapterData.length; i++) {
        var chapter = chapterData[i];
        var favKey = FAV_PREFIX + chapter.url;
        var isFav = localStorage.getItem(favKey) === chapter.name;
        
        list.append(`
            <div class="chapter-item" data-url="${chapter.url}" data-name="${chapter.name}" data-index="${i}">
                <span class="chapter-name">${chapter.name}</span>
                <button class="fav-btn ${isFav ? 'active' : ''}" title="Add to favorites">
                    <i class="fas fa-heart"></i>
                </button>
            </div>
        `);
    }
    
    // Bind click events
    $('.chapter-item').on('click', function(e) {
        if (!$(e.target).closest('.fav-btn').length) {
            var url = $(this).data('url');
            var name = $(this).data('name');
            var index = $(this).data('index');
            
            $('.chapter-item').removeClass('active');
            $(this).addClass('active');
            
            currentChapterIndex = index;
            loadChapter(url, name);
        }
    });
    
    $('.fav-btn').on('click', function(e) {
        e.stopPropagation();
        var url = $(this).closest('.chapter-item').data('url');
        var name = $(this).closest('.chapter-item').data('name');
        toggleFavorite(url, name);
    });
}

// Load chapter content
function loadChapter(url, chapterName) {
    showLoading(true);
    
    $.ajax({
        url: getRandomProxy() + url,
        dataType: 'html',
        type: 'GET',
        success: function(data) {
            var html = $.parseHTML(data);
            
            var title = '';
            var content = '';
            var prevUrl = '';
            var nextUrl = '';
            
            if (url.indexOf('royalroad.com') > -1) {
                // Try multiple selectors for chapter title
                title = $(html).find('.chapter-title').text().trim();
                if (!title) {
                    title = $(html).find('h1').first().text().trim();
                }
                if (!title) {
                    title = $(html).find('[property="name"]').text().trim();
                }
                
                // Try multiple selectors for chapter content
                var chapterContent = $(html).find('.chapter-content');
                if (chapterContent.length === 0) {
                    chapterContent = $(html).find('.fic-chapter-content');
                }
                if (chapterContent.length === 0) {
                    chapterContent = $(html).find('[property="articleBody"]');
                }
                if (chapterContent.length === 0) {
                    chapterContent = $(html).find('article .content');
                }
                if (chapterContent.length === 0) {
                    // Last resort: find the largest text block
                    var maxLen = 0;
                    $(html).find('div, section, article').each(function() {
                        var text = $(this).html();
                        if (text && text.length > maxLen && $(this).find('p').length > 3) {
                            maxLen = text.length;
                            chapterContent = $(this);
                        }
                    });
                }
                
                if (chapterContent.length) {
                    content = chapterContent.html();
                    
                    // Clean up content - remove unwanted elements
                    var tempDiv = $('<div>').html(content);
                    tempDiv.find('script, style, .ads, .advertisement, .comments').remove();
                    content = tempDiv.html();
                }
                
                // Navigation - try multiple selectors
                // Previous chapter
                var prevLink = $(html).find('a[href*="/chapter/"]').filter(function() {
                    var text = $(this).text().toLowerCase();
                    return text.indexOf('previous') > -1 || text.indexOf('prev') > -1;
                });
                if (prevLink.length === 0) {
                    prevLink = $(html).find('[rel="prev"]');
                }
                if (prevLink.length === 0) {
                    prevLink = $(html).find('.nav-previous a, .prev-chapter a');
                }
                
                // Next chapter
                var nextLink = $(html).find('a[href*="/chapter/"]').filter(function() {
                    var text = $(this).text().toLowerCase();
                    return text.indexOf('next') > -1;
                });
                if (nextLink.length === 0) {
                    nextLink = $(html).find('[rel="next"]');
                }
                if (nextLink.length === 0) {
                    nextLink = $(html).find('.nav-next a, .next-chapter a');
                }
                
                if (prevLink.length && prevLink.attr('href')) {
                    var prevHref = prevLink.attr('href');
                    if (prevHref.indexOf('http') === -1) {
                        prevUrl = 'https://www.royalroad.com' + prevHref;
                    } else {
                        prevUrl = prevHref;
                    }
                }
                
                if (nextLink.length && nextLink.attr('href')) {
                    var nextHref = nextLink.attr('href');
                    if (nextHref.indexOf('http') === -1) {
                        nextUrl = 'https://www.royalroad.com' + nextHref;
                    } else {
                        nextUrl = nextHref;
                    }
                }
            }
            
            // Update reader
            $('#chapterTitle').text(title || chapterName || 'Chapter');
            
            if (content) {
                $('#readerContent').html(content);
            } else {
                $('#readerContent').html('<p style="text-align: center; color: rgba(255,255,255,0.5);">Unable to load chapter content. Please try again or select another chapter.</p>');
            }
            
            // Update navigation
            prevChapterUrl = prevUrl;
            nextChapterUrl = nextUrl;
            
            $('#prevChapter').prop('disabled', !prevUrl);
            $('#nextChapter').prop('disabled', !nextUrl);
            $('#readerNav').show();
            
            // Scroll to top
            $('#readerArea').scrollTop(0);
            
            // Hide sidebar on mobile
            if (window.innerWidth <= 768) {
                $('#sidebar').removeClass('show-mobile');
            }
            
            // Update chapter count
            $('#chapterCount').text(chapters.length);
        },
        error: function(xhr, status, error) {
            console.error('Failed to load chapter:', error);
            showToast('Failed to load chapter content. Please try again.', 'error');
        },
        complete: function() {
            showLoading(false);
        }
    });
}

// Parse novel data from Royal Road
function parseRoyalRoad(initlink) {
    originUrl = 'https://www.royalroad.com';
    
    $.ajax({
        url: getRandomProxy() + initlink,
        dataType: 'html',
        type: 'GET',
        success: function(data) {
            var html = $.parseHTML(data);
            
            // Try multiple selectors for title
            var title = $(html).find('h1.font-white').text().trim();
            if (!title) {
                title = $(html).find('.fic-title h1').text().trim();
            }
            if (!title) {
                title = $(html).find('h1').first().text().trim();
            }
            
            // Try multiple selectors for author
            var author = $(html).find('.fic-title a.font-white').text().trim();
            if (!author) {
                author = $(html).find('.author a').text().trim();
            }
            if (!author) {
                author = $(html).find('[property="author"]').text().trim();
            }
            
            // Try multiple selectors for description
            var info = $(html).find('.hidden-content').text().trim();
            if (!info) {
                info = $(html).find('.description').text().trim();
            }
            if (!info) {
                info = $(html).find('[property="description"]').text().trim();
            }
            
            currentNovelTitle = title;
            novelInfo = 'Author: ' + author + '\n\n' + info;
            
            $('#novelTitle').text(title || 'Unknown Title');
            $('#infoTitle').text(title || 'Unknown Title');
            $('#infoContent').text(novelInfo || 'No description available.');
            document.title = (title || 'Novel') + ' - Novel Reader';
            
            // Parse chapter list - try multiple selectors
            var chapterData = [];
            
            // Method 1: Standard chapter table
            var chapterRows = $(html).find('#chapters tbody tr');
            
            if (chapterRows.length > 0) {
                chapterRows.each(function(index, row) {
                    var link = $(row).find('a').first();
                    var chapterUrl = link.attr('href');
                    var chapterName = link.text().trim();
                    
                    if (chapterUrl && chapterName) {
                        if (chapterUrl.indexOf('http') === -1) {
                            chapterUrl = originUrl + chapterUrl;
                        }
                        chapterData.push({
                            name: chapterName,
                            url: chapterUrl
                        });
                    }
                });
            }
            
            // Method 2: Chapter links in various containers
            if (chapterData.length === 0) {
                $(html).find('a[href*="/chapter/"]').each(function() {
                    var chapterUrl = $(this).attr('href');
                    var chapterName = $(this).text().trim();
                    
                    if (chapterUrl && chapterName && chapterName.length > 0) {
                        if (chapterUrl.indexOf('http') === -1) {
                            chapterUrl = originUrl + chapterUrl;
                        }
                        chapterData.push({
                            name: chapterName,
                            url: chapterUrl
                        });
                    }
                });
            }
            
            // Method 3: Fiction chapters list
            if (chapterData.length === 0) {
                $(html).find('.chapter-row, .fiction-chapter').each(function() {
                    var link = $(this).find('a').first();
                    var chapterUrl = link.attr('href');
                    var chapterName = link.text().trim();
                    
                    if (chapterUrl && chapterName) {
                        if (chapterUrl.indexOf('http') === -1) {
                            chapterUrl = originUrl + chapterUrl;
                        }
                        chapterData.push({
                            name: chapterName,
                            url: chapterUrl
                        });
                    }
                });
            }
            
            if (chapterData.length === 0) {
                showToast('No chapters found. The page structure may have changed.', 'warning');
                showLoading(false);
                return;
            }
            
            renderChapters(chapterData);
            
            // Auto load first chapter
            if (chapterData[0]) {
                $('.chapter-item').first().addClass('active');
                currentChapterIndex = 0;
                loadChapter(chapterData[0].url, chapterData[0].name);
            }
        },
        error: function(xhr, status, error) {
            console.error('Failed to load novel:', error);
            showToast('Failed to load novel. Please try again.', 'error');
            showLoading(false);
        }
    });
}

// Turn page (prev/next)
function turnPage(url) {
    if (!url) return;
    
    // Find chapter index
    for (var i = 0; i < chapters.length; i++) {
        if (chapters[i].url === url) {
            currentChapterIndex = i;
            break;
        }
    }
    
    loadChapter(url, '');
    
    // Update active state
    $('.chapter-item').removeClass('active');
    $('.chapter-item[data-url="' + url + '"]').addClass('active');
}

// Initialize
$(document).ready(function() {
    console.log('=== Novel Reader JS Loaded ===');
    
    // Load favorites
    loadFavorites();
    
    // Parse URL parameters
    var initlink = decodeURIComponent(window.location.href).split('web=')[1];
    
    console.log('Init link:', initlink);
    
    if (initlink) {
        showLoading(true);
        
        if (initlink.indexOf('https://www.royalroad.com/') > -1) {
            parseRoyalRoad(initlink);
        } else {
            showToast('Unsupported novel source. Only Royal Road is supported.', 'error');
            showLoading(false);
        }
    } else {
        showToast('No novel URL provided', 'warning');
        showLoading(false);
    }
    
    // UI Event handlers
    // Toggle Sidebar button
    $('#toggleSidebar').on('click', function() {
        toggleSidebar();
    });
    
    // Menu Button - hides toolbar for immersive reading
    $('#menuBtn').on('click', function() {
        var sidebar = $('#sidebar');
        var toolbar = $('.top-toolbar');
        var readerArea = $('#readerArea');
        
        // Hide toolbar for immersive reading
        toolbar.addClass('hidden');
        readerArea.addClass('expanded');
        
        // Collapse sidebar
        if (window.innerWidth <= 768) {
            sidebar.removeClass('show-mobile');
        } else {
            sidebar.addClass('collapsed');
        }
    });
    
    $('#backBtn').on('click', function() {
        window.location.href = '/Easy-Web-TV-M3u8/';
    });
    
    $('#favBtn').on('click', function() {
        $('#favPanel').toggleClass('show');
    });
    
    $('#closeFavPanel').on('click', function() {
        $('#favPanel').removeClass('show');
    });
    
    $('#infoBtn').on('click', function() {
        $('#novelInfo').slideToggle(300);
    });
    
    $('#prevChapter').on('click', function() {
        if (prevChapterUrl) {
            turnPage(prevChapterUrl);
        }
    });
    
    $('#nextChapter').on('click', function() {
        if (nextChapterUrl) {
            turnPage(nextChapterUrl);
        }
    });
    
    // Close panels when clicking outside
    $(document).on('click', function(e) {
        if (!$(e.target).closest('#favPanel, #favBtn').length) {
            $('#favPanel').removeClass('show');
        }
    });
    
    // Keyboard navigation
    $(document).on('keydown', function(e) {
        if (e.key === 'ArrowLeft' && prevChapterUrl) {
            turnPage(prevChapterUrl);
        } else if (e.key === 'ArrowRight' && nextChapterUrl) {
            turnPage(nextChapterUrl);
        }
    });
});
