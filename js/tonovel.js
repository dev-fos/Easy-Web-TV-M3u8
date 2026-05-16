// Novel List Page JS - Modern UI Version
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

// Global variables
var pnum = 1;
var currentCategory = '';
var currentSource = '';
var isLoading = false;

// Toast notification
function showToast(message, type = 'info') {
    var iconMap = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        info: 'fa-info-circle',
        warning: 'fa-exclamation-triangle'
    };
    
    // Remove existing toasts
    $('.toast-notification').remove();
    
    var toast = $(`
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
    } else {
        $('#loadMoreIndicator').hide();
    }
}

// Toggle sidebar
function toggleSidebar() {
    var sidebar = $('#sidebar');
    
    if (window.innerWidth <= 768) {
        sidebar.toggleClass('show-mobile');
    } else {
        sidebar.toggleClass('collapsed');
    }
}

// Render novel cards
function renderNovels(novels, append = false) {
    var grid = $('#contentGrid');
    
    if (!append) {
        grid.empty();
        grid.addClass('has-results');
    }
    
    novels.forEach(function(novel) {
        var card = $(`
            <a href="../catalogues/novelplay.html?web=${novel.url}" class="card-item">
                <img class="card-image" src="${novel.image}" alt="${novel.title}" onerror="this.src='../images/noimage.jpeg'">
                <div class="card-overlay"></div>
                <div class="card-play-icon">
                    <i class="fas fa-book-open"></i>
                </div>
                <div class="card-info">
                    <div class="card-type">Novel</div>
                    <h3 class="card-title">${novel.title}</h3>
                    <p class="card-author">${novel.author ? '[' + novel.author + ']' : ''}</p>
                </div>
            </a>
        `);
        grid.append(card);
    });
}

// Render categories
function renderCategories(categories) {
    var list = $('#categoryList');
    list.empty();
    
    categories.forEach(function(cat, index) {
        var item = $(`
            <div class="category-item ${index === 0 ? 'active' : ''}" data-url="${cat.url}" data-name="${cat.name}">
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
        
        var url = $(this).data('url');
        currentCategory = url;
        pnum = 1;
        loadNovels(url, false);
        
        // Hide sidebar on mobile
        if (window.innerWidth <= 768) {
            $('#sidebar').removeClass('show-mobile');
        }
    });
}

// Load novels from source
function loadNovels(url, append = true) {
    if (isLoading) return;
    isLoading = true;
    showLoading(true);
    
    var fullUrl = getRandomProxy() + url;
    
    $.ajax({
        url: fullUrl,
        type: 'GET',
        dataType: 'html',
        success: function(data) {
            var html = $.parseHTML(data);
            var novels = [];
            
            if (currentSource.indexOf('royalroad.com') > -1) {
                // Royal Road
                $(html).find('.fiction-list-item').each(function() {
                    var title = $(this).find('.fiction-title a').text().trim();
                    var novelUrl = 'https://www.royalroad.com' + $(this).find('.fiction-title a').attr('href');
                    var image = $(this).find('img').attr('src');
                    var author = $(this).find('.author a').text().trim();
                    
                    if (title && novelUrl) {
                        novels.push({
                            title: title,
                            url: novelUrl,
                            image: image || '../images/noimage.jpeg',
                            author: author
                        });
                    }
                });
            }
            
            renderNovels(novels, append);
            isLoading = false;
            showLoading(false);
        },
        error: function() {
            showToast('Failed to load novels', 'error');
            isLoading = false;
            showLoading(false);
        }
    });
}

// Load categories from source
function loadCategories(sourceUrl) {
    $('#categoryList').html('<div class="loading-state"><i class="fas fa-spinner"></i><span>Loading...</span></div>');
    
    $.ajax({
        url: getRandomProxy() + sourceUrl,
        type: 'GET',
        dataType: 'html',
        success: function(data) {
            var html = $.parseHTML(data);
            var categories = [];
            
            if (sourceUrl.indexOf('royalroad.com') > -1) {
                // Royal Road - predefined categories
                categories = [
                    { name: 'All', url: 'https://www.royalroad.com/fictions/best-rated' },
                    { name: 'Best Rated', url: 'https://www.royalroad.com/fictions/best-rated' },
                    { name: 'Trending', url: 'https://www.royalroad.com/fictions/trending' },
                    { name: 'Ongoing', url: 'https://www.royalroad.com/fictions/ongoing' },
                    { name: 'Completed', url: 'https://www.royalroad.com/fictions/completed' },
                    { name: 'Popular This Week', url: 'https://www.royalroad.com/fictions/weekly-popular' },
                    { name: 'Latest Updates', url: 'https://www.royalroad.com/fictions/latest-updates' },
                    { name: 'New Releases', url: 'https://www.royalroad.com/fictions/new' },
                    { name: 'Rising Stars', url: 'https://www.royalroad.com/fictions/rising-stars' }
                ];
            }
            
            renderCategories(categories);
            
            // Load first category
            if (categories.length > 0) {
                currentCategory = categories[0].url;
                pnum = 1;
                loadNovels(categories[0].url, false);
            }
        },
        error: function() {
            showToast('Failed to load categories', 'error');
        }
    });
}

// Search novels
function searchNovels(keyword) {
    if (!keyword) return;
    
    var searchUrl = '';
    
    if (currentSource.indexOf('royalroad.com') > -1) {
        searchUrl = 'https://www.royalroad.com/fictions/search?title=' + encodeURIComponent(keyword);
    }
    
    if (searchUrl) {
        pnum = 1;
        loadNovels(searchUrl, false);
    } else {
        showToast('Search not available for this source', 'warning');
    }
}

// Initialize
$(document).ready(function() {
    console.log('=== Novel List Page Loaded ===');
    
    // Load source options - only Royal Road (other sources are defunct)
    $('#sourceSelect').append('<option value="https://www.royalroad.com/">Royal Road</option>');
    
    // Set initial source
    currentSource = $('#sourceSelect').val();
    
    // Load initial data
    loadCategories(currentSource);
    
    // Source change handler
    $('#sourceSelect').on('change', function() {
        currentSource = $(this).val();
        pnum = 1;
        loadCategories(currentSource);
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
    
    // Search handlers
    $('#searchInput').on('keypress', function(e) {
        if (e.which === 13) {
            var keyword = $(this).val().trim();
            if (keyword) {
                searchNovels(keyword);
            }
        }
    });
    
    $('#sidebarSearch').on('keypress', function(e) {
        if (e.which === 13) {
            var keyword = $(this).val().trim();
            if (keyword) {
                searchNovels(keyword);
            }
        }
    });
    
    // Scroll to load more
    $('#contentArea').on('scroll', function() {
        var scrollTop = $(this).scrollTop();
        var scrollHeight = $(this)[0].scrollHeight;
        var height = $(this).height();
        
        if (scrollTop + height >= scrollHeight - 100) {
            if (!isLoading && currentCategory) {
                pnum++;
                // Load more logic would go here based on source
            }
        }
    });
});
