// Adult Player JS - Adapted for new adultplay.html structure
// Proxy for CORS
var proxy = {
    0: 'https://cors.luckydesigner.workers.dev/?',
    1: 'https://corsproxy.io/?',
    2: 'https://api.allorigins.win/raw?url=',
};
var rand = Math.floor(Math.random() * Object.keys(proxy).length);

// Favorite prefix for localStorage - ensures only this app's favorites are shown
const FAV_PREFIX = 'fav_adult_';

// Global variables
var currentApiUrl = '';
var currentVideoId = '';
var currentVideoName = '';
var currentPlayUrl = '';
var player = null;
var favorites = [];

$(document).ready(function() {
    console.log('=== Adult Player JS Loaded ===');
    
    // Initialize Video.js player
    player = videojs(document.querySelector('#video1'));
    console.log('Video.js player initialized');
    
    // Parse URL parameters
    var urlParams = new URLSearchParams(window.location.search);
    currentApiUrl = urlParams.get('web') || '';
    currentVideoId = urlParams.get('tab') || '';
    
    console.log('URL Parameters:');
    console.log('  - web (API URL):', currentApiUrl);
    console.log('  - tab (Video ID):', currentVideoId);
    
    // Load favorites from localStorage
    loadFavorites();
    
    // If we have both API URL and video ID, load video detail
    if (currentApiUrl && currentVideoId) {
        console.log('Loading video detail...');
        loadVideoDetail(currentApiUrl, currentVideoId);
    } else if (currentApiUrl) {
        // Only API URL, check if it's a direct play link (youxijian format)
        var initlink = decodeURIComponent(window.location.href).split('web=')[1];
        console.log('Direct play link:', initlink);
        if (initlink && initlink.indexOf('youxijian') > 1) {
            handleDirectPlay(initlink);
        }
    } else {
        console.warn('No API URL or Video ID provided');
        $('#channelList').html(`
            <div class="no-channels">
                <i class="fas fa-exclamation-triangle"></i>
                <span>No video specified</span>
            </div>
        `);
    }
    
    // Setup UI interactions
    setupUIInteractions();
});

// Build API URL with proxy
function buildApiUrl(link, action, params) {
    var baseUrl;
    if (link.endsWith('.php')) {
        baseUrl = link;
    } else {
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
    
    var selectedProxy = proxy[rand];
    if (selectedProxy.indexOf('allorigins') > -1) {
        return selectedProxy + encodeURIComponent(url);
    } else {
        return selectedProxy + encodeURIComponent(url);
    }
}

// Parse API response (handles both JSON and XML)
function parseApiResponse(data) {
    console.log('Parsing API response...');
    
    if (typeof data === 'object') {
        console.log('Response is already an object');
        return data;
    }
    
    // Try to parse as JSON first
    try {
        var jsonData = JSON.parse(data);
        console.log('Response parsed as JSON');
        return jsonData;
    } catch (e) {
        console.log('Not JSON, trying XML...');
    }
    
    // Try to parse as XML
    try {
        var xmlDoc = $.parseXML(data);
        var $xml = $(xmlDoc);
        var result = {};
        
        console.log('Response parsed as XML');
        
        // Parse list page
        var $list = $xml.find('list');
        result.page = parseInt($list.attr('page') || '1');
        result.pagecount = parseInt($list.attr('pagecount') || '0');
        result.recordcount = parseInt($list.attr('recordcount') || '0');
        
        // Parse video list
        result.list = [];
        $xml.find('video').each(function() {
            var $video = $(this);
            var videoData = {
                vod_id: $video.find('id').text(),
                vod_name: $video.find('name').text(),
                vod_pic: $video.find('pic').text() || '../images/noimage.jpeg',
                type_id: $video.find('tid').text(),
                type_name: $video.find('type').text(),
                vod_remarks: $video.find('note').text(),
                vod_content: $video.find('des').text(),
                vod_play_url: $video.find('dl').text(),
                vod_play_from: $video.find('from').text()
            };
            
            // Also try alternative field names
            if (!videoData.vod_play_url) {
                videoData.vod_play_url = $video.find('vod_play_url').text();
            }
            if (!videoData.vod_play_url) {
                videoData.vod_play_url = $video.find('play_url').text();
            }
            
            console.log('Parsed video:', videoData.vod_name, 'Play URL:', videoData.vod_play_url ? 'Found' : 'Not found');
            result.list.push(videoData);
        });
        
        return result;
    } catch (e) {
        console.error('Failed to parse response:', e);
        return null;
    }
}

// Load video detail
function loadVideoDetail(apiUrl, videoId) {
    console.log('=== Loading Video Detail ===');
    console.log('API URL:', apiUrl);
    console.log('Video ID:', videoId);
    
    $('#channelList').html(`
        <div class="loading-state">
            <i class="fas fa-spinner"></i>
            <span>Loading playlist...</span>
        </div>
    `);
    
    var detailUrl = buildApiUrl(apiUrl, 'detail', { ids: videoId });
    console.log('Detail API URL:', detailUrl);
    
    $.ajax({
        type: 'GET',
        url: detailUrl,
        dataType: 'text',
        timeout: 30000,
        success: function(data) {
            console.log('API Response received, length:', data.length);
            console.log('Raw response preview:', data.substring(0, 500));
            
            var parsedData = parseApiResponse(data);
            
            if (!parsedData) {
                console.error('Failed to parse API response');
                $('#channelList').html(`
                    <div class="no-channels">
                        <i class="fas fa-exclamation-triangle"></i>
                        <span>Failed to parse response</span>
                    </div>
                `);
                return;
            }
            
            console.log('Parsed data:', parsedData);
            
            if (!parsedData.list || parsedData.list.length === 0) {
                console.error('No video list in response');
                $('#channelList').html(`
                    <div class="no-channels">
                        <i class="fas fa-video-slash"></i>
                        <span>No video found</span>
                    </div>
                `);
                return;
            }
            
            var video = parsedData.list[0];
            console.log('Video data:', video);
            
            currentVideoName = video.vod_name || video.name || 'Unknown';
            var videoContent = video.vod_content || video.des || video.content || '暂无简介';
            
            // Try multiple possible field names for play URL
            var playUrlRaw = video.vod_play_url || video.vpath || video.play_url || video.url || video.dl || '';
            
            console.log('Video name:', currentVideoName);
            console.log('Play URL raw:', playUrlRaw);
            
            // Update title
            $('#currentChannel').text(currentVideoName);
            $('#videoTitle').text('Playlist');
            document.title = currentVideoName + ' - Adult Player';
            
            // Update detail panel
            $('#detailContent').html(`
                <h4 style="color: #ff004c; margin-bottom: 10px;">${currentVideoName}</h4>
                <p>${videoContent}</p>
            `);
            
            // Parse play URLs
            var playItems = parsePlayUrls(playUrlRaw, apiUrl);
            console.log('Parsed play items:', playItems.length);
            
            if (playItems.length === 0) {
                console.warn('No playable sources found');
                $('#channelList').html(`
                    <div class="no-channels">
                        <i class="fas fa-video-slash"></i>
                        <span>No playable sources found</span>
                        <small style="margin-top: 10px; font-size: 11px;">Raw data: ${playUrlRaw ? playUrlRaw.substring(0, 100) + '...' : 'Empty'}</small>
                    </div>
                `);
                return;
            }
            
            // Update channel count
            $('#channelCount').text(playItems.length);
            
            // Render playlist
            renderPlaylist(playItems);
            
            // Auto play first item
            if (playItems[0]) {
                console.log('Auto-playing first item:', playItems[0].name);
                playVideo(playItems[0].url, playItems[0].name);
                $('.channel-item').first().addClass('active');
            }
        },
        error: function(xhr, textStatus, errorThrown) {
            console.error('API Error:', textStatus, errorThrown);
            console.error('Status:', xhr.status);
            console.error('Response:', xhr.responseText);
            
            $('#channelList').html(`
                <div class="no-channels">
                    <i class="fas fa-exclamation-triangle"></i>
                    <span>Failed to load</span>
                    <small style="margin-top: 10px; font-size: 11px;">${textStatus}: ${errorThrown}</small>
                </div>
            `);
        }
    });
}

// Parse play URLs from various formats
function parsePlayUrls(playUrlRaw, apiUrl) {
    var items = [];
    
    console.log('=== Parsing Play URLs ===');
    console.log('Raw play URL:', playUrlRaw);
    
    if (!playUrlRaw) {
        console.warn('Empty play URL');
        return items;
    }
    
    // Format 1: 第1集$url1#第2集$url2#... (most common)
    if (playUrlRaw.indexOf('$') > -1 && playUrlRaw.indexOf('#') > -1) {
        console.log('Format: name$url#name$url');
        var parts = playUrlRaw.split('#');
        for (var i = 0; i < parts.length; i++) {
            var part = parts[i];
            if (part.indexOf('$') > -1) {
                var nameUrl = part.split('$');
                var name = nameUrl[0] || 'Episode ' + (i + 1);
                var url = nameUrl[1] || '';
                if (url) {
                    items.push({ name: name, url: url });
                }
            }
        }
    }
    // Format 2: url1#url2#url3 (just URLs separated by #)
    else if (playUrlRaw.indexOf('#') > -1) {
        console.log('Format: url#url#url');
        var parts = playUrlRaw.split('#');
        for (var i = 0; i < parts.length; i++) {
            var url = parts[i].trim();
            if (url && (url.indexOf('http') > -1 || url.indexOf('.m3u8') > -1)) {
                items.push({ name: 'Episode ' + (i + 1), url: url });
            }
        }
    }
    // Format 3: Single URL with $ separator
    else if (playUrlRaw.indexOf('$') > -1) {
        console.log('Format: name$url');
        var nameUrl = playUrlRaw.split('$');
        var name = nameUrl[0] || 'Play';
        var url = nameUrl[1] || '';
        if (url) {
            items.push({ name: name, url: url });
        }
    }
    // Format 4: Just URL
    else if (playUrlRaw.indexOf('http') > -1 || playUrlRaw.indexOf('.m3u8') > -1) {
        console.log('Format: single URL');
        items.push({ name: 'Play', url: playUrlRaw });
    }
    // Format 5: Try to extract URLs using regex
    else {
        console.log('Format: unknown, trying regex extraction');
        var urlPattern = /https?:\/\/[^\s#$]+/g;
        var matches = playUrlRaw.match(urlPattern);
        if (matches) {
            for (var i = 0; i < matches.length; i++) {
                items.push({ name: 'Episode ' + (i + 1), url: matches[i] });
            }
        }
    }
    
    console.log('Parsed items count:', items.length);
    if (items.length > 0) {
        console.log('First item:', items[0]);
    }
    
    return items;
}

// Render playlist to sidebar
function renderPlaylist(items) {
    console.log('Rendering playlist, items:', items.length);
    $('#channelList').empty();
    
    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        var displayName = currentVideoName + ' - ' + item.name;
        var isFavorite = checkFavorite(item.url, displayName);
        
        var itemHtml = `
            <div class="channel-item" data-url="${item.url}" data-name="${item.name}">
                <div class="channel-icon">
                    <i class="fas fa-play"></i>
                </div>
                <span class="channel-name">${item.name}</span>
                <i class="fas fa-heart favorite-btn ${isFavorite ? 'active' : ''}" data-url="${item.url}" data-name="${displayName}"></i>
            </div>
        `;
        $('#channelList').append(itemHtml);
    }
    
    // Click handler for playlist items
    $('.channel-item').on('click', function() {
        var url = $(this).data('url');
        var name = $(this).data('name');
        
        console.log('Channel clicked:', name, url);
        
        // Set active state
        $('.channel-item').removeClass('active');
        $(this).addClass('active');
        
        // Play video
        playVideo(url, name);
    });
    
    // Favorite button click handler
    $('.favorite-btn').on('click', function(e) {
        e.stopPropagation();
        var url = $(this).data('url');
        var name = $(this).data('name');
        toggleFavorite(url, name, $(this));
    });
}

// Play video
function playVideo(url, name) {
    console.log('=== Playing Video ===');
    console.log('URL:', url);
    console.log('Name:', name);
    
    currentPlayUrl = url;
    
    // Update title
    $('#currentChannel').text(name || currentVideoName);
    
    // Set video source and play
    try {
        player.src({
            src: url,
            type: 'application/x-mpegURL'
        });
        player.play();
        console.log('Video source set successfully');
    } catch (e) {
        console.error('Error setting video source:', e);
    }
}

// Handle direct play (youxijian format)
function handleDirectPlay(initlink) {
    console.log('Handling direct play:', initlink);
    
    var parts = initlink.split('&');
    var playUrl = parts[0];
    var videoName = parts[1] || 'Custom URL';
    
    currentVideoName = videoName;
    var displayName = videoName;
    var isFavorite = checkFavorite(playUrl, displayName);
    
    $('#currentChannel').text(videoName);
    $('#videoTitle').text('Playlist');
    $('#channelCount').text('1');
    
    $('#channelList').html(`
        <div class="channel-item active" data-url="${playUrl}" data-name="${videoName}">
            <div class="channel-icon">
                <i class="fas fa-play"></i>
            </div>
            <span class="channel-name">${videoName}</span>
            <i class="fas fa-heart favorite-btn ${isFavorite ? 'active' : ''}" data-url="${playUrl}" data-name="${displayName}"></i>
        </div>
    `);
    
    playVideo(playUrl, videoName);
    
    $('.channel-item').on('click', function() {
        var url = $(this).data('url');
        var name = $(this).data('name');
        $('.channel-item').removeClass('active');
        $(this).addClass('active');
        playVideo(url, name);
    });
    
    $('.favorite-btn').on('click', function(e) {
        e.stopPropagation();
        var url = $(this).data('url');
        var name = $(this).data('name');
        toggleFavorite(url, name, $(this));
    });
}

// Toggle favorite
function toggleFavorite(url, name, btn) {
    if (!window.localStorage) {
        console.log("Browser does not support localStorage");
        return;
    }
    
    var favKey = FAV_PREFIX + url;
    var isFavorited = window.localStorage.getItem(favKey) === name;
    
    if (isFavorited) {
        window.localStorage.removeItem(favKey);
        btn.removeClass('active');
    } else {
        window.localStorage.setItem(favKey, name);
        btn.addClass('active');
    }
    
    // Refresh favorites panel
    loadFavorites();
}

// Favorites management
function loadFavorites() {
    favorites = [];
    
    // Only load favorites with FAV_PREFIX
    for (var key of Object.keys(localStorage)) {
        if (key.startsWith(FAV_PREFIX)) {
            favorites.push({
                url: key.replace(FAV_PREFIX, ''),
                name: localStorage.getItem(key)
            });
        }
    }
    
    $('#favCount').text(favorites.length);
    
    if (favorites.length === 0) {
        $('#favoriteContent').html(`
            <div class="no-channels" style="padding: 20px;">
                <i class="fas fa-heart-broken" style="font-size: 24px;"></i>
                <span style="font-size: 12px;">No favorites yet</span>
            </div>
        `);
    } else {
        $('#favoriteContent').empty();
        for (var i = 0; i < favorites.length; i++) {
            var fav = favorites[i];
            var itemHtml = `
                <div class="favorite-item" data-url="${fav.url}">
                    <i class="fas fa-play-circle"></i>
                    <span>${fav.name}</span>
                    <i class="fas fa-times remove-fav" title="Remove"></i>
                </div>
            `;
            $('#favoriteContent').append(itemHtml);
        }
        
        $('.favorite-item').on('click', function(e) {
            if (!$(e.target).hasClass('remove-fav')) {
                var url = $(this).data('url');
                var name = $(this).find('span').text();
                
                $('#favoritePanel').removeClass('show');
                playVideo(url, name);
                
                $('.channel-item').removeClass('active');
                $('#currentChannel').text(name);
            }
        });
        
        $('.remove-fav').on('click', function(e) {
            e.stopPropagation();
            var item = $(this).closest('.favorite-item');
            var url = item.data('url');
            localStorage.removeItem(FAV_PREFIX + url);
            loadFavorites();
            renderPlaylist();
        });
    }
}

function checkFavorite(url, name) {
    var favKey = FAV_PREFIX + url;
    return localStorage.getItem(favKey) === name;
}

// Setup UI interactions
function setupUIInteractions() {
    console.log('Setting up UI interactions...');
    
    // Toggle Sidebar - with top-toolbar sync
    $('#toggleSidebar, #menuBtn').on('click', function() {
        console.log('Toggle sidebar clicked');
        var sidebar = $('#sidebar');
        var isCollapsed = sidebar.hasClass('collapsed');
        
        sidebar.toggleClass('collapsed');
        
        // Sync top-toolbar visibility
        if (isCollapsed) {
            // Expanding - show toolbar
            $('#top-toolbar').removeClass('hidden');
        } else {
            // Collapsing - hide toolbar
            $('#top-toolbar').addClass('hidden');
        }
        
        // Mobile handling
        if (window.innerWidth <= 768) {
            sidebar.toggleClass('show-mobile');
        }
    });
    
    // Toggle Link Input
    $('#linkBtn').on('click', function() {
        $('#linkInputWrapper').toggleClass('show');
        $('#linkInput').focus();
    });
    
    // Play custom link
    $('#playLinkBtn').on('click', function() {
        var url = $('#linkInput').val().trim();
        if (url) {
            playVideo(url, 'Custom URL');
            $('#currentChannel').text('Custom URL');
            $('#linkInputWrapper').removeClass('show');
            $('#linkInput').val('');
        }
    });
    
    // Enter key for link input
    $('#linkInput').on('keypress', function(e) {
        if (e.which === 13) {
            $('#playLinkBtn').click();
        }
    });
    
    // Toggle Favorite Panel
    $('#favoriteBtn').on('click', function() {
        $('#favoritePanel').toggleClass('show');
        $('#detailPanel').removeClass('show');
    });
    
    // Toggle Detail Panel
    $('#detailBtn').on('click', function() {
        $('#detailPanel').toggleClass('show');
        $('#favoritePanel').removeClass('show');
    });
    
    // Shuffle Button
    $('#shuffleBtn').on('click', function() {
        var channels = $('.channel-item');
        if (channels.length > 0) {
            var randomIndex = Math.floor(Math.random() * channels.length);
            channels.eq(randomIndex).click();
        }
    });
    
    // GitHub Button
    $('#githubBtn').on('click', function() {
        window.open('https://github.com/zhangboheng/Easy-Web-TV-M3u8', '_blank');
    });
    
    // Back Button
    $('#backBtn').on('click', function() {
        window.history.back();
    });
    
    // Channel Search
    $('#channelSearch').on('input', function() {
        var query = $(this).val().toLowerCase();
        $('.channel-item').each(function() {
            var name = $(this).find('.channel-name').text().toLowerCase();
            $(this).toggle(name.indexOf(query) > -1);
        });
    });
    
    // Close panels when clicking outside
    $(document).on('click', function(e) {
        if (!$(e.target).closest('#favoritePanel, #favoriteBtn').length) {
            $('#favoritePanel').removeClass('show');
        }
        if (!$(e.target).closest('#detailPanel, #detailBtn').length) {
            $('#detailPanel').removeClass('show');
        }
        if (!$(e.target).closest('#linkInputWrapper, #linkBtn').length) {
            $('#linkInputWrapper').removeClass('show');
        }
    });
    
    // Show toolbar on mouse move near top
    $(document).on('mousemove', function(e) {
        if (e.clientY < 100) {
            $('#top-toolbar').removeClass('hidden');
        }
    });
}
