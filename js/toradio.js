// Radio Page JS - Modern UI Version

// Set a array to store source links
var radiosource = ['https://de1.api.radio-browser.info/'];
// Set a random integer
var rand = Math.floor(Math.random() * radiosource.length);

$(document).ready(function() {
    // Tab 切换功能
    $('.tab-btn').on('click', function() {
        var targetTab = $(this).data('tab');
        
        // 切换 tab 按钮状态
        $('.tab-btn').removeClass('active');
        $(this).addClass('active');
        
        // 切换内容区域
        $('.tab-content').removeClass('active');
        $('#' + targetTab).addClass('active');
        
        // 清空搜索框
        $('#searchInput').val('');
        // 显示所有卡片
        $('.item-card').show();
    });
    
    // 搜索功能
    $('#searchInput').on('input', function() {
        var searchTerm = $(this).val().toLowerCase();
        var activeTab = $('.tab-content.active').attr('id');
        
        $('#' + activeTab + ' .item-card').each(function() {
            var text = $(this).find('a').text().toLowerCase();
            if (text.indexOf(searchTerm) > -1) {
                $(this).show();
            } else {
                $(this).hide();
            }
        });
    });
    
    // 返回按钮
    $('#backBtn').on('click', function() {
        window.history.back();
    });
    
    // 卡片点击跳转 - 使用事件委托
    $(document).on('click', '.item-card', function(e) {
        // 如果点击的是a标签本身，让它自然跳转
        if ($(e.target).is('a')) {
            return;
        }
        var link = $(this).find('a').attr('href');
        if (link) {
            window.location.href = link;
        }
    });
    
    // 动态加载 Countries 列表
    function loadCountries() {
        $.ajax({
            type: "GET",
            url: radiosource[rand] + "json/countries",
            success: function(data) {
                $("#countries-grid").empty();
                // 按名称排序
                data.sort(function(a, b) {
                    return a.name.localeCompare(b.name);
                });
                for (let i = 0; i < data.length; i++) {
                    let country = data[i];
                    let name = country.name;
                    // 处理台湾名称
                    let displayName = name == 'Taiwan Province Of China' ? 'Taiwan' : name;
                    let stationcount = country.stationcount;
                    let link = `../catalogues/radioplay.html?tab=${encodeURIComponent(name)}&t=1`;
                    $("#countries-grid").append(`
                        <div class="item-card">
                            <a href="${link}">${displayName}</a>
                            <span class="station-count">${stationcount} stations</span>
                        </div>
                    `);
                }
            },
            fail: function() {
                $("#countries-grid").html('<div class="no-results"><i class="fas fa-exclamation-triangle"></i><p>Failed to load countries list</p></div>');
            }
        });
    }
    
    // 动态加载 Languages 列表
    function loadLanguages() {
        $.ajax({
            type: "GET",
            url: radiosource[rand] + "json/languages",
            success: function(data) {
                $("#languages-grid").empty();
                // 按名称排序
                data.sort(function(a, b) {
                    return a.name.localeCompare(b.name);
                });
                for (let i = 0; i < data.length; i++) {
                    let lang = data[i];
                    let name = lang.name;
                    let stationcount = lang.stationcount;
                    let link = `../catalogues/radioplay.html?tab=${encodeURIComponent(name)}&t=2`;
                    $("#languages-grid").append(`
                        <div class="item-card">
                            <a href="${link}">${name}</a>
                            <span class="station-count">${stationcount} stations</span>
                        </div>
                    `);
                }
            },
            fail: function() {
                $("#languages-grid").html('<div class="no-results"><i class="fas fa-exclamation-triangle"></i><p>Failed to load languages list</p></div>');
            }
        });
    }
    
    // 动态加载 Tags (Category) 列表
    function loadTags() {
        $.ajax({
            type: "GET",
            url: radiosource[rand] + "json/tags",
            success: function(data) {
                $("#category-grid").empty();
                // 按名称排序
                data.sort(function(a, b) {
                    return a.name.localeCompare(b.name);
                });
                // 分类图标映射
                var iconMap = {
                    'pop': 'fa-music',
                    'rock': 'fa-guitar',
                    'jazz': 'fa-saxophone',
                    'classical': 'fa-violin',
                    'news': 'fa-newspaper',
                    'talk': 'fa-comments',
                    'sports': 'fa-futbol',
                    'country': 'fa-music',
                    'dance': 'fa-compact-disc',
                    'electronic': 'fa-bolt',
                    'hip hop': 'fa-microphone',
                    'rnb': 'fa-music',
                    'latin': 'fa-music',
                    'christian': 'fa-church',
                    'ambient': 'fa-cloud',
                    'indie': 'fa-music',
                    'metal': 'fa-guitar',
                    'blues': 'fa-music',
                    'reggae': 'fa-music',
                    'folk': 'fa-music',
                    'oldies': 'fa-clock',
                    'easy listening': 'fa-headphones',
                    'urban': 'fa-city',
                    'college': 'fa-graduation-cap',
                    'experimental': 'fa-flask',
                    'chill': 'fa-spa',
                    'lounge': 'fa-couch',
                    'top40': 'fa-chart-line',
                    '80s': 'fa-calendar-alt',
                    '90s': 'fa-calendar-alt',
                    '70s': 'fa-calendar-alt',
                    '60s': 'fa-calendar-alt',
                    'default': 'fa-tag'
                };
                for (let i = 0; i < data.length; i++) {
                    let tag = data[i];
                    let name = tag.name;
                    let stationcount = tag.stationcount;
                    // 获取图标，如果没有匹配则使用默认图标
                    let icon = iconMap[name.toLowerCase()] || iconMap['default'];
                    let link = `../catalogues/radioplay.html?tab=${encodeURIComponent(name)}&t=3`;
                    $("#category-grid").append(`
                        <div class="item-card">
                            <a href="${link}">${name}</a>
                            <span class="station-count">${stationcount} stations</span>
                        </div>
                    `);
                }
            },
            fail: function() {
                $("#category-grid").html('<div class="no-results"><i class="fas fa-exclamation-triangle"></i><p>Failed to load tags list</p></div>');
            }
        });
    }
    
    // 页面加载时获取数据
    loadCountries();
    loadLanguages();
    loadTags();
    
    // 错误检测
    setInterval(function() {
        if ($('#countries-grid .item-card').length == 0 && $('#countries-grid .loading-spinner').length == 0) {
            // 如果已经加载完成但没有数据，尝试重新加载
            if ($('#countries-grid .no-results').length == 0) {
                loadCountries();
            }
        }
        if ($('#languages-grid .item-card').length == 0 && $('#languages-grid .loading-spinner').length == 0) {
            if ($('#languages-grid .no-results').length == 0) {
                loadLanguages();
            }
        }
        if ($('#category-grid .item-card').length == 0 && $('#category-grid .loading-spinner').length == 0) {
            if ($('#category-grid .no-results').length == 0) {
                loadTags();
            }
        }
    }, 10000);
});
