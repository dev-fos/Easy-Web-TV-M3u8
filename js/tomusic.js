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

$(document).ready(function () {
    // Initialize audio player
    audioPlayer = document.getElementById('audioPlayer');
    
    // Back button
    $('#backBtn').on('click', function () {
        window.history.back();
    });
    
    // Menu button - toggle sidebar
    $('#menuBtn').on('click', function () {
        $('#sidebar').toggleClass('collapsed');
        $('#sidebar').toggleClass('show-mobile');
        $('#mainContent').toggleClass('expanded');
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
    
    // Initial load
    loadArtists();
});

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
        html += `
            <a href="../catalogues/musicplay.html?web=${artist.id}" class="artist-card">
                <img class="artist-image" src="${artist.picUrl || '../images/noimage.jpeg'}" alt="${artist.name}" onerror="this.src='../images/noimage.jpeg'">
                <div class="artist-info">
                    <div class="artist-name">${artist.name}</div>
                    ${alias ? `<div class="artist-alias">${alias}</div>` : ''}
                </div>
            </a>
        `;
    });
    
    $('#artistGrid').html(html);
}

function appendArtists(artistList) {
    var html = '';
    
    artistList.forEach(function (artist) {
        var alias = artist.alias && artist.alias.length > 0 ? artist.alias[0] : '';
        html += `
            <a href="../catalogues/musicplay.html?web=${artist.id}" class="artist-card">
                <img class="artist-image" src="${artist.picUrl || '../images/noimage.jpeg'}" alt="${artist.name}" onerror="this.src='../images/noimage.jpeg'">
                <div class="artist-info">
                    <div class="artist-name">${artist.name}</div>
                    ${alias ? `<div class="artist-alias">${alias}</div>` : ''}
                </div>
            </a>
        `;
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
                    $('#artistGrid').append('<div class="search-info" style="grid-column: 1 / -1; text-align: center; padding: 20px; color: rgba(255,255,255,0.5); font-size: 12px;"><i class="fas fa-info-circle"></i> 显示前50条搜索结果，如需更多请使用更精确的关键词</div>');
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
                            $('#artistGrid').append('<div class="search-info" style="grid-column: 1 / -1; text-align: center; padding: 20px; color: rgba(255,255,255,0.5); font-size: 12px;"><i class="fas fa-info-circle"></i> 显示前50条搜索结果，如需更多请使用更精确的关键词</div>');
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
        
        html += `
            <div class="artist-card song-card" data-index="${index}">
                <img class="artist-image" src="${albumPic}" alt="${songName}" onerror="this.src='../images/noimage.jpeg'">
                <div class="play-overlay">
                    <i class="fas fa-play-circle"></i>
                </div>
                <div class="artist-info">
                    <div class="artist-name">${songName}</div>
                    ${artistNames ? `<div class="artist-alias">${artistNames}</div>` : ''}
                </div>
            </div>
        `;
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
    $('#artistGrid').html(`
        <div class="no-results" style="grid-column: 1 / -1;">
            <i class="fas fa-music"></i>
            <p>No artists found</p>
        </div>
    `);
}

function showError(message) {
    $('#artistGrid').html(`
        <div class="no-results" style="grid-column: 1 / -1;">
            <i class="fas fa-exclamation-circle"></i>
            <p>${message}</p>
        </div>
    `);
}
