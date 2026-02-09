/**
 * 下载页面交互功能
 */

document.addEventListener('DOMContentLoaded', function() {
    // 下载按钮点击效果
    const downloadButtons = document.querySelectorAll('.download-btn');
    downloadButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            // 添加点击效果
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 200);
        });
    });

    // 渲染器说明展开/收起
    const rendererNote = document.querySelector('.renderer-note');
    if (rendererNote && window.innerWidth < 768) {
        const rendererHeading = rendererNote.querySelector('h3');
        const rendererContent = rendererNote.querySelector('ul, p');
        
        if (rendererHeading && rendererContent) {
            rendererContent.style.display = 'none';
            rendererHeading.style.cursor = 'pointer';
            
            rendererHeading.addEventListener('click', () => {
                if (rendererContent.style.display === 'none') {
                    rendererContent.style.display = 'block';
                    rendererHeading.querySelector('.fa').classList.replace('fa-exclamation-triangle', 'fa-chevron-down');
                } else {
                    rendererContent.style.display = 'none';
                    rendererHeading.querySelector('.fa').classList.replace('fa-chevron-down', 'fa-exclamation-triangle');
                }
            });
        }
    }

    // 平台切换效果
    const platformHeaders = document.querySelectorAll('.platform-header');
    platformHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const platformSection = header.closest('.download-section');
            const packageGrid = platformSection.querySelector('.package-grid');
            
            if (packageGrid) {
                // 切换显示/隐藏
                if (packageGrid.style.display === 'none') {
                    packageGrid.style.display = 'grid';
                    header.style.borderBottom = '1px solid rgba(168, 230, 207, 0.3)';
                } else {
                    packageGrid.style.display = 'none';
                    header.style.borderBottom = 'none';
                }
            }
        });
    });

    // 添加点击特效
    document.addEventListener('click', function(e) {
        const clickEffect = document.querySelector('.click-effect');
        if (clickEffect) {
            clickEffect.style.left = e.pageX + 'px';
            clickEffect.style.top = e.pageY + 'px';
            clickEffect.style.animation = 'none';
            void clickEffect.offsetWidth; // 触发重排
            clickEffect.style.animation = 'clickEffect 0.6s ease-out forwards';
        }
    });
});