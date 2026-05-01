document.addEventListener('DOMContentLoaded', function () {
    // 初始化轮播
    initHeroSlider();
    // 初始化音乐播放器
    initMusic();
    // 初始化蜜蜂（在轮播背景之上漂浮）
    initFloatingBees();
    // 世界板块交互
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
                '✅ 世界拓展包，新增地形和生物',
                '✅ 遗迹增加，丰富冒险内容',
                '✅ 添加四季变换系统、丰富农夫乐事的种植体验，增强沉浸感'
            ],
            link: 'read_agreements/world_rules&play_agreement/survival'
        },
        creative: {
            title: '创造世界',
            mainImage: 'assets/images/worlds/creative.webp',
            desc: '创造模式，无限资源，飞行权限，让你尽情发挥想象力，建造宏伟建筑或红石机械。',
            features: [
                '✅ 可随意破坏和放置方块，无任何限制',
                '✅ 可测试红石机械和复杂装置，适合技术玩家',
                '✅ 飞行权限，方便建造',
                '✅ 可申请获得 WorldEdit 模组权限，极大提升建筑效率和创造力'
            ],
            link: 'read_agreements/world_rules&play_agreement/creative',
            applyLink: 'apply/creative'
        },
        building: {
            title: '建筑世界',
            mainImage: 'assets/images/worlds/building.webp',
            desc: '专门为建筑爱好者准备的世界，让你专注建筑艺术。',
            features: [
                '✅ 不允许任何人随意破坏，保护建筑作品',
                '✅ 未取得权限的玩家为冒险模式，方便参观',
                '✅ 同样可以申请获得 WorldEdit 模组权限，极大提升建筑效率和创造力',
                '✅ 建筑比赛专区'
            ],
            link: 'read_agreements/world_rules&play_agreement/building',
            applyLink: 'apply/creative'
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
                let buttonsHtml = '';
                if (data.link) {
                    buttonsHtml += `<a href="${data.link}" class="btn-secondary">查看世界规则及游玩协议</a>`;
                }
                if (data.applyLink) {
                    buttonsHtml += `<a href="${data.applyLink}" class="btn-primary">申请权限</a>`;
                }
                if (buttonsHtml) {
                    btnWrapper.innerHTML = `<div style="display: flex; gap: 12px; justify-content: flex-end; flex-wrap: wrap;">${buttonsHtml}</div>`;
                } else {
                    btnWrapper.innerHTML = '';
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

function initMusic() {
    // ----- 音乐列表（请使用本地或长期有效的URL）-----
    const playlist = [
        { name: 'Minecraft', url: 'assets/medias/minecraft.m4a' },
        { name: 'Watcher', url: 'assets/medias/watcher.m4a' }
    ];

    // 播放器状态
    let audio = null;
    let currentIndex = 0;
    let isPlaying = false;
    let consecutiveErrors = 0;
    let pendingPlay = false;          // 用户手动切换时等待播放的标志
    const MAX_CONSECUTIVE_ERRORS = 2;

    // DOM 元素
    const musicToggleBtn = document.getElementById('musicToggleBtn');
    const musicPrevBtn = document.getElementById('musicPrevBtn');
    const musicNextBtn = document.getElementById('musicNextBtn');
    const musicPlaylistBtn = document.getElementById('musicPlaylistBtn');
    const musicPlaylist = document.getElementById('musicPlaylist');
    const playlistItemsUl = document.getElementById('playlistItems');

    if (!musicToggleBtn || !playlistItemsUl) {
        console.warn('音乐播放器所需的 DOM 元素未找到，跳过初始化');
        return;
    }

    // ========== 辅助函数 ==========
    function updateButtonIcon(playing) {
        const playingIcon = document.querySelector('.music-icon.music-playing');
        const pausedIcon = document.querySelector('.music-icon.music-paused');
        if (playingIcon && pausedIcon) {
            playingIcon.style.display = playing ? 'block' : 'none';
            pausedIcon.style.display = playing ? 'none' : 'block';
        }
    }

    let tipShown = false;
    function showMusicTip() {
        if (tipShown) return;
        tipShown = true;
        const tip = document.createElement('div');
        tip.className = 'music-tip';
        tip.innerHTML = '🎵 浏览器限制了自动播放，点击任意位置即可播放背景音乐 🎵';
        document.body.appendChild(tip);
        setTimeout(() => {
            tip.classList.add('fade-out');
            setTimeout(() => tip.remove(), 1000);
        }, 5000);
        const playOnInteraction = function() {
            if (audio && !isPlaying) {
                audio.play().catch(e => console.warn('仍无法播放', e));
            }
            document.removeEventListener('click', playOnInteraction);
            document.removeEventListener('touchstart', playOnInteraction);
        };
        document.addEventListener('click', playOnInteraction);
        document.addEventListener('touchstart', playOnInteraction);
    }

    function updatePlaylistActive() {
        if (!playlistItemsUl) return;
        const items = playlistItemsUl.querySelectorAll('li');
        items.forEach((li, idx) => {
            if (parseInt(li.dataset.index) === currentIndex) {
                li.classList.add('active');
            } else {
                li.classList.remove('active');
            }
        });
    }

    function renderPlaylist() {
        if (!playlistItemsUl) return;
        playlistItemsUl.innerHTML = '';
        playlist.forEach((item, idx) => {
            const li = document.createElement('li');
            li.textContent = item.name;
            li.dataset.index = idx;
            if (idx === currentIndex) li.classList.add('active');
            li.addEventListener('click', () => {
                // 用户点击列表项，手动切换，传入 true
                loadAndPlay(idx, true);
                if (musicPlaylist) musicPlaylist.classList.remove('open');
            });
            playlistItemsUl.appendChild(li);
        });
    }

    // ========== 音频事件处理 ==========
    function onCanPlay() {
        // 如果存在用户手动切换待播放标志，或者当前未播放且音频处于暂停状态
        if (pendingPlay || (!isPlaying && audio && audio.paused)) {
            // 清除待播放标志，防止重复
            pendingPlay = false;
            audio.play().catch(err => {
                console.warn('播放失败', err);
                showMusicTip();
            });
        }
    }

    function onPlay() {
        isPlaying = true;
        updateButtonIcon(true);
        consecutiveErrors = 0;
        pendingPlay = false; // 确保清除标志
    }

    function onPause() {
        isPlaying = false;
        updateButtonIcon(false);
    }

    function onEnded() {
        // 自然结束，自动下一首（不需要用户手势标志）
        playNext(false);
    }

    function onError(e) {
        console.error('音频加载错误:', playlist[currentIndex]?.url, e);
        consecutiveErrors++;
        if (consecutiveErrors <= MAX_CONSECUTIVE_ERRORS) {
            console.warn(`尝试播放下一首（连续错误 ${consecutiveErrors}/${MAX_CONSECUTIVE_ERRORS}）`);
            playNext(false);
        } else {
            console.error('连续错误次数过多，停止自动切换。请检查网络或音乐链接');
            if (audio) {
                audio.pause();
                audio = null;
            }
            isPlaying = false;
            updateButtonIcon(false);
        }
    }

    // ========== 核心播放控制 ==========
    // userInitiated: 是否是用户手动触发的切换（用于区分自动连播）
    function loadAndPlay(index, userInitiated = false) {
        index = (index + playlist.length) % playlist.length;
        // 如果请求的是同一首且正在播放，不做任何操作
        if (index === currentIndex && audio && !audio.paused) {
            return;
        }

        // 完全销毁旧的音频对象
        if (audio) {
            audio.removeEventListener('canplay', onCanPlay);
            audio.removeEventListener('play', onPlay);
            audio.removeEventListener('pause', onPause);
            audio.removeEventListener('ended', onEnded);
            audio.removeEventListener('error', onError);
            audio.pause();
            audio.src = '';
            audio.load();
            audio = null;
        }

        // 更新当前索引
        currentIndex = index;
        const newUrl = playlist[currentIndex].url;

        // 创建全新的音频对象
        audio = new Audio(newUrl);
        audio.volume = 0.5;
        audio.loop = false;

        // 绑定事件
        audio.addEventListener('canplay', onCanPlay);
        audio.addEventListener('play', onPlay);
        audio.addEventListener('pause', onPause);
        audio.addEventListener('ended', onEnded);
        audio.addEventListener('error', onError);

        // 开始加载
        audio.load();

        // 更新UI
        updatePlaylistActive();

        // 关键：如果是用户手动切换，设置待播放标志
        if (userInitiated) {
            pendingPlay = true;
        }
        // 注意：onCanPlay 会根据 pendingPlay 或自动播放条件决定是否播放
    }

    function playNext(userInitiated = true) {
        // 默认用户手动调用下一首（如点击按钮）为 true，自动连播传 false
        loadAndPlay(currentIndex + 1, userInitiated);
    }

    function playPrev() {
        // 上一首一定是用户手动触发
        loadAndPlay(currentIndex - 1, true);
    }

    function togglePlayPause() {
        if (!audio) return;
        if (isPlaying) {
            audio.pause();
        } else {
            // 用户点击播放按钮，属于用户手势，可以直接调用 play()
            audio.play().catch(err => {
                console.warn('播放失败', err);
                showMusicTip();
            });
        }
    }

    // ========== 初始化 & 自动播放（等待加载屏幕消失） ==========
    function initPlayerAndAutoPlay() {
        renderPlaylist();
        // 初始加载第一首，不设置 userInitiated，因为自动播放由 loader 消失后触发
        loadAndPlay(0, false);
    }

    // 监听加载屏幕消失
    const loader = document.querySelector('.loader');
    if (loader) {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.attributeName === 'class' && loader.classList.contains('hidden')) {
                    observer.disconnect();
                    // 加载完成后，如果音频已加载好且未播放，尝试自动播放
                    if (audio && audio.paused && !isPlaying) {
                        audio.play().catch(err => {
                            console.warn('自动播放被阻止', err);
                            showMusicTip();
                        });
                    }
                }
            });
        });
        observer.observe(loader, { attributes: true });
        if (loader.classList.contains('hidden')) {
            observer.disconnect();
            if (audio && audio.paused && !isPlaying) {
                audio.play().catch(err => showMusicTip());
            }
        }
    } else {
        if (audio && audio.paused && !isPlaying) {
            audio.play().catch(err => showMusicTip());
        }
    }

    // ========== 绑定UI事件 ==========
    function bindEvents() {
        if (musicToggleBtn) musicToggleBtn.addEventListener('click', togglePlayPause);
        if (musicPrevBtn) musicPrevBtn.addEventListener('click', playPrev);
        if (musicNextBtn) musicNextBtn.addEventListener('click', () => playNext(true));
        if (musicPlaylistBtn && musicPlaylist) {
            musicPlaylistBtn.addEventListener('click', () => {
                musicPlaylist.classList.toggle('open');
            });
            document.addEventListener('click', (e) => {
                if (!musicPlaylist.contains(e.target) && !musicPlaylistBtn.contains(e.target)) {
                    musicPlaylist.classList.remove('open');
                }
            });
        }
    }

    // 启动播放器
    initPlayerAndAutoPlay();
    bindEvents();
}

/**
 * 在主页轮播区域添加漂浮的蜜蜂
 */
function initFloatingBees() {
    const hero = document.querySelector('.hero');
    if (!hero) return;
    // 防止重复添加
    if (hero.querySelector('.bees-container')) return;

    // 蜜蜂图片路径 (头朝左 和 头朝右)
    const beeImages = [
        'assets/images/Bee1.webp',   // 头朝左
        'assets/images/Bee2.webp'    // 头朝右
    ];

    // 预定义文字周围的雅致位置 (百分比，相对 .hero)
    const positions = [
        { left: '12%', top: '28%' },    // 标题左侧
        { left: '80%', top: '22%' },    // 标题右侧
        { left: '20%', top: '42%' },    // 描述区域左侧
        { left: '68%', top: '48%' },    // 描述区域右侧
        { left: '35%', top: '70%' },    // 按钮左上方
        { left: '62%', top: '68%' },    // 按钮右上方
        { left: '8%', top: '75%' },     // 左下角点缀
        { left: '88%', top: '60%' },    // 右下角漂浮
        { left: '45%', top: '15%' },    // 标题上方高处
        { left: '28%', top: '55%' }     // 中间偏左
    ];

    // 随机挑选 6~8 只不同的蜜蜂（避免过多）
    const beeCount = Math.floor(Math.random() * 3) + 6; // 6 到 8 只
    const shuffledPositions = [...positions];
    // 打乱顺序
    for (let i = shuffledPositions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledPositions[i], shuffledPositions[j]] = [shuffledPositions[j], shuffledPositions[i]];
    }
    const selectedPositions = shuffledPositions.slice(0, beeCount);

    // 创建蜜蜂容器
    const beesContainer = document.createElement('div');
    beesContainer.className = 'bees-container';

    // 生成每只蜜蜂
    selectedPositions.forEach((pos, idx) => {
        const bee = document.createElement('img');
        // 随机挑选蜜蜂朝向图片（让图片看起来方向不同）
        const randomImg = beeImages[Math.floor(Math.random() * beeImages.length)];
        bee.src = randomImg;
        bee.alt = '飞舞的蜜蜂';
        bee.className = 'bee';
        bee.style.left = pos.left;
        bee.style.top = pos.top;
        // 附加随机微小偏移，更显自然
        const xOffset = (Math.random() - 0.5) * 2;   // -1% ~ 1%
        const yOffset = (Math.random() - 0.5) * 2;
        if (xOffset) bee.style.left = `calc(${pos.left} + ${xOffset}%)`;
        if (yOffset) bee.style.top = `calc(${pos.top} + ${yOffset}%)`;
        // 随机动画延迟，使飞舞错落有致
        const animDelay = (Math.random() * 2).toFixed(2) + 's';
        bee.style.animationDelay = animDelay;
        // 极少部分蜜蜂稍微放大缩小，更有生机
        const scale = 0.9 + Math.random() * 0.7
        bee.style.transform = `scale(${scale})`;
        beesContainer.appendChild(bee);
    });

    hero.appendChild(beesContainer);
}