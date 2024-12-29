const HistoryManager = {
    qrHistory: [],
    barcodeHistory: [],

    addToHistory(type, text, dataUrl) {
        const history = type === 'qr' ? this.qrHistory : this.barcodeHistory;
        if (!history.some(item => item.text === text)) {
            history.unshift({
                type,
                text,
                dataUrl,
                timestamp: new Date().toLocaleString()
            });
            if (history.length > 5) history.pop();
            this.updateCodeHistory();
        }
    },

    clearHistory(type) {
        if (type === 'all') {
            this.qrHistory = [];
            this.barcodeHistory = [];
            this.updateCodeHistory();
        }
    },

    updateCodeHistory() {
        const historyDiv = document.getElementById('codeHistory');
        const allHistory = [...this.qrHistory, ...this.barcodeHistory]
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 5);
        
        historyDiv.innerHTML = allHistory.map(item => `
            <div class="history-item">
                <div class="text-info">
                    <div>类型: ${item.type === 'qr' ? '二维码' : '条形码'}</div>
                    <div>文本: ${item.text}</div>
                    <div>时间: ${item.timestamp}</div>
                </div>
                <div class="image-container">
                    <img src="${item.dataUrl}" alt="${item.type === 'qr' ? '历史二维码' : '历史条形码'}">
                    <button class="download-btn" onclick="Utils.downloadImage('${item.dataUrl}', '${item.type === 'qr' ? '二维码' : '条形码'}_${item.text}.png')">下载</button>
                </div>
            </div>
        `).join('');
    }
}; 