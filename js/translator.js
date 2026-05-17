/**
 * 多语言翻译器
 * 负责检测浏览器语言并应用对应翻译
 */

(function() {
    'use strict';

    /**
     * 获取浏览器首选语言
     * @returns {string} 语言代码
     */
    function getBrowserLanguage() {
        const lang = navigator.language || navigator.userLanguage || 'en';
        return lang;
    }

    /**
     * 获取存储的语言或浏览器语言
     * @returns {string} 语言代码
     */
    function getStoredLanguage() {
        // 检查 URL 参数
        const urlParams = new URLSearchParams(window.location.search);
        const urlLang = urlParams.get('lang');
        if (urlLang) {
            localStorage.setItem('preferredLanguage', urlLang);
            return urlLang;
        }
        
        // 检查 localStorage
        const storedLang = localStorage.getItem('preferredLanguage');
        if (storedLang) {
            return storedLang;
        }
        
        // 使用浏览器语言
        return getBrowserLanguage();
    }

    /**
     * 初始化语言选择器
     */
    function initLanguageSelector() {
        const $selector = $('#languages');
        if (!$selector.length) return;
        
        // 设置当前选中项
        const currentLang = getStoredLanguage();
        const normalizedLang = typeof getNormalizedLanguage === 'function' 
            ? getNormalizedLanguage(currentLang) 
            : currentLang;
        
        $selector.val(normalizedLang);
        
        // 绑定 change 事件
        $selector.on('change', function() {
            const selectedLang = $(this).val();
            window.setLanguage(selectedLang);
        });
    }

    /**
     * 初始化翻译
     */
    function initTranslation() {
        const lang = getStoredLanguage();
        if (typeof applyTranslation === 'function') {
            applyTranslation(lang);
        }
        // 初始化语言选择器
        initLanguageSelector();
    }

    // DOM 加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTranslation);
    } else {
        initTranslation();
    }

    // 暴露全局方法供外部调用
    window.setLanguage = function(lang) {
        localStorage.setItem('preferredLanguage', lang);
        if (typeof applyTranslation === 'function') {
            applyTranslation(lang);
        }
        // 更新选择器显示
        $('#languages').val(lang);
    };

    window.getCurrentLanguage = function() {
        return getStoredLanguage();
    };

})();
