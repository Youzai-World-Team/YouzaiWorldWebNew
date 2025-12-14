// ECRFLU.js - 增强响应式功能
document.addEventListener('DOMContentLoaded', function() {
    // 页面元素
    const startLevelInput = document.getElementById('start-level');
    const targetLevelInput = document.getElementById('target-level');
    const calculateBtn = document.getElementById('calculate-btn');
    const resetBtn = document.getElementById('reset-btn');
    const inputBtns = document.querySelectorAll('.input-btn');
    
    // 结果元素
    const resultStartLevel = document.getElementById('result-start');
    const resultTargetLevel = document.getElementById('result-target');
    const totalExpElement = document.getElementById('total-exp');
    const avgExpElement = document.getElementById('avg-exp');
    const levelSpanElement = document.getElementById('level-span');
    const lastLevelExpElement = document.getElementById('last-level-exp');
    
    // 从本地存储加载上次的计算结果
    loadFromLocalStorage();
    
    // 使用对数计算避免溢出
    // 计算公式：升级所需经验 = 100 × (1.2^(当前等级/20))
    // 对数形式：log(exp) = log(100) + (level/20) * log(1.2)
    function calculateLevelUpExpLog(level) {
        return Math.log10(100) + (level / 20) * Math.log10(1.2);
    }
    
    // 计算最后一级的实际经验（使用对数反推）
    function calculateLastLevelExp(level) {
        const logExp = calculateLevelUpExpLog(level);
        return Math.pow(10, logExp);
    }
    
    // 使用对数计算总经验 - 避免大数字运算
    function calculateTotalExpLog(startLevel, targetLevel) {
        // 对于小跨度，使用传统方法计算
        if (targetLevel - startLevel <= 1000) {
            return calculateTotalExpTraditional(startLevel, targetLevel);
        }
        
        // 使用积分近似：∫ 100 * 1.2^(x/20) dx 从 startLevel 到 targetLevel
        // 积分结果： (100 * 20 / ln(1.2)) * (1.2^(targetLevel/20) - 1.2^(startLevel/20))
        const C = (100 * 20) / Math.log(1.2);
        const expStart = Math.pow(1.2, startLevel / 20);
        const expTarget = Math.pow(1.2, targetLevel / 20);
        const totalExp = C * (expTarget - expStart);
        
        // 最后一级的经验
        const lastLevelExp = 100 * Math.pow(1.2, (targetLevel - 1) / 20);
        
        return {
            total: totalExp,
            lastLevelExp: lastLevelExp
        };
    }
    
    // 传统计算方法（用于小跨度）
    function calculateTotalExpTraditional(startLevel, targetLevel) {
        let totalExp = 0;
        
        for (let i = startLevel; i < targetLevel; i++) {
            const exp = 100 * Math.pow(1.2, i / 20);
            totalExp += exp;
        }
        
        const lastLevelExp = 100 * Math.pow(1.2, (targetLevel - 1) / 20);
        
        return {
            total: totalExp,
            lastLevelExp: lastLevelExp
        };
    }
    
    // 智能格式化函数 - 处理任何大小的数字
    function formatNumberSmart(num) {
        // 如果是NaN或无穷大，返回0
        if (!isFinite(num)) return "0";
        
        // 处理超大数据 - 使用对数计算
        if (num >= 1e100) {
            return formatExtremelyLargeNumber(num);
        }
        
        // 尝试直接格式化为字符串
        let numStr;
        try {
            numStr = num.toLocaleString('fullwide', {useGrouping: false});
            // 如果包含指数表示，使用自定义格式化
            if (numStr.includes('e') || numStr.includes('E')) {
                return formatScientificNumber(num);
            }
        } catch (e) {
            // 如果失败，使用对数计算
            return formatExtremelyLargeNumber(num);
        }
        
        const length = numStr.length;
        
        // 根据数字长度决定单位
        if (length > 100) {
            return formatExtremelyLargeNumber(num);
        } else if (length > 30) {
            return formatWithUnit(num, 'No', 1e27);
        } else if (length > 27) {
            return formatWithUnit(num, 'Sp', 1e24);
        } else if (length > 24) {
            return formatWithUnit(num, 'Sx', 1e21);
        } else if (length > 21) {
            return formatWithUnit(num, 'Qi', 1e18);
        } else if (length > 18) {
            return formatWithUnit(num, 'Qa', 1e15);
        } else if (length > 15) {
            return formatWithUnit(num, 'T', 1e12);
        } else if (length > 12) {
            return formatWithUnit(num, 'B', 1e9);
        } else if (length > 9) {
            return formatWithUnit(num, 'M', 1e6);
        } else if (length > 6) {
            return formatWithUnit(num, 'K', 1e3);
        } else if (length > 3) {
            // 使用逗号分隔
            return num.toLocaleString('en-US', { maximumFractionDigits: 0 });
        } else {
            // 直接显示
            return Math.round(num).toString();
        }
    }
    
    // 格式化极大数字（使用对数计算）
    function formatExtremelyLargeNumber(num) {
        // 使用对数计算数量级
        const exponent = Math.floor(Math.log10(num));
        const mantissa = num / Math.pow(10, exponent);
        
        // 格式化尾数
        let mantissaStr;
        if (mantissa >= 100) {
            mantissaStr = Math.round(mantissa).toString();
        } else if (mantissa >= 10) {
            mantissaStr = mantissa.toFixed(1);
        } else {
            mantissaStr = mantissa.toFixed(2);
        }
        
        // 移除多余的零
        mantissaStr = mantissaStr.replace(/\.?0+$/, '');
        
        return mantissaStr + 'e' + exponent;
    }
    
    // 格式化科学记数法数字
    function formatScientificNumber(num) {
        // 将科学记数法转换为标准形式
        const str = num.toString();
        const parts = str.split(/[eE]/);
        const mantissa = parseFloat(parts[0]);
        const exponent = parseInt(parts[1] || 0);
        
        // 格式化尾数
        let mantissaStr;
        if (Math.abs(mantissa) >= 100) {
            mantissaStr = Math.round(mantissa).toString();
        } else if (Math.abs(mantissa) >= 10) {
            mantissaStr = mantissa.toFixed(1);
        } else {
            mantissaStr = mantissa.toFixed(2);
        }
        
        // 移除多余的零
        mantissaStr = mantissaStr.replace(/\.?0+$/, '');
        
        return mantissaStr + 'e' + exponent;
    }
    
    // 使用单位格式化
    function formatWithUnit(num, unit, divisor) {
        const value = num / divisor;
        
        if (value >= 1000) {
            // 如果转换后仍然很大，递归处理
            return formatNumberSmart(value) + unit;
        } else if (value >= 100) {
            return Math.round(value) + unit;
        } else if (value >= 10) {
            return value.toFixed(1) + unit;
        } else {
            return value.toFixed(2) + unit;
        }
    }
    
    // 更新结果
    function updateResults() {
        let startLevel = parseInt(startLevelInput.value) || 0;
        let targetLevel = parseInt(targetLevelInput.value) || 1;
        
        // 输入验证
        if (startLevel < 0) {
            startLevel = 0;
            startLevelInput.value = 0;
        }
        
        if (targetLevel <= startLevel) {
            targetLevel = startLevel + 1;
            targetLevelInput.value = targetLevel;
        }
        
        if (targetLevel > 10000) {
            targetLevel = 10000;
            targetLevelInput.value = 10000;
        }
        
        if (startLevel > 9999) {
            startLevel = 9999;
            startLevelInput.value = 9999;
        }
        
        // 计算经验 - 使用对数方法避免溢出
        const result = calculateTotalExpLog(startLevel, targetLevel);
        
        // 更新结果元素
        resultStartLevel.textContent = startLevel;
        resultTargetLevel.textContent = targetLevel;
        totalExpElement.textContent = formatNumberSmart(result.total);
        
        // 计算平均每级经验
        const levelDiff = targetLevel - startLevel;
        const avgExp = levelDiff > 0 ? result.total / levelDiff : 0;
        avgExpElement.textContent = formatNumberSmart(avgExp);
        
        // 更新其他信息
        levelSpanElement.textContent = levelDiff;
        lastLevelExpElement.textContent = formatNumberSmart(result.lastLevelExp);
        
        // 保存到本地存储（只保存小数据）
        if (result.total < 1e15) {
            saveToLocalStorage(startLevel, targetLevel, result.total);
        }
    }
    
    // 保存到本地存储
    function saveToLocalStorage(startLevel, targetLevel, totalExp) {
        const data = {
            startLevel: startLevel,
            targetLevel: targetLevel,
            totalExp: totalExp,
            timestamp: new Date().getTime()
        };
        
        try {
            localStorage.setItem('levelCalculatorData', JSON.stringify(data));
        } catch (e) {
            console.warn('无法保存到本地存储:', e);
        }
    }
    
    // 从本地存储加载
    function loadFromLocalStorage() {
        try {
            const savedData = localStorage.getItem('levelCalculatorData');
            
            if (savedData) {
                const data = JSON.parse(savedData);
                
                // 如果数据是10天内保存的，则加载
                const now = new Date().getTime();
                const oneDay = 10 * 24 * 60 * 60 * 1000;
                
                if (now - data.timestamp < oneDay) {
                    startLevelInput.value = data.startLevel || 0;
                    targetLevelInput.value = data.targetLevel || 10;
                    updateResults();
                    return;
                }
            }
        } catch (e) {
            console.warn('加载保存的数据失败:', e);
        }
        
        // 没有保存的数据或加载失败，使用默认值计算
        updateResults();
    }
    
    // 重置计算器
    function resetCalculator() {
        startLevelInput.value = 0;
        targetLevelInput.value = 10;
        updateResults();
    }
    
    // 输入按钮处理函数
    function handleInputButtonClick() {
        const action = this.getAttribute('data-action');
        const target = this.getAttribute('data-target');
        const input = document.getElementById(target);
        
        let value = parseInt(input.value) || 0;
        
        if (action === 'increase') {
            value++;
        } else if (action === 'decrease') {
            value--;
        }
        
        // 限制最小值
        if (target === 'start-level' && value < 1) value = 1;
        if (target === 'target-level' && value < 2) value = 2;
        
        // 限制最大值
        if (value > 10000) value = 10000;
        
        input.value = value;
        
        // 确保起始等级不超过目标等级
        if (target === 'start-level') {
            const targetLevel = parseInt(targetLevelInput.value) || 1;
            if (value >= targetLevel) {
                targetLevelInput.value = value + 1;
            }
        } else if (target === 'target-level') {
            const startLevel = parseInt(startLevelInput.value) || 0;
            if (value <= startLevel) {
                startLevelInput.value = value - 1;
                if (startLevelInput.value < 0) startLevelInput.value = 0;
            }
        }
        
        updateResults();
        
        // 添加点击反馈
        this.style.transform = 'scale(0.9)';
        setTimeout(() => {
            this.style.transform = '';
        }, 100);
    }
    
    // 触摸设备优化
    function addTouchOptimizations() {
        // 为触摸设备增加更大的点击区域
        if ('ontouchstart' in window || navigator.maxTouchPoints) {
            inputBtns.forEach(btn => {
                btn.style.minHeight = '44px'; // 苹果建议的最小触摸目标尺寸
                btn.style.minWidth = '44px';
            });
            
            calculateBtn.style.minHeight = '44px';
            resetBtn.style.minHeight = '44px';
            
            // 防止双击缩放
            let lastTouchEnd = 0;
            document.addEventListener('touchend', function(event) {
                const now = Date.now();
                if (now - lastTouchEnd <= 300) {
                    event.preventDefault();
                }
                lastTouchEnd = now;
            }, false);
        }
    }
    
    // 键盘导航支持
    function addKeyboardSupport() {
        // 输入框支持回车键计算
        startLevelInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                updateResults();
                targetLevelInput.focus();
            }
        });
        
        targetLevelInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                updateResults();
            }
        });
        
        // 按钮支持空格键和回车键
        calculateBtn.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                updateResults();
            }
        });
        
        resetBtn.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                resetCalculator();
            }
        });
    }
    
    // 事件监听器
    calculateBtn.addEventListener('click', updateResults);
    resetBtn.addEventListener('click', resetCalculator);
    
    // 输入按钮事件
    inputBtns.forEach(btn => {
        btn.addEventListener('click', handleInputButtonClick);
    });
    
    // 窗口大小变化时重新格式化数字
    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(updateResults, 250); // 防抖处理
    });
    
    // 初始化
    addTouchOptimizations();
    addKeyboardSupport();
});