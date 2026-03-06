// 初始化所有带 data-has-option 的按钮：根据当前选中的 radio 设置 href
function setButtonHref(button) {
    const card = button.closest('.download-card');
    if (!card) return;
    const optionsDiv = card.querySelector('.download-options');
    if (!optionsDiv) return;
    const selectedRadio = optionsDiv.querySelector('input[type="radio"]:checked');
    if (!selectedRadio) return;
    const value = selectedRadio.value; // 'default' 或 'none'
    const defaultUrl = button.dataset.urlDefault;
    const noneUrl = button.dataset.urlNone;
    if (value === 'default' && defaultUrl) {
        button.href = defaultUrl;
    } else if (value === 'none' && noneUrl) {
        button.href = noneUrl;
    } else {
        button.href = '#'; // 降级处理
    }
}

// 为所有带选项的卡片绑定 radio change 事件
const optionRadios = document.querySelectorAll('.download-options input[type="radio"]');
optionRadios.forEach(radio => {
    radio.addEventListener('change', function (e) {
        const card = this.closest('.download-card');
        if (!card) return;
        const button = card.querySelector('.btn-primary[data-has-option="true"]');
        if (button) {
            setButtonHref(button);
        }
    });
});

// 初始化所有带选项的按钮的 href
const optionButtons = document.querySelectorAll('.btn-primary[data-has-option="true"]');
optionButtons.forEach(button => {
    setButtonHref(button);
});