// Set global array proxy links to solve CORS error
var proxy = {
    0: 'https://cors.luckydesigner.workers.dev/?',
    1: 'https://corsproxy.io/?',
    2: 'https://api.allorigins.win/raw?url=',
};
var rand = Math.floor(Math.random() * Object.keys(proxy).length);

// Store episodes data
var episodes = [];
var links = [];
var videoName = '';
var videoDes = '';
var player = null;
var currentEpisodeIndex = -1;  // Track current playing episode

// Favorite prefix for localStorage - ensures only this app's favorites are shown
const FAV_PREFIX = 'fav_comprehensive_';

$(document).ready(function() {
    // Initialize player
    player = videojs(document.querySelector('#video1'));
    
    // Error handling - prevent loading spinner and error icon showing simultaneously
    player.on('error', function() {
        player.removeClass('vjs-waiting');
        player.removeClass('vjs-loading');
    });
    
    // Auto-play next episode when current episode ends
    player.on('ended', function() {
        console.log('Video ended, checking for next episode...');
        if (currentEpisodeIndex >= 0 && currentEpisodeIndex < links.length - 1) {
            var nextIndex = currentEpisodeIndex + 1;
            console.log('Auto-playing next episode:', nextIndex + 1);
            playEpisode(nextIndex);
        } else {
            console.log('No more episodes to play');
        }
    });
    
    // Get Current href parameters
    var initlink = decodeURIComponent(window.location.href).split('=')[1].split('&')[0];
    var id = decodeURIComponent(window.location.href).split('=')[2];
    
    // Load video data
    loadVideoData(initlink, id);
    
    // Initialize UI interactions
    initUIInteractions();
    
    // Load favorites
    loadFavorites();
});

// Load video data from API
function loadVideoData(linkUrl, videoId) {
    var baseUrl = linkUrl.endsWith('/') ? linkUrl : linkUrl + '/';
    var apiUrl = proxy[rand] + encodeURIComponent(baseUrl + '?ac=videolist&ids=' + videoId);
    
    $.ajax({
        type: "GET",
        url: apiUrl,
        dataType: 'json',
        success: function(data) {
            $("#episodeList").empty();
            
            // Parse JSON response
            var videos = data.list || [];
            if (videos.length === 0) {
                showError("No video data found!");
                return;
            }
            
            var video = videos[0];
            videoName = video.vod_name || 'Unknown';
            videoDes = video.vod_content || 'No description available';
            var vodPlayUrl = video.vod_play_url || '';
            
            // Update UI with video info
            $('#videoTitle').text(videoName);
            $('#detailContent').html('<p>' + videoDes + '</p>');
            
            // Parse play links
            var sources = vodPlayUrl.split('$$$').filter(x => x.trim());
            var playItems = [];
            
            for (var j = 0; j < sources.length; j++) {
                var items = sources[j].split('#').filter(x => x.trim());
                playItems = playItems.concat(items);
            }
            
            episodes = [];
            links = [];
            
            for (let i = 0; i < playItems.length; i++) {
                var parts = playItems[i].split('$');
                if (parts.length >= 2) {
                    // Only keep m3u8 format links
                    if (parts[1].trim().toLowerCase().endsWith('.m3u8')) {
                        episodes.push(parts[0]);
                        links.push(parts[1]);
                    }
                } else if (parts.length === 1 && parts[0].includes('http')) {
                    // Only keep m3u8 format links
                    if (parts[0].trim().toLowerCase().endsWith('.m3u8')) {
                        episodes.push('第' + Number(i+1) + '集');
                        links.push(parts[0]);
                    }
                }
            }
            
            // Update episode count
            $('#episodeCount').text(episodes.length);
            
            if (episodes.length === 0) {
                $('#episodeList').html(`
                    <div class="no-episodes">
                        <i class="fas fa-video-slash"></i>
                        <span>No episodes available</span>
                    </div>
                `);
                return;
            }
            
            // Render episode list
            renderEpisodeList();
            
            // Play first episode
            if (links.length > 0) {
                playEpisode(0);
            }
        },
        error: function() {
            showError("Failed to load video data. Please check your internet connection.");
        }
    });
}

// Render episode list
function renderEpisodeList() {
    $('#episodeList').empty();
    
    for (let i = 0; i < episodes.length; i++) {
        var displayName = videoName + ' - ' + episodes[i];
        var favKey = FAV_PREFIX + links[i];
        var isFavorited = window.localStorage.getItem(favKey) === displayName;
        
        var episodeHtml = `
            <div class="episode-item" data-index="${i}">
                <div class="episode-icon">
                    <i class="fas fa-play"></i>
                </div>
                <span class="episode-name">${episodes[i]}</span>
                <i class="fas fa-heart favorite-btn ${isFavorited ? 'active' : ''}" data-link="${links[i]}" data-name="${displayName}"></i>
            </div>
        `;
        $('#episodeList').append(episodeHtml);
    }
    
    // Click handler for episodes
    $('.episode-item').on('click', function(e) {
        if (!$(e.target).hasClass('favorite-btn')) {
            var index = $(this).data('index');
            playEpisode(index);
        }
    });
    
    // Favorite button click handler
    $('.favorite-btn').on('click', function(e) {
        e.stopPropagation();
        var link = $(this).data('link');
        var name = $(this).data('name');
        toggleFavorite(link, name, $(this));
    });
}

// Play episode by index
function playEpisode(index) {
    if (index < 0 || index >= links.length) return;
    
    currentEpisodeIndex = index;  // Update current index
    var url = links[index];
    var name = episodes[index];
    
    player.src({
        src: url,
        type: 'application/x-mpegURL'
    });
    player.play();
    
    // Update current episode display
    $('#currentEpisode').text(videoName + ' - ' + name);
    
    // Update active state
    $('.episode-item').removeClass('active');
    $('.episode-item[data-index="' + index + '"]').addClass('active');
}

// Toggle favorite
function toggleFavorite(link, name, btn) {
    if (!window.localStorage) {
        console.log("Browser does not support localStorage");
        return;
    }
    
    var favKey = FAV_PREFIX + link;
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

// Load favorites
function loadFavorites() {
    var favorites = [];
    
    for (let key of Object.keys(localStorage)) {
        if (key.startsWith(FAV_PREFIX)) {
            favorites.push({
                link: key.replace(FAV_PREFIX, ''),
                name: localStorage.getItem(key)
            });
        }
    }
    
    $('#favCount').text(favorites.length);
    
    if (favorites.length === 0) {
        $('#favoriteContent').html(`
            <div class="no-episodes" style="padding: 20px;">
                <i class="fas fa-heart-broken" style="font-size: 24px;"></i>
                <span style="font-size: 12px;">No favorites yet</span>
            </div>
        `);
        return;
    }
    
    $('#favoriteContent').empty();
    
    for (let fav of favorites) {
        var favHtml = `
            <div class="favorite-item" data-link="${fav.link}">
                <i class="fas fa-play-circle"></i>
                <span>${fav.name}</span>
                <i class="fas fa-times remove-fav" title="Remove"></i>
            </div>
        `;
        $('#favoriteContent').append(favHtml);
    }
    
    // Click handler for favorite items
    $('.favorite-item').on('click', function(e) {
        if (!$(e.target).hasClass('remove-fav')) {
            var link = $(this).data('link');
            playCustomLink(link, $(this).find('span').text());
        }
    });
    
    // Remove favorite handler
    $('.remove-fav').on('click', function(e) {
        e.stopPropagation();
        var item = $(this).closest('.favorite-item');
        var link = item.data('link');
        localStorage.removeItem(FAV_PREFIX + link);
        loadFavorites();
        renderEpisodeList();
    });
}

// Play custom link
function playCustomLink(url, name) {
    player.src({
        src: url,
        type: 'application/x-mpegURL'
    });
    player.play();
    $('#currentEpisode').text(name || 'Custom URL');
}

// Show error message
function showError(message) {
    $('#episodeList').html(`
        <div class="no-episodes">
            <i class="fas fa-exclamation-triangle"></i>
            <span>${message}</span>
        </div>
    `);
}

// Initialize UI interactions
function initUIInteractions() {
    // Toggle sidebar - toggle episode list and toolbar visibility
    function toggleSidebar() {
        var sidebar = $('#sidebar');
        var toolbar = $('#top-toolbar');
        
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
        } else {
            toolbar.addClass('hidden');
        }
    }
    
    // Toggle Sidebar button
    $('#toggleSidebar').on('click', function() {
        toggleSidebar();
    });
    
    // Back Button
    $('#backBtn').on('click', function() {
        window.history.back();
    });
    
    // Link Input Toggle
    $('#linkBtn').on('click', function() {
        $('#linkInputWrapper').toggleClass('show');
    });
    
    // Play Custom Link
    $('#playLinkBtn').on('click', function() {
        var link = $('#linkInput').val().trim();
        if (link) {
            playCustomLink(link, 'Custom URL');
            $('#linkInput').val('');
        }
    });
    
    // Enter key for link input
    $('#linkInput').on('keypress', function(e) {
        if (e.which === 13) {
            var link = $(this).val().trim();
            if (link) {
                playCustomLink(link, 'Custom URL');
                $(this).val('');
            }
        }
    });
    
    // Favorite Panel Toggle
    $('#favoriteBtn').on('click', function() {
        $('#favoritePanel').toggleClass('show');
        $('#detailPanel').removeClass('show');
    });
    
    // Detail Panel Toggle
    $('#detailBtn').on('click', function() {
        $('#detailPanel').toggleClass('show');
        $('#favoritePanel').removeClass('show');
    });
    
    // GitHub Button
    $('#githubBtn').on('click', function() {
        window.open('https://github.com/zhangboheng/Easy-Web-TV-M3u8', '_blank');
    });
    
    // Shuffle Play
    $('#shuffleBtn').on('click', function() {
        if (links.length > 0) {
            var randomIndex = Math.floor(Math.random() * links.length);
            playEpisode(randomIndex);
        }
    });
    
    // Episode Search
    $('#episodeSearch').on('input', function() {
        var searchTerm = $(this).val().toLowerCase();
        $('.episode-item').each(function() {
            var name = $(this).find('.episode-name').text().toLowerCase();
            if (name.indexOf(searchTerm) > -1) {
                $(this).show();
            } else {
                $(this).hide();
            }
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
    
    // Keyboard shortcuts
    $(document).on('keydown', function(e) {
        // Escape to close panels
        if (e.key === 'Escape') {
            $('#favoritePanel').removeClass('show');
            $('#detailPanel').removeClass('show');
            $('#linkInputWrapper').removeClass('show');
        }
        
        // Space to toggle play/pause (when not focused on input)
        if (e.key === ' ' && !$(e.target).is('input, textarea')) {
            e.preventDefault();
            if (player.paused()) {
                player.play();
            } else {
                player.pause();
            }
        }
    });
}
