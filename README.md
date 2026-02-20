# 🌅 传承62 (Legacy 62)
### 极简 · 优雅 · 精准的小组打卡管理系统
### Minimalist · Elegant · Precise Team Check-in Management System

---

## 🌟 项目简介 | Introduction

**传承62** 是一款专为团队协作、早宣晚结设计的全栈打卡应用。它不仅拥有令人愉悦的视觉设计，更在底层逻辑上实现了高精度的时间同步与数据持久化。无论是清晨的奋斗宣言，还是深夜的复盘总结，它都能为您记录每一刻的成长。

**Legacy 62** is a full-stack check-in application designed specifically for team collaboration and daily routines. It combines delightful visual design with high-precision time synchronization and data persistence.

---

## ✨ 核心功能 | Core Features

### 1. 🕒 实时精准时钟 (Real-time Precision Clock)
*   **服务器同步**：自动校准服务器时间，消除客户端系统时钟偏差。
*   **北京时间锁定**：无论服务器身处何处，逻辑判定严格遵循中国标准时间 (UTC+8)。
*   **动态更新**：分钟级实时跳动，无需刷新即可掌握最精准的打卡窗口。

### 2. 🎨 沉浸式视觉设计 (Immersive UI/UX)
*   **动漫风格美学**：精致的流光背景、毛玻璃质感 (Glassmorphism) 与灵动的渐变标题。
*   **响应式适配**：针对移动端触摸体验深度优化，支持微信、Safari 等主流浏览器。
*   **动效反馈**：基于 `motion` 的平滑过渡，让每一次点击都充满仪式感。

### 3. 📊 智能打卡看板与周报 (Intelligent Dashboard & Weekly Report)
*   **多维度统计**：实时显示各小组“早宣”与“晚结”的完成比例。
*   **未打卡追踪**：一键展开小组详情，精准定位“未早宣”或“未晚结”的成员。
*   **周报概览**：新增周报视图，展示过去 7 天的“遵守承诺率”趋势。
*   **交互详情**：点击周报柱状图可查看历史每日的具体未打卡名单。
*   **动态流**：底部实时滚动显示最新的打卡动态，团队氛围一目了然。

### 4. 🔒 稳健的后端架构 (Robust Backend)
*   **轻量持久化**：采用 SQLite 数据库，零配置即可实现数据永久存储。
*   **防重复机制**：严格的打卡判定逻辑，确保每人每天每时段仅能打卡一次。
*   **容错处理**：完善的 API 校验与错误捕获，确保系统在高并发下依然稳定。

---

## 🛠 技术栈 | Tech Stack

*   **Frontend**: React 18, Tailwind CSS, Lucide React, Framer Motion
*   **Backend**: Node.js, Express, Better-SQLite3
*   **Build Tool**: Vite, tsx

---

## 🚀 部署指南 | Deployment Guide

### 1. 环境准备 | Prerequisites
*   **Node.js**: v18.0.0+
*   **Package Manager**: npm or yarn

### 2. 安装与运行 | Installation & Running

#### 中文说明
1. **克隆项目**: `git clone <repo_url>`
2. **安装依赖**: `npm install`
3. **构建前端**: `npm run build`
4. **启动服务**: `npm start` (默认端口 3000)

#### English Instructions
1. **Clone Project**: `git clone <repo_url>`
2. **Install Deps**: `npm install`
3. **Build Frontend**: `npm run build`
4. **Start Server**: `npm start` (Default port: 3000)

### 3. 环境变量 | Environment Variables
*   `PORT`: 服务端口 (Default: 3000)
*   `NODE_ENV`: 运行模式 (Set to `production` for deployment)

---

## 📝 打卡规则 | Check-in Rules

*   **早宣时间 (Morning)**: `06:30 - 10:00`
*   **晚结时间 (Evening)**: `20:00 - 23:30`
*   **判定逻辑**: 系统会自动识别当前时间所属时段，非打卡时段按钮将自动禁用。

---

## 📄 开源协议 | License
Apache-2.0 License. 记录每一天的成长与坚持。
