var channels = [];
var player;
var currentChannelIndex = -1;  // Track current playing channel index

// Favorite prefix for localStorage - ensures only this app's favorites are shown
const FAV_PREFIX = 'fav_tvplay_';

$(document).ready(function() {
    // Initialize video player
    player = videojs(document.querySelector('#video1'));
    
    // Error handling - prevent loading spinner and error icon showing simultaneously
    player.on('error', function() {
        player.removeClass('vjs-waiting');
        player.removeClass('vjs-loading');
    });
    
    // Auto-play next channel when current channel ends
    player.on('ended', function() {
        console.log('Video ended, checking for next channel...');
        if (currentChannelIndex >= 0 && currentChannelIndex < channels.length - 1) {
            var nextIndex = currentChannelIndex + 1;
            console.log('Auto-playing next channel:', nextIndex + 1);
            var nextUrl = channels[nextIndex];
            var $nextItem = $('.channel-item').eq(nextIndex);
            var nextName = $nextItem.data('name');
            playChannel(nextUrl, nextName);
            $('.channel-item').removeClass('active');
            $nextItem.addClass('active');
        } else {
            console.log('No more channels to play');
        }
    });
    
    // Get Current href parameters
    // URL format: tvplay.html?type=categories&key=xxx&title=xxx
    var urlParams = new URLSearchParams(window.location.search);
    var type = urlParams.get('type') || 'categories';
    var key = urlParams.get('key') || '';
    var title = urlParams.get('title') || 'TV';

    // Set Page Title
    $('title').text(decodeURIComponent(title) + ' - TV Player');
    $('#categoryTitle').text(decodeURIComponent(title));

    // Build API URL based on type
    var apiUrl = 'https://iptv-org.github.io/iptv/' + type + '/' + key + ".m3u";

    // Get iptv-org m3u list and show contents
    loadChannels(apiUrl);
    
    // Load favorites
    loadFavorites();
    
    // ========== UI Event Handlers ==========
    
    // Toggle sidebar - toggle channel list and toolbar visibility
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
    
    // Menu Button - hides toolbar for immersive mode
    $('#menuBtn').on('click', function() {
        var sidebar = $('#sidebar');
        var toolbar = $('#top-toolbar');
        
        // Hide toolbar for immersive mode
        toolbar.addClass('hidden');
        
        // Collapse sidebar
        if (window.innerWidth <= 768) {
            sidebar.removeClass('show-mobile');
        } else {
            sidebar.addClass('collapsed');
        }
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
        var link = $('#linkInput').val();
        if (link) {
            playChannel(link, 'Custom URL');
        }
    });
    
    // Favorite Panel Toggle
    $('#favoriteBtn').on('click', function() {
        $('#favoritePanel').toggleClass('show');
    });
    
    // GitHub Button
    $('#githubBtn').on('click', function() {
        window.open('https://github.com/zhangboheng/Easy-Web-TV-M3u8', '_blank');
    });
    
    // Shuffle Play
    $('#shuffleBtn').on('click', function() {
        var channelItems = $('#channelList .channel-item');
        if (channelItems.length > 0) {
            var randomIndex = Math.floor(Math.random() * channelItems.length);
            channelItems.eq(randomIndex).click();
        }
    });
    
    // Channel Search
    $('#channelSearch').on('input', function() {
        var searchTerm = $(this).val().toLowerCase();
        $('#channelList .channel-item').each(function() {
            var name = $(this).find('.channel-name').text().toLowerCase();
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
        if (!$(e.target).closest('#linkInputWrapper, #linkBtn').length) {
            $('#linkInputWrapper').removeClass('show');
        }
    });
});

// Load channels from API
function loadChannels(apiUrl) {
    $.ajax({
        type: "GET",
        url: apiUrl,
        success: function(message, text, response) {
            var channelList = [];
            let str = message;
            let lst = str.split(",").slice(1, ).filter(x => /[^h]+.m3u8/.test(x)).map(x => x.split("\n"));
            let array = str.split(" ");
            let links = array.filter(x => /[^h]+.m3u8/.test(x)).map(x => x.split("\n")).flat().filter(x => /[^h]+.m3u8/.test(x));
            
            for (let i = 0; i < links.length; i++) {
                channels.push(links[i]);
                channelList.push({
                    name: lst[i][0],
                    url: links[i],
                    isFavorite: window.localStorage.getItem(FAV_PREFIX + links[i]) == lst[i][0]
                });
            }
            
            renderChannelList(channelList);
        },
        fail: function(xhr, textStatus, errorThrown) {
            $('#channelList').html(`
                <div class="no-channels">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Failed to load channels</p>
                    <p style="font-size: 12px; margin-top: 10px;">Please check your internet connection</p>
                </div>
            `);
        }
    });
}

// Render channel list
function renderChannelList(channelList) {
    $('#channelList').empty();
    $('#channelCount').text(channelList.length);
    
    if (channelList.length === 0) {
        $('#channelList').html(`
            <div class="no-channels">
                <i class="fas fa-tv"></i>
                <p>No channels found</p>
            </div>
        `);
        return;
    }
    
    channelList.forEach(function(channel, index) {
        var isFav = channel.isFavorite ? 'active' : '';
        var item = $(`
            <div class="channel-item" data-url="${channel.url}" data-name="${channel.name}">
                <div class="channel-icon">
                    <i class="fas fa-tv"></i>
                </div>
                <span class="channel-name">${channel.name}</span>
                <i class="fas fa-heart favorite-btn ${isFav}" title="Add to favorites"></i>
            </div>
        `);
        
        // Play first channel automatically
        if (index === 0) {
            item.addClass('active');
            playChannel(channel.url, channel.name);
        }
        
        $('#channelList').append(item);
    });
    
    // Click to play channel
    $('.channel-item').on('click', function(e) {
        if ($(e.target).hasClass('favorite-btn')) {
            return; // Don't play if clicking favorite button
        }
        
        var url = $(this).data('url');
        var name = $(this).data('name');
        
        $('.channel-item').removeClass('active');
        $(this).addClass('active');
        
        playChannel(url, name);
    });
    
    // Favorite button click
    $('.favorite-btn').on('click', function(e) {
        e.stopPropagation();
        var url = $(this).closest('.channel-item').data('url');
        var name = $(this).closest('.channel-item').data('name');
        
        if ($(this).hasClass('active')) {
            // Remove from favorites
            localStorage.removeItem(FAV_PREFIX + url);
            $(this).removeClass('active');
        } else {
            // Add to favorites
            localStorage.setItem(FAV_PREFIX + url, name);
            $(this).addClass('active');
        }
        
        loadFavorites();
    });
}

// Play channel
function playChannel(url, name) {
    if (!player) {
        player = videojs('video1');
    }
    
    // Update current channel index
    for (var i = 0; i < channels.length; i++) {
        if (channels[i] === url) {
            currentChannelIndex = i;
            break;
        }
    }
    
    player.src({
        src: url,
        type: 'application/x-mpegURL'
    });
    
    player.play();
    $('#currentChannel').text(name);
}

// Load favorites list
function loadFavorites() {
    var favorites = [];
    
    for (let key of Object.keys(localStorage)) {
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
        return;
    }
    
    $('#favoriteContent').empty();
    
    favorites.forEach(function(fav) {
        var item = $(`
            <div class="favorite-item" data-url="${fav.url}" data-name="${fav.name}">
                <i class="fas fa-tv"></i>
                <span>${fav.name}</span>
            </div>
        `);
        
        $('#favoriteContent').append(item);
    });
    
    // Click to play favorite
    $('.favorite-item').on('click', function() {
        var url = $(this).data('url');
        var name = $(this).data('name');
        
        playChannel(url, name);
        $('#favoritePanel').removeClass('show');
        
        // Update active state in channel list
        $('.channel-item').removeClass('active');
        $('.channel-item[data-url="' + url + '"]').addClass('active');
    });
}
