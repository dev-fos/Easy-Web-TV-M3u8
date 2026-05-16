var channels = [];
var player;

// Favorite prefix for localStorage - ensures only this app's favorites are shown
const FAV_PREFIX = 'fav_tvplay_';

$(document).ready(function() {
    // Initialize video player
    player = videojs(document.querySelector('#video1'));
    
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
