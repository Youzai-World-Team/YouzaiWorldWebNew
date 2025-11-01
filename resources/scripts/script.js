document.addEventListener('DOMContentLoaded', function () {
    // 导航栏切换
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navbar = document.querySelector('.navbar');

    if (navToggle) {
        navToggle.addEventListener('click', function () {
            const isOpening = !navMenu.classList.contains('active');

            navMenu.classList.toggle('active');
            this.classList.toggle('active');

            // 菜单打开时强制显示背景色
            if (isOpening) {
                navbar.classList.add('menu-open');
            } else {
                // 菜单关闭时根据滚动位置决定是否显示背景色
                navbar.classList.remove('menu-open');
                if (window.scrollY > 50) {
                    navbar.classList.add('scrolled');
                } else {
                    navbar.classList.remove('scrolled');
                }
            }
        });
    }

    // 点击菜单项后关闭菜单
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function () {
            if (window.innerWidth <= 768) {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
                navbar.classList.remove('menu-open');

                // 关闭菜单后根据滚动位置设置背景色
                if (window.scrollY > 50) {
                    navbar.classList.add('scrolled');
                } else {
                    navbar.classList.remove('scrolled');
                }
            }
        });
    });

    // 平滑滚动
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });

    // 导航栏滚动效果
    window.addEventListener('scroll', function () {
        // 如果菜单是打开的，不处理背景色变化
        if (navMenu && navMenu.classList.contains('active')) {
            return;
        }

        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
            navbar.style.padding = '15px 0';
        } else {
            navbar.classList.remove('scrolled');
            navbar.style.padding = '20px 0';
        }
    });

    // 页面加载时检查滚动位置
    window.dispatchEvent(new Event('scroll'));

    // 点击特效
    document.addEventListener('click', function (e) {
        const clickEffect = document.createElement('div');
        clickEffect.className = 'click-effect';
        clickEffect.style.left = e.clientX + 'px';
        clickEffect.style.top = e.clientY + 'px';
        document.body.appendChild(clickEffect);

        setTimeout(() => {
            clickEffect.remove();
        }, 600);
    });

    // 表单提交
    const joinForm = document.querySelector('.join-form form');
    if (joinForm) {
        joinForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const emailInput = this.querySelector('input[type="email"]');
            if (emailInput.value) {
                alert('感谢您的订阅！我们会将最新消息发送到：' + emailInput.value);
                emailInput.value = '';
            }
        });
    }

    // 加入服务器按钮
    const joinButton = document.querySelector('.btn-primary');
    if (joinButton) {
        joinButton.addEventListener('click', function () {
            alert('服务器IP: play.greenworld.com\n版本: 1.19.2\n欢迎加入绿野仙境！');
        });
    }

    // 了解更多按钮
    const learnMoreButton = document.querySelector('.btn-secondary');
    if (learnMoreButton) {
        learnMoreButton.addEventListener('click', function () {
            document.querySelector('#features').scrollIntoView({
                behavior: 'smooth'
            });
        });
    }

    // 加载动画
    window.addEventListener('load', function () {
        const loader = document.querySelector('.loader');
        const loadStartTime = Date.now();
        const minimumLoadTime = 500;

        function hideLoader() {
            loader.classList.add('hidden');
            loader.addEventListener('transitionend', function () {
                loader.style.display = 'none';
            }, { once: true });
        }

        const elapsedTime = Date.now() - loadStartTime;

        if (elapsedTime >= minimumLoadTime) {
            hideLoader();
        } else {
            setTimeout(hideLoader, minimumLoadTime - elapsedTime);
        }
    });
});