// 工具页面特定脚本
document.addEventListener('DOMContentLoaded', function () {
    // 工具分类过滤
    const categoryButtons = document.querySelectorAll('.tool-category-btn');
    const toolItems = document.querySelectorAll('.tool-item');

    categoryButtons.forEach(button => {
        button.addEventListener('click', function () {
            // 更新活动按钮
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');

            const selectedCategory = this.getAttribute('data-category');

            // 过滤工具项
            toolItems.forEach(item => {
                const itemCategories = item.getAttribute('data-categories').split(',');

                if (selectedCategory === 'all' || itemCategories.includes(selectedCategory)) {
                    item.style.display = 'flex';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });

    // 工具项悬停效果增强
    toolItems.forEach(item => {
        item.addEventListener('mouseenter', function () {
            this.style.transform = 'translateY(-8px)';
            this.style.boxShadow = '0 15px 30px rgba(0, 0, 0, 0.12)';
        });

        item.addEventListener('mouseleave', function () {
            this.style.transform = 'translateY(-5px)';
            this.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.1)';
        });
    });

    // 隐藏加载器
    setTimeout(function () {
        const loader = document.querySelector('.loader');
        if (loader) {
            loader.classList.add('hidden');
            setTimeout(() => loader.style.display = 'none', 500);
        }
    }, 800);
});