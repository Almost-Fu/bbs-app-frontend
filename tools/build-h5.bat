@echo off
chcp 65001 >nul
rem ===========================================================================
rem  命令行打包 H5（产物与 HBuilderX「发行 → 网站-PC Web 或手机 H5」完全一致）
rem
rem  用法：双击本脚本即可；完成后再双击 tools\publish-h5.bat 提交发布。
rem  原理：HBuilderX 自带 uni/vite 编译器，本脚本用「临时 package.json +
rem        临时 vite.config.js + node_modules 目录联接」把它跑起来，
rem        产物直接写入 unpackage/dist/build/web（Vercel 发布的就是这个目录）。
rem  说明：临时文件用完即删、联接用完即撤，不会污染项目，也不影响 HBuilderX 使用。
rem ===========================================================================
setlocal
cd /d "%~dp0.."
set "PROJ=%CD%"
set "HBX=D:\学习资料\HBuilderX\plugins\uniapp-cli-vite"

if not exist "%HBX%\node_modules\.bin\uni.cmd" (
  echo [X] 没找到 HBuilderX 的编译器：%HBX%
  echo     如果 HBuilderX 装在别的地方，请修改本脚本里的 HBX 变量。
  pause
  exit /b 1
)
set "PATH=D:\nodejs;%PATH%"

echo ==== 1. 放置临时构建配置 ====
copy /y "tools\h5-build\package.json" "package.json" >nul
copy /y "tools\h5-build\vite.config.js" "vite.config.js" >nul

echo ==== 2. 准备依赖链接（项目 node_modules 指向 HBuilderX 自带依赖）====
if not exist "node_modules\@dcloudio" (
  if exist "node_modules" rmdir "node_modules"
  mklink /J "node_modules" "%HBX%\node_modules" >nul
)

echo ==== 3. 编译中（大约 30~60 秒，请稍等）====
set "UNI_PLATFORM=h5"
set "NODE_ENV=production"
set "UNI_INPUT_DIR=%PROJ%"
set "UNI_OUTPUT_DIR=%PROJ%\unpackage\dist\build\web"
set "UNI_HBUILDERX_PLUGINS=D:\学习资料\HBuilderX\plugins"
"%HBX%\node_modules\.bin\uni.cmd" build -p h5

echo ==== 4. 清理临时文件 ====
del /q "package.json" "vite.config.js" 2>nul
rmdir "node_modules" 2>nul

echo ==== 5. 校验产物是否带上后端地址 ====
findstr /s /m /c:"onrender" "unpackage\dist\build\web\assets\*.js" >nul
if errorlevel 1 (
  echo [X] 产物里没有后端地址 —— 构建可能失败，请看上面的编译输出。
  pause
  exit /b 1
)
echo [OK] 打包完成：unpackage\dist\build\web 已更新，且产物包含后端地址。
echo      下一步：双击 tools\publish-h5.bat 提交并发布到 Vercel。
pause
