/**
 * animations.js
 * 所有新增动画效果的独立脚本文件
 */

/**
 * 滚动入场动画初始化
 */
function initScrollAnimation() {
    const animatedElements = document.querySelectorAll(`
        .strength-card,
        .team-card,
        .tutorial-item,
        .event-item,
        .trend-item,
        .donate-card,
        .download-card,
        .penalty-stats .stat-card,
        .status-node-card,
        .error-container,
        .gallery-item,
        .join-info,
        .join-info-wide,
        .friend-link-card,
        .penalty-table-container,
        .donators-table-container,
        .trends-stats,
        .trends-filter-section,
        .download-section-block,
        .latest-news
    `);

    if (!window.IntersectionObserver) {
        animatedElements.forEach(el => el.classList.add('scroll-animate', 'animated'));
        return;
    }

    animatedElements.forEach(el => el.classList.add('scroll-animate'));

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -20px 0px' });

    animatedElements.forEach(el => observer.observe(el));

    // 手动触发已在视口内的元素
    setTimeout(() => {
        animatedElements.forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight - 100) {
                el.classList.add('animated');
                observer.unobserve(el);
            }
        });
    }, 100);
}

/**
 * 数字滚动计数器
 */
function initCountUp() {
    const countElements = document.querySelectorAll('.stat-card .count, .donate-stat-value');
    if (!countElements.length) return;
    if (!window.IntersectionObserver) {
        countElements.forEach(el => {
            const target = parseFloat(el.getAttribute('data-target') || el.innerText.replace(/[^0-9.-]/g, ''));
            if (!isNaN(target)) el.innerText = target;
        });
        return;
    }

    const counters = [];
    countElements.forEach(el => {
        let targetText = el.getAttribute('data-target') || el.innerText.replace(/[^0-9.-]/g, '');
        const target = parseFloat(targetText);
        if (isNaN(target)) return;
        const isCurrency = el.innerText.includes('¥');
        const isTime = el.innerText.includes('天') || el.innerText.includes('时');
        if (isTime && targetText.length > 4) return; // 跳过运行时间
        counters.push({ el, target, current: 0, isCurrency, animated: false });
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const counter = counters.find(c => c.el === entry.target);
            if (entry.isIntersecting && counter && !counter.animated) {
                counter.animated = true;
                startCountUp(counter);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => observer.observe(counter.el));

    function startCountUp(counter) {
        const { el, target, isCurrency } = counter;
        let current = 0;
        const duration = 1500;
        const stepTime = 20;
        const steps = duration / stepTime;
        const increment = target / steps;
        let step = 0;
        const timer = setInterval(() => {
            step++;
            current += increment;
            if (step >= steps) {
                current = target;
                clearInterval(timer);
                el.classList.add('count-updated');
                setTimeout(() => el.classList.remove('count-updated'), 300);
            }
            let displayValue = isCurrency ? '¥' + Math.floor(current).toLocaleString() :
                               (Number.isInteger(target) ? Math.floor(current).toLocaleString() : current.toFixed(2));
            el.innerText = displayValue;
        }, stepTime);
    }
}

/**
 * 轮播增强：添加切换动画类
 */
function enhanceSwiperTransition() {
    const contentSwiperEl = document.querySelector('.hero-content-swiper');
    if (contentSwiperEl && contentSwiperEl.swiper) {
        const swiper = contentSwiperEl.swiper;
        swiper.on('slideChange', function() {
            const activeSlide = swiper.slides[swiper.activeIndex];
            if (activeSlide) {
                activeSlide.classList.add('slide-active-animation');
                setTimeout(() => activeSlide.classList.remove('slide-active-animation'), 500);
            }
        });
    }
}

/**
 * 为“加载更多”按钮添加新条目渐显效果
 */
function enhanceLoadMoreAnimation() {
    const loadMoreBtn = document.getElementById('load-more-btn');
    if (!loadMoreBtn) return;
    loadMoreBtn.addEventListener('click', function() {
        setTimeout(() => {
            const newItems = document.querySelectorAll('.trend-item:not(.animated-entry)');
            newItems.forEach((item, idx) => {
                item.classList.add('animated-entry', 'new-item');
                item.style.animationDelay = `${idx * 0.05}s`;
            });
        }, 50);
    });
}

/**
 * 页脚滚动入场动画
 */
function initFooterAnimation() {
    const footer = document.querySelector('.footer');
    if (!footer) return;
    if (!window.IntersectionObserver) {
        footer.classList.add('animated');
        return;
    }
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                footer.classList.add('animated');
                observer.unobserve(footer);
            }
        });
    }, { threshold: 0.1 });
    observer.observe(footer);
}

/**
 * 服务器状态卡片交错动画
 */
function initStatusCardsStagger() {
    const cards = document.querySelectorAll('.status-node-card');
    if (!cards.length) return;
    if (!window.IntersectionObserver) {
        cards.forEach(card => card.classList.add('animated'));
        return;
    }
    let index = 0;
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const card = entry.target;
                setTimeout(() => card.classList.add('animated'), index * 150);
                index++;
                observer.unobserve(card);
            }
        });
    }, { threshold: 0.2 });
    cards.forEach(card => observer.observe(card));
}

/**
 * 捐赠者表格行依次淡入动画
 */
function initDonatorsTableRowsAnimation() {
    const rows = document.querySelectorAll('.donators-table tbody tr');
    if (!rows.length) return;
    if (!window.IntersectionObserver) {
        rows.forEach(row => row.classList.add('animated'));
        return;
    }
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    rows.forEach(row => observer.observe(row));
}

/**
 * 初始化所有动态增强功能
 */
function initDynamicEnhancements() {
    initCountUp();
    enhanceSwiperTransition();
    enhanceLoadMoreAnimation();
    initFooterAnimation();
    initStatusCardsStagger();
    initDonatorsTableRowsAnimation();
}

// 页面加载完成后执行
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initScrollAnimation();
        initDynamicEnhancements();
    });
} else {
    initScrollAnimation();
    initDynamicEnhancements();
}