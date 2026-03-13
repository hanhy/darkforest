# Dark Forest

基于黑暗森林理论的宇宙文明演化模拟游戏。

> "The universe is a dark forest. Every civilization is an armed hunter."

## V1.0 功能

- **宇宙生成**：根据参数在圆形宇宙中随机生成星系，每个星系按概率诞生文明
- **文明演化**：每个时间片，有文明的星系按概率进行演化，文明等级从 0 逐步增长至 10
- **视口控制**：支持鼠标滚轮缩放和拖拽平移，自由浏览宇宙
- **信息展示**：鼠标悬浮星系查看详情（文明等级、演化速度等），右上角 HUD 显示宇宙年龄和轮次
- **参数可调**：通过设置面板调整宇宙半径、星系数量、文明概率、时间片参数等，支持重新开局
- **时间控制**：支持暂停和继续

## 技术栈

- TypeScript + HTML5 Canvas
- Vite

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

浏览器打开 `http://localhost:5173` 即可。

## License

MIT License

## 作者

**hanhy**
