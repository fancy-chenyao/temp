@echo off
chcp 65001 >nul
echo ========================================
echo 🎄 圣诞主题页面 - 快速部署工具
echo ========================================
echo.

:menu
echo 请选择部署方式：
echo.
echo 1. 局域网分享（最简单，同一WiFi可访问）
echo 2. 准备 GitHub 部署（创建 Git 仓库）
echo 3. 查看本机 IP 地址
echo 4. 退出
echo.
set /p choice=请输入选项 (1-4): 

if "%choice%"=="1" goto local
if "%choice%"=="2" goto github
if "%choice%"=="3" goto showip
if "%choice%"=="4" goto end

echo 无效选项，请重新选择
echo.
goto menu

:local
echo.
echo ========================================
echo 🌐 启动局域网服务器
echo ========================================
echo.
echo 正在获取本机 IP 地址...
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
    set ip=%%a
    goto :found_ip
)
:found_ip
set ip=%ip:~1%
echo.
echo ✅ 服务器即将启动！
echo.
echo 📱 分享以下地址给同一 WiFi 网络的人：
echo    http://%ip%:8000
echo.
echo 💡 提示：
echo    - 保持此窗口打开
echo    - 按 Ctrl+C 可以停止服务器
echo    - 只有同一 WiFi 网络的人才能访问
echo.
echo ========================================
echo.
pause
echo 正在启动服务器...
python -m http.server 8000 --bind 0.0.0.0
goto end

:github
echo.
echo ========================================
echo 📦 准备 GitHub 部署
echo ========================================
echo.
echo 正在初始化 Git 仓库...
git init
if errorlevel 1 (
    echo ❌ Git 未安装或初始化失败
    echo 请先安装 Git: https://git-scm.com/download/win
    pause
    goto menu
)
echo.
echo 正在添加文件...
git add .
echo.
echo 正在提交...
git commit -m "🎄 Initial commit: Christmas theme page"
echo.
echo ========================================
echo ✅ Git 仓库已准备好！
echo ========================================
echo.
echo 📝 接下来的步骤：
echo.
echo 1. 访问 https://github.com/new 创建新仓库
echo 2. 仓库名称建议：christmas-page
echo 3. 不要勾选任何初始化选项
echo 4. 创建后，复制仓库地址
echo 5. 在此窗口运行以下命令（替换为你的仓库地址）：
echo.
echo    git remote add origin https://github.com/你的用户名/christmas-page.git
echo    git branch -M main
echo    git push -u origin main
echo.
echo 6. 推送成功后，在 GitHub 仓库设置中启用 Pages
echo    Settings → Pages → Source: main branch → Save
echo.
echo 7. 几分钟后访问：
echo    https://你的用户名.github.io/christmas-page/
echo.
echo ========================================
pause
goto menu

:showip
echo.
echo ========================================
echo 🔍 本机 IP 地址
echo ========================================
echo.
ipconfig | findstr /c:"IPv4"
echo.
echo 💡 使用方法：
echo    1. 启动本地服务器（选项 1）
echo    2. 将 IP 地址 + :8000 分享给其他人
echo    例如：http://192.168.1.100:8000
echo.
echo ========================================
pause
goto menu

:end
echo.
echo 👋 感谢使用！祝你部署顺利！
echo.
pause
