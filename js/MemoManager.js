const MemoManager = {
    memos: [],

    init() {
        // 从本地存储加载备忘录
        const savedMemos = localStorage.getItem('memos');
        if (savedMemos) {
            this.memos = JSON.parse(savedMemos);
            this.renderMemos();
        }
    },

    addMemo() {
        const titleInput = document.getElementById('memoTitle');
        const contentInput = document.getElementById('memoContent');
        const title = titleInput.value.trim();
        const content = contentInput.value.trim();

        if (!title || !content) {
            alert('请输入标题和内容');
            return;
        }

        const memo = {
            id: Date.now(),
            title,
            content,
            date: new Date().toLocaleString()
        };

        this.memos.unshift(memo);
        this.saveMemos();
        this.renderMemos();

        // 清空输入
        titleInput.value = '';
        contentInput.value = '';
    },

    deleteMemo(id) {
        this.memos = this.memos.filter(memo => memo.id !== id);
        this.saveMemos();
        this.renderMemos();
    },

    saveMemos() {
        localStorage.setItem('memos', JSON.stringify(this.memos));
    },

    renderMemos() {
        const memoList = document.getElementById('memoList');
        memoList.innerHTML = this.memos.map(memo => `
            <div class="memo-item">
                <button class="delete-btn" onclick="MemoManager.deleteMemo(${memo.id})">×</button>
                <h3>${this.escapeHtml(memo.title)}</h3>
                <p>${this.escapeHtml(memo.content)}</p>
                <div class="memo-date">${memo.date}</div>
            </div>
        `).join('');
    },

    downloadMemos() {
        if (this.memos.length === 0) {
            alert('没有可下载的备忘录');
            return;
        }

        let mdContent = '# 我的备忘录\n\n';
        
        this.memos.forEach(memo => {
            mdContent += `## ${memo.title}\n`;
            mdContent += `${memo.date}\n\n`;
            mdContent += `${memo.content}\n\n`;
            mdContent += '---\n\n';
        });

        const blob = new Blob([mdContent], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `备忘录_${new Date().toLocaleDateString()}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    async importMemos() {
        const fileInput = document.getElementById('memoFile');
        const file = fileInput.files[0];
        
        if (!file) return;

        try {
            const content = await this.readFile(file);
            const importedMemos = this.parseMdContent(content);
            
            if (importedMemos.length === 0) {
                alert('未找到有效的备忘录内容');
                return;
            }

            // 确认是否合并或替换现有备忘录
            const shouldMerge = confirm('是否将导入的备忘录与现有备忘录合并？\n点击"确定"合并，点击"取消"替换现有备忘录。');
            
            if (shouldMerge) {
                // 合并备忘录，避免重复
                const existingIds = new Set(this.memos.map(memo => memo.id));
                importedMemos.forEach(memo => {
                    if (!existingIds.has(memo.id)) {
                        this.memos.push(memo);
                    }
                });
            } else {
                // 替换现有备忘录
                this.memos = importedMemos;
            }

            this.saveMemos();
            this.renderMemos();
            fileInput.value = ''; // 清空文件输入
            alert('导入成功！');

        } catch (error) {
            console.error('导入失败:', error);
            alert('导入失败：' + error.message);
        }
    },

    // 读取文件内容
    readFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(new Error('文件读取失败'));
            reader.readAsText(file);
        });
    },

    // 解析 Markdown 内容
    parseMdContent(content) {
        const memos = [];
        const sections = content.split('---\n\n');
        
        sections.forEach(section => {
            if (!section.trim()) return;

            const titleMatch = section.match(/^## (.+)\n/);
            const dateMatch = section.match(/^## .+\n(.+)\n\n/);
            
            if (titleMatch && dateMatch) {
                const title = titleMatch[1].trim();
                const date = dateMatch[1].trim();
                const content = section
                    .replace(/^## .+\n.+\n\n/, '') // 移除标题和日期
                    .trim();

                if (title && content) {
                    memos.push({
                        id: Date.now() + Math.random(), // 生成新的唯一ID
                        title,
                        content,
                        date
                    });
                }
            }
        });

        return memos;
    },

    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
}; 