// Game Page JS - Modern UI Version

// Game data
var games = [
    // Emulator Games
    {
        id: 5,
        name: 'NES Emulator',
        platform: 'NES',
        category: 'emulator',
        image: '../images/nes.svg',
        url: '../routes/emulatorjs/emulatorjs.html?core=fceumm'
    },
    {
        id: 6,
        name: 'SNES Emulator',
        platform: 'SNES',
        category: 'emulator',
        image: '../images/snes.svg',
        url: '../routes/emulatorjs/emulatorjs.html?core=snes9x'
    },
    {
        id: 7,
        name: 'GBA Emulator',
        platform: 'GBA',
        category: 'emulator',
        image: '../images/gba.svg',
        url: '../routes/emulatorjs/emulatorjs.html?core=mgba'
    },
    {
        id: 8,
        name: 'Game Boy Emulator',
        platform: 'GB/GBC',
        category: 'emulator',
        image: '../images/gb.svg',
        url: '../routes/emulatorjs/emulatorjs.html?core=gambatte'
    },
    {
        id: 9,
        name: 'N64 Emulator',
        platform: 'N64',
        category: 'emulator',
        image: '../images/n64.svg',
        url: '../routes/emulatorjs/emulatorjs.html?core=mupen64plus'
    },
    {
        id: 10,
        name: 'PS1 Emulator',
        platform: 'PS1',
        category: 'emulator',
        image: '../images/ps1.svg',
        url: '../routes/emulatorjs/emulatorjs.html?core=pcsx_rearmed'
    },
    {
        id: 38,
        name: 'PSX Emulator',
        platform: 'PSX',
        category: 'emulator',
        image: '../images/psx.svg',
        url: '../routes/emulatorjs/emulatorjs.html?core=pcsx_rearmed'
    },
    {
        id: 11,
        name: 'PSP Emulator',
        platform: 'PSP',
        category: 'emulator',
        image: '../images/psp.svg',
        url: '../routes/emulatorjs/emulatorjs.html?core=ppsspp'
    },
    {
        id: 12,
        name: 'Genesis Emulator',
        platform: 'Genesis',
        category: 'emulator',
        image: '../images/genesis.svg',
        url: '../routes/emulatorjs/emulatorjs.html?core=genesis_plus_gx'
    },
    {
        id: 13,
        name: 'Master System Emulator',
        platform: 'Master System',
        category: 'emulator',
        image: '../images/mastersystem.svg',
        url: '../routes/emulatorjs/emulatorjs.html?core=genesis_plus_gx'
    },
    {
        id: 14,
        name: 'Sega CD Emulator',
        platform: 'Sega CD',
        category: 'emulator',
        image: '../images/segacd.svg',
        url: '../routes/emulatorjs/emulatorjs.html?core=genesis_plus_gx'
    },
    {
        id: 15,
        name: 'Saturn Emulator',
        platform: 'Saturn',
        category: 'emulator',
        image: '../images/saturn.svg',
        url: '../routes/emulatorjs/emulatorjs.html?core=yabause'
    },
    {
        id: 16,
        name: 'Dreamcast Emulator',
        platform: 'Dreamcast',
        category: 'emulator',
        image: '../images/dreamcast.svg',
        url: '../routes/emulatorjs/emulatorjs.html?core=flycast'
    },
    {
        id: 17,
        name: 'NDS Emulator',
        platform: 'NDS',
        category: 'emulator',
        image: '../images/nds.svg',
        url: '../routes/emulatorjs/emulatorjs.html?core=melonds'
    },
    {
        id: 18,
        name: '3DS Emulator',
        platform: '3DS',
        category: 'emulator',
        image: '../images/3ds.svg',
        url: '../routes/emulatorjs/emulatorjs.html?core=citra'
    },
    {
        id: 19,
        name: 'PS2 Emulator',
        platform: 'PS2',
        category: 'emulator',
        image: '../images/ps2.svg',
        url: '../routes/emulatorjs/emulatorjs.html?core=pcsx2'
    },
    {
        id: 20,
        name: 'Atari 2600 Emulator',
        platform: 'Atari 2600',
        category: 'emulator',
        image: '../images/atari2600.svg',
        url: '../routes/emulatorjs/emulatorjs.html?core=stella'
    },
    {
        id: 21,
        name: 'Atari 7800 Emulator',
        platform: 'Atari 7800',
        category: 'emulator',
        image: '../images/atari7800.svg',
        url: '../routes/emulatorjs/emulatorjs.html?core=a7800'
    },
    {
        id: 22,
        name: 'Atari 5200 Emulator',
        platform: 'Atari 5200',
        category: 'emulator',
        image: '../images/atari5200.svg',
        url: '../routes/emulatorjs/emulatorjs.html?core=atari800'
    },
    {
        id: 23,
        name: 'Atari Jaguar Emulator',
        platform: 'Atari Jaguar',
        category: 'emulator',
        image: '../images/atarijaguar.svg',
        url: '../routes/emulatorjs/emulatorjs.html?core=virtualjaguar'
    },
    {
        id: 24,
        name: 'Atari Lynx Emulator',
        platform: 'Atari Lynx',
        category: 'emulator',
        image: '../images/atarilynx.svg',
        url: '../routes/emulatorjs/emulatorjs.html?core=handy'
    },
    {
        id: 25,
        name: '3DO Emulator',
        platform: '3DO',
        category: 'emulator',
        image: '../images/3do.svg',
        url: '../routes/emulatorjs/emulatorjs.html?core=opera'
    },
    {
        id: 26,
        name: 'Arcade Emulator',
        platform: 'Arcade',
        category: 'emulator',
        image: '../images/arcade.svg',
        url: '../routes/emulatorjs/emulatorjs.html?core=fbneo'
    },
    {
        id: 27,
        name: 'MAME 2003 Emulator',
        platform: 'MAME',
        category: 'emulator',
        image: '../images/mame.svg',
        url: '../routes/emulatorjs/emulatorjs.html?core=mame2003'
    },
    {
        id: 28,
        name: 'ColecoVision Emulator',
        platform: 'ColecoVision',
        category: 'emulator',
        image: '../images/colecovision.svg',
        url: '../routes/emulatorjs/emulatorjs.html?core=bluemsx'
    },
    {
        id: 29,
        name: 'Commodore 64 Emulator',
        platform: 'C64',
        category: 'emulator',
        image: '../images/c64.svg',
        url: '../routes/emulatorjs/emulatorjs.html?core=vice'
    },
    {
        id: 30,
        name: 'Commodore 128 Emulator',
        platform: 'C128',
        category: 'emulator',
        image: '../images/c128.svg',
        url: '../routes/emulatorjs/emulatorjs.html?core=vice'
    },
    {
        id: 31,
        name: 'Commodore VIC-20 Emulator',
        platform: 'VIC-20',
        category: 'emulator',
        image: '../images/vic20.svg',
        url: '../routes/emulatorjs/emulatorjs.html?core=vice'
    },
    {
        id: 32,
        name: 'Commodore PET Emulator',
        platform: 'PET',
        category: 'emulator',
        image: '../images/pet.svg',
        url: '../routes/emulatorjs/emulatorjs.html?core=vice'
    },
    {
        id: 33,
        name: 'Commodore Plus/4 Emulator',
        platform: 'Plus/4',
        category: 'emulator',
        image: '../images/plus4.svg',
        url: '../routes/emulatorjs/emulatorjs.html?core=vice'
    },
    {
        id: 34,
        name: 'Amiga Emulator',
        platform: 'Amiga',
        category: 'emulator',
        image: '../images/amiga.svg',
        url: '../routes/emulatorjs/emulatorjs.html?core=puae'
    },
    {
        id: 35,
        name: 'Sega 32X Emulator',
        platform: 'Sega 32X',
        category: 'emulator',
        image: '../images/sega32x.svg',
        url: '../routes/emulatorjs/emulatorjs.html?core=picodrive'
    },
    {
        id: 36,
        name: 'Sega Game Gear Emulator',
        platform: 'Game Gear',
        category: 'emulator',
        image: '../images/gamegear.svg',
        url: '../routes/emulatorjs/emulatorjs.html?core=genesis_plus_gx'
    },
    {
        id: 37,
        name: 'Virtual Boy Emulator',
        platform: 'Virtual Boy',
        category: 'emulator',
        image: '../images/virtualboy.svg',
        url: '../routes/emulatorjs/emulatorjs.html?core=beetle_vb'
    },
    {
        id: 39,
        name: 'DOS Emulator',
        platform: 'DOS',
        category: 'emulator',
        image: '../images/dos.svg',
        url: '../routes/emulatorjs/emulatorjs.html?core=dosbox_pure'
    },
    {
        id: 1,
        name: 'Square Obstacles',
        platform: 'PC',
        category: 'others',
        image: '../gamebox/ball/squareobstacle.png',
        url: '../catalogues/gameplay.html?game=square-obstacles'
    },
    {
        id: 2,
        name: 'Pong',
        platform: 'PC',
        category: 'others',
        image: '../gamebox/bong/bong.png',
        url: '../catalogues/gameplay.html?game=pong'
    },
    {
        id: 3,
        name: 'Breakout',
        platform: 'PC',
        category: 'others',
        image: '../gamebox/breakout/breakout.png',
        url: '../catalogues/gameplay.html?game=breakout'
    },
    {
        id: 4,
        name: 'Tic Tac Toe',
        platform: 'PC',
        category: 'others',
        image: '../gamebox/tic-tac-toe/tictactoe.png',
        url: '../catalogues/gameplay.html?game=tic-tac-toe'
    },
    
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
