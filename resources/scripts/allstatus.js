// 服务器状态监控功能
class ServerStatusMonitor {
    constructor() {
        this.apiUrl = 'https://api.eqad.fun/mcsm/api/services/';
        this.nodeContainer = document.getElementById('statusNodeContainer');
        this.refreshBtn = document.getElementById('statusRefreshBtn');
        this.nodes = ['EQAD-001'];

        this.init();
    }

    init() {
        this.loadStatus();
        this.refreshBtn.addEventListener('click', () => this.loadStatus());

        // 每5分钟自动刷新
        setInterval(() => this.loadStatus(), 2 * 60 * 1000);
    }

    async loadStatus() {
        // 显示加载状态
        this.showLoading();
        const startTime = Date.now();
        const minimumLoadTime = 2000;

        try {
            const response = await fetch(this.apiUrl);
            const data = await response.json();

            const elapsedTime = Date.now() - startTime;
            const remainingTime = Math.max(minimumLoadTime - elapsedTime, 0);

            setTimeout(() => {
                if (data.status === 200 && data.data) {
                    this.renderNodes(data.data);
                } else {
                    this.showError('无法获取服务器状态数据');
                }
            }, remainingTime);

        } catch (error) {
            console.error('获取服务器状态失败:', error);
            const elapsedTime = Date.now() - startTime;
            const remainingTime = Math.max(minimumLoadTime - elapsedTime, 0);

            setTimeout(() => {
                this.showError('连接服务器失败，请稍后重试');
            }, remainingTime);
        }
    }

    showLoading() {
        this.nodeContainer.innerHTML = this.nodes.map(node => `
            <div class="status-node-card loading">
                <div class="status-node-header">
                    <h3 class="status-node-title">Youzai World Sever</h3>
                    <div class="status-node-status status-loading">
                        <span class="status-indicator loading"></span>
                        获取中...
                    </div>
                </div>
                <div class="status-info-grid">
                    <div class="status-info-section">
                        <div class="status-info-title">系统信息</div>
                        <div class="status-info-items">
                            ${this.createLoadingItems(2)}
                        </div>
                    </div>
                    <div class="status-info-section">
                        <div class="status-info-title">系统资源</div>
                        <div class="status-info-items">
                            ${this.createLoadingItems(2)}
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    createLoadingItems(count) {
        return Array(count).fill(0).map(() => `
            <div class="status-info-item">
                <span class="status-info-label status-loading-text"></span>
                <span class="status-info-value status-loading-text"></span>
            </div>
        `).join('');
    }

    renderNodes(nodeData) {
        const nodeMap = {};
        nodeData.forEach(node => {
            nodeMap[node.nickname] = node;
        });

        this.nodeContainer.innerHTML = this.nodes.map(nodeName => {
            const node = nodeMap[nodeName];
            if (!node) {
                return this.createOfflineNode(nodeName);
            }
            return this.createNodeCard(node);
        }).join('');
    }

    createNodeCard(node) {
        const cpuUsage = (node.system.cpuUsage * 100).toFixed(1);
        const memUsage = (node.system.memUsage * 100).toFixed(1);
        const loadAvg = this.formatLoadAvg(node.system.loadavg);
        return `
            <div class="status-node-card">
                <div class="status-node-header">
                    <h3 class="status-node-title">Youzai World Sever</h3>
                    <div class="status-node-status status-online">
                        <span class="status-indicator online"></span>
                        在线
                    </div>
                </div>
                <div class="status-info-grid">
                    <div class="status-info-section">
                        <div class="status-info-title">系统信息</div>
                        <div class="status-info-items">
                            <div class="status-info-item">
                                <span class="status-info-label">系统类型</span>
                                <span class="status-info-value">${node.system.type}</span>
                            </div>
                            <div class="status-info-item">
                                <span class="status-info-label">更新时间</span>
                                <span class="status-info-value">${this.formatTime(node.timestamp)}</span>
                            </div>
                        </div>
                    </div>
                    <div class="status-info-section">
                        <div class="status-info-title">系统资源</div>
                        <div class="status-info-items">
                            <div class="status-info-item">
                                <span class="status-info-label">CPU 使用率</span>
                                <span class="status-info-value">${cpuUsage}%</span>
                                <div class="status-progress-container">
                                    <div class="status-progress-bar" style="width: ${cpuUsage}%"></div>
                                </div>
                            </div>
                            <div class="status-info-item">
                                <span class="status-info-label">内存使用率</span>
                                <span class="status-info-value">${memUsage}%</span>
                                <div class="status-progress-container">
                                    <div class="status-progress-bar" style="width: ${memUsage}%"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    createOfflineNode(nodeName) {
        return `
            <div class="status-node-card">
                <div class="status-node-header">
                    <h3 class="status-node-title">Youzai World Sever</h3>
                    <div class="status-node-status status-offline">
                        <span class="status-indicator offline"></span>
                        离线
                    </div>
                </div>
                <div class="status-info-grid">
                    <div class="status-info-section">
                        <div class="status-info-title">系统信息</div>
                        <div class="status-info-items">
                            <div class="status-info-item">
                                <span class="status-info-label">系统类型</span>
                                <span class="status-info-value">-</span>
                            </div>
                            <div class="status-info-item">
                                <span class="status-info-label">更新时间</span>
                                <span class="status-info-value">-</span>
                            </div>
                        </div>
                    </div>
                    <div class="status-info-section">
                        <div class="status-info-title">系统资源</div>
                        <div class="status-info-items">
                            <div class="status-info-item">
                                <span class="status-info-label">CPU 使用率</span>
                                <span class="status-info-value">-</span>
                                <div class="status-progress-container">
                                    <div class="status-progress-bar" style="width: 0%"></div>
                                </div>
                            </div>
                            <div class="status-info-item">
                                <span class="status-info-label">内存使用率</span>
                                <span class="status-info-value">-</span>
                                <div class="status-progress-container">
                                    <div class="status-progress-bar" style="width: 0%"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    showError(message) {
        this.nodeContainer.innerHTML = `
            <div class="status-empty">
                <h3>状态获取失败</h3>
                <p>${message}</p>
                <button class="btn-primary" onclick="serverStatusMonitor.loadStatus()">重新加载</button>
            </div>
        `;
    }

    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    formatLoadAvg(loadavg) {
        if (!loadavg || !Array.isArray(loadavg) || loadavg.length < 3) return '-';
        return `${loadavg[0].toFixed(2)}, ${loadavg[1].toFixed(2)}, ${loadavg[2].toFixed(2)}`;
    }

    formatTime(timestamp) {
        if (!timestamp) return '-';
        return new Date(timestamp).toLocaleString('zh-CN');
    }

    getCPUInfo(nodeName) {
        const cpuInfo = {
            'EQAD-001': 'AMD Ryzen 9 9900X'
        };
        return cpuInfo[nodeName] || '-';
    }
}

// 初始化服务器状态监控
let serverStatusMonitor;
document.addEventListener('DOMContentLoaded', function () {
    serverStatusMonitor = new ServerStatusMonitor();
});