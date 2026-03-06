// 文章页面交互功能
document.addEventListener('DOMContentLoaded', function() {
    // 复制服务器地址功能
    const serverAddresses = document.querySelectorAll('.address-value');
    
    serverAddresses.forEach(address => {
        address.addEventListener('click', function() {
            const textToCopy = this.textContent;
            
            // 使用现代 Clipboard API
            navigator.clipboard.writeText(textToCopy).then(() => {
                // 显示复制成功提示
                const originalText = this.textContent;
                this.textContent = '已复制!';
                this.style.backgroundColor = 'rgba(76, 175, 80, 0.2)';
                
                setTimeout(() => {
                    this.textContent = originalText;
                    this.style.backgroundColor = 'rgba(168, 230, 207, 0.2)';
                }, 2000);
            }).catch(err => {
                console.error('复制失败:', err);
                alert('复制失败，请手动选择并复制文本');
            });
        });
        
        // 添加悬停效果
        address.style.cursor = 'pointer';
        address.title = '点击复制';
    });
    
    // 图片灯箱效果
    const articleImages = document.querySelectorAll('.article-image');
    
    articleImages.forEach(img => {
        img.addEventListener('click', function() {
            // 创建灯箱容器
            const lightbox = document.createElement('div');
            lightbox.className = 'lightbox';
            lightbox.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.9);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
                cursor: pointer;
            `;
            
            // 创建图片元素
            const lightboxImg = document.createElement('img');
            lightboxImg.src = this.src;
            lightboxImg.alt = this.alt;
            lightboxImg.style.cssText = `
                max-width: 90%;
                max-height: 90%;
                object-fit: contain;
                border-radius: 10px;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
            `;
            
            // 创建关闭按钮
            const closeBtn = document.createElement('button');
            closeBtn.innerHTML = '×';
            closeBtn.style.cssText = `
                position: absolute;
                top: 20px;
                right: 20px;
                width: 40px;
                height: 40px;
                background: rgba(255, 255, 255, 0.1);
                border: none;
                border-radius: 50%;
                color: white;
                font-size: 30px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: background 0.3s;
            `;
            
            closeBtn.addEventListener('mouseenter', () => {
                closeBtn.style.background = 'rgba(255, 255, 255, 0.2)';
            });
            
            closeBtn.addEventListener('mouseleave', () => {
                closeBtn.style.background = 'rgba(255, 255, 255, 0.1)';
            });
            
            // 添加关闭功能
            const closeLightbox = () => {
                document.body.removeChild(lightbox);
                document.body.style.overflow = 'auto';
            };
            
            closeBtn.addEventListener('click', closeLightbox);
            lightbox.addEventListener('click', (e) => {
                if (e.target === lightbox) {
                    closeLightbox();
                }
            });
            
            // 添加键盘支持
            const handleKeyDown = (e) => {
                if (e.key === 'Escape') {
                    closeLightbox();
                    document.removeEventListener('keydown', handleKeyDown);
                }
            };
            
            // 添加到页面
            lightbox.appendChild(lightboxImg);
            lightbox.appendChild(closeBtn);
            document.body.appendChild(lightbox);
            document.body.style.overflow = 'hidden';
            
            // 添加键盘事件监听
            document.addEventListener('keydown', handleKeyDown);
        });
    });
    
    // 步骤卡片动画
    const stepCards = document.querySelectorAll('.step-card');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1
    });
    
    stepCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        card.style.transitionDelay = `${index * 0.1}s`;
        
        observer.observe(card);
    });
    
    // 奖励项悬停效果增强
    const rewardItems = document.querySelectorAll('.reward-item');
    
    rewardItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.boxShadow = '0 5px 15px rgba(107, 179, 155, 0.3)';
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.boxShadow = 'none';
        });
    });
});