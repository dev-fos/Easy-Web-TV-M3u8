// Game Play Page JS

// Game data mapping
var games = {
    'square-obstacles': {
        name: 'Square Obstacles',
        category: 'arcade',
        url: '../gamebox/ball/gameball.html'
    },
    'pong': {
        name: 'Pong',
        category: 'classic',
        url: '../gamebox/bong/gamebong.html'
    },
    'breakout': {
        name: 'Breakout',
        category: 'arcade',
        url: '../gamebox/breakout/gamebreakout.html'
    },
    'tic-tac-toe': {
        name: 'Tic Tac Toe',
        category: 'puzzle',
        url: '../gamebox/tic-tac-toe/tic-tac-toe-game.html'
    }
};

// Get URL parameters
function getUrlParams() {
    var params = {};
    var search = window.location.search.substring(1);
    if (search) {
        var pairs = search.split('&');
        for (var i = 0; i < pairs.length; i++) {
            var pair = pairs[i].split('=');
            params[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
        }
    }
    return params;
}

// Load game
function loadGame() {
    var params = getUrlParams();
    var gameId = params.game || '';
    
    // Default to first game if not found
    if (!gameId || !games[gameId]) {
        gameId = Object.keys(games)[0];
    }
    
    var game = games[gameId];
    
    // Update UI
    $('#gameTitle').text(game.name);
    $('#gameCategory').text(game.category);
    document.title = game.name + ' - Easy Web TV';
    
    // Load game in iframe
    var iframe = document.getElementById('gameFrame');
    iframe.src = game.url;
}

// Toggle fullscreen
function toggleFullscreen() {
    var container = document.getElementById('gameplayContainer');
    
    if (!document.fullscreenElement) {
        if (container.requestFullscreen) {
            container.requestFullscreen();
        } else if (container.webkitRequestFullscreen) {
            container.webkitRequestFullscreen();
        } else if (container.msRequestFullscreen) {
            container.msRequestFullscreen();
        }
        $('#fullscreenBtn i').removeClass('fa-expand').addClass('fa-compress');
        $('#fullscreenBtn span').text('Exit');
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
        $('#fullscreenBtn i').removeClass('fa-compress').addClass('fa-expand');
        $('#fullscreenBtn span').text('Fullscreen');
    }
}

// Restart game
function restartGame() {
    var iframe = document.getElementById('gameFrame');
    if (iframe.src) {
        iframe.src = iframe.src;
        $('#loadingOverlay').removeClass('hidden');
    }
}

// Initialize
$(document).ready(function() {
    console.log('=== Game Play Page Loaded ===');
    
    // Load game
    loadGame();
    
    // Back button - go to games page
    $('#backBtn').on('click', function() {
        window.location.href = 'game.html';
    });
    
    // Home button - go to home page
    $('#homeBtn').on('click', function() {
        window.location.href = '../index.html';
    });
    
    // Restart button
    $('#restartBtn').on('click', function() {
        restartGame();
    });
    
    // Fullscreen button
    $('#fullscreenBtn').on('click', function() {
        toggleFullscreen();
    });
    
    // Listen for fullscreen changes
    document.addEventListener('fullscreenchange', function() {
        if (!document.fullscreenElement) {
            $('#fullscreenBtn i').removeClass('fa-compress').addClass('fa-expand');
            $('#fullscreenBtn span').text('Fullscreen');
        }
    });
    
    document.addEventListener('webkitfullscreenchange', function() {
        if (!document.webkitFullscreenElement) {
            $('#fullscreenBtn i').removeClass('fa-compress').addClass('fa-expand');
            $('#fullscreenBtn span').text('Fullscreen');
        }
    });
    
    // Keyboard shortcuts
    $(document).on('keydown', function(e) {
        // ESC - exit fullscreen or go back
        if (e.key === 'Escape') {
            if (document.fullscreenElement) {
                toggleFullscreen();
            }
        }
        // R - restart
        if (e.key === 'r' || e.key === 'R') {
            restartGame();
        }
        // F - fullscreen
        if (e.key === 'f' || e.key === 'F') {
            toggleFullscreen();
        }
    });
});
