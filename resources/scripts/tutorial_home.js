document.addEventListener('DOMContentLoaded', function () {
    // 教程数据
    const tutorials = [
        {
            id: 1,
            title: "快速游玩指南",
            description: "了解如何快速开始悠哉世界的冒险。",
            image: "resources/images/background_9.webp",
            category: "入门|玩法",
            date: "2025-11-23",
            link: "tutorials/quick_play_guide",
            sticky: true  // 置顶教程
        }
    ];

    // DOM元素
    const tutorialList = document.getElementById('tutorialList');
    const searchInput = document.getElementById('tutorialSearch');
    const resultCount = document.getElementById('resultCount');
    const categoryFilter = document.getElementById('categoryFilter');

    // 获取所有分类（处理多分类）
    function getAllCategories() {
        const allCategories = [];
        
        tutorials.forEach(tutorial => {
            // 使用 "|" 分割分类
            const categories = tutorial.category.split('|').map(cat => cat.trim());
            allCategories.push(...categories);
        });
        
        // 去重并返回
        return [...new Set(allCategories)];
    }

    // 初始化分类筛选器
    function initCategoryFilter() {
        const categories = getAllCategories();
        
        // 添加"全部"选项
        const allOption = document.createElement('option');
        allOption.value = 'all';
        allOption.textContent = '全部分类';
        categoryFilter.appendChild(allOption);
        
        // 添加各个分类选项
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categoryFilter.appendChild(option);
        });
    }

    // 渲染教程列表
    function renderTutorials(tutorialsToRender) {
        tutorialList.innerHTML = '';

        if (tutorialsToRender.length === 0) {
            tutorialList.innerHTML = `
                <div class="empty-state">
                    <h3>未找到相关教程</h3>
                    <p>尝试使用不同的关键词搜索，或选择其他分类~</p>
                </div>
            `;
            resultCount.textContent = '0';
            return;
        }

        resultCount.textContent = tutorialsToRender.length;

        tutorialsToRender.forEach(tutorial => {
            const tutorialElement = document.createElement('div');
            tutorialElement.className = 'tutorial-item';
            
            // 添加置顶标记
            const stickyBadge = tutorial.sticky ? '<span class="sticky-badge">置顶</span>' : '';
            
            // 处理多分类显示
            const categories = tutorial.category.split('|').map(cat => cat.trim());
            const categoryTags = categories.map(cat => `<span class="tutorial-category">${cat}</span>`).join('');
            
            tutorialElement.innerHTML = `
                <div class="tutorial-image">
                    <img src="${tutorial.image}" alt="${tutorial.title}" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMDAgMTYwIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjE2MCIgZmlsbD0iI2VjZjVlMSIvPjx0ZXh0IHg9IjE1MCIgeT0iODAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzMzMyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSI+5paH5Lu25Zu+5YOPPC90ZXh0Pjwvc3ZnPg=='">
                    ${stickyBadge}
                </div>
                <div class="tutorial-content">
                    <h3>${tutorial.title}</h3>
                    <p>${tutorial.description}</p>
                    <div class="tutorial-meta">
                        <div class="tutorial-categories">
                            ${categoryTags}
                        </div>
                        <span>${formatDate(tutorial.date)}</span>
                    </div>
                </div>
            `;

            // 添加点击事件
            tutorialElement.addEventListener('click', () => {
                window.location.href = tutorial.link;
            });

            tutorialList.appendChild(tutorialElement);
        });
    }

    // 格式化日期
    function formatDate(dateString) {
        const date = new Date(dateString);
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    }

    // 筛选教程
    function filterTutorials() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        const selectedCategory = categoryFilter.value;

        let filteredTutorials = tutorials;

        // 按分类筛选
        if (selectedCategory !== 'all') {
            filteredTutorials = filteredTutorials.filter(tutorial => {
                // 使用 "|" 分割分类，然后检查是否包含所选分类
                const categories = tutorial.category.split('|').map(cat => cat.trim());
                return categories.includes(selectedCategory);
            });
        }

        // 按搜索词筛选
        if (searchTerm !== '') {
            filteredTutorials = filteredTutorials.filter(tutorial => {
                // 检查标题、描述和所有分类
                const categories = tutorial.category.split('|').map(cat => cat.trim());
                const categoryMatch = categories.some(cat => cat.toLowerCase().includes(searchTerm));
                
                return tutorial.title.toLowerCase().includes(searchTerm) ||
                       tutorial.description.toLowerCase().includes(searchTerm) ||
                       categoryMatch;
            });
        }

        // 如果没有搜索和筛选条件，则置顶教程排在前面
        const hasNoFilters = searchTerm === '' && selectedCategory === 'all';
        
        if (hasNoFilters) {
            filteredTutorials.sort((a, b) => {
                // 置顶教程排在前面
                if (a.sticky && !b.sticky) return -1;
                if (!a.sticky && b.sticky) return 1;
                // 如果都是置顶或都不是置顶，按日期降序排列
                return new Date(b.date) - new Date(a.date);
            });
        } else {
            // 有筛选条件时，按日期降序排列
            filteredTutorials.sort((a, b) => new Date(b.date) - new Date(a.date));
        }

        renderTutorials(filteredTutorials);
    }

    // 初始化
    function init() {
        initCategoryFilter();
        filterTutorials();
    }

    // 事件监听
    searchInput.addEventListener('input', filterTutorials);
    categoryFilter.addEventListener('change', filterTutorials);

    // 初始化
    init();
});