const TabManager = {
    currentTab: 0,
    tabs: ['textConvert', 'codeGen', 'memo', 'flappyBird'],
    tabNames: {
        textConvert: '文本转换',
        codeGen: '生成码',
        memo: '备忘录',
        flappyBird: '管道鸟'
    },

    openTab(evt, tabName) {
        const tabcontent = document.getElementsByClassName("tabcontent");
        for (let i = 0; i < tabcontent.length; i++) {
            tabcontent[i].style.display = "none";
        }
        
        const tablinks = document.getElementsByClassName("tablinks");
        for (let i = 0; i < tablinks.length; i++) {
            tablinks[i].className = tablinks[i].className.replace(" active", "");
        }
        
        document.getElementById(tabName).style.display = "block";
        if (evt) evt.currentTarget.className += " active";

        // 更新当前页面名称
        const pageTitle = document.querySelector('.page-title');
        if (pageTitle) {
            pageTitle.textContent = this.tabNames[tabName];
        }

        // 更新滑动提示
        this.updateSwipeHint();
    },

    updateSwipeHint() {
        const prevTab = (this.currentTab - 1 + this.tabs.length) % this.tabs.length;
        const nextTab = (this.currentTab + 1) % this.tabs.length;
        document.querySelector('.swipe-left').textContent = `← ${this.tabNames[this.tabs[prevTab]]}`;
        document.querySelector('.swipe-right').textContent = `${this.tabNames[this.tabs[nextTab]]} →`;
    },

    initSwipe() {
        let startX;
        const container = document.querySelector('.container');

        container.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
        });

        container.addEventListener('touchend', (e) => {
            const endX = e.changedTouches[0].clientX;
            const diffX = endX - startX;

            if (Math.abs(diffX) > 50) { // 检测滑动距离
                if (diffX > 0) {
                    this.currentTab = (this.currentTab - 1 + this.tabs.length) % this.tabs.length;
                } else {
                    this.currentTab = (this.currentTab + 1) % this.tabs.length;
                }
                this.openTab(null, this.tabs[this.currentTab]);
            }
        });
    }
};

document.addEventListener("DOMContentLoaded", function() {
    TabManager.initSwipe();
    TabManager.openTab(null, TabManager.tabs[TabManager.currentTab]);
}); 