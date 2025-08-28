const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

// 数据文件的路径（用户数据目录，确保可写入）
const dataPath = path.join(app.getPath('userData'), 'checkin-data.json');

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 1400,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js') // 使用预加载脚本
        }
    });

    mainWindow.loadFile('index.html');
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});

// 监听来自页面的“读取数据”请求
ipcMain.handle('load-data', () => {
    try {
        if (fs.existsSync(dataPath)) {
            const rawData = fs.readFileSync(dataPath, 'utf8');
            const parsedData = JSON.parse(rawData);
            return parsedData;
        }
    } catch (error) {
        console.error('读取数据失败:', error);
    }
    return []; // 如果文件不存在或出错，返回空数组
});

// 监听来自页面的“保存数据”请求
ipcMain.on('save-data', (event, data) => {
    try {
        // 确保目录存在
        const dir = path.dirname(dataPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
        console.error('保存数据失败:', error);
    }
});

// 获取数据文件路径（用于调试）
ipcMain.handle('get-data-path', () => {
    return dataPath;
});