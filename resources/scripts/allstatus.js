// 服务器状态监控功能
class ServerStatusMonitor {
    constructor() {
        this.apiUrl = 'https://api.eqad.fun/mcsm/api/services/';
        this.nodeContainer = document.getElementById('statusNodeContainer');
        this.nodes = ['EQAD-003'];
        this.minecraftServer = 'mc.youzaiworld.top';
        //this.minecraftServer = 'suyecity.eqad.fun';
        this.minecraftPort = 25565;
        
        this.init();
    }

    init() {
        this.loadStatus();
        
        // 每5分钟自动刷新
        setInterval(() => this.loadStatus(), 5 * 60 * 1000);
    }

    async loadStatus() {
        // 显示加载状态
        this.showLoading();
        const startTime = Date.now();
        const minimumLoadTime = 2000;

        try {
            // 并行获取节点状态和游戏服务器状态
            const [nodeResponse, minecraftStatus] = await Promise.all([
                fetch(this.apiUrl),
                this.fetchMinecraftServerStatus(this.minecraftServer, this.minecraftPort)
            ]);
            
            const nodeData = await nodeResponse.json();

            const elapsedTime = Date.now() - startTime;
            const remainingTime = Math.max(minimumLoadTime - elapsedTime, 0);

            setTimeout(() => {
                if (nodeData.status === 200 && nodeData.data) {
                    this.renderNodes(nodeData.data, minecraftStatus);
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
                    <h3 class="status-node-title">
                        Youzai World Sever
                        <button class="node-refresh-btn" title="刷新状态" id="cardRefreshBtn" disabled>
                            <img src="resources/images/refresh.svg" alt="刷新">
                        </button>
                    </h3>
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
                    <div class="status-minecraft-section">
                        <div class="status-minecraft-title">游戏状态</div>
                        <div class="minecraft-info-grid">
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

    renderNodes(nodeData, minecraftStatus) {
        const nodeMap = {};
        nodeData.forEach(node => {
            nodeMap[node.nickname] = node;
        });

        this.nodeContainer.innerHTML = this.nodes.map(nodeName => {
            const node = nodeMap[nodeName];
            if (!node) {
                return this.createOfflineNode(nodeName, minecraftStatus);
            }
            return this.createNodeCard(node, minecraftStatus);
        }).join('');
    }

    createNodeCard(node, minecraftStatus) {
        const cpuUsage = (node.system.cpuUsage * 100).toFixed(1);
        const memUsage = (node.system.memUsage * 100).toFixed(1);
        
        return `
            <div class="status-node-card">
                <div class="status-node-header">
                    <h3 class="status-node-title">
                        Youzai World Sever
                        <button class="node-refresh-btn" title="刷新状态" id="cardRefreshBtn" onclick="serverStatusMonitor.loadStatus()">
                            <img src="resources/images/refresh.svg" alt="刷新">
                        </button>
                    </h3>
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
                    ${this.createMinecraftStatusSection(minecraftStatus)}
                </div>
            </div>
        `;
    }

    createOfflineNode(nodeName, minecraftStatus) {
        return `
            <div class="status-node-card">
                <div class="status-node-header">
                    <h3 class="status-node-title">
                        Youzai World Sever
                        <button class="node-refresh-btn" title="刷新状态" id="cardRefreshBtn" onclick="serverStatusMonitor.loadStatus()">
                            <img src="resources/images/refresh.svg" alt="刷新">
                        </button>
                    </h3>
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
                    ${this.createMinecraftStatusSection(minecraftStatus)}
                </div>
            </div>
        `;
    }

    createMinecraftStatusSection(minecraftStatus) {
        if (!minecraftStatus) {
            return `
                <div class="status-minecraft-section">
                    <div class="status-minecraft-title">游戏状态</div>
                    <div class="minecraft-info-grid">
                        ${this.createLoadingItems(2)}
                    </div>
                </div>
            `;
        }

        if (minecraftStatus.online) {
            const players = minecraftStatus.players || { online: 0, max: 0 };
            const version = minecraftStatus.version || '未知版本';
            
            return `
                <div class="status-minecraft-section">
                    <div class="status-minecraft-title">游戏状态</div>
                    <div class="minecraft-info-grid">
                        <div class="minecraft-info-item">
                            <span class="minecraft-info-label">在线玩家</span>
                            <span class="minecraft-info-value minecraft-player-count">${players.online}/${players.max}</span>
                        </div>
                        <div class="minecraft-info-item">
                            <span class="minecraft-info-label">游戏版本</span>
                            <span class="minecraft-info-value minecraft-version">${version}</span>
                        </div>
                    </div>
                </div>
            `;
        } else {
            return `
                <div class="status-minecraft-section">
                    <div class="status-minecraft-title">游戏状态</div>
                    <div class="minecraft-info-grid">
                        <div class="minecraft-info-item">
                            <span class="minecraft-info-label">在线玩家</span>
                             <span class="minecraft-info-value" style="color: #e74c3c;">获取失败</span>
                        </div>
                        <div class="minecraft-info-item">
                            <span class="minecraft-info-label">游戏版本</span>
                             <span class="minecraft-info-value" style="color: #e74c3c;">获取失败</span>
                        </div>
                    </div>
                </div>
            `;
        }
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

    formatTime(timestamp) {
        if (!timestamp) return '-';
        return new Date(timestamp).toLocaleString('zh-CN');
    }

    // 游戏服务器状态获取函数
    async fetchMinecraftServerStatus(host, port) {
        try {
            const response = await fetch(`https://api.eqad.fun/mc-status/ping-mc?host=${host}&port=${port}`);
            if (!response.ok) {
                throw new Error('Network Error');
            }
            const data = await response.json();
            if (data.error) {
                throw new Error(data.error);
            }
            return data;
        } catch (error) {
            return {
                online: false,
                host: host,
                port: port,
                error: error.message
            };
        }
    }
}

// 初始化服务器状态监控
let serverStatusMonitor;
document.addEventListener('DOMContentLoaded', function () {
    serverStatusMonitor = new ServerStatusMonitor();
});