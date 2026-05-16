// Comprehensive (Theater) Page JS - Modern UI Version
// Proxy for CORS
var proxy = {
    0: 'https://cors.luckydesigner.workers.dev/?',
    1: 'https://corsproxy.io/?',
    2: 'https://api.allorigins.win/raw?url=',
};
var rand = Math.floor(Math.random() * Object.keys(proxy).length);

// Global variables
var currentLink = '';
var currentCategory = '';
var pageNum = 1;
var isLoading = false;

// Toast notification
function showToast(message, type = 'info') {
    var iconMap = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        info: 'fa-info-circle',
        warning: 'fa-exclamation-triangle'
    };
    
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

// Filter ad text from category names
function filterTypeName(name) {
    if (!name) return name;
    return name.replace(/\\?">\* src=https?:\/\/[^\s<]+<\/script>/gi, '').trim();
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

// Show/Hide loading
function showLoading(show = true, isSearch = false) {
    if (show) {
        if (isSearch) {
            $('#contentArea').find('.search-loading').remove();
            $('#contentGrid').hide();
            $('#contentArea').prepend(`
                <div class="loading-state search-loading">
                    <i class="fas fa-spinner"></i>
                    <span>Searching...</span>
                </div>
            `);
        } else if (pageNum > 1) {
            $('#loadMoreIndicator').show();
        } else {
            $('#contentGrid').html(`
                <div class="loading-state">
                    <i class="fas fa-spinner"></i>
                    <span>Loading videos...</span>
                </div>
            `);
        }
    } else {
        $('#loadMoreIndicator').hide();
        $('.search-loading').remove();
        $('#contentGrid').show();
    }
}

// Load categories
function loadCategories(link) {
    var baseUrl = link.endsWith('/') ? link : link + '/';
    var apiUrl = proxy[rand] + encodeURIComponent(baseUrl + '?ac=&pg=1');
    
    $('#categoryList').html(`
        <div class="loading-state">
            <i class="fas fa-spinner"></i>
            <span>Loading categories...</span>
        </div>
    `);
    
    $.ajax({
        type: 'GET',
        url: apiUrl,
        dataType: 'json',
        success: function(data) {
            $('#categoryList').empty();
            
            var categories = data.class || [];
            
            // Add "Latest Update" category
            $('#categoryList').append(`
                <div class="category-item active" data-id="">
                    <i class="fas fa-clock"></i>
                    <span>最新更新</span>
                </div>
            `);
            
            // Add other categories
            for (var i = 0; i < categories.length; i++) {
                var cat = categories[i];
                var catId = cat.type_id;
                var catName = filterTypeName(cat.type_name);
                
                $('#categoryList').append(`
                    <div class="category-item" data-id="${catId}">
                        <i class="fas fa-folder"></i>
                        <span>${catName}</span>
                    </div>
                `);
            }
            
            // Bind click handler
            $('.category-item').on('click', function() {
                $('.category-item').removeClass('active');
                $(this).addClass('active');
                currentCategory = $(this).data('id');
                pageNum = 1;
                $('#searchInput').val('');
                loadVideos(currentLink, currentCategory, 1);
                
                // Hide sidebar on mobile
                if (window.innerWidth <= 768) {
                    $('#sidebar').removeClass('show-mobile');
                }
            });
        },
        error: function() {
            $('#categoryList').html(`
                <div class="empty-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Failed to load categories</p>
                </div>
            `);
            showToast('Failed to load categories', 'error');
        }
    });
}

// Load videos
function loadVideos(link, category, page) {
    if (isLoading) return;
    isLoading = true;
    
    showLoading(page > 1, false);
    
    if (page === 1) {
        showLoading(true, false);
    }
    
    var baseUrl = link.endsWith('/') ? link : link + '/';
    var apiUrl = category 
        ? proxy[rand] + encodeURIComponent(baseUrl + '?ac=videolist&t=' + category + '&pg=' + page)
        : proxy[rand] + encodeURIComponent(baseUrl + '?ac=videolist&pg=' + page);
    
    $.ajax({
        type: 'GET',
        url: apiUrl,
        dataType: 'json',
        success: function(data) {
            if (page === 1) {
                $('#contentGrid').empty();
            }
            
            var videos = data.list || [];
            
            if (videos.length === 0 && page === 1) {
                $('#contentGrid').html(`
                    <div class="empty-state">
                        <i class="fas fa-video-slash"></i>
                        <p>No videos found</p>
                    </div>
                `);
            } else {
                $('#contentGrid').addClass('has-results');
                
                for (var i = 0; i < videos.length; i++) {
                    var video = videos[i];
                    var videoId = video.vod_id;
                    var videoName = video.vod_name;
                    var videoPic = video.vod_pic || '../images/noimage.jpeg';
                    var videoType = filterTypeName(video.type_name) || '未知';
                    
                    var cardHtml = `
                        <a href="../catalogues/complay.html?web=${link}&tab=${videoId}" class="card-item">
                            <img class="card-image" src="${videoPic}" alt="${videoName}" onerror="this.src='../images/noimage.jpeg'">
                            <div class="card-overlay"></div>
                            <div class="card-play-icon">
                                <i class="fas fa-play"></i>
                            </div>
                            <div class="card-info">
                                <span class="card-type">${videoType}</span>
                                <h4 class="card-title">${videoName}</h4>
                            </div>
                        </a>
                    `;
                    $('#contentGrid').append(cardHtml);
                }
            }
            
            showLoading(false);
            isLoading = false;
        },
        error: function() {
            if (page === 1) {
                $('#contentGrid').html(`
                    <div class="empty-state">
                        <i class="fas fa-exclamation-triangle"></i>
                        <p>Failed to load videos</p>
                    </div>
                `);
            }
            showLoading(false);
            isLoading = false;
            showToast('Failed to load videos', 'error');
        }
    });
}

// Search videos
function searchVideos(link, term, page) {
    if (isLoading) return;
    isLoading = true;
    
    showLoading(page > 1, page === 1);
    
    var baseUrl = link.endsWith('/') ? link : link + '/';
    var apiUrl = proxy[rand] + encodeURIComponent(baseUrl + '?ac=videolist&wd=' + encodeURIComponent(term) + '&pg=' + (page || 1));
    
    $.ajax({
        type: 'GET',
        url: apiUrl,
        dataType: 'json',
        success: function(data) {
            if (page === 1) {
                $('#contentGrid').removeClass('has-results').empty();
            }
            
            showLoading(false);
            
            var videos = data.list || data.vod_list || data.data || [];
            
            if (videos.length === 0 && page === 1) {
                $('#contentGrid').html(`
                    <div class="empty-state">
                        <i class="fas fa-search"></i>
                        <p>No results found for "${term}"</p>
                    </div>
                `);
            } else if (videos.length > 0) {
                $('#contentGrid').addClass('has-results');
                
                for (var i = 0; i < videos.length; i++) {
                    var video = videos[i];
                    var videoId = video.vod_id;
                    var videoName = video.vod_name;
                    var videoPic = video.vod_pic || '../images/noimage.jpeg';
                    var videoType = filterTypeName(video.type_name) || '未知';
                    
                    var cardHtml = `
                        <a href="../catalogues/complay.html?web=${link}&tab=${videoId}" class="card-item">
                            <img class="card-image" src="${videoPic}" alt="${videoName}" onerror="this.src='../images/noimage.jpeg'">
                            <div class="card-overlay"></div>
                            <div class="card-play-icon">
                                <i class="fas fa-play"></i>
                            </div>
                            <div class="card-info">
                                <span class="card-type">${videoType}</span>
                                <h4 class="card-title">${videoName}</h4>
                            </div>
                        </a>
                    `;
                    $('#contentGrid').append(cardHtml);
                }
            }
            
            isLoading = false;
        },
        error: function() {
            showLoading(false);
            
            if (page === 1) {
                $('#contentGrid').html(`
                    <div class="empty-state">
                        <i class="fas fa-exclamation-triangle"></i>
                        <p>Search failed</p>
                    </div>
                `);
            }
            
            isLoading = false;
            showToast('Search failed', 'error');
        }
    });
}

// Initialize
$(document).ready(function() {
    console.log('=== Theater (Comprehensive) Page Loaded ===');
    
    // Set initial source
    currentLink = $('#sourceSelect').val();
    
    // Load initial data
    loadCategories(currentLink);
    loadVideos(currentLink, '', 1);
    
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
    
    // Source select change
    $('#sourceSelect').on('change', function() {
        currentLink = $(this).val();
        currentCategory = '';
        pageNum = 1;
        loadCategories(currentLink);
        loadVideos(currentLink, '', 1);
    });
    
    // Search handler
    $('#searchInput').on('keyup', function(e) {
        if (e.which === 13) {
            var searchTerm = $(this).val().trim();
            if (searchTerm) {
                currentCategory = '';
                pageNum = 1;
                $('.category-item').removeClass('active');
                searchVideos(currentLink, searchTerm, 1);
            } else {
                loadVideos(currentLink, currentCategory, 1);
            }
        }
    });
    
    // Infinite scroll
    $('#contentArea').on('scroll', function() {
        var scrollTop = $(this).scrollTop();
        var scrollHeight = $(this)[0].scrollHeight;
        var clientHeight = $(this).height();
        
        if (scrollTop + clientHeight >= scrollHeight - 100 && !isLoading) {
            pageNum++;
            var searchTerm = $('#searchInput').val().trim();
            if (searchTerm) {
                searchVideos(currentLink, searchTerm, pageNum);
            } else {
                loadVideos(currentLink, currentCategory, pageNum);
            }
        }
    });
});
