var proxy = {
    0: 'https://api.codetabs.com/v1/proxy/?quest=',
    1: 'https://cors.luckydesigner.workers.dev/?',
    2: 'https://corsproxy.io/?',
    3: 'https://api.allorigins.win/raw?url=',
};
var rand = Math.floor(Math.random() * Object.keys(proxy).length);

var artists = [];
var pageNum = 1;
var currentFilter = { type: 'all', value: '-1' };
var searchQuery = '';
var isLoading = false;
var hasMore = true;
var isSearchMode = false;

// Player state
var currentPlaylist = [];
var currentSongIndex = -1;
var audioPlayer = null;
var isPlaying = false;

// Podcast state
var podcastSubscriptions = [];
var PODCAST_STORAGE_KEY = 'podcast_subscriptions';

$(document).ready(function () {
    // Initialize audio player
    audioPlayer = document.getElementById('audioPlayer');
    
    // Back button
    $('#backBtn').on('click', function () {
        window.history.back();
    });
    
    // Tab switching
    $('.tab-btn').on('click', function () {
        var tabId = $(this).data('tab');
        
        // Update tab buttons
        $('.tab-btn').removeClass('active');
        $(this).addClass('active');
        
        // Update tab content
        $('.tab-content').removeClass('active');
        $('#' + tabId).addClass('active');
        
        // Show/hide search box based on tab
        if (tabId === 'podcast') {
            $('#musicSearchBox').hide();
            $('#podcastSearchBox').show();
        } else {
            $('#musicSearchBox').show();
            $('#podcastSearchBox').hide();
        }
        
        // Load music data on first switch if needed
        if (tabId === 'music' && artists.length === 0 && !isLoading) {
            loadArtists();
        }
    });
    
    // ============ PODCAST EVENT HANDLERS ============
    
    // OPML import button
    $('#importOpmlBtn').on('click', function () {
        $('#opmlFileInput').click();
    });
    
    // OPML file selected
    $('#opmlFileInput').on('change', function (e) {
        var file = e.target.files[0];
        if (!file) return;
        
        var reader = new FileReader();
        reader.onload = function (event) {
            var content = event.target.result;
            parseOpml(content);
            // Reset file input
            $('#opmlFileInput').val('');
        };
        reader.readAsText(file);
    });
    
    // Add RSS feed
    $('#addRssBtn').on('click', function () {
        addRssFeed();
    });
    
    $('#rssUrlInput').on('keypress', function (e) {
        if (e.which === 13) {
            addRssFeed();
        }
    });
    
    // Export OPML
    $('#exportOpmlBtn').on('click', function () {
        exportOpml();
    });
    
    // Clear all podcasts
    $('#clearPodcastsBtn').on('click', function () {
        showConfirm('Are you sure you want to remove all podcast subscriptions?', function () {
            podcastSubscriptions = [];
            savePodcastSubscriptions();
            renderPodcastList();
            showToast('All podcast subscriptions have been removed.', 'success');
        }, true);
    });
    
    // Confirm modal buttons
    $('#confirmOk').on('click', function () {
        if (confirmCallback) {
            confirmCallback();
        }
        hideConfirm();
    });
    
    $('#confirmCancel').on('click', function () {
        hideConfirm();
    });
    
    // Remove individual podcast (delegated)
    $('#podcastGrid').on('click', '.podcast-remove', function (e) {
        e.stopPropagation();
        e.preventDefault();
        var feedUrl = $(this).data('feed');
        podcastSubscriptions = podcastSubscriptions.filter(function (p) {
            return p.feedUrl !== feedUrl;
        });
        savePodcastSubscriptions();
        renderPodcastList();
    });
    
    // ============ MUSIC EVENT HANDLERS ============
    
    // Menu button - toggle sidebar
    $('#menuBtn').on('click', function () {
        if (window.innerWidth <= 768) {
            $('#sidebar').toggleClass('show-mobile');
        } else {
            $('#sidebar').toggleClass('collapsed');
            $('#mainContent').toggleClass('expanded');
        }
    });
    
    // Toggle sidebar button
    $('#toggleSidebar').on('click', function () {
        if (window.innerWidth <= 768) {
            $('#sidebar').toggleClass('show-mobile');
        } else {
            $('#sidebar').toggleClass('collapsed');
            $('#mainContent').toggleClass('expanded');
        }
    });
    
    // Category selection
    $('#categoryList').on('click', '.category-item', function () {
        if (isLoading) return;
        
        $('.category-item').removeClass('active');
        $(this).addClass('active');
        
        currentFilter = {
            type: $(this).data('type'),
            value: $(this).data('value')
        };
        
        // Reset pagination
        pageNum = 1;
        hasMore = true;
        artists = [];
        
        // Load artists with new filter
        loadArtists();
    });
    
    // Search functionality
    $('#searchInput').on('keypress', function (e) {
        if (e.which === 13) {
            performSearch();
        }
    });
    
    $('#searchBtn').on('click', function () {
        performSearch();
    });
    
    // Infinite scroll - listen on main content area scroll
    $('#mainContent').on('scroll', function () {
        var scrollTop = $(this).scrollTop();
        var scrollHeight = $(this)[0].scrollHeight;
        var clientHeight = $(this).height();
        
        // Trigger when user scrolls near bottom (100px before end)
        if (scrollTop + clientHeight >= scrollHeight - 100) {
            if (!isLoading && hasMore && !isSearchMode) {
                loadMoreArtists();
            }
        }
    });
    
    // Player controls
    initPlayerControls();
    
    // Podcast search functionality
    $('#podcastSearchInput').on('keypress', function (e) {
        if (e.which === 13) {
            performPodcastSearch();
        }
    });
    
    $('#podcastSearchBtn').on('click', function () {
        performPodcastSearch();
    });
    
    // ============ INITIAL LOAD ============
    
    // Load podcast subscriptions from localStorage
    loadPodcastSubscriptions();
    renderPodcastList();
    
    // Show podcast search box, hide music search box (default tab is podcast)
    $('#podcastSearchBox').show();
    $('#musicSearchBox').hide();
});

// ============ TOAST & CONFIRM FUNCTIONS ============

var toastIcons = {
    success: 'fa-check-circle',
    error: 'fa-times-circle',
    warning: 'fa-exclamation-circle',
    info: 'fa-info-circle'
};

var toastTitles = {
    success: 'Success',
    error: 'Error',
    warning: 'Warning',
    info: 'Info'
};

function showToast(message, type, duration) {
    type = type || 'info';
    duration = duration || 3000;
    
    var iconClass = toastIcons[type] || toastIcons.info;
    var titleText = toastTitles[type] || toastTitles.info;
    
    var toastHtml = '<div class="toast ' + type + '">';
    toastHtml += '  <div class="toast-icon"><i class="fas ' + iconClass + '"></i></div>';
    toastHtml += '  <div class="toast-body">';
    toastHtml += '    <div class="toast-title">' + titleText + '</div>';
    toastHtml += '    <div class="toast-text">' + escapeHtml(message) + '</div>';
    toastHtml += '  </div>';
    toastHtml += '  <button class="toast-close" onclick="dismissToast(this)"><i class="fas fa-times"></i></button>';
    toastHtml += '</div>';
    
    var $toast = $(toastHtml);
    $('#toastContainer').append($toast);
    
    // Auto dismiss
    setTimeout(function () {
        dismissToast($toast.find('.toast-close')[0]);
    }, duration);
}

function dismissToast(closeBtn) {
    var $toast = $(closeBtn).closest('.toast');
    if ($toast.hasClass('toast-exit')) return;
    $toast.addClass('toast-exit');
    setTimeout(function () {
        $toast.remove();
    }, 300);
}

var confirmCallback = null;

function showConfirm(message, onConfirm, isDanger) {
    isDanger = isDanger || false;
    confirmCallback = onConfirm;
    
    $('#confirmMessage').text(message);
    
    if (isDanger) {
        $('#confirmIcon').addClass('danger');
        $('#confirmOk').addClass('danger');
        $('#confirmIcon i').removeClass('fa-exclamation-triangle').addClass('fa-trash-alt');
    } else {
        $('#confirmIcon').removeClass('danger');
        $('#confirmOk').removeClass('danger');
        $('#confirmIcon i').removeClass('fa-trash-alt').addClass('fa-exclamation-triangle');
    }
    
    $('#confirmOverlay').addClass('show');
}

function hideConfirm() {
    $('#confirmOverlay').removeClass('show');
    confirmCallback = null;
}

// ============ PODCAST FUNCTIONS ============

function loadPodcastSubscriptions() {
    try {
        var stored = localStorage.getItem(PODCAST_STORAGE_KEY);
        if (stored) {
            podcastSubscriptions = JSON.parse(stored);
        }
    } catch (e) {
        console.error('Failed to load podcast subscriptions:', e);
        podcastSubscriptions = [];
    }
}

function savePodcastSubscriptions() {
    try {
        localStorage.setItem(PODCAST_STORAGE_KEY, JSON.stringify(podcastSubscriptions));
    } catch (e) {
        console.error('Failed to save podcast subscriptions:', e);
    }
}

function parseOpml(xmlContent) {
    try {
        var parser = new DOMParser();
        var doc = parser.parseFromString(xmlContent, 'text/xml');
        var outlines = doc.querySelectorAll('outline[type="rss"], outline[type="link"]');
        
        var newPodcasts = [];
        outlines.forEach(function (outline) {
            var text = outline.getAttribute('text') || outline.getAttribute('title') || '';
            var xmlUrl = outline.getAttribute('xmlUrl') || outline.getAttribute('url') || '';
            var category = outline.parentElement && outline.parentElement.getAttribute('text') 
                ? outline.parentElement.getAttribute('text') : '';
            
            if (xmlUrl) {
                // Check if already subscribed
                var exists = podcastSubscriptions.some(function (p) { return p.feedUrl === xmlUrl; });
                if (!exists) {
                    newPodcasts.push({
                        name: text,
                        feedUrl: xmlUrl,
                        category: category,
                        imageUrl: ''
                    });
                }
            }
        });
        
        if (newPodcasts.length > 0) {
            podcastSubscriptions = podcastSubscriptions.concat(newPodcasts);
            savePodcastSubscriptions();
            renderPodcastList();
            
            // Fetch podcast details (cover images) in background
            newPodcasts.forEach(function (podcast) {
                fetchPodcastInfo(podcast);
            });
        }
        
        if (newPodcasts.length === 0 && outlines.length > 0) {
            showToast('All podcasts from this OPML are already in your subscriptions.', 'warning');
        } else if (outlines.length === 0) {
            showToast('No RSS feeds found in this OPML file.', 'warning');
        } else {
            showToast('Successfully imported ' + newPodcasts.length + ' podcast(s).', 'success');
        }
    } catch (e) {
        console.error('Failed to parse OPML:', e);
        showToast('Failed to parse OPML file. Please check the file format.', 'error');
    }
}

function addRssFeed() {
    var url = $('#rssUrlInput').val().trim();
    if (!url) {
        showToast('Please enter a valid RSS feed URL.', 'warning');
        return;
    }
    
    // Auto-prepend https:// if missing
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
    }
    
    // Validate URL format using URL constructor
    try {
        var urlObj = new URL(url);
        // Must have a valid hostname with at least one dot (not just a single word)
        if (!urlObj.hostname || urlObj.hostname.indexOf('.') === -1) {
            showToast('Invalid URL format. Please enter a complete URL (e.g., https://example.com/feed.xml)', 'error');
            return;
        }
        // Must use http or https protocol
        if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
            showToast('URL must use http:// or https:// protocol.', 'error');
            return;
        }
    } catch (e) {
        showToast('Invalid URL format. Please enter a valid URL.', 'error');
        return;
    }
    
    // Check if already subscribed
    var exists = podcastSubscriptions.some(function (p) { return p.feedUrl === url; });
    if (exists) {
        showToast('This podcast is already in your subscriptions.', 'warning');
        return;
    }
    
    var podcast = {
        name: 'Loading...', // Will be updated after fetching
        feedUrl: url,
        category: '',
        imageUrl: ''
    };
    
    podcastSubscriptions.push(podcast);
    savePodcastSubscriptions();
    renderPodcastList();
    $('#rssUrlInput').val('');
    
    showToast('Adding podcast... Fetching details from RSS feed.', 'info');
    
    // Fetch podcast details
    fetchPodcastInfo(podcast);
}

function extractPodcastImage(channel, xmlText) {
    var imageUrl = '';
    
    // Method 1: Find <image> child element and extract <url> text
    // Browsers may convert <image> to <img>, so we need to handle both
    var imageEl = channel.children('image').first();
    if (imageEl.length) {
        imageUrl = imageEl.children('url').first().text();
    }
    // Also try <img> since browsers auto-convert <image> in HTML parser
    if (!imageUrl) {
        imageEl = channel.children('img').first();
        if (imageEl.length) {
            imageUrl = imageEl.attr('src') || '';
        }
    }
    
    // Method 2: itunes:image href attribute (try multiple selector variations)
    if (!imageUrl) {
        imageUrl = channel.find('itunes\\:image').attr('href') || '';
    }
    if (!imageUrl) {
        // Some browsers handle namespaced elements differently
        channel.children().each(function () {
            if (this.tagName && (this.tagName.toLowerCase() === 'itunes:image' || this.tagName.toLowerCase === 'itunes:image')) {
                imageUrl = $(this).attr('href') || '';
                if (imageUrl) return false; // break
            }
        });
    }
    
    // Method 3: Regex fallback - extract from raw XML text
    if (!imageUrl && xmlText) {
        // Try <url>...</url> inside <image> block
        var urlMatch = xmlText.match(/<image[^>]*>[\s\S]*?<url>\s*(.*?)\s*<\/url>/i);
        if (urlMatch && urlMatch[1]) {
            imageUrl = urlMatch[1];
        }
        // Try itunes:image href
        if (!imageUrl) {
            var itunesMatch = xmlText.match(/<itunes:image\s+href=["']([^"']+)["']/i);
            if (itunesMatch && itunesMatch[1]) {
                imageUrl = itunesMatch[1];
            }
        }
    }
    
    return imageUrl;
}

function fetchPodcastInfo(podcast) {
    var apiUrl = podcast.feedUrl;
    
    $.ajax({
        url: proxy[rand] + encodeURIComponent(apiUrl),
        type: "GET",
        dataType: "xml",
        success: function (data) {
            try {
                var xmlText = data.xml || (new XMLSerializer()).serializeToString(data);
                var channel = $(data).find('channel');
                var title = channel.find('title').first().text() || podcast.name;
                var image = extractPodcastImage(channel, xmlText);
                
                // Update the podcast info
                var idx = podcastSubscriptions.findIndex(function (p) { return p.feedUrl === podcast.feedUrl; });
                if (idx !== -1) {
                    podcastSubscriptions[idx].name = title;
                    podcastSubscriptions[idx].imageUrl = image;
                    savePodcastSubscriptions();
                    renderPodcastList();
                }
            } catch (e) {
                console.error('Failed to parse podcast info:', e);
            }
        },
        error: function () {
            // Try alternate proxy
            var altRand = (rand + 1) % Object.keys(proxy).length;
            $.ajax({
                url: proxy[altRand] + encodeURIComponent(apiUrl),
                type: "GET",
                dataType: "xml",
                success: function (data) {
                    try {
                        var xmlText = data.xml || (new XMLSerializer()).serializeToString(data);
                        var channel = $(data).find('channel');
                        var title = channel.find('title').first().text() || podcast.name;
                        var image = extractPodcastImage(channel, xmlText);
                        
                        var idx = podcastSubscriptions.findIndex(function (p) { return p.feedUrl === podcast.feedUrl; });
                        if (idx !== -1) {
                            podcastSubscriptions[idx].name = title;
                            podcastSubscriptions[idx].imageUrl = image;
                            savePodcastSubscriptions();
                            renderPodcastList();
                        }
                    } catch (e) {
                        console.error('Failed to parse podcast info (alt proxy):', e);
                    }
                },
                error: function () {
                    // Failed to fetch - update name to show it's unavailable
                    var idx = podcastSubscriptions.findIndex(function (p) { return p.feedUrl === podcast.feedUrl; });
                    if (idx !== -1 && podcastSubscriptions[idx].name === 'Loading...') {
                        // Extract domain name as fallback display
                        try {
                            var urlObj = new URL(podcast.feedUrl);
                            podcastSubscriptions[idx].name = urlObj.hostname;
                        } catch (e) {
                            podcastSubscriptions[idx].name = 'Unknown Podcast';
                        }
                        savePodcastSubscriptions();
                        renderPodcastList();
                        showToast('Could not fetch podcast details for: ' + podcastSubscriptions[idx].name + '. The RSS feed may be unavailable.', 'error', 5000);
                    }
                    console.error('Failed to fetch podcast info for:', podcast.feedUrl);
                }
            });
        }
    });
}

function renderPodcastList() {
    if (podcastSubscriptions.length === 0) {
        $('#podcastEmpty').show();
        $('#podcastGrid').hide();
        $('#podcastActions').hide();
        return;
    }
    
    $('#podcastEmpty').hide();
    $('#podcastGrid').show();
    $('#podcastActions').show();
    
    var html = '';
    podcastSubscriptions.forEach(function (podcast) {
        var imgSrc = podcast.imageUrl || '../images/noimage.jpeg';
        var isLoading = podcast.name === 'Loading...';
        html += '<a href="../catalogues/podcastplay.html?feed=' + encodeURIComponent(podcast.feedUrl) + '" class="card-item' + (isLoading ? ' loading' : '') + '">';
        html += '  <img class="card-image" src="' + imgSrc + '" alt="' + escapeHtml(podcast.name) + '" onerror="this.src=\'../images/noimage.jpeg\'">';
        html += '  <div class="card-overlay"></div>';
        html += '  <div class="card-play-icon"><i class="fas fa-play"></i></div>';
        html += '  <div class="card-info">';
        if (podcast.category) {
            html += '    <div class="card-type">' + escapeHtml(podcast.category) + '</div>';
        }
        html += '    <div class="card-title">' + (isLoading ? '<i class="fas fa-spinner fa-spin" style="margin-right:6px;color:#a3001b;"></i>' : '') + escapeHtml(podcast.name) + '</div>';
        html += '  </div>';
        html += '  <div class="podcast-remove" data-feed="' + escapeHtml(podcast.feedUrl) + '"><i class="fas fa-times"></i></div>';
        html += '</a>';
    });
    
    $('#podcastGrid').html(html);
}

function performPodcastSearch() {
    var query = $('#podcastSearchInput').val().trim().toLowerCase();
    
    if (!query) {
        // If search is empty, show all podcasts
        renderPodcastList();
        return;
    }
    
    // Filter podcasts by name
    var filtered = podcastSubscriptions.filter(function (p) {
        return p.name.toLowerCase().indexOf(query) !== -1;
    });
    
    if (filtered.length === 0) {
        $('#podcastGrid').html('<div class="podcast-empty"><i class="fas fa-search"></i><h3>No Results</h3><p>No podcasts matching "' + escapeHtml(query) + '"</p></div>');
        $('#podcastGrid').show();
        $('#podcastEmpty').hide();
        return;
    }
    
    // Render filtered list
    var html = '';
    filtered.forEach(function (podcast) {
        var imgSrc = podcast.imageUrl || '../images/noimage.jpeg';
        var isLoading = podcast.name === 'Loading...';
        html += '<a href="../catalogues/podcastplay.html?feed=' + encodeURIComponent(podcast.feedUrl) + '" class="card-item' + (isLoading ? ' loading' : '') + '">';
        html += '  <img class="card-image" src="' + imgSrc + '" alt="' + escapeHtml(podcast.name) + '" onerror="this.src=\'../images/noimage.jpeg\'">';
        html += '  <div class="card-overlay"></div>';
        html += '  <div class="card-play-icon"><i class="fas fa-play"></i></div>';
        html += '  <div class="card-info">';
        if (podcast.category) {
            html += '    <div class="card-type">' + escapeHtml(podcast.category) + '</div>';
        }
        html += '    <div class="card-title">' + (isLoading ? '<i class="fas fa-spinner fa-spin" style="margin-right:6px;color:#a3001b;"></i>' : '') + escapeHtml(podcast.name) + '</div>';
        html += '  </div>';
        html += '  <div class="podcast-remove" data-feed="' + escapeHtml(podcast.feedUrl) + '"><i class="fas fa-times"></i></div>';
        html += '</a>';
    });
    
    $('#podcastGrid').html(html);
}

function exportOpml() {
    if (podcastSubscriptions.length === 0) {
        showToast('No podcasts to export.', 'warning');
        return;
    }
    
    var xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<opml version="1.0">\n';
    xml += '  <head>\n';
    xml += '    <title>Podcast Subscriptions</title>\n';
    xml += '  </head>\n';
    xml += '  <body>\n';
    
    // Group by category
    var categories = {};
    podcastSubscriptions.forEach(function (podcast) {
        var cat = podcast.category || 'Uncategorized';
        if (!categories[cat]) categories[cat] = [];
        categories[cat].push(podcast);
    });
    
    Object.keys(categories).forEach(function (cat) {
        xml += '    <outline text="' + escapeXml(cat) + '">\n';
        categories[cat].forEach(function (podcast) {
            xml += '      <outline type="rss" text="' + escapeXml(podcast.name) + '" xmlUrl="' + escapeXml(podcast.feedUrl) + '" />\n';
        });
        xml += '    </outline>\n';
    });
    
    xml += '  </body>\n';
    xml += '</opml>';
    
    var blob = new Blob([xml], { type: 'text/xml' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'podcast-subscriptions.opml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function escapeHtml(text) {
    if (!text) return '';
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(text));
    return div.innerHTML;
}

function escapeXml(text) {
    if (!text) return '';
    var result = text.replace(/&/g, '\x26amp;');
    result = result.replace(/</g, '\x26lt;');
    result = result.replace(/>/g, '\x26gt;');
    result = result.replace(/"/g, '\x26quot;');
    result = result.replace(/'/g, '\x26apos;');
    return result;
}

// ============ MUSIC FUNCTIONS ============

function initPlayerControls() {
    // Play/Pause button
    $('#playPauseBtn').on('click', function () {
        if (isPlaying) {
            audioPlayer.pause();
            isPlaying = false;
            $('#playIcon').removeClass('fa-pause').addClass('fa-play');
        } else {
            audioPlayer.play();
            isPlaying = true;
            $('#playIcon').removeClass('fa-play').addClass('fa-pause');
        }
    });
    
    // Previous button
    $('#prevBtn').on('click', function () {
        if (currentSongIndex > 0) {
            playSong(currentSongIndex - 1);
        }
    });
    
    // Next button
    $('#nextBtn').on('click', function () {
        if (currentSongIndex < currentPlaylist.length - 1) {
            playSong(currentSongIndex + 1);
        }
    });
    
    // Close player button
    $('#closePlayerBtn').on('click', function () {
        audioPlayer.pause();
        isPlaying = false;
        $('#bottomPlayer').removeClass('show');
        $('#mainContent').removeClass('with-player');
        $('#playIcon').removeClass('fa-pause').addClass('fa-play');
    });
    
    // Progress bar click
    $('#progressBar').on('click', function (e) {
        var width = $(this).width();
        var clickX = e.offsetX;
        var percentage = clickX / width;
        audioPlayer.currentTime = audioPlayer.duration * percentage;
    });
    
    // Volume slider click
    $('#volumeSlider').on('click', function (e) {
        var width = $(this).width();
        var clickX = e.offsetX;
        var percentage = clickX / width;
        audioPlayer.volume = percentage;
        $('#volumeBar').css('width', percentage * 100 + '%');
        updateVolumeIcon(percentage);
    });
    
    // Volume icon click (mute/unmute)
    $('#volumeIcon').on('click', function () {
        if (audioPlayer.volume > 0) {
            audioPlayer.volume = 0;
            $('#volumeBar').css('width', '0%');
            updateVolumeIcon(0);
        } else {
            audioPlayer.volume = 0.7;
            $('#volumeBar').css('width', '70%');
            updateVolumeIcon(0.7);
        }
    });
    
    // Audio player events
    audioPlayer.addEventListener('timeupdate', function () {
        var currentTime = audioPlayer.currentTime;
        var duration = audioPlayer.duration;
        
        if (duration) {
            var percentage = (currentTime / duration) * 100;
            $('#progressFill').css('width', percentage + '%');
            $('#currentTime').text(formatTime(currentTime));
            $('#totalTime').text(formatTime(duration));
        }
    });
    
    audioPlayer.addEventListener('ended', function () {
        if (currentSongIndex < currentPlaylist.length - 1) {
            playSong(currentSongIndex + 1);
        } else {
            isPlaying = false;
            $('#playIcon').removeClass('fa-pause').addClass('fa-play');
        }
    });
    
    audioPlayer.addEventListener('play', function () {
        isPlaying = true;
        $('#playIcon').removeClass('fa-play').addClass('fa-pause');
    });
    
    audioPlayer.addEventListener('pause', function () {
        isPlaying = false;
        $('#playIcon').removeClass('fa-pause').addClass('fa-play');
    });
}

function updateVolumeIcon(volume) {
    var icon = $('#volumeIcon');
    icon.removeClass('fa-volume-up fa-volume-down fa-volume-mute');
    
    if (volume === 0) {
        icon.addClass('fa-volume-mute');
    } else if (volume < 0.5) {
        icon.addClass('fa-volume-down');
    } else {
        icon.addClass('fa-volume-up');
    }
}

function formatTime(seconds) {
    var mins = Math.floor(seconds / 60);
    var secs = Math.floor(seconds % 60);
    return mins + ':' + (secs < 10 ? '0' : '') + secs;
}

function playSong(index) {
    if (index < 0 || index >= currentPlaylist.length) return;
    
    currentSongIndex = index;
    var song = currentPlaylist[index];
    
    // Update player UI
    $('#playerSongName').text(song.name || 'Unknown');
    $('#playerArtistName').text(song.artistName || 'Unknown');
    $('#playerCover').attr('src', song.cover || '../images/noimage.jpeg').onerror = function () {
        this.src = '../images/noimage.jpeg';
    };
    
    // Show player
    $('#bottomPlayer').addClass('show');
    $('#mainContent').addClass('with-player');
    
    // Get song URL and play
    getSongUrl(song.id, function (url) {
        if (url) {
            audioPlayer.src = url;
            audioPlayer.play();
        } else {
            showError('Unable to get song URL');
        }
    });
}

function getSongUrl(songId, callback) {
    var apiUrl = 'http://iwenwiki.com:3000/song/url?id=' + songId;
    
    $.ajax({
        url: proxy[rand] + encodeURIComponent(apiUrl),
        type: "GET",
        dataType: "json",
        success: function (data) {
            console.log('Song URL response:', data);
            var url = null;
            if (data.data && data.data[0] && data.data[0].url) {
                url = data.data[0].url;
            }
            callback(url);
        },
        error: function () {
            // Try alternate proxy
            var altRand = (rand + 1) % Object.keys(proxy).length;
            $.ajax({
                url: proxy[altRand] + encodeURIComponent(apiUrl),
                type: "GET",
                dataType: "json",
                success: function (data) {
                    var url = null;
                    if (data.data && data.data[0] && data.data[0].url) {
                        url = data.data[0].url;
                    }
                    callback(url);
                },
                error: function () {
                    callback(null);
                }
            });
        }
    });
}

function loadArtists() {
    if (isLoading) return;
    isLoading = true;
    
    showLoading();
    
    var apiUrl = buildApiUrl();
    console.log('Loading artists, API URL:', apiUrl);
    
    $.ajax({
        url: proxy[rand] + encodeURIComponent(apiUrl),
        type: "GET",
        dataType: "json",
        success: function (data) {
            console.log('Load artists response:', data);
            hideLoading();
            isLoading = false;
            
            if (data.artists && data.artists.length > 0) {
                artists = data.artists;
                renderArtists(artists);
            } else {
                showNoResults();
            }
        },
        error: function (xhr, status, error) {
            console.log('Load artists failed with proxy 0, trying proxy 1...', error);
            // Try alternate proxy
            var altRand = (rand + 1) % Object.keys(proxy).length;
            $.ajax({
                url: proxy[altRand] + encodeURIComponent(apiUrl),
                type: "GET",
                dataType: "json",
                success: function (data) {
                    console.log('Load artists response (proxy 1):', data);
                    hideLoading();
                    isLoading = false;
                    
                    if (data.artists && data.artists.length > 0) {
                        artists = data.artists;
                        renderArtists(artists);
                    } else {
                        showNoResults();
                    }
                },
                error: function () {
                    hideLoading();
                    isLoading = false;
                    showError('Failed to load artists');
                }
            });
        }
    });
}

function loadMoreArtists() {
    if (isLoading || !hasMore) return;
    isLoading = true;
    
    $('#loadMore').show();
    pageNum++;
    
    var apiUrl = buildApiUrl();
    console.log('Loading more artists, page:', pageNum, 'API URL:', apiUrl);
    
    $.ajax({
        url: proxy[rand] + encodeURIComponent(apiUrl),
        type: "GET",
        dataType: "json",
        success: function (data) {
            console.log('Load more response:', data);
            $('#loadMore').hide();
            isLoading = false;
            
            if (data.artists && data.artists.length > 0) {
                // Filter out duplicates
                var existingIds = artists.map(function(a) { return a.id; });
                var newArtists = data.artists.filter(function(a) {
                    return existingIds.indexOf(a.id) === -1;
                });
                
                if (newArtists.length > 0) {
                    artists = artists.concat(newArtists);
                    appendArtists(newArtists);
                }
                
                // If we got less than expected, might be end of data
                if (data.artists.length < 50) {
                    hasMore = false;
                }
            } else {
                hasMore = false;
            }
        },
        error: function (xhr, status, error) {
            console.log('Load more failed with proxy 0, trying proxy 1...', error);
            // Try alternate proxy
            var altRand = (rand + 1) % Object.keys(proxy).length;
            $.ajax({
                url: proxy[altRand] + encodeURIComponent(apiUrl),
                type: "GET",
                dataType: "json",
                success: function (data) {
                    console.log('Load more response (proxy 1):', data);
                    $('#loadMore').hide();
                    isLoading = false;
                    
                    if (data.artists && data.artists.length > 0) {
                        var existingIds = artists.map(function(a) { return a.id; });
                        var newArtists = data.artists.filter(function(a) {
                            return existingIds.indexOf(a.id) === -1;
                        });
                        
                        if (newArtists.length > 0) {
                            artists = artists.concat(newArtists);
                            appendArtists(newArtists);
                        }
                        
                        if (data.artists.length < 50) {
                            hasMore = false;
                        }
                    } else {
                        hasMore = false;
                    }
                },
                error: function () {
                    $('#loadMore').hide();
                    isLoading = false;
                    pageNum--;
                }
            });
        }
    });
}

function buildApiUrl() {
    var baseUrl = 'http://iwenwiki.com:3000/artist/list';
    var params = [];
    
    if (currentFilter.type === 'area') {
        params.push('area=' + currentFilter.value);
        params.push('type=-1');
    } else if (currentFilter.type === 'type') {
        params.push('type=' + currentFilter.value);
        params.push('area=-1');
    } else {
        params.push('type=-1');
        params.push('area=-1');
    }
    
    params.push('limit=50');
    params.push('offset=' + (50 * (pageNum - 1)));
    
    return baseUrl + '?' + params.join('&');
}

function renderArtists(artistList) {
    var html = '';
    
    artistList.forEach(function (artist) {
        var alias = artist.alias && artist.alias.length > 0 ? artist.alias[0] : '';
        html += '<a href="../catalogues/musicplay.html?web=' + artist.id + '" class="artist-card">';
        html += '  <img class="artist-image" src="' + (artist.picUrl || '../images/noimage.jpeg') + '" alt="' + artist.name + '" onerror="this.src=\'../images/noimage.jpeg\'">';
        html += '  <div class="artist-info">';
        html += '    <div class="artist-name">' + artist.name + '</div>';
        if (alias) {
            html += '    <div class="artist-alias">' + alias + '</div>';
        }
        html += '  </div>';
        html += '</a>';
    });
    
    $('#artistGrid').html(html);
}

function appendArtists(artistList) {
    var html = '';
    
    artistList.forEach(function (artist) {
        var alias = artist.alias && artist.alias.length > 0 ? artist.alias[0] : '';
        html += '<a href="../catalogues/musicplay.html?web=' + artist.id + '" class="artist-card">';
        html += '  <img class="artist-image" src="' + (artist.picUrl || '../images/noimage.jpeg') + '" alt="' + artist.name + '" onerror="this.src=\'../images/noimage.jpeg\'">';
        html += '  <div class="artist-info">';
        html += '    <div class="artist-name">' + artist.name + '</div>';
        if (alias) {
            html += '    <div class="artist-alias">' + alias + '</div>';
        }
        html += '  </div>';
        html += '</a>';
    });
    
    $('#artistGrid').append(html);
}

function performSearch() {
    var query = $('#searchInput').val().trim();
    
    if (!query) {
        // If search is empty, reload with current filter
        isSearchMode = false;
        pageNum = 1;
        hasMore = true;
        artists = [];
        loadArtists();
        return;
    }
    
    searchQuery = query;
    isSearchMode = true;
    searchSongs(query);
}

function searchSongs(query) {
    showLoading();
    isLoading = true;
    
    // Disable load more in search mode
    hasMore = false;
    
    // Try both proxies for better reliability
    var apiUrl = 'http://iwenwiki.com:3000/search?keywords=' + encodeURIComponent(query) + '&limit=50';
    
    console.log('Search API URL:', apiUrl);
    
    $.ajax({
        url: proxy[rand] + encodeURIComponent(apiUrl),
        type: "GET",
        dataType: "json",
        success: function (data) {
            console.log('Search response:', data);
            hideLoading();
            isLoading = false;
            
            // Check multiple possible response structures
            var songs = null;
            if (data.result && data.result.songs) {
                songs = data.result.songs;
            } else if (data.data && data.data.songs) {
                songs = data.data.songs;
            } else if (data.songs) {
                songs = data.songs;
            }
            
            if (songs && songs.length > 0) {
                // Store songs as playlist
                currentPlaylist = songs.map(function (song) {
                    // Get artist names from artists array
                    var artistNames = '';
                    if (song.artists && song.artists.length > 0) {
                        artistNames = song.artists.map(function(a) { return a.name; }).join(', ');
                    } else if (song.ar && song.ar.length > 0) {
                        artistNames = song.ar.map(function(a) { return a.name; }).join(', ');
                    }
                    
                    return {
                        id: song.id,
                        name: song.name,
                        artistName: artistNames,
                        cover: song.al && song.al.picUrl ? song.al.picUrl : '../images/noimage.jpeg'
                    };
                });
                renderSearchResults(songs);
                
                // Show message that search results are limited
                if (songs.length === 50) {
                    $('#artistGrid').append('<div class="search-info" style="grid-column: 1 / -1; text-align: center; padding: 20px; color: rgba(255,255,255,0.5); font-size: 12px;"><i class="fas fa-info-circle"></i> Showing top 50 results. Use more specific keywords for better results.</div>');
                }
            } else {
                showNoResults();
            }
        },
        error: function (xhr, status, error) {
            console.log('Search failed with proxy 0, trying proxy 1...', error);
            // Try alternate proxy
            var altRand = (rand + 1) % Object.keys(proxy).length;
            $.ajax({
                url: proxy[altRand] + encodeURIComponent(apiUrl),
                type: "GET",
                dataType: "json",
                success: function (data) {
                    console.log('Search response (proxy 1):', data);
                    hideLoading();
                    isLoading = false;
                    
                    var songs = null;
                    if (data.result && data.result.songs) {
                        songs = data.result.songs;
                    } else if (data.data && data.data.songs) {
                        songs = data.data.songs;
                    } else if (data.songs) {
                        songs = data.songs;
                    }
                    
                    if (songs && songs.length > 0) {
                        currentPlaylist = songs.map(function (song) {
                            // Get artist names from artists array
                            var artistNames = '';
                            if (song.artists && song.artists.length > 0) {
                                artistNames = song.artists.map(function(a) { return a.name; }).join(', ');
                            } else if (song.ar && song.ar.length > 0) {
                                artistNames = song.ar.map(function(a) { return a.name; }).join(', ');
                            }
                            
                            return {
                                id: song.id,
                                name: song.name,
                                artistName: artistNames,
                                cover: song.al && song.al.picUrl ? song.al.picUrl : '../images/noimage.jpeg'
                            };
                        });
                        renderSearchResults(songs);
                        
                        // Show message that search results are limited
                        if (songs.length === 50) {
                            $('#artistGrid').append('<div class="search-info" style="grid-column: 1 / -1; text-align: center; padding: 20px; color: rgba(255,255,255,0.5); font-size: 12px;"><i class="fas fa-info-circle"></i> Showing top 50 results. Use more specific keywords for better results.</div>');
                        }
                    } else {
                        showNoResults();
                    }
                },
                error: function (xhr2, status2, error2) {
                    console.log('Search failed completely:', error2);
                    hideLoading();
                    isLoading = false;
                    showError('Search failed: ' + error2);
                }
            });
        }
    });
}

function renderSearchResults(songs) {
    var html = '';
    
    songs.forEach(function (song, index) {
        var songName = song.name || '';
        // Get artist names from artists array
        var artistNames = '';
        if (song.artists && song.artists.length > 0) {
            artistNames = song.artists.map(function(a) { return a.name; }).join(', ');
        } else if (song.ar && song.ar.length > 0) {
            artistNames = song.ar.map(function(a) { return a.name; }).join(', ');
        }
        var albumPic = song.al && song.al.picUrl ? song.al.picUrl : '../images/noimage.jpeg';
        
        html += '<div class="artist-card song-card" data-index="' + index + '">';
        html += '  <img class="artist-image" src="' + albumPic + '" alt="' + songName + '" onerror="this.src=\'../images/noimage.jpeg\'">';
        html += '  <div class="play-overlay"><i class="fas fa-play-circle"></i></div>';
        html += '  <div class="artist-info">';
        html += '    <div class="artist-name">' + songName + '</div>';
        if (artistNames) {
            html += '    <div class="artist-alias">' + artistNames + '</div>';
        }
        html += '  </div>';
        html += '</div>';
    });
    
    $('#artistGrid').html(html);
    
    // Add click handler for song cards
    $('.song-card').on('click', function () {
        var index = parseInt($(this).data('index'));
        playSong(index);
    });
}

function showLoading() {
    $('#loadingOverlay').removeClass('hidden');
}

function hideLoading() {
    $('#loadingOverlay').addClass('hidden');
}

function showNoResults() {
    $('#artistGrid').html('<div class="no-results" style="grid-column: 1 / -1;"><i class="fas fa-music"></i><p>No artists found</p></div>');
}

function showError(message) {
    $('#artistGrid').html('<div class="no-results" style="grid-column: 1 / -1;"><i class="fas fa-exclamation-circle"></i><p>' + message + '</p></div>');
}
