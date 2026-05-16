// Game Page JS - Modern UI Version

// Game data
var games = [
    {
        id: 1,
        name: 'Square Obstacles',
        platform: 'PC',
        category: 'arcade',
        image: '../gamebox/ball/squareobstacle.png',
        url: 'gameplay.html?game=square-obstacles'
    },
    {
        id: 2,
        name: 'Pong',
        platform: 'PC',
        category: 'classic',
        image: '../gamebox/bong/bong.png',
        url: 'gameplay.html?game=pong'
    },
    {
        id: 3,
        name: 'Breakout',
        platform: 'PC',
        category: 'arcade',
        image: '../gamebox/breakout/breakout.png',
        url: 'gameplay.html?game=breakout'
    },
    {
        id: 4,
        name: 'Tic Tac Toe',
        platform: 'PC',
        category: 'puzzle',
        image: '../gamebox/tic-tac-toe/tictactoe.png',
        url: 'gameplay.html?game=tic-tac-toe'
    }
];

var currentCategory = 'all';
var searchQuery = '';

// Render games
function renderGames() {
    var filteredGames = games;
    
    // Filter by category
    if (currentCategory !== 'all') {
        filteredGames = filteredGames.filter(function(game) {
            return game.category === currentCategory;
        });
    }
    
    // Filter by search
    if (searchQuery) {
        filteredGames = filteredGames.filter(function(game) {
            return game.name.toLowerCase().indexOf(searchQuery.toLowerCase()) !== -1;
        });
    }
    
    var $grid = $('#gameGrid');
    $grid.empty();
    
    if (filteredGames.length === 0) {
        $grid.html(`
            <div class="no-results">
                <i class="fas fa-gamepad"></i>
                <p>No games found</p>
            </div>
        `);
        return;
    }
    
    filteredGames.forEach(function(game) {
        var cardHtml = `
            <a href="${game.url}" class="game-card">
                <img class="game-image" src="${game.image}" alt="${game.name}" onerror="this.src='../images/noimage.jpeg'">
                <div class="game-overlay"></div>
                <div class="play-icon">
                    <i class="fas fa-play"></i>
                </div>
                <div class="game-info">
                    <span class="game-platform">${game.platform}</span>
                    <h4 class="game-name">${game.name}</h4>
                </div>
            </a>
        `;
        $grid.append(cardHtml);
    });
}

// Toggle sidebar
function toggleSidebar() {
    var $sidebar = $('#sidebar');
    var $mainContent = $('#mainContent');
    
    if (window.innerWidth <= 768) {
        $sidebar.toggleClass('show-mobile');
    } else {
        $sidebar.toggleClass('collapsed');
        $mainContent.toggleClass('expanded');
    }
}

// Show toast notification
function showToast(message, type) {
    type = type || 'info';
    $('.toast-notification').remove();
    
    var toast = $(`
        <div class="toast-notification ${type}" style="
            position: fixed;
            top: 80px;
            right: 20px;
            padding: 15px 20px;
            background: rgba(0,0,0,0.9);
            border: 2px solid #a3001b;
            border-radius: 10px;
            color: #fff;
            z-index: 9999;
            display: flex;
            align-items: center;
            gap: 10px;
        ">
            <i class="fas fa-info-circle" style="color: #a3001b"></i>
            <span>${message}</span>
        </div>
    `);
    
    $('body').append(toast);
    
    setTimeout(function() {
        toast.fadeOut(300, function() {
            $(this).remove();
        });
    }, 3000);
}

// Initialize
$(document).ready(function() {
    console.log('=== Game Page Loaded ===');
    
    // Render initial games
    renderGames();
    
    // Back button
    $('#backBtn').on('click', function() {
        window.history.back();
    });
    
    // Menu toggle
    $('#menuBtn').on('click', function() {
        toggleSidebar();
    });
    
    // Toggle sidebar button
    $('#toggleSidebar').on('click', function() {
        toggleSidebar();
    });
    
    // Category selection
    $('.category-item').on('click', function() {
        $('.category-item').removeClass('active');
        $(this).addClass('active');
        currentCategory = $(this).data('category');
        renderGames();
        
        // Hide sidebar on mobile
        if (window.innerWidth <= 768) {
            $('#sidebar').removeClass('show-mobile');
        }
    });
    
    // Search functionality
    $('#searchInput').on('keyup', function(e) {
        searchQuery = $(this).val().trim();
        renderGames();
    });
    
    $('#searchBtn').on('click', function() {
        searchQuery = $('#searchInput').val().trim();
        renderGames();
    });
    
    // Handle window resize
    $(window).on('resize', function() {
        if (window.innerWidth > 768) {
            $('#sidebar').removeClass('show-mobile');
        }
    });
});
