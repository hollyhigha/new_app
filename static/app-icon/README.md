# App Logo 素材说明

本目录存放 App 图标的源文件及按平台切好的各尺寸，供 HBuilderX 打包和应用商店上架使用。

## 设计说明

- App 名称：**靓人科普**
- 主视觉：女性侧脸 + 翻开的书本（寓意"人 + 科普"）
- 主色：柔粉渐变 `#FDE7EC → #E8B4B8`，线条 `#8B4A5C`
- 风格：圆角方形、扁平极简、专业温暖，弱化商业感

## 文件清单

| 文件 | 用途 |
| --- | --- |
| `app-logo-1024.png` | **主源文件**（1024×1024），HBuilderX 自动生成图标用 |
| `app-logo-v3-original.png` | AI 原始输出（1376×768，横版），留档备查 |
| `app-logo-v1.png` | 第一版带内框设计（已弃用），留档备查 |
| `ios/icon-*.png` | iOS 各尺寸图标（120/180/152/167/87/80/60/58/40） |
| `android/icon-*.png` | Android 各密度图标（48/72/96/144/192） |
| `store/app-store-1024.png` | App Store 上架用 1024×1024 |
| `store/play-store-512.png` | Google Play 上架用 512×512 |
| `splash/splash-2732.png` | 启动图（2732×2732，AI 直接生成、全画布无缝渐变） |
| `splash/splash-source.png` | 启动图 AI 原始输出，留档 |

另外项目根 `static/logo.png` 已同步替换为新 logo（1024×1024），供 App 内部页面（如"关于"页）使用。

## HBuilderX 打包配置（推荐方式）

### 一、应用图标

1. 打开 HBuilderX，点击 `manifest.json`
2. 左侧选择 **App图标配置**
3. 点击 **浏览...** → 选择 `static/app-icon/app-logo-1024.png`
4. 点击 **自动生成所有图标并替换**
5. HBuilderX 会自动生成 iOS/Android 所有尺寸到 `unpackage/res/icons/`，并写入 manifest.json

### 二、启动图（Splash Screen）

1. 同样在 `manifest.json` 中，左侧选择 **App启动界面配置**
2. 勾选 **Android 平台启动界面使用 storyboard** / **iOS 平台启动界面使用 storyboard**
3. 点击 **浏览...** → 选择 `static/app-icon/splash/splash-2732.png`
4. 点击 **自动生成所有启动图**

> 说明：iOS 新版（iOS 13+）和 Android 新版启动界面都推荐使用 storyboard 方式，HBuilderX 会自动适配刘海屏/全面屏。

## 应用商店上架素材

| 平台 | 文件 | 尺寸要求 |
| --- | --- | --- |
| App Store Connect | `store/app-store-1024.png` | 1024×1024 PNG，无 Alpha 通道 |
| Google Play Console | `store/play-store-512.png` | 512×512 PNG |
| 华为/小米/OPPO/vivo 应用市场 | `app-logo-1024.png` | 各家要求不同，通常 512×512 即可 |

## 后续如需调整

1. 只修改 `app-logo-1024.png`（源文件），然后：
   - 重跑批量生成脚本（见下方）
   - 或直接在 HBuilderX 里重新"自动生成所有图标"

### 批量重生成脚本（macOS / sips）

```bash
cd static/app-icon
# iOS
for s in 40 58 60 80 87 120 152 167 180; do
  sips -z $s $s app-logo-1024.png --out ios/icon-$s.png
done
# Android
for s in 48 72 96 144 192; do
  sips -z $s $s app-logo-1024.png --out android/icon-$s.png
done
# 商店
cp app-logo-1024.png store/app-store-1024.png
sips -z 512 512 app-logo-1024.png --out store/play-store-512.png
# 启动图（重新生成时，建议直接用 AI 生成一张全画布渐变，再裁为正方形；
# 不要用 sips 的 padding 方式，会出现内外色差接缝）
sips -c 768 768 splash/splash-source.png --out splash/_sq.png
sips -z 2732 2732 splash/_sq.png --out splash/splash-2732.png
rm splash/_sq.png
```
