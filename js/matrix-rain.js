/**
 * Matrix Rain Effect
 * Classic green digital rain background inspired by "The Matrix"
 * Uses HTML5 Canvas for high-performance rendering
 */
(function () {
    'use strict';

    const canvas = document.getElementById('matrix-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // Configuration
    const config = {
        fontSize: 16,
        fontFamily: 'monospace',
        speed: 0.6,           // Lower = slower
        charSet: 'ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        headColor: '#FFFFFF',   // Bright white head
        glowColor: '#00FF41',   // Matrix green glow
        tailColor: '#008F11',   // Darker green tail
        fadeColor: 'rgba(0, 0, 0, 0.05)', // Fade speed (lower = longer trails)
        lightOpacity: 0.15,    // Opacity in light theme
        darkOpacity: 0.8,      // Opacity in dark theme
    };

    let columns = [];
    let w, h, columnCount;

    // Check if dark theme is active
    function isDarkTheme() {
        return document.documentElement.getAttribute('data-theme') === 'dark';
    }

    // Resize canvas to fill window
    function resize() {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
        columnCount = Math.floor(w / config.fontSize);

        // Preserve existing column positions, add new ones if needed
        const newColumns = [];
        for (let i = 0; i < columnCount; i++) {
            newColumns[i] = columns[i] || Math.random() * h / config.fontSize;
        }
        columns = newColumns;
    }

    // Get a random character from the charset
    function getRandomChar() {
        return config.charSet[Math.floor(Math.random() * config.charSet.length)];
    }

    // Draw one frame
    function draw() {
        // Fade effect - draw semi-transparent black over the entire canvas
        ctx.fillStyle = config.fadeColor;
        ctx.fillRect(0, 0, w, h);

        // Set opacity based on theme
        const opacity = isDarkTheme() ? config.darkOpacity : config.lightOpacity;
        ctx.globalAlpha = opacity;

        ctx.font = config.fontSize + 'px ' + config.fontFamily;

        for (let i = 0; i < columnCount; i++) {
            const char = getRandomChar();
            const x = i * config.fontSize;
            const y = columns[i] * config.fontSize;

            // Draw the bright head character
            ctx.fillStyle = config.headColor;
            ctx.shadowBlur = 10;
            ctx.shadowColor = config.glowColor;
            ctx.fillText(char, x, y);

            // Draw a slightly dimmer character just above (glow effect)
            if (columns[i] > 1) {
                const prevChar = getRandomChar();
                ctx.fillStyle = config.glowColor;
                ctx.shadowBlur = 5;
                ctx.fillText(prevChar, x, y - config.fontSize);
            }

            // Reset shadow for performance
            ctx.shadowBlur = 0;

            // Move the column down
            columns[i] += config.speed;

            // Randomly reset column to top for varied heights
            if (columns[i] * config.fontSize > h && Math.random() > 0.975) {
                columns[i] = 0;
            }
        }

        // Reset global alpha
        ctx.globalAlpha = 1.0;
    }

    // Animation loop
    let animationId;
    function animate() {
        draw();
        animationId = requestAnimationFrame(animate);
    }

    // Initialize
    function init() {
        resize();
        // Fill canvas with black initially
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, w, h);
        animate();
    }

    // Handle window resize with debounce
    let resizeTimer;
    window.addEventListener('resize', function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () {
            resize();
        }, 150);
    });

    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
