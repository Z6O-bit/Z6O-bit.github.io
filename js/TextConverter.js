const TextConverter = {
    // 添加检查彩蛋的方法
    checkEasterEgg(text) {
        if (text.trim() === '作者') {
            this.showEasterEgg();
            return true;
        }
        return false;
    },

    // 显示彩蛋效果
    showEasterEgg() {
        // 创建彩蛋容器
        const easterEgg = document.createElement('div');
        easterEgg.className = 'easter-egg';

        // 创建关闭按钮
        const closeButton = document.createElement('button');
        closeButton.className = 'easter-egg-close';
        closeButton.textContent = '关闭';
        closeButton.onclick = () => {
            document.body.removeChild(easterEgg);
        };

        // 随机颜色数组
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD', '#D4A5A5', '#9B59B6', '#3498DB'];
        
        // 随机动画数组
        const animations = ['scrollText', 'scrollTextReverse', 'scrollDiagonal'];
        
        // 创建多个滚动文本
        for (let i = 0; i < 15; i++) {
            const text = document.createElement('div');
            text.className = 'easter-egg-text';
            text.style.left = `${Math.random() * 80}%`;
            text.style.color = colors[Math.floor(Math.random() * colors.length)];
            text.style.animationDelay = `${Math.random() * 2}s`;
            text.style.animationDuration = `${2 + Math.random() * 3}s`;
            text.style.animationName = animations[Math.floor(Math.random() * animations.length)];
            text.style.animationIterationCount = 'infinite';
            text.style.animationTimingFunction = 'linear';
            text.textContent = '张浩 666';
            easterEgg.appendChild(text);
        }

        // 添加头像元素
        for (let i = 0; i < 5; i++) {
            const avatar = document.createElement('img');
            avatar.className = 'easter-egg-avatar';
            avatar.src = 'img/头像.jpg';  // 确保路径正确
            avatar.style.left = `${Math.random() * 80}%`;
            avatar.style.animationDelay = `${Math.random() * 2}s`;
            avatar.style.animationDuration = `${3 + Math.random() * 2}s`;
            avatar.style.animationName = animations[Math.floor(Math.random() * animations.length)];
            avatar.style.animationIterationCount = 'infinite';
            avatar.style.animationTimingFunction = 'linear';
            easterEgg.appendChild(avatar);
        }

        easterEgg.appendChild(closeButton);
        document.body.appendChild(easterEgg);

        // 添加点击效果
        easterEgg.addEventListener('click', (e) => {
            if (e.target === easterEgg) {
                const text = document.createElement('div');
                text.className = 'easter-egg-text';
                text.style.left = `${e.clientX}px`;
                text.style.top = `${e.clientY}px`;
                text.style.color = colors[Math.floor(Math.random() * colors.length)];
                text.style.animationDelay = '0s';
                text.style.animationDuration = '2s';
                text.style.animationName = animations[Math.floor(Math.random() * animations.length)];
                text.style.animationIterationCount = 'infinite';
                text.style.animationTimingFunction = 'linear';
                text.textContent = '张浩 666';
                easterEgg.appendChild(text);
            }
        });
    },

    convertToSnake() {
        const text = document.getElementById('text').value;
        if (this.checkEasterEgg(text)) return;
        
        const result = text.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase();
        document.getElementById('convertResult').textContent = result;
    },

    convertToCamel() {
        const text = document.getElementById('text').value;
        if (this.checkEasterEgg(text)) return;
        
        const components = text.split('_');
        const result = components[0] + components.slice(1)
            .map(x => x.charAt(0).toUpperCase() + x.slice(1))
            .join('');
        document.getElementById('convertResult').textContent = result;
    },

    async translate() {
        const text = document.getElementById('text').value;
        if (this.checkEasterEgg(text)) return;
        
        if (!text) return;

        const targetLang = document.getElementById('targetLang').value;
        const resultDiv = document.getElementById('convertResult');
        resultDiv.innerHTML = '<div class="loading"></div>';

        try {
            // 检查配置是否存在
            if (!CONFIG || !CONFIG.BAIDU_TRANSLATE || !CONFIG.BAIDU_TRANSLATE.APPID || !CONFIG.BAIDU_TRANSLATE.KEY) {
                throw new Error('翻译服务未配置，请参考 config.example.js 配置翻译服务');
            }
            
            const appid = CONFIG.BAIDU_TRANSLATE.APPID;
            const key = CONFIG.BAIDU_TRANSLATE.KEY;
            const salt = new Date().getTime();
            const sign = CryptoJS.MD5(appid + text + salt + key).toString();
            
            // 使用JSONP方式请求
            await new Promise((resolve, reject) => {
                // 创建一个唯一的回调函数名
                const callbackName = 'baiduTranslateCallback_' + Math.random().toString(36).substr(2, 9);
                
                // 创建全局回调函数
                window[callbackName] = function(response) {
                    // 清理：删除script标签和回调函数
                    document.body.removeChild(script);
                    delete window[callbackName];
                    
                    if (response.error_code) {
                        reject(new Error(response.error_msg));
                    } else {
                        resolve(response);
                    }
                };

                // 创建script标签
                const script = document.createElement('script');
                script.src = `https://api.fanyi.baidu.com/api/trans/vip/translate?` +
                    `q=${encodeURIComponent(text)}` +
                    `&from=auto` +
                    `&to=${targetLang}` +
                    `&appid=${appid}` +
                    `&salt=${salt}` +
                    `&sign=${sign}` +
                    `&callback=${callbackName}`;
                
                // 处理脚本加载错误
                script.onerror = () => {
                    document.body.removeChild(script);
                    delete window[callbackName];
                    reject(new Error('网络请求失败'));
                };

                // 添加script标签到页面
                document.body.appendChild(script);

                // 设置超时处理
                setTimeout(() => {
                    if (window[callbackName]) {
                        document.body.removeChild(script);
                        delete window[callbackName];
                        reject(new Error('请求超时'));
                    }
                }, 10000);
            }).then(response => {
                if (response.trans_result && response.trans_result[0]) {
                    resultDiv.textContent = response.trans_result[0].dst;
                } else {
                    throw new Error('翻译结果格式错误');
                }
            });

        } catch (error) {
            console.error('翻译出错:', error);
            resultDiv.textContent = `翻译失败: ${error.message}`;
        }
    }
}; 