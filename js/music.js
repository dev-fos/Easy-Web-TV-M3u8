var songs = [];
var playlist = [];
var currentSongId = null;
var artistName = '';
var artistId = '';
var FAV_PREFIX = 'fav_music_';
var pageNum = 1;
var isLoading = false;
var hasMore = true;

var proxy = {
    0: 'https://api.codetabs.com/v1/proxy/?quest=',
    1: 'https://corsproxy.io/?',
    2: 'https://api.allorigins.win/raw?url=',
};
var rand = Math.floor(Math.random() * Object.keys(proxy).length);

$(document).ready(function () {
    var player = videojs(document.querySelector('#video1'));
    
    // Get Current href
    artistId = decodeURIComponent(window.location.href).split('web=')[1];
    
    // Toggle sidebar - toggle chapter list and toolbar visibility
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
    
    // Menu Button - hides toolbar for immersive mode
    $('#menuBtn').on('click', function () {
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
    $('#backBtn').on('click', function () {
        window.history.back();
    });
    
    // Favorite Panel Toggle
    $('#favoriteBtn').on('click', function () {
        $('#favoritePanel').toggleClass('show');
    });
    
    // GitHub Button
    $('#githubBtn').on('click', function () {
        window.open('https://github.com/zhangboheng/Easy-Web-TV-M3u8', '_blank');
    });
    
    // Shuffle Play
    $('#shuffleBtn').on('click', function () {
        if (songs.length > 0) {
            var randomIndex = Math.floor(Math.random() * songs.length);
            playSong(songs[randomIndex].id, songs[randomIndex].name);
        }
    });
    
    // Song Search
    $('#songSearch').on('input', function () {
        var searchTerm = $(this).val().toLowerCase();
        $('#songList .song-item').each(function () {
            var name = $(this).find('.song-name').text().toLowerCase();
            if (name.indexOf(searchTerm) > -1) {
                $(this).show();
            } else {
                $(this).hide();
            }
        });
    });
    
    // Close panels when clicking outside
    $(document).on('click', function (e) {
        if (!$(e.target).closest('#favoritePanel, #favoriteBtn').length) {
            $('#favoritePanel').removeClass('show');
        }
    });
    
    // Player events
    player.on('play', function () {
        $('#musicVisualizer').removeClass('paused');
    });
    
    player.on('pause', function () {
        $('#musicVisualizer').addClass('paused');
    });
    
    // Auto play next song on ended
    player.on('ended', function () {
        if (playlist.length > 0) {
            var randomIndex = Math.floor(Math.random() * playlist.length);
            playSong(playlist[randomIndex].id, playlist[randomIndex].name);
        }
    });
    
    // Scroll to load more songs in sidebar
    $('#songList').on('scroll', function () {
        var scrollTop = $(this).scrollTop();
        var scrollHeight = $(this)[0].scrollHeight;
        var containerHeight = $(this).height();
        
        if (scrollTop + containerHeight >= scrollHeight - 50) {
            if (!isLoading && hasMore) {
                loadMoreSongs();
            }
        }
    });
    
    // Load songs from API
    loadSongs(artistId);
    
    // Load favorites
    loadFavorites();
});

// Load songs from API
function loadSongs(id) {
    artistId = id;
    isLoading = true;
    
    $('#songList').html(`
        <div class="loading-state">
            <i class="fas fa-spinner"></i>
            <span>Loading songs...</span>
        </div>
    `);
    
    $.ajax({
        type: "GET",
        url: proxy[rand] + `http://iwenwiki.com:3000/artist/songs?id=${artistId}&limit=50&offset=0`,
        success: function (message, text, response) {
            isLoading = false;
            var songList = message.songs;
            if (songList && songList.length > 0) {
                artistName = songList[0].ar[0].name;
                $('#artistTitle').text(artistName);
                $('#artistName span').text(artistName);
                
                songs = songList.map(x => ({ id: x.id, name: x.name }));
                playlist = [...songs];
                
                $('#songCount').text(songs.length);
                
                // Render song list
                renderSongList();
                
                // Play first song
                playSong(songs[0].id, songs[0].name);
                
                // Check if there might be more songs
                if (songList.length < 50) {
                    hasMore = false;
                }
            } else {
                hasMore = false;
                $('#songList').html(`
                    <div class="no-songs">
                        <i class="fas fa-music"></i>
                        <span>No songs found</span>
                    </div>
                `);
            }
        },
        error: function (xhr, status) {
            isLoading = false;
            hasMore = false;
            $('#songList').html(`
                <div class="no-songs">
                    <i class="fas fa-exclamation-circle"></i>
                    <span>Failed to load songs</span>
                </div>
            `);
        }
    });
}

// Load more songs
function loadMoreSongs() {
    if (isLoading || !hasMore) return;
    isLoading = true;
    pageNum++;
    
    // Add loading indicator at bottom
    $('#songList').append(`
        <div class="loading-more" id="loadingMore">
            <i class="fas fa-spinner" style="animation: spin 1s linear infinite;"></i>
            <span style="color: rgba(255,255,255,0.5); font-size: 12px; margin-left: 10px;">Loading more...</span>
        </div>
    `);
    
    $.ajax({
        type: "GET",
        url: proxy[rand] + `http://iwenwiki.com:3000/artist/songs?id=${artistId}&limit=50&offset=${50 * (pageNum - 1)}`,
        success: function (message, text, response) {
            isLoading = false;
            $('#loadingMore').remove();
            
            var songList = message.songs;
            if (songList && songList.length > 0) {
                var newSongs = songList.map(x => ({ id: x.id, name: x.name }));
                songs = songs.concat(newSongs);
                playlist = playlist.concat(newSongs);
                
                $('#songCount').text(songs.length);
                
                // Append new songs to list
                appendSongList(newSongs);
                
                if (songList.length < 50) {
                    hasMore = false;
                }
            } else {
                hasMore = false;
            }
        },
        error: function (xhr, status) {
            isLoading = false;
            pageNum--;
            $('#loadingMore').remove();
        }
    });
}

// Render song list
function renderSongList() {
    var html = '';
    songs.forEach(function (song, index) {
        var isFavorite = localStorage.getItem(FAV_PREFIX + song.id);
        html += `
            <div class="song-item ${index === 0 ? 'active' : ''}" data-id="${song.id}" data-name="${song.name}">
                <div class="song-icon">
                    <i class="fas fa-music"></i>
                </div>
                <span class="song-name">${song.name}</span>
                <i class="fas fa-heart favorite-btn ${isFavorite ? 'active' : ''}"></i>
            </div>
        `;
    });
    $('#songList').html(html);
    
    // Click to play song
    $('#songList').on('click', '.song-item', function (e) {
        if (!$(e.target).hasClass('favorite-btn')) {
            var id = $(this).data('id');
            var name = $(this).data('name');
            playSong(id, name);
        }
    });
    
    // Click to toggle favorite
    $('#songList').on('click', '.favorite-btn', function (e) {
        e.stopPropagation();
        var songItem = $(this).closest('.song-item');
        var id = songItem.data('id');
        var name = songItem.data('name');
        
        if ($(this).hasClass('active')) {
            // Remove from favorites
            localStorage.removeItem(FAV_PREFIX + id);
            $(this).removeClass('active');
        } else {
            // Add to favorites
            localStorage.setItem(FAV_PREFIX + id, name);
            $(this).addClass('active');
        }
        
        loadFavorites();
    });
}

// Append new songs to list
function appendSongList(newSongs) {
    var html = '';
    newSongs.forEach(function (song) {
        var isFavorite = localStorage.getItem(FAV_PREFIX + song.id);
        html += `
            <div class="song-item" data-id="${song.id}" data-name="${song.name}">
                <div class="song-icon">
                    <i class="fas fa-music"></i>
                </div>
                <span class="song-name">${song.name}</span>
                <i class="fas fa-heart favorite-btn ${isFavorite ? 'active' : ''}"></i>
            </div>
        `;
    });
    $('#songList').append(html);
}

// Play song
function playSong(songId, songName) {
    currentSongId = songId;
    
    // Update UI
    $('#currentSong').text(songName);
    $('#songTitle').text(songName);
    $('#artistName span').text(artistName);
    
    // Update active state
    $('#songList .song-item').removeClass('active');
    $(`#songList .song-item[data-id="${songId}"]`).addClass('active');
    
    // Scroll to active song in sidebar
    var activeItem = $('#songList .song-item[data-id="' + songId + '"]');
    if (activeItem.length) {
        var scrollPosition = activeItem.position().top - $('#songList').height() / 2 + activeItem.height() / 2;
        $('#songList').animate({ scrollTop: scrollPosition }, 300);
    }
    
    // Check music availability and play
    $.ajax({
        url: proxy[rand] + 'http://iwenwiki.com:3000/check/music?id=' + songId,
        type: "GET",
        dataType: "json",
        success: function (data) {
            $.ajax({
                url: proxy[rand] + 'http://iwenwiki.com:3000/song/url?id=' + songId,
                type: "GET",
                dataType: "json",
                success: function (data) {
                    var url = data.data[0].url;
                    if (url) {
                        var player = videojs(document.querySelector('#video1'));
                        player.src({
                            src: url,
                            type: "audio/mp3"
                        });
                        player.play();
                        $('#musicVisualizer').removeClass('paused');
                    } else {
                        alert('Sorry, this song is not available...');
                    }
                },
                error: function (xhr, status) {
                    alert('Sorry, no rights to play...');
                }
            });
        },
        error: function (xhr, status) {
            alert('Sorry, no rights to play...');
        }
    });
}

// Load favorites from localStorage
function loadFavorites() {
    var favorites = [];
    for (var key of Object.keys(localStorage)) {
        if (key.startsWith(FAV_PREFIX)) {
            var songId = key.replace(FAV_PREFIX, '');
            var songName = localStorage.getItem(key);
            favorites.push({ id: songId, name: songName });
        }
    }
    
    $('#favCount').text(favorites.length);
    
    if (favorites.length === 0) {
        $('#favoriteContent').html(`
            <div class="no-songs" style="padding: 20px;">
                <i class="fas fa-heart-broken" style="font-size: 24px;"></i>
                <span style="font-size: 12px;">No favorites yet</span>
            </div>
        `);
    } else {
        var html = '';
        favorites.forEach(function (fav) {
            html += `
                <div class="favorite-item" data-id="${fav.id}" data-name="${fav.name}">
                    <i class="fas fa-heart"></i>
                    <span>${fav.name}</span>
                    <i class="fas fa-times delete-btn"></i>
                </div>
            `;
        });
        $('#favoriteContent').html(html);
        
        // Click to play favorite
        $('#favoriteContent').off('click', '.favorite-item').on('click', '.favorite-item', function (e) {
            if (!$(e.target).hasClass('delete-btn')) {
                var id = $(this).data('id');
                var name = $(this).data('name');
                playSong(id, name);
                $('#favoritePanel').removeClass('show');
            }
        });
        
        // Click to delete favorite
        $('#favoriteContent').off('click', '.delete-btn').on('click', '.delete-btn', function (e) {
            e.stopPropagation();
            var songItem = $(this).closest('.favorite-item');
            var id = songItem.data('id');
            localStorage.removeItem(FAV_PREFIX + id);
            loadFavorites();
            
            // Update song list favorite icon
            $(`#songList .song-item[data-id="${id}"] .favorite-btn`).removeClass('active');
        });
    }
}
