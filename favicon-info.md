# Favicon 说明

## 当前状态

浏览器尝试加载 `favicon.ico` 但找不到文件，导致 404 错误。

这不影响功能，但会在控制台显示错误信息。

## 解决方案

### 方法 1：使用 emoji 作为 favicon（最简单）

在 `index.html` 的 `<head>` 部分添加：

```html
<link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🎄</text></svg>">
```

### 方法 2：使用在线 favicon 生成器

1. 访问 https://favicon.io/
2. 选择 "Text" 或 "Emoji"
3. 输入 "🎄" 或其他圣诞图标
4. 下载生成的 `favicon.ico`
5. 放在项目根目录

### 方法 3：忽略这个错误

这个 404 错误不影响任何功能，可以忽略。

## 推荐

使用方法 1（emoji favicon），最简单且效果好。
