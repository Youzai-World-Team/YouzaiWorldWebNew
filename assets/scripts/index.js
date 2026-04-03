document.addEventListener('DOMContentLoaded', function () {
    // 初始化轮播
    initHeroSlider();
    //世界板块交互
    initWorldsSection();
    // Swiper
    const bgSwiper = new Swiper('.hero-bg-swiper', {
        slidesPerView: 1,
        spaceBetween: 0,
        loop: true,
        effect: 'fade',
        fadeEffect: {
            crossFade: true
        },
        speed: 1000,
        allowTouchMove: false,
    });

    const contentSwiper = new Swiper('.hero-content-swiper', {
        slidesPerView: 1,
        spaceBetween: 0,
        loop: true,
        speed: 1000,
        autoplay: {
            delay: 5000,
            disableOnInteraction: false,
        },
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
    });

    contentSwiper.on('slideChange', function () {
        bgSwiper.slideToLoop(contentSwiper.realIndex, 1000);
    });

    const showMoreBtn = document.querySelector('.show-more-btn');
    const trendList = document.querySelector('.trend-list');
    const trendItems = document.querySelectorAll('.trend-item');

    // 复制按钮功能
    document.querySelectorAll('.copy-btn').forEach(button => {
        button.addEventListener('click', function () {
            const textToCopy = this.getAttribute('data-text');

            // 使用现代 Clipboard API
            navigator.clipboard.writeText(textToCopy).then(() => {
                // 复制成功反馈
                const originalText = this.textContent;
                this.textContent = '成功';
                this.classList.add('copied');

                setTimeout(() => {
                    this.textContent = originalText;
                    this.classList.remove('copied');
                }, 1000);
            }).catch(err => {
                // 降级方案：使用传统方法
                const textArea = document.createElement('textarea');
                textArea.value = textToCopy;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);

                // 反馈
                const originalText = this.textContent;
                this.textContent = '成功';
                this.classList.add('copied');

                setTimeout(() => {
                    this.textContent = originalText;
                    this.classList.remove('copied');
                }, 1000);
            });
        });
    });
});

// 添加淡入动画
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);

// 首页横幅轮播功能
function initHeroSlider() {
    const slides = document.querySelectorAll('.slide');
    let currentSlide = 0;

    if (slides.length === 0) return;

    function preloadImages() {
        const imagePaths = [
            'assets/images/background_1.webp'
        ];
        /*,
            'assets/images/background_2.webp',
            'assets/images/background_3.webp',
            'assets/images/background_4.webp',
            'assets/images/background_5.webp',
            'assets/images/background_6.webp',
            'assets/images/background_7.webp',
            'assets/images/background_8.webp',
            'assets/images/background_9.webp',
            'assets/images/background_10.webp',
            'assets/images/background_11.webp'
        */
        let loadedImages = 0;
        const totalImages = imagePaths.length;

        imagePaths.forEach(path => {
            const img = new Image();
            img.onload = function () {
                loadedImages++;
                // 当所有图片加载完成后开始轮播
                if (loadedImages === totalImages) {
                    startSlider();
                }
            };
            img.onerror = function () {
                console.warn('Failed to load image:', path);
                loadedImages++;
                if (loadedImages === totalImages) {
                    startSlider();
                }
            };
            img.src = path;
        });
    }

    // 每5秒切换一次背景
    setInterval(() => {
        // 隐藏当前幻灯片
        slides[currentSlide].classList.remove('active');

        // 移动到下一张
        //currentSlide = (currentSlide + 1) % slides.length;

        // 显示新幻灯片
        slides[currentSlide].classList.add('active');
    }, 3000);
}

/**
 * 可游玩的世界板块 - 卡片动画
 */
function initWorldsSection() {
    // 世界数据（含图片URL和详细内容）
    const worldsData = {
        survival: {
            title: '生存世界',
            mainImage: 'assets/images/worlds/survival.webp',
            desc: '经典生存模式，采集资源、建造家园、挑战怪物。与伙伴一起探索广阔的世界。',
            features: [
                '✅ 完整原版生存体验',
                '✅ 领地保护，防止破坏',
                '✅ 经济系统与玩家交易',
                '✅ 定期备份，安全可靠'
            ],
            link: 'read_agreements/world_rules&play_agreement/survival'   // 新增完整介绍页链接
        },
        creative: {
            title: '创造世界',
            mainImage: 'assets/images/worlds/creative.webp',
            desc: '创造模式，无限资源，飞行权限，让你尽情发挥想象力，建造宏伟建筑或红石机械。',
            features: [
                '✅ 创造模式，无限方块',
                '✅ 飞行权限，方便建造',
                '✅ 世界编辑工具支持',
                '✅ 可申请建筑模板'
            ],
            link: 'read_agreements/world_rules&play_agreement/creative'
        },
        building: {
            title: '建筑世界',
            mainImage: 'assets/images/worlds/building.webp',
            desc: '专门为建筑爱好者准备的平坦世界，超大地形，让你专注建筑艺术。',
            features: [
                '✅ 超平坦地形',
                '✅ 建筑比赛专区',
                '✅ 团队协作区域',
                '✅ 优秀作品展示'
            ],
            link: 'read_agreements/world_rules&play_agreement/building'
        }
    };

    // DOM 元素
    const mainCard = document.getElementById('worldMainCard');
    const mainImageDiv = document.getElementById('worldMainImage');
    const mainTitle = document.getElementById('worldMainTitle');
    const mainDesc = document.getElementById('worldMainDesc');
    const mainFeatures = document.getElementById('worldMainFeatures');
    const sideItems = document.querySelectorAll('.world-side-item');

    let isAnimating = false; // 防止快速点击导致动画冲突

    // 更新右侧卡片的禁用状态（当前激活的卡片不可点击）
    function updateDisabledStates(activeWorldId) {
        sideItems.forEach(item => {
            const worldId = item.getAttribute('data-world');
            // “更多世界”卡片永远不可点击（已通过 CSS 和属性禁用，这里再次确保）
            if (worldId === 'more') {
                item.classList.add('disabled');
                return;
            }
            // 当前激活的世界卡片不可点击
            if (worldId === activeWorldId) {
                item.classList.add('disabled');
            } else {
                item.classList.remove('disabled');
            }
        });
    }

    // 切换世界（渐隐渐显效果）
    function switchWorld(worldId) {
        // 禁止切换到“更多世界”
        if (worldId === 'more') return;
        if (isAnimating) return;

        const data = worldsData[worldId];
        if (!data) return;

        isAnimating = true;

        // 淡出
        if (mainCard) {
            mainCard.classList.add('fade-out');
        }

        setTimeout(() => {
            // 更新内容（在完全透明后）
            if (mainImageDiv) {
                mainImageDiv.style.backgroundImage = `url('${data.mainImage}')`;
                // 图片加载失败时的回退
                const img = new Image();
                img.onerror = () => {
                    mainImageDiv.style.backgroundImage = 'none';
                    mainImageDiv.style.backgroundColor = '#a8e6cf';
                };
                img.src = data.mainImage;
            }
            mainTitle.textContent = data.title;
            mainDesc.innerHTML = `<p>${data.desc}</p>`;
            mainFeatures.innerHTML = data.features.map(f => `<li>${f}</li>`).join('');

            // 处理按钮
            const btnWrapper = document.getElementById('worldMainBtnWrapper');
            if (btnWrapper) {
                if (data.link) {
                    btnWrapper.innerHTML = `<a href="${data.link}" class="btn-secondary" style="margin-top: 28px;text-align: right;">查看世界规则及游玩协议</a>`;
                } else {
                    btnWrapper.innerHTML = ''; // 无链接时隐藏按钮
                }
            }

            // 淡入
            if (mainCard) {
                mainCard.classList.remove('fade-out');
            }

            // 更新右侧激活样式
            sideItems.forEach(item => {
                if (item.getAttribute('data-world') === worldId) {
                    item.classList.add('active');
                } else {
                    item.classList.remove('active');
                }
            });

            // 更新禁用状态（当前激活的世界不可点击，其他可点击）
            updateDisabledStates(worldId);

            // 动画结束，解锁
            setTimeout(() => {
                isAnimating = false;
            }, 300);
        }, 200); // 等待淡出完成（与 CSS transition 时间匹配）
    }

    // 绑定点击事件
    sideItems.forEach(item => {
        item.addEventListener('click', function (e) {
            const worldId = this.getAttribute('data-world');
            // 如果是“更多世界”或当前已经激活（disabled），不执行切换
            if (worldId === 'more') return;
            if (this.classList.contains('disabled')) return;
            switchWorld(worldId);
        });
    });

    // 初始化：默认激活生存世界，并设置禁用状态（生存世界卡片不可点击，“更多世界”不可点击）
    // 先设置“更多世界”永久 disabled
    sideItems.forEach(item => {
        if (item.getAttribute('data-world') === 'more') {
            item.classList.add('disabled');
        }
    });
    // 激活生存世界
    switchWorld('survival');
}