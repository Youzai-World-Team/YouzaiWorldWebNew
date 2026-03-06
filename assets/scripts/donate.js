// 捐赠者数据
const donatorsData = [
    { player: "zxabinbina", amount: 50, date: "2025-06-20", note: "服务器启动资金" }
];

// 初始化数据
document.addEventListener('DOMContentLoaded', function () {
    // 渲染捐赠者表格
    renderDonatorsTable(donatorsData);

    // 更新统计数据
    updateDonationStats(donatorsData);

    // 设置搜索功能
    const searchInput = document.getElementById('donator-search');
    searchInput.addEventListener('input', function () {
        filterDonators();
    });

    // 设置筛选功能
    const filterSelect = document.getElementById('amount-filter');
    filterSelect.addEventListener('change', function () {
        filterDonators();
    });
});

// 渲染捐赠者表格
function renderDonatorsTable(donators) {
    const tableBody = document.getElementById('donators-table-body');
    const emptyState = document.getElementById('empty-state');

    // 清空表格
    tableBody.innerHTML = '';

    if (donators.length === 0) {
        // 显示空状态
        tableBody.parentElement.parentElement.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }

    // 隐藏空状态，显示表格
    tableBody.parentElement.parentElement.style.display = 'block';
    emptyState.style.display = 'none';

    // 按捐赠金额降序排列
    const sortedDonators = [...donators].sort((a, b) => b.amount - a.amount);

    // 添加行到表格
    sortedDonators.forEach(donator => {
        const row = document.createElement('tr');

        // 玩家代号
        const playerCell = document.createElement('td');
        playerCell.className = 'player-name';
        playerCell.textContent = donator.player;

        // 捐赠金额
        const amountCell = document.createElement('td');
        amountCell.className = 'donate-amount';
        amountCell.textContent = `¥${donator.amount}`;

        // 捐赠日期
        const dateCell = document.createElement('td');
        dateCell.className = 'donate-date';
        dateCell.textContent = donator.date;

        // 备注
        const noteCell = document.createElement('td');
        noteCell.className = 'donate-note-cell';
        noteCell.textContent = donator.note;

        // 添加到行
        row.appendChild(playerCell);
        row.appendChild(amountCell);
        row.appendChild(dateCell);
        row.appendChild(noteCell);

        // 添加到表格
        tableBody.appendChild(row);
    });
}

// 更新捐赠统计数据
function updateDonationStats(donators) {
    // 总捐赠人数
    document.getElementById('total-donators').textContent = donators.length;

    // 捐赠总额
    const totalAmount = donators.reduce((sum, donator) => sum + donator.amount, 0);
    document.getElementById('total-amount').textContent = `¥${totalAmount.toLocaleString()}`;

    // 平均捐赠额
    const avgDonation = totalAmount / donators.length;
    document.getElementById('avg-donation').textContent = `¥${avgDonation.toFixed(2)}`;
}

// 筛选捐赠者
function filterDonators() {
    const searchTerm = document.getElementById('donator-search').value.toLowerCase();
    const filterValue = document.getElementById('amount-filter').value;

    let filteredDonators = donatorsData.filter(donator => {
        // 搜索条件
        const matchesSearch = searchTerm === '' ||
            donator.player.toLowerCase().includes(searchTerm) ||
            donator.note.toLowerCase().includes(searchTerm);

        // 金额筛选条件
        let matchesFilter = true;
        if (filterValue !== 'all') {
            switch (filterValue) {
                case '0-50':
                    matchesFilter = donator.amount >= 10 && donator.amount <= 50;
                    break;
                case '51-100':
                    matchesFilter = donator.amount >= 51 && donator.amount <= 100;
                    break;
                case '101-250':
                    matchesFilter = donator.amount >= 101 && donator.amount <= 250;
                    break;
                case '251-500':
                    matchesFilter = donator.amount >= 251 && donator.amount <= 500;
                    break;
                case '501+':
                    matchesFilter = donator.amount >= 501;
                    break;
            }
        }

        return matchesSearch && matchesFilter;
    });

    // 重新渲染表格
    renderDonatorsTable(filteredDonators);
}