# 🏠 贴吧社区（bbs-app）

一个基于 **uni-app + Vue3** 的贴吧/社区类前端练习项目，**页面与交互仿照百度贴吧 App**（帖子信息流、进吧/关注、吧内详情、发布帖子、评论点赞、游客鉴权等）。
纯前端实现，用本地存储（Storage）模拟后端，无需启动服务器即可完整跑通所有功能。

---

## ✨ 技术栈

| 技术 | 说明 |
|---|---|
| uni-app | 一套代码可编译到 H5 / 微信小程序 / App |
| Vue3 | `<script setup>` 组合式 API（ref / computed / watch） |
| JavaScript | 无 TypeScript，逻辑统一封装在数据层 |
| Storage | `uni.getStorageSync / setStorageSync` 模拟后端数据库 |

## 🚀 运行方式

1. 用 **HBuilderX** 打开项目根目录（`bbs-app`）
2. 菜单栏「运行 → 运行到浏览器」即可预览 H5 版
3. 也可「运行到小程序模拟器」验证多端兼容

> 首次运行会自动初始化种子数据（帖子、评论、关注等），见 `utils/store.js`。

## 📁 目录结构

```
bbs-app/
├── App.vue                  # 应用入口（onLaunch 调用 initStore 初始化数据）
├── main.js                  # Vue3 入口（createSSRApp）
├── pages.json               # 页面注册 / 路由 / 全局样式
├── manifest.json            # 应用配置（H5 / 小程序 / App）
├── uni.scss                 # 全局样式变量
├── index.html               # H5 模板
├── pages/                   # 页面
│   ├── home/                # 首页（帖子信息流 + 侧边抽屉）
│   ├── enter/               # 进吧（足迹 / 关注 / 吧单瀑布流）
│   ├── bar/                 # 吧详情（关注 / 吧内帖子）
│   ├── detail/              # 帖子详情（点赞/转发/收藏/评论）
│   ├── publish/             # 发布帖子（多图 / 选吧 / 话题）
│   ├── search/              # 搜索（防抖实时 / 历史 / 高亮）
│   ├── message/             # 消息（点赞 / 回复 / @我）
│   ├── my/                  # 我的（个人中心入口）
│   ├── my-posts/            # 我的帖子
│   ├── favorites/           # 我的收藏
│   ├── profile/             # 编辑资料（昵称 / emoji 头像）
│   ├── settings/            # 设置（清搜索历史 / 重置本地数据）
│   ├── login/ register/     # 登录 / 注册
│   └── index/               # （旧入口，已废弃，未注册）
├── components/
│   ├── tab-bar/             # 底部导航（easycom 免注册，含未读角标）
│   └── post-card/           # 帖子卡片（旧组件，当前未使用）
├── utils/
│   └── store.js             # ★ 数据层：统一封装 Storage 读写
└── static/
    └── images/              # 本地图片素材（posts / bars / avatars）
        └── 说明见「图片素材说明.md」
```

## ✅ 已实现功能

### 帖子
- 首页信息流：单图 / 多图网格 / 图片预览
- 下拉刷新
- 点赞 / 转发 / 收藏（数据全局联动）
- 帖子详情 + 评论 + 评论点赞

### 吧
- 进吧页：足迹、我的关注、瀑布流吧单（展开/收起）
- 吧详情：关注/取关、吧内帖子列表、发帖入口

### 发布
- 标题 + 正文（2000 字实时计数）
- 多图选择（最多 9 张，`chooseImage`）
- 选择贴吧（弹层 + 搜索过滤）
- 话题（#标签）

### 用户
- 注册 / 登录 / 退出 / 编辑资料（昵称、emoji 头像）
- 游客模式：互动操作（关注 / 点赞 / 评论 / 收藏 / 转发 / 发布）自动提示并跳登录页
- 足迹、关注的吧：游客显示「登录后查看」，登录后展示
- 我的帖子 / 我的收藏（登录可见）

### 其他
- 搜索：输入防抖实时搜索、搜索历史（最多 10 条可清空）、热门词、关键词高亮
- 消息中心：点赞 / 回复 / @我 三个分类，进入清零未读角标（`uni.$emit` 联动 tab-bar）
- 设置：清空搜索历史、一键重置全部本地数据

## 🔐 数据层设计（utils/store.js）

用本地存储模拟后端，所有页面共享同一份数据，保证联动。

| Storage Key | 存什么 |
|---|---|
| `bbs_posts` | 帖子（含点赞/转发状态） |
| `bbs_comments` | 评论（按帖子 id 分组） |
| `bbs_favorites` | 收藏的帖子 id |
| `bbs_followed_bars` | 关注的吧 id |
| `bbs_search_history` | 搜索历史 |
| `bbs_users` / `bbs_current_user` | 用户列表 / 当前登录用户 |
| `bbs_unread` | 未读消息数 |

> 重置：`pages/settings/settings.vue`「重置本地数据」，会清空并重新初始化种子数据。

## 🧭 页面路由（pages.json）

| 页面 | 路径 | 入口 |
|---|---|---|
| 首页 | `/pages/home/home` | tab1 |
| 进吧 | `/pages/enter/enter` | tab2 |
| 发布 | `/pages/publish/publish` | tab3（需登录） |
| 消息 | `/pages/message/message` | tab4 |
| 我的 | `/pages/my/my` | tab5 |
| 登录/注册 | `/pages/login/login` `/pages/register/register` | 游客拦截跳转 |
| 吧详情 | `/pages/bar/bar?id=&name=` | 点吧 |
| 帖子详情 | `/pages/detail/detail?id=` | 点帖 |
| 搜索 | `/pages/search/search` | 顶部搜索栏 |
| 我的帖子/收藏/资料/设置 | `my-posts` `favorites` `profile` `settings` | 「我的」内 |

## ⚠️ 说明

- 帖子配图、吧卡片图目前用网络占位图（picsum.photos），可按需替换成 `static/images` 本地图（见「图片素材说明.md」）。
- `components/post-card/` 为早期遗留组件，暂未使用，可删除。
- 本项目为前端练习，无真实后端；数据存于浏览器/小程序本地存储，清除缓存即恢复初始。
