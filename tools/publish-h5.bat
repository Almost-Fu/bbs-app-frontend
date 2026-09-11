@echo off
chcp 65001 >nul
rem ===========================================================================
rem  在 HBuilderX 完成「发行 → 网站-PC Web 或手机 H5」之后，双击本脚本：
rem    1) 校验产物里是否已包含后端域名（onrender）—— 没打包成功会直接拦住
rem    2) 校验产物里是否还残留旧本地存储键（bbs_posts）
rem    3) git add / commit / push（Vercel 会自动部署）
rem  说明：Vercel 发布的是 unpackage/dist/build/web 这个文件夹，
rem        所以「改了源码若不重新打包」，线上永远不会变。
rem ===========================================================================
setlocal
cd /d "%~dp0.."

echo ==== 1. 检查 H5 产物是否已包含后端域名 ====
findstr /s /m /c:"onrender" "unpackage\dist\build\web\assets\*.js" >nul
if errorlevel 1 (
  echo [X] 产物里没有后端域名 —— 说明还没重新打包。
  echo     请先在 HBuilderX：菜单「发行」-^> 「网站-PC Web 或手机 H5」，等编译完成后再运行本脚本。
  pause
  exit /b 1
)
echo [OK] 产物已包含后端地址（onrender）

echo.
echo ==== 2. 检查是否残留旧本地存储键 ====
findstr /s /m /c:"bbs_posts" "unpackage\dist\build\web\assets\*.js" >nul
if not errorlevel 1 (
  echo [!] 仍能搜到 bbs_posts（旧数据层的键名，可能只是被压缩后拼接，不一定代表旧包；
  echo     若线上首次加载就是 8 篇来自数据库的帖子，即为新包，可忽略此提示）
) else (
  echo [OK] 未发现旧本地存储键
)

echo.
echo ==== 3. 提交并推送 ====
git add -A
git commit -m "build: H5 重新打包（全部页面接入数据库 + 头像改图片）"
git push

echo.
echo 完成：Vercel 会在 1 分钟内自动部署。
echo 验证：打开 https://bbs-app-wheat.vercel.app 并按 Ctrl+Shift+R 强刷；
echo       首页应显示 8 篇帖子（含「办公桌面」「50 个前端面试考点」「上半年 5 本书」），
echo       用 demo / demo123456 登录后发帖，管理后台「用户管理」里能看到你的账号。
pause
