// 全局变量，存储从 API 获取的处罚数据
let penaltyData = [];

// 从 QuickForm API 获取数据
async function fetchPenaltyData() {
    const apiUrl = 'https://quickform.cn/api/1kwd7qm2hy/all';
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        // QuickForm 返回结构: { submissions: [...] }
        if (result.submissions && Array.isArray(result.submissions)) {
            penaltyData = result.submissions.map(item => ({
                // 映射字段，确保与原有数据结构一致
                player: item.player,
                type: item.type,
                reason: item.reason,
                penaltyTime: item.penaltyTime,
                unbanTime: item.unbanTime,
                operator: item.operator,
                status: item.status || 'active',   // 默认 active
                // 可选，保留原始 submitted_at 等
            }));
        } else {
            console.warn('API 返回格式异常，使用空数组', result);
            penaltyData = [];
        }
        return penaltyData;
    } catch (error) {
        console.error('获取处罚数据失败:', error);
        // 可在此处显示错误提示（例如修改 resultsInfo 文本）
        const resultsInfo = document.getElementById('results-info');
        if (resultsInfo) resultsInfo.textContent = '加载数据失败，请稍后重试';
        penaltyData = [];
        return [];
    }
}

// 检查处罚状态的函数（与原逻辑相同）
function checkPenaltyStatus(item) {
    if (item.type === 'warning') {
        return item.status;
    }
    if (item.unbanTime === "永久") {
        return "active";
    }
    if (item.unbanTime === "-" || !item.unbanTime) {
        return "active";
    }
    const unbanDate = new Date(item.unbanTime.replace(' ', 'T') + ':00');
    const now = new Date();
    return now > unbanDate ? "expired" : "active";
}

// 更新所有处罚的计算状态
function updateAllPenaltyStatuses() {
    penaltyData.forEach(item => {
        item.calculatedStatus = checkPenaltyStatus(item);
    });
}

// 更新统计数据（基于当前 penaltyData）
function updateStats() {
    const activePenalties = penaltyData.filter(item => {
        const status = item.calculatedStatus || checkPenaltyStatus(item);
        return status === 'active';
    }).length;
    const today = new Date().toISOString().split('T')[0];
    const todayPenalties = penaltyData.filter(item =>
        item.penaltyTime && item.penaltyTime.split(' ')[0] === today
    ).length;
    const banPenalties = penaltyData.filter(item => {
        const status = item.calculatedStatus || checkPenaltyStatus(item);
        return item.type === 'ban' && status === 'active';
    }).length;
    const mutePenalties = penaltyData.filter(item => {
        const status = item.calculatedStatus || checkPenaltyStatus(item);
        return item.type === 'mute' && status === 'active';
    }).length;

    document.getElementById('active-count').textContent = activePenalties;
    document.getElementById('today-count').textContent = todayPenalties;
    document.getElementById('ban-count').textContent = banPenalties;
    document.getElementById('mute-count').textContent = mutePenalties;
}

// 渲染表格（与原来一致，但数据源改为全局 penaltyData）
function renderTable(data) {
    const tableBody = document.getElementById('penalty-table-body');
    const noResults = document.getElementById('no-results');
    const resultsInfo = document.getElementById('results-info');

    tableBody.innerHTML = '';
    if (data.length === 0) {
        noResults.style.display = 'block';
        resultsInfo.textContent = '找到 0 条匹配的处罚记录';
    } else {
        noResults.style.display = 'none';
        resultsInfo.textContent = `找到 ${data.length} 条处罚记录`;
        data.forEach(item => {
            const row = document.createElement('tr');
            // 玩家名
            const playerCell = document.createElement('td');
            const playerDiv = document.createElement('div');
            playerDiv.className = 'player-name';
            const playerNameSpan = document.createElement('span');
            playerNameSpan.textContent = item.player;
            playerDiv.appendChild(playerNameSpan);
            playerCell.appendChild(playerDiv);
            // 处罚类型
            const typeCell = document.createElement('td');
            const typeSpan = document.createElement('span');
            typeSpan.className = `penalty-type penalty-${item.type}`;
            switch (item.type) {
                case 'ban': typeSpan.textContent = '封禁'; break;
                case 'mute': typeSpan.textContent = '禁言'; break;
                case 'kick': typeSpan.textContent = '踢出群聊'; break;
                case 'warning': typeSpan.textContent = '警告'; break;
                default: typeSpan.textContent = item.type;
            }
            typeCell.appendChild(typeSpan);
            // 处罚原因
            const reasonCell = document.createElement('td');
            reasonCell.textContent = item.reason;
            // 处罚时间
            const timeCell = document.createElement('td');
            timeCell.textContent = item.penaltyTime;
            // 解封时间
            const unbanCell = document.createElement('td');
            unbanCell.textContent = item.unbanTime;
            // 操作员
            const operatorCell = document.createElement('td');
            operatorCell.textContent = item.operator;
            // 状态
            const statusCell = document.createElement('td');
            const currentStatus = item.calculatedStatus || checkPenaltyStatus(item);
            statusCell.className = currentStatus === 'active' ? 'status-active' : 'status-expired';
            statusCell.textContent = currentStatus === 'active' ? '生效中' : '已过期';
            // 组装行
            row.appendChild(playerCell);
            row.appendChild(typeCell);
            row.appendChild(reasonCell);
            row.appendChild(timeCell);
            row.appendChild(unbanCell);
            row.appendChild(operatorCell);
            row.appendChild(statusCell);
            tableBody.appendChild(row);
        });
    }
    updateStats();
}

// 应用筛选（基于全局 penaltyData）
let currentFilteredData = [];
function applyFilters() {
    const searchText = document.getElementById('search-player').value.toLowerCase();
    const selectedType = document.getElementById('filter-type').value;
    const selectedStatus = document.getElementById('filter-status').value;
    const selectedOperator = document.getElementById('filter-operator').value;

    const filtered = penaltyData.filter(item => {
        const matchesSearch = searchText === '' ||
            item.player.toLowerCase().includes(searchText) ||
            (item.reason && item.reason.toLowerCase().includes(searchText));
        const matchesType = selectedType === 'all' || item.type === selectedType;
        const currentStatus = item.calculatedStatus || checkPenaltyStatus(item);
        const matchesStatus = selectedStatus === 'all' || currentStatus === selectedStatus;
        const matchesOperator = selectedOperator === 'all' || item.operator === selectedOperator;
        return matchesSearch && matchesType && matchesStatus && matchesOperator;
    });
    currentFilteredData = filtered;
    renderTable(filtered);
}

// 重置筛选
function resetFilters() {
    document.getElementById('search-player').value = '';
    document.getElementById('filter-type').value = 'all';
    document.getElementById('filter-status').value = 'all';
    document.getElementById('filter-operator').value = 'all';
    applyFilters();
}

// 页面初始化
document.addEventListener('DOMContentLoaded', async function () {
    // 显示加载中
    const resultsInfo = document.getElementById('results-info');
    resultsInfo.textContent = '正在加载数据...';

    // 从 API 拉取数据
    await fetchPenaltyData();
    // 更新所有处罚的实时状态
    updateAllPenaltyStatuses();
    // 初次渲染全部数据
    applyFilters();  // 内部调用 renderTable 和 updateStats

    // 绑定筛选事件
    const searchInput = document.getElementById('search-player');
    const typeFilter = document.getElementById('filter-type');
    const statusFilter = document.getElementById('filter-status');
    const operatorFilter = document.getElementById('filter-operator');
    const resetBtn = document.getElementById('reset-filters');

    searchInput.addEventListener('input', applyFilters);
    typeFilter.addEventListener('change', applyFilters);
    statusFilter.addEventListener('change', applyFilters);
    operatorFilter.addEventListener('change', applyFilters);
    resetBtn.addEventListener('click', resetFilters);

    // 每分钟自动刷新数据（同步最新提交的记录）
    setInterval(async function () {
        await fetchPenaltyData();
        updateAllPenaltyStatuses();
        applyFilters();  // 重新筛选并渲染
    }, 60000);
});