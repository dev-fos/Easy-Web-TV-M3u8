// Adult content translations for all supported languages
const AdultTranslations = {
    getButtonText: function(lang) {
        var translations = {
            'default': 'Enter',
            'zh': '进入', 'zh-CN': '进入', 'zh-HK': '進入', 'zh-TW': '進入',
            'ja': '入力', 'ko': '입력하다', 'vi': 'Vào', 'th': 'เข้า',
            'es': 'Ingresar', 'pt': 'Digitar', 'pt-BR': 'Digitar', 'pt-PT': 'Digitar',
            'fr': 'Entrer', 'fr-CA': 'Entrer', 'fr-FR': 'Entrer', 'fr-CH': 'Entrer',
            'de': 'Eintreten', 'de-AT': 'Eintreten', 'de-DE': 'Eintreten', 'de-CH': 'Eintreten',
            'it': 'accedere', 'it-IT': 'accedere', 'it-CH': 'accedere',
            'ru': 'Входить', 'ar': 'يدخل', 'hi': 'प्रवेश करना',
            'tr': 'Girmek', 'pl': 'Wejść', 'nl': 'Binnenkomen', 'sv': 'Stiga på',
            'da': 'Gå ind', 'no': 'Tast inn', 'nb': 'Tast inn', 'nn': 'Tast inn',
            'fi': 'Tulla sisään', 'el': 'Εισαγω', 'cs': 'Vstupte', 'sk': 'Zadajte',
            'hu': 'Belép', 'ro': 'introduce', 'bg': 'Въведете', 'uk': 'Введіть',
            'id': 'Memasuki', 'ms': 'Masukkan', 'fil': 'Pasok', 'vi': 'Vào',
            'he': 'להיכנס', 'fa': 'وارد', 'ur': 'داخل کریں۔', 'bn': 'প্রবেশ করুন',
            'ta': 'உள்ளிடவும்', 'te': 'నమోదు చేయండి', 'ml': 'നൽകുക', 'kn': 'ನಮೂದಿಸಿ',
            'mr': 'एंटर करा', 'gu': 'દાખલ કરો', 'pa': 'ਦਾਖਲ ਕਰੋ', 'or': 'ପ୍ରବେଶ କରନ୍ତୁ |'
        };
        return translations[lang] || translations['default'];
    },
    
    getDescriptionText: function(lang) {
        var translations = {
            'default': 'Porn Videos...',
            'zh': '色情视频...', 'zh-CN': '色情视频...', 'zh-HK': '色情影片...', 'zh-TW': '色情影片...',
            'ja': 'ポルノビデオ...', 'ko': '포르노 비디오...', 'vi': 'Video khiêu dâm ...', 'th': 'วิดีโอโป๊...',
            'es': 'Vídeos porno ...', 'pt': 'Vídeos pornôs ...', 'pt-BR': 'Vídeos pornôs ...', 'pt-PT': 'Vídeos pornô...',
            'fr': 'Vidéos porno...', 'fr-CA': 'Vidéos porno...', 'fr-FR': 'Vidéos porno...', 'fr-CH': 'Vidéos porno...',
            'de': 'Pornovideos...', 'de-AT': 'Pornovideos...', 'de-DE': 'Pornovideos...', 'de-CH': 'Pornovideos...',
            'it': 'Video porno...', 'it-IT': 'Video porno...', 'it-CH': 'Video porno...',
            'ru': 'Порно видео ...', 'ar': 'أشرطة الفيديو الإباحية ...', 'hi': 'अश्लील वीडियो...',
            'tr': 'Video porno...', 'pl': 'Filmy porno...', 'nl': 'Video porno...', 'sv': 'Videoporr ...',
            'da': 'Videoporno ...', 'no': 'Video porno ...', 'nb': 'Video porno ...', 'nn': 'Video porno ...',
            'fi': 'Video porno ...', 'el': 'Βίντεο πορνό ...', 'cs': 'Video porno ...', 'sk': 'Video porno ...',
            'hu': 'Videó pornó ...', 'ro': 'Video porno ...', 'bg': 'Порно видео ...', 'uk': 'Відео порно ...',
            'id': 'Video porno...', 'ms': 'Video lucah ...', 'fil': 'Video porn ...',
            'he': 'פורנו וידאו ...', 'fa': 'فیلم پورنو ...', 'ur': 'ویڈیو فحش ...', 'bn': 'ভিডিও পর্ন ...',
            'ta': 'வீடியோ ஆபாச ...', 'te': 'వీడియో పోర్న్ ...', 'ml': 'വീഡിയോ പോൺ ...', 'kn': 'ವಿಡಿಯೋ ಪೋರ್ನ್ ...',
            'mr': 'व्हिडिओ पॉर्न ...', 'gu': 'વિડિઓ પોર્ન ...', 'pa': 'ਵੀਡੀਓ ਪੋਰਨ ...'
        };
        return translations[lang] || translations['default'];
    }
};

// Loading and Error handling utilities
const LoadingManager = {
    show: function() {
        $('#loading-overlay').addClass('active');
    },
    hide: function() {
        $('#loading-overlay').removeClass('active');
    }
};

const ErrorToast = {
    show: function(message, duration) {
        duration = duration || 3000;
        var $toast = $('#error-toast');
        $toast.find('.error-message').text(message);
        $toast.addClass('show');
        setTimeout(function() {
            $toast.removeClass('show');
        }, duration);
    },
    hide: function() {
        $('#error-toast').removeClass('show');
    }
};

// Keyboard Navigation Manager
const KeyboardManager = {
    modalVisible: false,
    
    // Category routes for quick navigation
    categoryRoutes: {
        1: 'routes/tv.html',              // TV Channels
        2: 'routes/comprehensive.html',   // Movies & Series
        3: 'routes/radio.html?t=1',       // Radio Stations
        4: 'routes/novel.html',           // Novels
        5: 'routes/manga.html',           // Manga
        6: 'routes/music.html',           // Music
        7: 'routes/game.html'             // Games
    },
    
    init: function() {
        this.bindEvents();
        this.checkFirstVisit();
    },
    
    bindEvents: function() {
        // Keyboard shortcuts
        $(document).on('keydown', function(e) {
            // Ignore shortcuts when typing in input fields
            if ($(e.target).is('input, textarea, select')) {
                return;
            }
            
            // Number keys 1-7 for quick navigation
            if (e.key >= '1' && e.key <= '7') {
                KeyboardManager.navigateToCategory(parseInt(e.key));
                e.preventDefault();
                return;
            }
            
            // Show keyboard help with ?
            if (e.key === '?' && !KeyboardManager.modalVisible) {
                KeyboardManager.showModal();
                e.preventDefault();
                return;
            }
            
            // Close modal/menu with ESC
            if (e.key === 'Escape') {
                KeyboardManager.closeAll();
                return;
            }
            
            // Toggle menu with M
            if (e.key === 'm' || e.key === 'M') {
                KeyboardManager.toggleMenu();
                e.preventDefault();
                return;
            }
            
            // Toggle theme with T
            if (e.key === 't' || e.key === 'T') {
                ThemeManager.toggleTheme();
                e.preventDefault();
                return;
            }
            
            // Share with S
            if (e.key === 's' || e.key === 'S') {
                ShareManager.share();
                e.preventDefault();
                return;
            }
        });
        
        // Close modal on overlay click
        $('#keyboard-modal-overlay').on('click', function() {
            KeyboardManager.hideModal();
        });
        
        // Close modal on close button click
        $('#keyboard-modal .close-btn').on('click', function() {
            KeyboardManager.hideModal();
        });
        
        // Close guide tooltip
        $('#guide-tooltip .close-guide').on('click', function() {
            KeyboardManager.hideGuide();
            localStorage.setItem('guideShown', 'true');
        });
        
        // Keyboard help button in header
        $('#keyboard-help-btn').on('click', function(e) {
            e.stopPropagation();
            KeyboardManager.showModal();
        });
    },
    
    navigateToCategory: function(index) {
        var route = this.categoryRoutes[index];
        if (route) {
            // Show loading indicator
            LoadingManager.show();
            // Navigate to the category
            window.location.href = route;
        }
    },
    
    showModal: function() {
        $('#keyboard-modal').addClass('show');
        $('#keyboard-modal-overlay').addClass('show');
        this.modalVisible = true;
    },
    
    hideModal: function() {
        $('#keyboard-modal').removeClass('show');
        $('#keyboard-modal-overlay').removeClass('show');
        this.modalVisible = false;
    },
    
    closeAll: function() {
        // Close keyboard modal
        this.hideModal();
        
        // Close side navigation
        if ($('#mySidenav').is(':visible')) {
            $('#main').css('marginRight', '0');
            $('#mySidenav').hide();
            $('#menu-toggle-btn').attr('aria-expanded', 'false');
        }
        
        // Close any open dialogs
        if ($('#popupbox').is(':visible')) {
            window.location.href = '#';
        }
        if ($('#sourcebox').is(':visible')) {
            window.location.href = '#';
        }
        if ($('#logbox').is(':visible')) {
            window.location.href = '#';
        }
        if ($('#infobox').is(':visible')) {
            window.location.href = '#';
        }
        
        // Close age confirmation modal
        if ($('#age-confirm-modal').hasClass('show')) {
            $('#age-confirm-modal').removeClass('show');
            $('#age-confirm-overlay').removeClass('show');
        }
    },
    
    toggleMenu: function() {
        var $sidenav = $('#mySidenav');
        var $main = $('#main');
        var $btn = $('#menu-toggle-btn');
        
        if ($sidenav.is(':visible')) {
            $main.css('marginRight', '0');
            $sidenav.hide();
            $btn.attr('aria-expanded', 'false');
        } else {
            if ($(window).width() > 640) {
                $main.css('marginRight', '400px');
            } else {
                $main.css('marginRight', '250px');
            }
            $sidenav.show();
            $btn.attr('aria-expanded', 'true');
        }
    },
    
    checkFirstVisit: function() {
        // Show guide tooltip on first visit
        if (!localStorage.getItem('guideShown')) {
            setTimeout(function() {
                $('#guide-tooltip').addClass('show');
                // Auto hide after 8 seconds (longer for better visibility)
                setTimeout(function() {
                    KeyboardManager.hideGuide();
                    localStorage.setItem('guideShown', 'true');
                }, 8000);
            }, 1500);
        }
    },
    
    hideGuide: function() {
        $('#guide-tooltip').removeClass('show');
    }
};

// Theme Manager - Dark/Light mode toggle
const ThemeManager = {
    init: function() {
        this.loadSavedTheme();
        this.bindEvents();
    },
    
    loadSavedTheme: function() {
        var savedTheme = localStorage.getItem('theme') || 'light';
        this.setTheme(savedTheme);
    },
    
    setTheme: function(theme) {
        if (theme === 'dark') {
            $('html').attr('data-theme', 'dark');
        } else {
            $('html').removeAttr('data-theme');
        }
        localStorage.setItem('theme', theme);
    },
    
    toggleTheme: function() {
        var currentTheme = localStorage.getItem('theme') || 'light';
        var newTheme = currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
    },
    
    bindEvents: function() {
        // Theme toggle button in menu
        $('#theme-toggle-menu').on('click', function() {
            ThemeManager.toggleTheme();
        });
        
        // Theme toggle button in header
        $('#theme-toggle').on('click', function(e) {
            e.stopPropagation();
            ThemeManager.toggleTheme();
        });
    }
};

// Share Manager - Web Share API
const ShareManager = {
    init: function() {
        this.bindEvents();
    },
    
    bindEvents: function() {
        // Share button in menu
        $('#share-btn-menu').on('click', function() {
            ShareManager.share();
        });
        
        // Share button in header
        $('#share-btn').on('click', function(e) {
            e.stopPropagation();
            ShareManager.share();
        });
    },
    
    share: function() {
        var shareData = {
            title: 'Easy Web TV - Online SmartTV',
            text: 'Watch 6000+ TV channels, movies, series, anime, listen to 28000+ radio stations, read novels, manga, and play games!',
            url: window.location.href
        };
        
        if (navigator.share) {
            navigator.share(shareData)
                .then(function() {
                    console.log('Shared successfully');
                })
                .catch(function(err) {
                    console.error('Share failed:', err);
                    ShareManager.fallbackShare();
                });
        } else {
            ShareManager.fallbackShare();
        }
    },
    
    fallbackShare: function() {
        // Fallback: copy URL to clipboard
        var url = window.location.href;
        
        if (navigator.clipboard) {
            navigator.clipboard.writeText(url)
                .then(function() {
                    ErrorToast.show('Link copied to clipboard!', 2000);
                })
                .catch(function(err) {
                    console.error('Clipboard write failed:', err);
                    ShareManager.legacyCopy(url);
                });
        } else {
            ShareManager.legacyCopy(url);
        }
    },
    
    legacyCopy: function(text) {
        var textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            document.execCommand('copy');
            ErrorToast.show('Link copied to clipboard!', 2000);
        } catch (err) {
            console.error('Legacy copy failed:', err);
            ErrorToast.show('Share not supported on this device', 3000);
        }
        
        document.body.removeChild(textArea);
    }
};

// PWA Install Manager
const InstallManager = {
    deferredPrompt: null,
    
    init: function() {
        this.bindEvents();
        this.listenForPrompt();
    },
    
    listenForPrompt: function() {
        window.addEventListener('beforeinstallprompt', function(e) {
            e.preventDefault();
            InstallManager.deferredPrompt = e;
            
            // Show install prompt after a delay
            setTimeout(function() {
                if (!localStorage.getItem('pwaInstallDismissed')) {
                    $('#install-prompt').addClass('show');
                }
            }, 3000);
        });
        
        // Listen for successful installation
        window.addEventListener('appinstalled', function() {
            InstallManager.deferredPrompt = null;
            $('#install-prompt').removeClass('show');
            ErrorToast.show('App installed successfully!', 3000);
        });
    },
    
    bindEvents: function() {
        $('#install-accept').on('click', function() {
            InstallManager.install();
        });
        
        $('#install-dismiss').on('click', function() {
            InstallManager.dismiss();
        });
    },
    
    install: function() {
        if (this.deferredPrompt) {
            this.deferredPrompt.prompt();
            this.deferredPrompt.userChoice
                .then(function(choiceResult) {
                    if (choiceResult.outcome === 'accepted') {
                        console.log('User accepted the install prompt');
                    } else {
                        console.log('User dismissed the install prompt');
                    }
                    InstallManager.deferredPrompt = null;
                    $('#install-prompt').removeClass('show');
                });
        }
    },
    
    dismiss: function() {
        $('#install-prompt').removeClass('show');
        localStorage.setItem('pwaInstallDismissed', 'true');
    }
};

// Scroll Animation Manager
const ScrollAnimationManager = {
    init: function() {
        this.observeElements();
    },
    
    observeElements: function() {
        // Use Intersection Observer for fade-in animations
        if ('IntersectionObserver' in window) {
            var observer = new IntersectionObserver(function(entries) {
                entries.forEach(function(entry) {
                    if (entry.isIntersecting) {
                        $(entry.target).addClass('visible');
                    }
                });
            }, {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            });
            
            $('.fade-in').each(function() {
                observer.observe(this);
            });
        } else {
            // Fallback for browsers without Intersection Observer
            $('.fade-in').addClass('visible');
        }
    }
};

$(document).ready(function() {
    // Initialize keyboard navigation
    KeyboardManager.init();
    
    // Initialize scroll animations
    ScrollAnimationManager.init();
    
    // Initialize theme manager
    ThemeManager.init();
    
    // Initialize share manager
    ShareManager.init();
    
    // Initialize PWA install manager
    InstallManager.init();
    
    //Check user IP belongs to if in China, North Korea
    if (window.localStorage.getItem('bannedcountries') != 'true') {
        getUserIp();
    } else {
        $('#mySidenav div:eq(0)').hide();
    }
    //Append select language options
    $("#languages").append(`
    <option value="selectbox">==Select==</option>
    <option value="af">Afrikaans</option>
    <option value="sq">Albanian - shqip</option>
    <option value="am">Amharic - አማርኛ</option>
    <option value="ar">Arabic - العربية</option>
    <option value="hy">Armenian - հայերեն</option>
    <option value="az">Azerbaijani - azərbaycan dili</option>
    <option value="eu">Basque - euskara</option>
    <option value="be">Belarusian - беларуская</option>
    <option value="bn">Bangla - বাংলা</option>
    <option value="bs">Bosnian - bosanski</option>
    <option value="bg">Bulgarian - български</option>
    <option value="ca">Catalan - català</option>
    <option value="zh">Chinese - 中文</option>
    <option value="zh-HK">Chinese (Hong Kong) - 中文（香港）</option>
    <option value="zh-CN">Chinese (Simplified) - 中文（简体）</option>
    <option value="zh-TW">Chinese (Traditional) - 中文（繁體）</option>
    <option value="co">Corsican</option>
    <option value="hr">Croatian - hrvatski</option>
    <option value="cs">Czech - čeština</option>
    <option value="da">Danish - dansk</option>
    <option value="nl">Dutch - Nederlands</option>
    <option value="en">English</option>
    <option value="en-AU">English (Australia)</option>
    <option value="en-CA">English (Canada)</option>
    <option value="en-IN">English (India)</option>
    <option value="en-NZ">English (New Zealand)</option>
    <option value="en-ZA">English (South Africa)</option>
    <option value="en-GB">English (United Kingdom)</option>
    <option value="en-US">English (United States)</option>
    <option value="eo">Esperanto - esperanto</option>
    <option value="et">Estonian - eesti</option>
    <option value="fil">Filipino</option>
    <option value="fi">Finnish - suomi</option>
    <option value="fr">French - français</option>
    <option value="fr-CA">French (Canada) - français (Canada)</option>
    <option value="fr-FR">French (France) - français (France)</option>
    <option value="fr-CH">French (Switzerland) - français (Suisse)</option>
    <option value="gl">Galician - galego</option>
    <option value="ka">Georgian - ქართული</option>
    <option value="de">German - Deutsch</option>
    <option value="de-AT">German (Austria) - Deutsch (Österreich)</option>
    <option value="de-DE">German (Germany) - Deutsch (Deutschland)</option>
    <option value="de-LI">German (Liechtenstein) - Deutsch (Liechtenstein)</option>
    <option value="de-CH">German (Switzerland) - Deutsch (Schweiz)</option>
    <option value="el">Greek - Ελληνικά</option>
    <option value="gu">Gujarati - ગુજરાતી</option>
    <option value="ha">Hausa</option>
    <option value="haw">Hawaiian - ʻŌlelo Hawaiʻi</option>
    <option value="he">Hebrew - עברית</option>
    <option value="hi">Hindi - हिन्दी</option>
    <option value="hu">Hungarian - magyar</option>
    <option value="is">Icelandic - íslenska</option>
    <option value="id">Indonesian - Indonesia</option>
    <option value="ga">Irish - Gaeilge</option>
    <option value="it">Italian - italiano</option>
    <option value="it-IT">Italian (Italy) - italiano (Italia)</option>
    <option value="it-CH">Italian (Switzerland) - italiano (Svizzera)</option>
    <option value="ja">Japanese - 日本語</option>
    <option value="kn">Kannada - ಕನ್ನಡ</option>
    <option value="kk">Kazakh - қазақ тілі</option>
    <option value="km">Khmer - ខ្មែរ</option>
    <option value="ko">Korean - 한국어</option>
    <option value="ku">Kurdish - Kurdî</option>
    <option value="ky">Kyrgyz - кыргызча</option>
    <option value="lo">Lao - ລາວ</option> 
    <option value="la">Latin</option>
    <option value="lv">Latvian - latviešu</option>
    <option value="lt">Lithuanian - lietuvių</option>
    <option value="mk">Macedonian - македонски</option>
    <option value="ms">Malay - Bahasa Melayu</option>
    <option value="ml">Malayalam - മലയാളം</option>
    <option value="mt">Maltese - Malti</option>
    <option value="mr">Marathi - मराठी</option>
    <option value="mn">Mongolian - монгол</option>
    <option value="ne">Nepali - नेपाली</option>
    <option value="no">Norwegian - norsk</option>
    <option value="nb">Norwegian Bokmål - norsk bokmål</option>
    <option value="nn">Norwegian Nynorsk - nynorsk</option>
    <option value="od">Odia</option>
    <option value="ps">Pashto - پښتو</option>
    <option value="fa">Persian - فارسی</option>
    <option value="pl">Polish - polski</option>
    <option value="pt">Portuguese - português</option>
    <option value="pt-BR">Portuguese (Brazil) - português (Brasil)</option>
    <option value="pt-PT">Portuguese (Portugal) - português (Portugal)</option>
    <option value="pa">Punjabi - ਪੰਜਾਬੀ</option>
    <option value="ro">Romanian - română</option>
    <option value="mo">Romanian (Moldova) - română (Moldova)</option>
    <option value="rm">Romansh - rumantsch</option>
    <option value="ru">Russian - русский</option>
    <option value="gd">Scottish Gaelic</option>
    <option value="sr">Serbian - српски</option> 
    <option value="sn">Shona - chiShona</option>
    <option value="sd">Sindhi</option>
    <option value="si">Sinhala - සිංහල</option>
    <option value="sk">Slovak - slovenčina</option>
    <option value="sl">Slovenian - slovenščina</option>
    <option value="so">Somali - Soomaali</option>
    <option value="st">Southern Sotho</option>
    <option value="es">Spanish - español</option>
    <option value="es-AR">Spanish (Argentina) - español (Argentina)</option>
    <option value="es-419">Spanish (Latin America) - español (Latinoamérica)</option>
    <option value="es-MX">Spanish (Mexico) - español (México)</option>
    <option value="es-ES">Spanish (Spain) - español (España)</option>
    <option value="es-US">Spanish (United States) - español (Estados Unidos)</option>
    <option value="su">Sundanese</option>
    <option value="sw">Swahili - Kiswahili</option> 
    <option value="sv">Swedish - svenska</option>
    <option value="tg">Tajik - тоҷикӣ</option>
    <option value="ta">Tamil - தமிழ்</option> 
    <option value="tt">Tatar</option>
    <option value="te">Telugu - తెలుగు</option>
    <option value="th">Thai - ไทย</option>
    <option value="tr">Turkish - Türkçe</option>
    <option value="tk">Turkmen</option>
    <option value="uk">Ukrainian - українська</option>
    <option value="ur">Urdu - اردو</option>
    <option value="ug">Uyghur</option>
    <option value="uz">Uzbek - o‘zbek</option>
    <option value="vi">Vietnamese - Tiếng Việt</option>
    <option value="cy">Welsh - Cymraeg</option>
    <option value="fy">Western Frisian</option>
    <option value="xh">Xhosa</option>
    <option value="yi">Yiddish</option>
    <option value="yo">Yoruba - Èdè Yorùbá</option>
    <option value="zu">Zulu - isiZulu</option>
    `);
    //Toggle Menu - updated with aria-expanded
    $('#main').click(function() {
        var $btn = $('#menu-toggle-btn');
        if ($('#mySidenav').is(':visible')) {
            $(this).css({
                'marginRight': '0'
            });
            $('#mySidenav').hide();
            $btn.attr('aria-expanded', 'false');
        } else {
            if ($(window).width() > 640) {
                $(this).css({
                    'marginRight': '400px'
                });
            } else {
                $(this).css({
                    'marginRight': '250px'
                });
            }
            $('#mySidenav').show();
            $btn.attr('aria-expanded', 'true');
        };
    });
    //if user back refresh page
    let link = window.location.href;
    if (link.indexOf('popupbox') > -1) {
        window.location.replace('https://zhangboheng.github.io/Easy-Web-TV-M3u8/');
    }
    //Set attributes to button
    $('.stylebtn:eq(2)').click(function() {
        $(this).attr('title', 'selected');
        $('.stylebtn:eq(4)').removeAttr("title");
    });
    $('.stylebtn:eq(4)').click(function() {
        $(this).attr('title', 'selected');
        $('.stylebtn:eq(2)').removeAttr("title");
    });
    //Select TV Options
    $('.stylebtn:eq(0)').on('click', function() {
        if ($('input[name=radioName]:checked', '#selectform').val() == 1 && $('.stylebtn:eq(2)').attr('title') == 'selected') {
            window.location.href = "routes/countries.html";
        } else if ($('input[name=radioName]:checked', '#selectform').val() == 2 && $('.stylebtn:eq(2)').attr('title') == 'selected') {
            window.location.href = "routes/language.html";
        } else if ($('input[name=radioName]:checked', '#selectform').val() == 3 && $('.stylebtn:eq(2)').attr('title') == 'selected') {
            window.location.href = "routes/category.html";
        } else if ($('input[name=radioName]:checked', '#selectform').val() == 1 && $('.stylebtn:eq(4)').attr('title') == 'selected') {
            window.location.href = "routes/radio.html?t=1";
        } else if ($('input[name=radioName]:checked', '#selectform').val() == 2 && $('.stylebtn:eq(4)').attr('title') == 'selected') {
            window.location.href = "routes/radio.html?t=2";
        } else if ($('input[name=radioName]:checked', '#selectform').val() == 3 && $('.stylebtn:eq(4)').attr('title') == 'selected') {
            window.location.href = "routes/radio.html?t=3";
        }
    });
    //Set adult content default
    if (window.localStorage.getItem('bannedcountries') != 'true' && window.localStorage.getItem('adult') == 'open') {
        $('#adultban').prop('checked', true);
        var currentLang = window.localStorage.getItem('languages') || 'en';
        var buttonText = AdultTranslations.getButtonText(currentLang);
        var descText = AdultTranslations.getDescriptionText(currentLang);
        $('.mobile').append(`<li><img src="images/sex.svg" /><dd><a href="routes/adult.html"><button class="stylebtn">${buttonText}</button></a></dd><p>${descText}</p></li>`);
    }
    // Age Confirmation Modal Manager
    const AgeConfirmModal = {
        pendingCheckbox: null,
        
        init: function() {
            this.bindEvents();
        },
        
        bindEvents: function() {
            // Yes button click
            $('#age-confirm-yes').on('click', function() {
                AgeConfirmModal.confirmYes();
            });
            
            // No button click
            $('#age-confirm-no').on('click', function() {
                AgeConfirmModal.confirmNo();
            });
            
            // Close on overlay click
            $('#age-confirm-overlay').on('click', function() {
                AgeConfirmModal.confirmNo();
            });
            
            // Close on ESC key
            $(document).on('keydown', function(e) {
                if (e.key === 'Escape' && $('#age-confirm-modal').hasClass('show')) {
                    AgeConfirmModal.confirmNo();
                }
            });
        },
        
        show: function(checkbox) {
            this.pendingCheckbox = checkbox;
            $('#age-confirm-modal').addClass('show');
            $('#age-confirm-overlay').addClass('show');
            $('#age-confirm-modal').attr('aria-hidden', 'false');
            $('#age-confirm-overlay').attr('aria-hidden', 'false');
        },
        
        hide: function() {
            $('#age-confirm-modal').removeClass('show');
            $('#age-confirm-overlay').removeClass('show');
            $('#age-confirm-modal').attr('aria-hidden', 'true');
            $('#age-confirm-overlay').attr('aria-hidden', 'true');
            this.pendingCheckbox = null;
        },
        
        confirmYes: function() {
            if (this.pendingCheckbox) {
                this.pendingCheckbox.prop('checked', true);
                var currentLang = window.localStorage.getItem('languages') || 'en';
                var buttonText = AdultTranslations.getButtonText(currentLang);
                var descText = AdultTranslations.getDescriptionText(currentLang);
                $('.mobile').append(`<li><img src="images/sex.svg" /><dd><a href="routes/adult.html"><button class="stylebtn">${buttonText}</button></a></dd><p>${descText}</p></li>`);
                window.localStorage.setItem('adult', 'open');
            }
            this.hide();
        },
        
        confirmNo: function() {
            if (this.pendingCheckbox) {
                this.pendingCheckbox.prop('checked', false);
            }
            this.hide();
        }
    };
    
    // Initialize Age Confirmation Modal
    AgeConfirmModal.init();
    
    //Check sensetive content if or not - updated to use custom modal
    $('#adultban').on('change', function() {
        if ($(this).is(':checked')) {
            // Prevent the checkbox from being checked immediately
            $(this).prop('checked', false);
            // Show custom modal
            AgeConfirmModal.show($(this));
        } else {
            $('.mobile li:eq(7)').remove();
            localStorage.removeItem('adult');
        }
    });
    //Clear cache
    $('.cachebtn:eq(0)').click(function() {
        if (confirm("Are you sure clear the cache?")) {
            localStorage.clear();
        } else {
            console.log("Not do nothing...");
        }
    });
    //Append log history
    $('.scrollidbar').empty();
    $('.scrollidbar').append(`
        <p>[2026-05-17] V8.2.3: release add video autoplay next episode feature</p>
        <p>[2026-05-16] V8.2.2 release fixed some bugs</p>
        <p>[2026-05-16] V8.2.1 release beautify UI</p>
        <p>[2021-10-09] V8.2.0 release support to play one game</p>
        <p>[2021-10-06] V8.1.1 release Add about feature and fixed some bugs</p>
        <p>[2021-10-02] V8.1.0 release Add source control feature</p>
        <p>[2021-10-01] Delete one invalid manga source and add log history</p>
        <p>[2021-09-16] V8.0.0 release support to listen to music online</p>
        <p>[2021-09-15] V7.0.0 release support to read manga books</p>
        <p>[2021-09-13] V6.0.0 release support to read novel books</p>
        <p>[2021-09-08] V5.0.0 release support to listen 28000+ radio stations</p>
        <p>[2021-09-04] V4.0.0 release support to watch movies, series, cartoon...</p>
        <p>[2021-08-31] V3.0.0 release support to watch IPTV</p>
        <p>[2021-08-29] V2.0.0 release support to search IPTV channels</p>
        <p>[2021-08-29] V1.1.0 release pure code</p>
        <p>[2021-08-28] V1.0.3 release support to remark favorite channels</p>
        <p>[2021-04-21] V1.0.0 release</p>
    `);
    //Show QRcode
    $('.circlescon li:eq(3)').click(function() {
        $('.qrcode').toggle(500);
    });
    $('.circlescon li:eq(3)').mouseleave(function() {
        $('.qrcode').hide(500);
    });
});
//Go to source nextpage
function goToSource() {
    if ($('input[name="sourceName"]:checked').val() == 1) {
        $('#sourceitem div').remove();
        $('#sourceitem button').remove();
        $('#sourceitem').append(`
            <div id="selectform" style="display:flex;">
                <input type="checkbox" name="movie" value="hyzy" checked />
                <label for="movie"> 虎牙资源</label><br />
                <input type="checkbox" name="movie" value="wlys" checked />
                <label for="movie"> 卧龙影视</label><br />
                <input type="checkbox" name="movie" value="gszy" checked />
                <label for="movie"> 光速资源</label><br />
            </div>
            <div id="selectform" style="display:flex;">
                <input type="checkbox" name="movie" value="hnzy" checked />
                <label for="movie"> 红牛资源</label><br />
                <input type="checkbox" name="movie" value="tky" checked />
                <label for="movie"> 茅台资源</label><br />
                <input type="checkbox" name="movie" value="bjy" checked />
                <label for="movie"> 如意资源</label><br />
            </div>
            <button class="stylebtn" onclick="returnSource()"><img src="./images/return.svg" style="width:30px;"></button>
        `);
        let ms = window.localStorage.getItem('movie').split(",");
        let arr = ["hyzy", "wlys", "gszy", "hnzy", "tky", "bjy"];
        let lst = arr.filter(x => ms.includes(x)).map(x => arr.indexOf(x));
        let cat = arr.filter(x => !ms.includes(x)).map(x => arr.indexOf(x));
        for (let i of lst) {
            $(`input[name="movie"]:eq(${i})`).prop('checked', true);
        }
        for (let i of cat) {
            $(`input[name="movie"]:eq(${i})`).prop('checked', false);
        }
    } else if ($('input[name="sourceName"]:checked').val() == 2) {
        $('#sourceitem div').remove();
        $('#sourceitem button').remove();
        $('#sourceitem').append(`
            <div id="selectform" style="display:flex;">
                <input type="checkbox" name="novel" value="novelonlinefull" checked />
                <label for="novel"> novelonlinefull</label><br />
                <input type="checkbox" name="novel" value="95sb" checked />
                <label for="novel"> 95书包</label><br />
            </div>
            <button class="stylebtn" onclick="returnSource()"><img src="./images/return.svg" style="width:30px;"></button>
        `);
        let ms = window.localStorage.getItem('novel').split(",");
        let arr = ["novelonlinefull", "95sb"];
        let lst = arr.filter(x => ms.includes(x)).map(x => arr.indexOf(x));
        let cat = arr.filter(x => !ms.includes(x)).map(x => arr.indexOf(x));
        for (let i of lst) {
            $(`input[name="novel"]:eq(${i})`).prop('checked', true);
        }
        for (let i of cat) {
            $(`input[name="novel"]:eq(${i})`).prop('checked', false);
        }
    } else if ($('input[name="sourceName"]:checked').val() == 3) {
        $('#sourceitem div').remove();
        $('#sourceitem button').remove();
        $('#sourceitem').append(`
            <div id="selectform" style="display:flex;">
                <input type="checkbox" name="manga" value="mangabuddy" checked />
                <label for="manga"> mangabuddy</label><br />
                <input type="checkbox" name="manga" value="mangadex" checked />
                <label for="manga"> mangadex</label><br />
            </div>
            <div id="selectform" style="display:flex;">
                <input type="checkbox" name="manga" value="dmmh" checked>
                <label for="manga"> 耽美漫画(PC端)</label><br />
            </div>
            <button class="stylebtn" onclick="returnSource()"><img src="./images/return.svg" style="width:30px;"></button>
        `);
        let ms = window.localStorage.getItem('manga').split(",");
        let arr = ["mangabuddy", "mangadex", "dmmh"];
        let lst = arr.filter(x => ms.includes(x)).map(x => arr.indexOf(x));
        let cat = arr.filter(x => !ms.includes(x)).map(x => arr.indexOf(x));
        for (let i of lst) {
            $(`input[name="manga"]:eq(${i})`).prop('checked', true);
        }
        for (let i of cat) {
            $(`input[name="manga"]:eq(${i})`).prop('checked', false);
        }
    } else if ($('input[name="sourceName"]:checked').val() == 4) {
        $('#sourceitem div').remove();
        $('#sourceitem button').remove();
        $('#sourceitem').append(`
            <div id="selectform" style="display:flex;">
                <input type="checkbox" name="music" value="wymusic" checked>
                <label for="music"> 网易云音乐</label><br />
            </div>
            <button class="stylebtn" onclick="returnSource()"><img src="./images/return.svg" style="width:30px;"></button>
        `);
        let ms = window.localStorage.getItem('music').split(",");
        let arr = ["wymusic"];
        let lst = arr.filter(x => ms.includes(x)).map(x => arr.indexOf(x));
        let cat = arr.filter(x => !ms.includes(x)).map(x => arr.indexOf(x));
        for (let i of lst) {
            $(`input[name="music"]:eq(${i})`).prop('checked', true);
        }
        for (let i of cat) {
            $(`input[name="music"]:eq(${i})`).prop('checked', false);
        }
    } else if ($('input[name="sourceName"]:checked').val() == 5) {
        $('#sourceitem div').remove();
        $('#sourceitem button').remove();
        $('#sourceitem').append(`
            <div id="selectform" style="display:flex;">
                <input type="checkbox" name="porn" value="zmwzy" checked>
                <label for="porn"> 字幕网</label><br />
                <input type="checkbox" name="porn" value="fedzy" checked>
                <label for="porn"> 富二代</label><br />
                <input type="checkbox" name="porn" value="javmy" checked>
                <label for="porn"> JAV名优</label><br />
            </div>
            <div id="selectform" style="display:flex;">
                <input type="checkbox" name="porn" value="hyzy" checked>
                <label for="porn"> 环亚</label><br />
                <input type="checkbox" name="porn" value="sszy" checked>
                <label for="porn"> 色色</label><br />
                <input type="checkbox" name="porn" value="jjzy" checked>
                <label for="porn"> 玖玖</label><br />
            </div>
            <div id="selectform" style="display:flex;">
                <input type="checkbox" name="porn" value="lsnzy" checked>
                <label for="porn"> 狼少年</label><br />
                <input type="checkbox" name="porn" value="bttzy" checked>
                <label for="porn"> 博天堂</label><br />
                <input type="checkbox" name="porn" value="llzy" checked>
                <label for="porn"> 利来</label><br />
            </div>
            <button class="stylebtn" onclick="returnSource()"><img src="./images/return.svg" style="width:30px;"></button>
        `);
        let ms = window.localStorage.getItem('porn').split(",");
        let arr = ["zmwzy", "fedzy", "javmy", "hyzy", "sszy", "jjzy", "lsnzy", "bttzy", "llzy"];
        let lst = arr.filter(x => ms.includes(x)).map(x => arr.indexOf(x));
        let cat = arr.filter(x => !ms.includes(x)).map(x => arr.indexOf(x));
        for (let i of lst) {
            $(`input[name="porn"]:eq(${i})`).prop('checked', true);
        }
        for (let i of cat) {
            $(`input[name="porn"]:eq(${i})`).prop('checked', false);
        }
    }
}
//Return source homepage
function returnSource() {
    var arr = [];
    $('input[name="movie"]:checked').each(function() {
        arr[0] = "movie";
        arr.push($(this).val());
    });
    $('input[name="novel"]:checked').each(function() {
        arr[0] = "novel";
        arr.push($(this).val());
    });
    $('input[name="manga"]:checked').each(function() {
        arr[0] = "manga";
        arr.push($(this).val());
    });
    $('input[name="music"]:checked').each(function() {
        arr[0] = "music";
        arr.push($(this).val());
    });
    $('input[name="porn"]:checked').each(function() {
        arr[0] = "porn";
        arr.push($(this).val());
    });
    if (arr.length == 0) {
        alert("Please select at least one source...");
    } else {
        if (arr[0] == "movie") {
            window.localStorage.setItem('movie', arr.slice(1).join(","));
        } else if (arr[0] == "novel") {
            window.localStorage.setItem('novel', arr.slice(1).join(","));
        } else if (arr[0] == "manga") {
            window.localStorage.setItem('manga', arr.slice(1).join(","));
        } else if (arr[0] == "music") {
            window.localStorage.setItem('music', arr.slice(1).join(","));
        } else if (arr[0] == "porn") {
            window.localStorage.setItem('porn', arr.slice(1).join(","));
        }
        $('#sourceitem div').remove();
        $('#sourceitem button').remove();
        $('#sourceitem').append(`
            <div id="selectform">
                <input type="radio" name="sourceName" value="1" checked/> <span>Moive</span> <br />
                <input type="radio" name="sourceName" value="2" /> <span>Novel</span> <br />
                <input type="radio" name="sourceName" value="3" /> <span>Manga</span> <br />
                <input type="radio" name="sourceName" value="4" /> <span>Music</span> <br />
                <input type="radio" name="sourceName" value="5" /> <span>Porn</span> <br />
            </div>
            <button class="stylebtn" onclick="goToSource()"><img src="./images/nextselect.svg" style="width:30px;"></button>
        `);
    }
}
//Get User IP
function getUserIp() {
    LoadingManager.show();
    var request = new XMLHttpRequest();
    
    request.timeout = 10000; // 10 seconds timeout

    request.open('GET', 'https://api.ipdata.co/?api-key=7910661894e758448cbebb4a636485005498427178dea6ef0e911311');

    request.setRequestHeader('Accept', 'application/json');

    request.onreadystatechange = function() {
        if (this.readyState === 4) {
            LoadingManager.hide();
            if (this.status === 200) {
                try {
                    let response = JSON.parse(this.responseText);
                    let country = response.country_code;
                    if (country && (country.toLowerCase() == 'cn' || country.toLowerCase() == 'kp')) {
                        window.localStorage.setItem('bannedcountries', 'true');
                        $('#mySidenav div:eq(0)').hide();
                    }
                } catch (e) {
                    console.error('Error parsing IP response:', e);
                    getCoordintes();
                }
            } else {
                console.warn('IP API request failed, trying geolocation');
                getCoordintes();
            }
        }
    };
    
    request.ontimeout = function() {
        LoadingManager.hide();
        console.warn('IP API request timed out, trying geolocation');
        getCoordintes();
    };
    
    request.onerror = function() {
        LoadingManager.hide();
        console.error('IP API request error, trying geolocation');
        getCoordintes();
    };
    
    request.send();
}
// Step 1: Get user coordinates
function getCoordintes() {
    LoadingManager.show();
    var options = {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
    };

    function success(pos) {
        var crd = pos.coords;
        var lat = crd.latitude.toString();
        var lng = crd.longitude.toString();
        var coordinates = [lat, lng];
        var xhr = new XMLHttpRequest();
        var lat = coordinates[0];
        var lng = coordinates[1];

        // Paste your LocationIQ token below.
        xhr.open('GET', "https://us1.locationiq.com/v1/reverse.php?key=pk.dd067483fe694f72f04c0fdd2d312091&lat=" + lat + "&lon=" + lng + "&format=json", true);
        xhr.timeout = 8000;
        
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4) {
                LoadingManager.hide();
                if (xhr.status == 200) {
                    try {
                        var response = JSON.parse(xhr.responseText);
                        var city = response.address;
                        if (city && (city.country_code == 'cn' || city.country_code == 'kp')) {
                            window.localStorage.setItem('bannedcountries', 'true');
                            $('#mySidenav div:eq(0)').hide();
                        }
                    } catch (e) {
                        console.error('Error parsing geolocation response:', e);
                    }
                } else {
                    console.warn('Geolocation API request failed');
                }
            }
        };
        
        xhr.ontimeout = function() {
            LoadingManager.hide();
            console.warn('Geolocation API request timed out');
        };
        
        xhr.onerror = function() {
            LoadingManager.hide();
            console.error('Geolocation API request error');
        };
        
        xhr.send();
    }

    function error(err) {
        LoadingManager.hide();
        console.warn('Geolocation error:', err.message);
    }

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(success, error, options);
    } else {
        LoadingManager.hide();
        console.warn('Geolocation is not supported by this browser');
    }
}
