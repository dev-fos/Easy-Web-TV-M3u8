// Proxy for CORS
var proxy = {
    0: 'https://cors.luckydesigner.workers.dev/?',
    1: 'https://corsproxy.io/?',
    2: 'https://api.allorigins.win/raw?url=',
};
var rand = Math.floor(Math.random() * Object.keys(proxy).length);
var proxyRetryCount = 0;
var maxProxyRetries = 3;

// Get next proxy
function getNextProxy() {
    proxyRetryCount++;
    if (proxyRetryCount >= maxProxyRetries) {
        proxyRetryCount = 0;
        rand = (rand + 1) % Object.keys(proxy).length;
    }
    return proxy[rand];
}

var currentLink = '';
var currentCategory = '';
var pageNum = 1;
var isLoading = false;
var isSearchMode = false;

$(document).ready(function() {
    // Initialize
    currentLink = $('#sourceSelect').val();
    loadCategories(currentLink);
    loadVideos(currentLink, '', 1);
    
    // Back button
    $('#backBtn').on('click', function() {
        window.history.back();
    });
    
    // Toggle sidebar
    $('#toggleSidebar, #menuBtn').on('click', function() {
        $('#sidebar').toggleClass('collapsed');
        $('#sidebar').toggleClass('show-mobile');
    });
    
    // Source select change
    $('#sourceSelect').on('change', function() {
        currentLink = $(this).val();
        currentCategory = '';
        pageNum = 1;
        isSearchMode = false;
        $('#searchInput').val('');
        loadCategories(currentLink);
        loadVideos(currentLink, '', 1);
    });
    
    // Search
    $('#searchInput').on('keyup', function(e) {
        if (e.which == 13) {
            var searchTerm = $(this).val().trim();
            
            if (searchTerm) {
                currentCategory = '';
                pageNum = 1;
                isSearchMode = true;
                // Clear category selection
                $('.category-item').removeClass('active');
                // Show loading state
                $('#contentArea').find('.loading-state').remove();
                $('#contentGrid').hide();
                $('#contentArea').prepend(`
                    <div class="loading-state search-loading">
                        <i class="fas fa-spinner"></i>
                        <span>Searching...</span>
                    </div>
                `);
                searchVideos(currentLink, searchTerm, 1);
            } else {
                isSearchMode = false;
                loadVideos(currentLink, currentCategory, 1);
            }
        }
    });
    
    // Infinite scroll on content area
    $('#contentArea').scroll(function() {
        var scrollTop = $(this).scrollTop();
        var scrollHeight = $(this)[0].scrollHeight;
        var clientHeight = $(this).height();
        
        if (scrollTop + clientHeight >= scrollHeight - 100 && !isLoading) {
            pageNum++;
            if (isSearchMode) {
                var searchTerm = $('#searchInput').val().trim();
                if (searchTerm) {
                    searchVideos(currentLink, searchTerm, pageNum);
                }
            } else {
                loadVideos(currentLink, currentCategory, pageNum);
            }
        }
    });
});

// Build API URL with proper format
function buildApiUrl(link, action, params) {
    // Handle URLs that already end with .php (no trailing slash needed)
    var baseUrl;
    if (link.endsWith('.php')) {
        baseUrl = link;
    } else {
        // Ensure URL ends with / before adding query params
        baseUrl = link.endsWith('/') ? link : link + '/';
    }
    var url = baseUrl + '?ac=' + action;
    
    if (params) {
        for (var key in params) {
            if (params[key]) {
                url += '&' + key + '=' + encodeURIComponent(params[key]);
            }
        }
    }
    
    // Use different proxy format for allorigins
    var selectedProxy = proxy[rand];
    if (selectedProxy.indexOf('allorigins') > -1) {
        // allorigins needs full URL encoding
        return selectedProxy + encodeURIComponent(url);
    } else {
        return selectedProxy + encodeURIComponent(url);
    }
}

// Parse API response (handles both JSON and XML)
function parseApiResponse(data) {
    // If it's already an object, return it
    if (typeof data === 'object') {
        return data;
    }
    
    // Try to parse as JSON first
    try {
        return JSON.parse(data);
    } catch (e) {
        // Not JSON, try XML
    }
    
    // Try to parse as XML
    try {
        var xmlDoc = $.parseXML(data);
        var $xml = $(xmlDoc);
        var result = {};
        
        // Parse list page
        var $list = $xml.find('list');
        result.page = parseInt($list.attr('page') || '1');
        result.pagecount = parseInt($list.attr('pagecount') || '0');
        result.recordcount = parseInt($list.attr('recordcount') || '0');
        
        // Parse class categories
        result.class = [];
        $xml.find('class > ty').each(function() {
            result.class.push({
                type_id: $(this).attr('id'),
                type_name: $(this).text()
            });
        });
        
        // Parse video list
        result.list = [];
        $xml.find('video').each(function() {
            var $video = $(this);
            result.list.push({
                vod_id: $video.find('id').text(),
                vod_name: $video.find('name').text(),
                vod_pic: $video.find('pic').text() || '../images/noimage.jpeg',
                type_id: $video.find('tid').text(),
                type_name: $video.find('type').text(),
                vod_remarks: $video.find('note').text()
            });
        });
        
        return result;
    } catch (e) {
        console.error('Failed to parse response:', e);
        return null;
    }
}

// Load categories (use API class data if available, otherwise extract from video list)
function loadCategories(link) {
    var apiUrl = buildApiUrl(link, 'list', { pg: 1 });
    
    $.ajax({
        type: 'GET',
        url: apiUrl,
        dataType: 'text',
        success: function(data) {
            var parsedData = parseApiResponse(data);
            if (!parsedData) {
                $('#categoryList').html(`
                    <div class="empty-state">
                        <i class="fas fa-exclamation-triangle"></i>
                        <p>Failed to parse response</p>
                    </div>
                `);
                return;
            }
            
            $('#categoryList').empty();
            
            // Add "Latest Update" category
            $('#categoryList').append(`
                <div class="category-item active" data-id="">
                    <i class="fas fa-clock"></i>
                    <span>最新更新</span>
                </div>
            `);
            
            // Use class data from API if available
            var categories = parsedData.class || [];
            if (categories.length > 0) {
                // API returned class data
                for (var i = 0; i < categories.length; i++) {
                    var cat = categories[i];
                    var catId = cat.type_id;
                    var catName = cat.type_name;
                    if (catId && catName) {
                        $('#categoryList').append(`
                            <div class="category-item" data-id="${catId}">
                                <i class="fas fa-folder"></i>
                                <span>${catName}</span>
                            </div>
                        `);
                    }
                }
            } else {
                // Fallback: extract unique categories from video list
                var categoryMap = {};
                var videos = parsedData.list || [];
                for (var i = 0; i < videos.length; i++) {
                    var video = videos[i];
                    var catId = video.type_id || video.tid;
                    var catName = video.type_name || video.type;
                    if (catId && catName && !categoryMap[catId]) {
                        categoryMap[catId] = catName;
                    }
                }
                
                // Add extracted categories
                for (var id in categoryMap) {
                    if (categoryMap.hasOwnProperty(id)) {
                        $('#categoryList').append(`
                            <div class="category-item" data-id="${id}">
                                <i class="fas fa-folder"></i>
                                <span>${categoryMap[id]}</span>
                            </div>
                        `);
                    }
                }
            }
            
            // Click handler
            $('.category-item').on('click', function() {
                $('.category-item').removeClass('active');
                $(this).addClass('active');
                currentCategory = $(this).data('id');
                pageNum = 1;
                isSearchMode = false;
                $('#searchInput').val('');
                loadVideos(currentLink, currentCategory, 1);
            });
        },
        error: function() {
            $('#categoryList').html(`
                <div class="empty-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Failed to load categories</p>
                </div>
            `);
        }
    });
}

// Load videos
function loadVideos(link, category, page) {
    if (isLoading) return;
    isLoading = true;
    
    // Show load more indicator for pagination
    if (page > 1) {
        $('#loadMoreIndicator').show();
    }
    
    if (page === 1) {
        $('#contentGrid').html(`
            <div class="loading-state">
                <i class="fas fa-spinner"></i>
                <span>Loading videos...</span>
            </div>
        `).show();
    }
    
    var params = { pg: page };
    if (category) {
        params.t = category;
    }
    
    var apiUrl = buildApiUrl(link, 'videolist', params);
    
    $.ajax({
        type: 'GET',
        url: apiUrl,
        dataType: 'text',
        success: function(data) {
            var parsedData = parseApiResponse(data);
            if (!parsedData) {
                if (page === 1) {
                    $('#contentGrid').html(`
                        <div class="empty-state">
                            <i class="fas fa-exclamation-triangle"></i>
                            <p>Failed to parse response</p>
                        </div>
                    `);
                }
                $('#loadMoreIndicator').hide();
                isLoading = false;
                return;
            }
            
            if (page === 1) {
                $('#contentGrid').empty();
            }
            
            var videos = parsedData.list || [];
            
            if (videos.length === 0 && page === 1) {
                $('#contentGrid').html(`
                    <div class="empty-state">
                        <i class="fas fa-video-slash"></i>
                        <p>No videos found</p>
                    </div>
                `);
            } else {
                renderVideos(videos, link, page === 1);
            }
            
            // Hide load more indicator
            $('#loadMoreIndicator').hide();
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
            // Hide load more indicator
            $('#loadMoreIndicator').hide();
            isLoading = false;
        }
    });
}

// Search videos
function searchVideos(link, term, page) {
    if (isLoading && page === 1) return;
    if (page > 1 && isLoading) return;
    isLoading = true;
    
    // Show load more indicator for pagination
    if (page > 1) {
        $('#loadMoreIndicator').show();
    }
    
    var apiUrl = buildApiUrl(link, 'videolist', { wd: term, pg: page || 1 });
    
    $.ajax({
        type: 'GET',
        url: apiUrl,
        dataType: 'text',
        success: function(data) {
            // Remove loading state first
            $('.search-loading').remove();
            $('#contentGrid').show();
            
            var parsedData = parseApiResponse(data);
            if (!parsedData) {
                $('#contentGrid').html(`
                    <div class="empty-state">
                        <i class="fas fa-exclamation-triangle"></i>
                        <p>Failed to parse response</p>
                    </div>
                `);
                $('#loadMoreIndicator').hide();
                isLoading = false;
                return;
            }
            
            // Clear the grid for page 1
            if (page === 1) {
                $('#contentGrid').removeClass('has-results').empty();
            }
            
            var videos = parsedData.list || [];
            
            if (videos.length === 0 && page === 1) {
                $('#contentGrid').html(`
                    <div class="empty-state">
                        <i class="fas fa-search"></i>
                        <p>No results found for "${term}"</p>
                    </div>
                `);
            } else if (videos.length > 0) {
                // Add has-results class to change positioning
                $('#contentGrid').addClass('has-results');
                renderVideos(videos, link, page === 1);
            }
            
            // Hide load more indicator
            $('#loadMoreIndicator').hide();
            isLoading = false;
        },
        error: function() {
            // Remove loading state on error too
            $('.search-loading').remove();
            $('#contentGrid').show();
            
            if (page === 1) {
                $('#contentGrid').html(`
                    <div class="empty-state">
                        <i class="fas fa-exclamation-triangle"></i>
                        <p>Search failed</p>
                    </div>
                `);
            }
            // Hide load more indicator
            $('#loadMoreIndicator').hide();
            isLoading = false;
        }
    });
}

// Filter ad text from category names
function filterTypeName(name) {
    if (!name) return name;
    return name.replace(/\\?">\* src=https?:\/\/[^\s<]+<\/script>/gi, '').trim();
}

// Render videos to grid
function renderVideos(videos, link, clear) {
    for (var i = 0; i < videos.length; i++) {
        var video = videos[i];
        var videoId = video.vod_id;
        var videoName = video.vod_name || '';
        var videoPic = video.vod_pic || '../images/noimage.jpeg';
        var videoType = filterTypeName(video.type_name) || '';
        
        var playUrl = '../catalogues/adultplay.html?web=' + encodeURIComponent(link) + '&tab=' + videoId;
        
        var cardHtml = `
            <a href="${playUrl}" class="card-item">
                <img class="card-image" src="${videoPic}" alt="${videoName}" onerror="this.src='../images/noimage.jpeg'">
                <div class="card-overlay"></div>
                <div class="card-play-icon">
                    <i class="fas fa-play"></i>
                </div>
                <div class="card-info">
                    ${videoType ? `<span class="card-type">${videoType}</span>` : ''}
                    <h4 class="card-title">${videoName}</h4>
                </div>
            </a>
        `;
        $('#contentGrid').append(cardHtml);
    }
}
