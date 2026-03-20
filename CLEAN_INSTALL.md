# Clean Install Guide / 清理安装指南

## 🧹 Complete Clean Install / 完整清理安装

```bash
# 1. Delete node_modules and dist
rm -rf node_modules dist

# 2. Pull latest code
git pull origin main

# 3. Reinstall dependencies
npm install

# 4. Start development server
npm run dev
```

## 🌐 Browser Cache / 浏览器缓存

**Important:** Clear browser cache or hard refresh:
- **Chrome/Edge:** `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
- **Firefox:** `Ctrl + F5` (Windows) or `Cmd + Shift + R` (Mac)
- **Safari:** `Cmd + Option + E` then `Cmd + R`

Or open in **Incognito/Private mode** to bypass cache.

## ⚙️ Settings Usage / 设置使用

1. Open settings panel (⚙ button)
2. Adjust "Real Time per Slice" to **0.1**
3. **Click "New Game" button** ← Must do this!
4. Game will restart with new settings

## 📊 Expected Performance / 预期性能

- **10,000 galaxies:** Should run smoothly at 60fps
- **With Dark Forest ON:** Slight slowdown during strike calculations
- **Time setting:** 0.1s = very fast, 5s = slow

## ❓ Still Slow? / 仍然卡顿？

Try reducing galaxy count:
- Set "Number of Galaxies" to **5000** or **3000**
- Click "New Game" to apply

---

**Latest commit:** a934dfb (performance fix)
**Version:** 1.2.0
