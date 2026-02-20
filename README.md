# 晨曦晚露 - 极简打卡程序

这是一个基于 React + Express + SQLite 构建的精美打卡程序，专为小组早宣晚结设计。

## 🚀 快速开始

### 1. 环境准备
确保您的服务器已安装 [Node.js](https://nodejs.org/) (建议 v18 或更高版本)。

### 2. 下载代码
将代码上传到您的服务器或通过 GitHub 克隆：
```bash
git clone <您的仓库地址>
cd <项目目录>
```

### 3. 安装依赖
在项目根目录下运行：
```bash
npm install
```

### 4. 运行程序

#### 开发模式
```bash
npm run dev
```

#### 生产模式 (部署建议)
首先构建前端资源：
```bash
npm run build
```
然后启动服务器：
```bash
# 使用 tsx 直接运行 (推荐)
npx tsx server.ts

# 或者设置环境变量运行
export NODE_ENV=production
npx tsx server.ts
```

## 🛠 部署到 GitHub 步骤

1. **创建仓库**：在 GitHub 上创建一个新的私有或公开仓库。
2. **初始化本地仓库**：
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```
3. **推送到 GitHub**：
   ```bash
   git remote add origin <您的仓库URL>
   git branch -M main
   git push -u origin main
   ```

## 📱 设备兼容性
- **手机端**：完美适配 iOS (Safari) 和 Android (Chrome/微信浏览器)。使用了响应式布局和触摸优化。
- **电脑端**：适配所有主流浏览器 (Chrome, Edge, Firefox, Safari)。
- **动态效果**：标题渐变和背景流光效果使用了标准的 CSS3 动画，具备良好的跨设备兼容性。

## 📝 注意事项
- **数据库**：程序会自动在根目录创建 `checkin.db` 文件。
- **端口**：默认运行在 `3000` 端口，您可以根据需要在 `server.ts` 中修改。
- **时间**：程序内部逻辑已锁定中国标准时间 (UTC+8)，无论服务器位于何处，打卡时间判定均以北京时间为准。
