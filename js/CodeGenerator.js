const CodeGenerator = {
    generateQR() {
        const text = document.getElementById('codeText').value;
        if (!text) {
            alert('请输入需要生成二维码的文本');
            return;
        }
        
        const qr = qrcode(0, 'L');
        qr.addData(text);
        qr.make();
        const dataUrl = qr.createDataURL(10);
        
        const qrImg = document.getElementById('qrcode');
        qrImg.src = dataUrl;
        qrImg.style.display = 'block';
        document.getElementById('barcode').style.display = 'none';
        
        // 确保显示容器
        const codeDisplay = document.querySelector('.code-display');
        codeDisplay.classList.add('active');
        
        // 添加到历史记录
        HistoryManager.addToHistory('qr', text, dataUrl);
    },

    generateBarcode() {
        const text = document.getElementById('codeText').value;
        if (!text) return;

        const barcodeElement = document.getElementById('barcode');
        const codeDisplay = document.querySelector('.code-display');
        
        // 清空并重置显示状态
        barcodeElement.innerHTML = '';
        barcodeElement.style.display = 'block';
        document.getElementById('qrcode').style.display = 'none';
        codeDisplay.classList.add('active');

        try {
            // 生成条形码
            JsBarcode(barcodeElement, text, {
                format: "CODE128",
                width: 3,
                height: 150,
                displayValue: true,
                fontSize: 20,
                margin: 10,
                background: "#ffffff"
            });

            // 直接从SVG获取数据URL
            const svgData = new XMLSerializer().serializeToString(barcodeElement);
            const svgBlob = new Blob([svgData], {type: 'image/svg+xml;charset=utf-8'});
            const url = URL.createObjectURL(svgBlob);

            // 创建临时图片以获取数据URL
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = barcodeElement.width.baseVal.value;
                canvas.height = barcodeElement.height.baseVal.value;
                const ctx = canvas.getContext('2d');
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0);
                
                const dataUrl = canvas.toDataURL('image/png');
                URL.revokeObjectURL(url);

                // 确保条形码显示
                barcodeElement.style.display = 'block';
                codeDisplay.classList.add('active');

                // 添加到历史记录
                HistoryManager.addToHistory('barcode', text, dataUrl);
            };
            img.src = url;

        } catch (error) {
            console.error('生成条形码出错:', error);
            alert('生成条形码失败，请检查输入文本');
            codeDisplay.classList.remove('active');
        }
    },
}; 