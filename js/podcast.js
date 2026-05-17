var proxy = {
    0: 'https://api.codetabs.com/v1/proxy/?quest=',
    1: 'https://cors.luckydesigner.workers.dev/?',
    2: 'https://corsproxy.io/?',
    3: 'https://api.allorigins.win/raw?url=',
};
var rand = Math.floor(Math.random() * Object.keys(proxy).length);

var feedUrl = '';
var podcastInfo = {};
var episodes = [];
var filteredEpisodes = [];
var currentEpisodeIndex = -1;
var audioEl = null;
var isPlaying = false;
var playbackSpeeds = [0.5, 0.75, 1, 1.25, 1.5, 2];
var currentSpeedIndex = 2;
var FAV_PREFIX = 'fav_podcast_';

$(document).ready(function () {
    audioEl = document.getElementById('podcastAudio');
    var params = new URLSearchParams(window.location.search);
    feedUrl = params.get('feed') || '';
    if (!feedUrl) { showError('No podcast feed URL provided.'); return; }
    
    // Back button
    $('#backBtn').on('click', function () { window.history.back(); });
    
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
    $('#toggleSidebar').on('click', function () {
        toggleSidebar();
    });
    
    // Episode search
    $('#episodeSearch').on('keypress', function (e) {
        if (e.which === 13) { searchEpisodes(); }
    });
    $('#episodeSearch').on('input', function () {
        if (!$(this).val().trim()) { searchEpisodes(); }
    });
    
    // Cover play button
    $('#coverPlayBtn').on('click', function () {
        if (currentEpisodeIndex === -1 && episodes.length > 0) {
            playEpisode(0);
        } else if (currentEpisodeIndex !== -1) {
            if (isPlaying) { audioEl.pause(); } else { audioEl.play().catch(function(e){ console.error(e); }); }
        }
    });
    
    // Shuffle button
    $('#shuffleBtn').on('click', function () {
        if (episodes.length > 0) {
            var randomIndex = Math.floor(Math.random() * episodes.length);
            playEpisode(randomIndex);
        }
    });
    
    // Favorite Panel Toggle
    $('#favoriteBtn').on('click', function () {
        $('#favoritePanel').toggleClass('show');
    });
    
    // Close panels when clicking outside
    $(document).on('click', function (e) {
        if (!$(e.target).closest('#favoritePanel, #favoriteBtn').length) {
            $('#favoritePanel').removeClass('show');
        }
    });
    
    // GitHub button
    $('#githubBtn').on('click', function () {
        window.open('https://github.com/zhangboheng/Easy-Web-TV-M3u8', '_blank');
    });
    
    initPlayerControls();
    loadPodcastFeed();
    loadFavorites();
});

function loadPodcastFeed() {
    $('#loadingOverlay').removeClass('hidden');
    $.ajax({
        url: proxy[rand] + encodeURIComponent(feedUrl), type: "GET", dataType: "xml",
        success: function (data) { $('#loadingOverlay').addClass('hidden'); parsePodcastFeed(data); },
        error: function () {
            var altRand = (rand + 1) % Object.keys(proxy).length;
            $.ajax({
                url: proxy[altRand] + encodeURIComponent(feedUrl), type: "GET", dataType: "xml",
                success: function (data) { $('#loadingOverlay').addClass('hidden'); parsePodcastFeed(data); },
                error: function () { $('#loadingOverlay').addClass('hidden'); showError('Failed to load podcast feed.'); }
            });
        }
    });
}

function extractPodcastImage(channel, xmlText) {
    var imageUrl = '';
    
    var imageEl = channel.children('image').first();
    if (imageEl.length) {
        imageUrl = imageEl.children('url').first().text();
    }
    if (!imageUrl) {
        imageEl = channel.children('img').first();
        if (imageEl.length) {
            imageUrl = imageEl.attr('src') || '';
        }
    }
    
    if (!imageUrl) {
        imageUrl = channel.find('itunes\\:image').attr('href') || '';
    }
    if (!imageUrl) {
        channel.children().each(function () {
            if (this.tagName && (this.tagName.toLowerCase() === 'itunes:image' || this.tagName.toLowerCase === 'itunes:image')) {
                imageUrl = $(this).attr('href') || '';
                if (imageUrl) return false;
            }
        });
    }
    
    if (!imageUrl && xmlText) {
        var urlMatch = xmlText.match(/<image[^>]*>[\s\S]*?<url>\s*(.*?)\s*<\/url>/i);
        if (urlMatch && urlMatch[1]) {
            imageUrl = urlMatch[1];
        }
        if (!imageUrl) {
            var itunesMatch = xmlText.match(/<itunes:image\s+href=["']([^"']+)["']/i);
            if (itunesMatch && itunesMatch[1]) {
                imageUrl = itunesMatch[1];
            }
        }
    }
    
    return imageUrl;
}

function parsePodcastFeed(xmlData) {
    try {
        var xmlText = xmlData.xml || (new XMLSerializer()).serializeToString(xmlData);
        var channel = $(xmlData).find('channel');
        var imageUrl = extractPodcastImage(channel, xmlText) || '../images/noimage.jpeg';
        
        podcastInfo = {
            title: channel.find('title').first().text() || 'Unknown Podcast',
            description: channel.find('description').first().text() || '',
            imageUrl: imageUrl,
            link: channel.find('link').first().text() || ''
        };
        
        // Update header
        $('#headerTitle').text(podcastInfo.title);
        $('#sidebarTitle').text(podcastInfo.title);
        
        // Update cover
        var coverSrc = podcastInfo.imageUrl && podcastInfo.imageUrl !== '../images/noimage.jpeg' 
            ? podcastInfo.imageUrl 
            : '../images/noimage.jpeg';
        $('#podcastCover').attr('src', coverSrc).onerror = function () { this.src = '../images/noimage.jpeg'; };
        
        // Update info text
        $('#podcastName').text(podcastInfo.title);
        $('#podcastDesc').text(podcastInfo.description);
        
        // Parse episodes
        episodes = [];
        channel.find('item').each(function () {
            var item = $(this);
            var enclosure = item.find('enclosure');
            var audioUrl = enclosure.attr('url') || '';
            if (audioUrl) {
                episodes.push({
                    title: item.find('title').first().text() || 'Untitled Episode',
                    audioUrl: audioUrl,
                    pubDate: formatDate(item.find('pubDate').first().text()),
                    duration: formatDuration(item.find('itunes\\:duration').first().text()),
                    description: item.find('description').first().text() || '',
                    imageUrl: item.find('itunes\\:image').attr('href') || podcastInfo.imageUrl
                });
            }
        });
        
        if (episodes.length === 0) { showError('No episodes found in this podcast feed.'); return; }
        
        // Update episode count
        $('#episodeCount').text(episodes.length);
        
        filteredEpisodes = episodes.slice();
        renderEpisodes(filteredEpisodes);
    } catch (e) { console.error('Failed to parse podcast feed:', e); showError('Failed to parse podcast feed.'); }
}

function renderEpisodes(epList) {
    var html = '';
    epList.forEach(function (ep, index) {
        // Find the real index in the full episodes array
        var realIndex = episodes.indexOf(ep);
        var isFavorite = localStorage.getItem(FAV_PREFIX + realIndex);
        html += '<div class="episode-item" data-index="' + realIndex + '">';
        html += '  <div class="ep-icon"><i class="fas fa-play"></i></div>';
        html += '  <div class="ep-info">';
        html += '    <div class="ep-title">' + escapeHtml(ep.title) + '</div>';
        html += '    <div class="ep-meta">';
        if (ep.pubDate) html += '<span><i class="fas fa-calendar"></i>' + ep.pubDate + '</span>';
        if (ep.duration) html += '<span><i class="fas fa-clock"></i>' + ep.duration + '</span>';
        html += '    </div>';
        html += '  </div>';
        html += '  <i class="fas fa-heart favorite-btn ' + (isFavorite ? 'active' : '') + '"></i>';
        html += '</div>';
    });
    $('#episodeList').html(html);
    
    // Click handler - play episode
    $('#episodeList').on('click', '.episode-item', function (e) {
        if (!$(e.target).hasClass('favorite-btn')) {
            playEpisode(parseInt($(this).data('index')));
        }
    });
    
    // Click to toggle favorite
    $('#episodeList').on('click', '.favorite-btn', function (e) {
        e.stopPropagation();
        var epItem = $(this).closest('.episode-item');
        var index = epItem.data('index');
        
        if ($(this).hasClass('active')) {
            localStorage.removeItem(FAV_PREFIX + index);
            $(this).removeClass('active');
        } else {
            localStorage.setItem(FAV_PREFIX + index, episodes[index].title);
            $(this).addClass('active');
        }
        
        loadFavorites();
    });
}

function searchEpisodes() {
    var query = $('#episodeSearch').val().trim().toLowerCase();
    if (!query) {
        filteredEpisodes = episodes.slice();
        renderEpisodes(filteredEpisodes);
        return;
    }
    filteredEpisodes = episodes.filter(function (ep) {
        return ep.title.toLowerCase().indexOf(query) !== -1;
    });
    renderEpisodes(filteredEpisodes);
}

function playEpisode(index) {
    if (index < 0 || index >= episodes.length) return;
    currentEpisodeIndex = index;
    var ep = episodes[index];
    
    // Update sidebar active state
    $('.episode-item').removeClass('active');
    $('.episode-item[data-index="' + index + '"]').addClass('active');
    $('.episode-item .ep-icon i').removeClass('fa-pause').addClass('fa-play');
    $('.episode-item[data-index="' + index + '"] .ep-icon i').removeClass('fa-play').addClass('fa-pause');
    
    // Update main display
    $('#podcastInfoText').hide();
    $('#currentEpInfo').show();
    $('#epTitleDisplay').text(ep.title);
    $('#epPodcastDisplay').text(podcastInfo.title);
    
    // Update cover with episode image if available
    var epCover = ep.imageUrl || podcastInfo.imageUrl;
    if (epCover && epCover !== '../images/noimage.jpeg' && !epCover.startsWith('data:')) {
        // Don't proxy cover images here - let them load directly or fall back
        $('#podcastCover').attr('src', epCover).onerror = function () { this.src = '../images/noimage.jpeg'; };
    }
    
    // Show player controls and progress
    $('#playerControlsBar').show();
    $('#progressContainer').show();
    
    // Update visualizer
    $('#soundWave').removeClass('paused');
    
    // Play audio
    audioEl.src = ep.audioUrl;
    audioEl.play().catch(function (e) { console.error('Failed to play audio:', e); });
}

function initPlayerControls() {
    // Play/Pause
    $('#pPlayPause').on('click', function () {
        if (currentEpisodeIndex === -1) return;
        if (isPlaying) { audioEl.pause(); } else { audioEl.play().catch(function(e){ console.error(e); }); }
    });
    
    // Rewind 15s
    $('#pBackward').on('click', function () {
        if (currentEpisodeIndex !== -1) audioEl.currentTime = Math.max(0, audioEl.currentTime - 15);
    });
    
    // Forward 15s
    $('#pForward').on('click', function () {
        if (currentEpisodeIndex !== -1) audioEl.currentTime = Math.min(audioEl.duration || 0, audioEl.currentTime + 15);
    });
    
    // Speed control
    $('#pSpeed').on('click', function () {
        currentSpeedIndex = (currentSpeedIndex + 1) % playbackSpeeds.length;
        var speed = playbackSpeeds[currentSpeedIndex];
        audioEl.playbackRate = speed;
        $('#pSpeed').text(speed + 'x');
    });
    
    // Progress bar click
    $('#pProgressBar').on('click', function (e) {
        if (currentEpisodeIndex === -1) return;
        var pct = e.offsetX / $(this).width();
        audioEl.currentTime = audioEl.duration * pct;
    });
    
    // Audio events
    audioEl.addEventListener('timeupdate', function () {
        var ct = audioEl.currentTime, dur = audioEl.duration;
        if (dur) {
            $('#pProgressFill').css('width', (ct / dur) * 100 + '%');
            $('#pCurrentTime').text(formatTime(ct));
            $('#pTotalTime').text(formatTime(dur));
        }
    });
    
    audioEl.addEventListener('play', function () {
        isPlaying = true;
        $('#pPlayIcon').removeClass('fa-play').addClass('fa-pause');
        $('#soundWave').removeClass('paused');
    });
    
    audioEl.addEventListener('pause', function () {
        isPlaying = false;
        $('#pPlayIcon').removeClass('fa-pause').addClass('fa-play');
        $('#soundWave').addClass('paused');
    });
    
    audioEl.addEventListener('ended', function () {
        if (currentEpisodeIndex < episodes.length - 1) {
            playEpisode(currentEpisodeIndex + 1);
        } else {
            isPlaying = false;
            $('#pPlayIcon').removeClass('fa-pause').addClass('fa-play');
            $('#soundWave').addClass('paused');
            $('.episode-item').removeClass('active');
            $('.episode-item .ep-icon i').removeClass('fa-pause').addClass('fa-play');
        }
    });
}

function formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return '0:00';
    var hrs = Math.floor(seconds / 3600), mins = Math.floor((seconds % 3600) / 60), secs = Math.floor(seconds % 60);
    if (hrs > 0) return hrs + ':' + (mins < 10 ? '0' : '') + mins + ':' + (secs < 10 ? '0' : '') + secs;
    return mins + ':' + (secs < 10 ? '0' : '') + secs;
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    try { return new Date(dateStr).toLocaleDateString(); } catch (e) { return dateStr; }
}

function formatDuration(d) {
    if (!d) return '';
    if (/^\d+$/.test(d)) return formatTime(parseInt(d));
    return d;
}

function escapeHtml(text) {
    if (!text) return '';
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(text));
    return div.innerHTML;
}

function showError(msg) {
    $('#episodeList').html('<div class="empty-state"><i class="fas fa-exclamation-circle"></i><h3>Error</h3><p>' + msg + '</p></div>');
}

// Load favorites from localStorage
function loadFavorites() {
    var favorites = [];
    for (var key of Object.keys(localStorage)) {
        if (key.startsWith(FAV_PREFIX)) {
            var epIndex = key.replace(FAV_PREFIX, '');
            var epTitle = localStorage.getItem(key);
            favorites.push({ index: epIndex, title: epTitle });
        }
    }
    
    $('#favCount').text(favorites.length);
    
    if (favorites.length === 0) {
        $('#favoriteContent').html(
            '<div class="empty-state" style="padding: 20px;">' +
            '<i class="fas fa-heart-broken" style="font-size: 24px;"></i>' +
            '<span style="font-size: 12px;">No favorites yet</span>' +
            '</div>'
        );
    } else {
        var html = '';
        favorites.forEach(function (fav) {
            html += '<div class="favorite-item" data-index="' + fav.index + '" data-title="' + escapeHtml(fav.title) + '">';
            html += '  <i class="fas fa-heart"></i>';
            html += '  <span>' + escapeHtml(fav.title) + '</span>';
            html += '  <i class="fas fa-times delete-btn"></i>';
            html += '</div>';
        });
        $('#favoriteContent').html(html);
        
        // Click to play favorite
        $('#favoriteContent').off('click', '.favorite-item').on('click', '.favorite-item', function (e) {
            if (!$(e.target).hasClass('delete-btn')) {
                var index = parseInt($(this).data('index'));
                if (index >= 0 && index < episodes.length) {
                    playEpisode(index);
                    $('#favoritePanel').removeClass('show');
                }
            }
        });
        
        // Click to delete favorite
        $('#favoriteContent').off('click', '.delete-btn').on('click', '.delete-btn', function (e) {
            e.stopPropagation();
            var favItem = $(this).closest('.favorite-item');
            var index = favItem.data('index');
            localStorage.removeItem(FAV_PREFIX + index);
            loadFavorites();
            
            // Update episode list favorite icon
            $('.episode-item[data-index="' + index + '"] .favorite-btn').removeClass('active');
        });
    }
}
