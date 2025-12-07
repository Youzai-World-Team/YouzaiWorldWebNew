// 服务器动态数据
const trendsData = [
    { date: "2025-11-30 12:57", text: "服务器已经更新到 1.21.124 版本了，功能已经修复完毕，可以正常游玩！", type: "success", icon: "succeed.svg" },
    { date: "2025-11-29 18:57", text: "服务器已经更新到 1.21.124 版本了，但缺失部分功能，正在修复中。当前仍可进入游玩！", type: "update", icon: "updata.svg" },
    { date: "2025-11-29 16:59", text: "服务器升级过程中遇到问题，正在修复，当前无法进入！", type: "warning", icon: "warning.svg" },
    { date: "2025-11-28 18:40", text: "关服维护和更新", type: "info", icon: "info.svg" },
    { date: "2025-11-21 21:20", text: "修复了等级系统的问题，重新设计升级所需的经验值公式", type: "fix", icon: "fix.svg" },
    { date: "2025-11-19 14:25", text: "安装了新的等级系统，配置了新的设置", type: "install", icon: "install.svg" },
    { date: "2025-11-16 01:40", text: "更新并修复了大量版本不对的插件，提升稳定性", type: "success", icon: "succeed.svg" },
    { date: "2025-11-15 20:35", text: "成功将服务端版本更新到 1.21.111 ，同步新特性", type: "update", icon: "updata.svg" },
    { date: "2025-11-10 09:40", text: "卸载了老旧的等级系统", type: "uninstall", icon: "uninstall.svg" },
    { date: "2025-8-16 14:45", text: "成功将服务端版本更新到 1.21.94 ，同步新特性", type: "update", icon: "updata.svg" },
    { date: "2025-7-20 08:45", text: "服务器由只有部分人游玩转向全面公开", type: "info", icon: "info.svg" },
    { date: "2025-6-20 18:50", text: "我们开服啦", type: "info", icon: "info.svg" }
];

// 当前显示的动态数量
let currentDisplayCount = 5;
const initialDisplayCount = 5;
const loadMoreCount = 5;

// 初始化数据
document.addEventListener('DOMContentLoaded', function () {
    // 渲染动态列表
    renderTrendsList();

    // 更新统计数据
    updateTrendsStats();

    // 设置搜索功能
    const searchInput = document.getElementById('trend-search');
    searchInput.addEventListener('input', function () {
        filterTrends();
    });

    // 设置筛选功能
    const filterSelect = document.getElementById('type-filter');
    filterSelect.addEventListener('change', function () {
        filterTrends();
    });

    // 更新加载更多按钮状态
    updateLoadMoreButton();
});

// 渲染动态列表
function renderTrendsList(trendsToShow = null) {
    const trendsList = document.getElementById('trend-list');
    const emptyState = document.getElementById('empty-state');

    // 清空列表
    trendsList.innerHTML = '';

    // 确定要显示的数据
    let displayData;
    if (trendsToShow) {
        displayData = trendsToShow.slice(0, currentDisplayCount);
    } else {
        displayData = trendsData.slice(0, currentDisplayCount);
    }

    if (displayData.length === 0) {
        // 显示空状态
        trendsList.style.display = 'none';
        emptyState.classList.add('active');
        document.querySelector('.trends-load-more').style.display = 'none';
        return;
    }

    // 隐藏空状态，显示列表
    trendsList.style.display = 'block';
    emptyState.classList.remove('active');
    document.querySelector('.trends-load-more').style.display = 'block';

    // 添加动态条目
    displayData.forEach(trend => {
        const trendItem = document.createElement('div');
        trendItem.className = 'trend-item';
        trendItem.setAttribute('data-type', trend.type);

        // 类型对应的中文标签
        const typeLabels = {
            'success': '成功',
            'update': '更新',
            'warning': '警告',
            'info': '信息',
            'fix': '修复',
            'install': '安装',
            'uninstall': '卸载'
        };

        // 类型对应的CSS类
        const typeClasses = {
            'success': 'trend-type-success',
            'update': 'trend-type-update',
            'warning': 'trend-type-warning',
            'info': 'trend-type-info',
            'fix': 'trend-type-fix',
            'install': 'trend-type-install',
            'uninstall': 'trend-type-uninstall'
        };

        trendItem.innerHTML = `
                    <img src="resources/images/${trend.icon}" alt="${typeLabels[trend.type]}" class="trend-icon">
                    <div class="trend-content">
                        <span class="trend-date">${trend.date}</span>
                        <span class="trend-type-badge ${typeClasses[trend.type]}">${typeLabels[trend.type]}</span>
                        <span class="trend-text">${trend.text}</span>
                    </div>
                `;

        trendsList.appendChild(trendItem);
    });

    // 更新加载更多按钮状态
    updateLoadMoreButton(trendsToShow);
}

// 更新统计数据
function updateTrendsStats() {
    // 总动态数
    document.getElementById('total-trends').textContent = trendsData.length;

    // 最近更新日期
    const latestDate = trendsData[0].date.split(' ')[0];
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    if (latestDate === today) {
        document.getElementById('latest-update').textContent = '今天';
    } else if (latestDate === yesterday) {
        document.getElementById('latest-update').textContent = '昨天';
    } else {
        document.getElementById('latest-update').textContent = latestDate;
    }
}

// 筛选动态
function filterTrends() {
    const searchTerm = document.getElementById('trend-search').value.toLowerCase();
    const filterValue = document.getElementById('type-filter').value;

    // 重置显示数量
    currentDisplayCount = initialDisplayCount;

    let filteredTrends = trendsData.filter(trend => {
        // 搜索条件
        const matchesSearch = searchTerm === '' ||
            trend.text.toLowerCase().includes(searchTerm) ||
            trend.date.toLowerCase().includes(searchTerm);

        // 类型筛选条件
        const matchesFilter = filterValue === 'all' || trend.type === filterValue;

        return matchesSearch && matchesFilter;
    });

    // 重新渲染列表
    renderTrendsList(filteredTrends);
}

// 加载更多动态
function loadMoreTrends() {
    const searchTerm = document.getElementById('trend-search').value.toLowerCase();
    const filterValue = document.getElementById('type-filter').value;

    // 获取当前筛选条件下的数据
    let filteredTrends = trendsData.filter(trend => {
        const matchesSearch = searchTerm === '' ||
            trend.text.toLowerCase().includes(searchTerm) ||
            trend.date.toLowerCase().includes(searchTerm);

        const matchesFilter = filterValue === 'all' || trend.type === filterValue;

        return matchesSearch && matchesFilter;
    });

    // 增加显示数量
    currentDisplayCount += loadMoreCount;

    // 重新渲染列表
    renderTrendsList(filteredTrends);
}

// 更新加载更多按钮状态
function updateLoadMoreButton(trendsToShow = null) {
    const loadMoreBtn = document.getElementById('load-more-btn');

    // 确定要检查的数据
    let dataToCheck;
    if (trendsToShow) {
        dataToCheck = trendsToShow;
    } else {
        const searchTerm = document.getElementById('trend-search').value.toLowerCase();
        const filterValue = document.getElementById('type-filter').value;

        dataToCheck = trendsData.filter(trend => {
            const matchesSearch = searchTerm === '' ||
                trend.text.toLowerCase().includes(searchTerm) ||
                trend.date.toLowerCase().includes(searchTerm);

            const matchesFilter = filterValue === 'all' || trend.type === filterValue;

            return matchesSearch && matchesFilter;
        });
    }

    // 如果已显示所有数据，则禁用按钮
    if (currentDisplayCount >= dataToCheck.length) {
        loadMoreBtn.disabled = true;
        loadMoreBtn.textContent = '已显示所有动态';
    } else {
        loadMoreBtn.disabled = false;
        loadMoreBtn.innerHTML = `
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                    加载更多动态
                `;
    }
}

// 重置筛选条件
function resetFilters() {
    document.getElementById('trend-search').value = '';
    document.getElementById('type-filter').value = 'all';
    currentDisplayCount = initialDisplayCount;
    renderTrendsList();
}