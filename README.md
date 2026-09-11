# 🏠 贴吧社区（bbs-app-frontend）

一个基于 **uni-app + Vue3** 的贴吧/社区前端项目，**页面与交互仿照百度贴吧 App**（帖子信息流、进吧/关注、吧内详情、发布帖子、评论点赞、互动消息、游客鉴权等）。
**数据全部来自后端**：FastAPI 接口（部署在 Render）+ MySQL（Aiven 云数据库）；本机只保留登录态与搜索历史。
配套仓库：`bbs-app-backend`（接口服务）、`bbs-admin-web`（管理后台）。

---

## ✨ 技术栈

| 技术 | 说明 |
|---|---|
| uni-app | 一套代码可编译到 H5 / 微信小程序 / App |
| Vue3 | `<script setup>` 组合式 API（ref / computed / watch） |
| JavaScript | 无 TypeScript，接口调用统一封装在 `utils/api.js` |
| 后端接口 | FastAPI（Render），统一响应体 `{code, message, data}` |
| 数据库 | MySQL（Aiven 云库），表结构见 `bbs-app-backend/sql/bbs_schema.sql` |

## 🚀 运行方式

1. 用 **HBuilderX** 打开项目根目录（`bbs-app-frontend`）
2. 菜单栏「运行 → 运行到浏览器」即可预览 H5 版
3. 也可「运行到小程序模拟器」验证多端兼容

> 数据来自后端接口：本地联调先启动 `bbs-app-backend`（`python main.py` → 127.0.0.1:8000）；
> H5 / APK 发行时用的是 `utils/config.js` 里的线上地址（Render）。

## 📁 目录结构

```
bbs-app-frontend/
├── App.vue                  # 应用入口（onLaunch 调用 initStore 初始化本机状态）
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
│   └── login/ register/     # 登录 / 注册
├── components/
│   ├── tab-bar/             # 底部导航（easycom 免注册，含未读角标）
│   └── post-card/           # 帖子卡片（旧组件，当前未使用）
├── utils/
│   ├── config.js            # ★ 后端地址（本地 / 线上只改这一个文件）
│   ├── request.js           # uni.request 封装：带 token、统一响应体、错误提示
│   ├── api.js               # ★ 所有接口（帖子/吧/评论/收藏/关注/足迹/消息/资料/发图）
│   └── store.js             # 只存"设备私有状态"：登录态缓存 + 搜索历史
└── static/
    └── images/              # 本地图片素材（bars：吧图 / avatars：头像 / posts：帖子图）
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
- 消息中心：点赞 / 回复 / @我 三个分类（消息由后端按真实互动聚合），进入即标记已读
- 设置：清空搜索历史、清除本机缓存（含退出登录）

## 🔐 数据来源（只有一个：数据库）

App 端**所有会变化的数据都由后端接口提供**，页面不再读写本地"假数据"：

| 数据 | 接口 | 落在哪张表 |
|---|---|---|
| 帖子信息流 / 详情 / 搜索 | `GET /api/posts`、`/api/posts/{id}`、`/api/search` | `posts`、`post_images` |
| 发布帖子（含多图上传） | `POST /api/posts`（multipart） | `posts`、`post_images` |
| 点赞 / 收藏 / 转发 | `POST|DELETE /api/posts/{id}/like`、`/favorite`、`POST /forward` | `likes`、`favorites`、`posts.forward_count` |
| 评论 / 评论点赞 | `GET|POST /api/posts/{id}/comments`、`/api/comments/{id}/like` | `comments`、`likes` |
| 贴吧列表 / 吧内帖子 / 吧详情 | `GET /api/bars`、`/api/bars/{id}/posts`、`/api/bars/{id}` | `bars`、`posts` |
| 关注吧 / 足迹 | `POST|DELETE /api/bars/{id}/follow`、`POST /api/bars/{id}/visit`、`GET /api/users/me/footprints` | `follows`、`footprints` |
| 我的帖子 / 我的收藏 | `GET /api/users/me/posts`、`/api/users/me/favorites` | `posts`、`favorites` |
| 互动消息（点赞 / 回复 / @我） | `GET /api/users/me/notifications`（+ `unread`、`read`） | 由 `likes`、`comments` 聚合 |
| 编辑资料 | `PATCH /api/users/me` | `users` |
| 登录 / 注册 / 当前用户 | `POST /api/auth/login`、`/register`、`GET /api/auth/me` | `users` |

本机 Storage 只保留「设备私有状态」，这些**不进数据库**：

| Storage Key | 存什么 |
|---|---|
| `bbs_token` | 登录 token（`utils/request.js` 自动加到请求头） |
| `bbs_current_user` | 当前用户缓存（首屏秒开，随后用 `/auth/me` 刷新） |
| `bbs_search_history` | 搜索历史（本机记录，最多 10 条） |

> 设置页「清除本机缓存（含登录状态）」= 清空上面这三项；**服务器上的帖子、收藏、关注等不受影响**。

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

- 头像统一用后端 `/static/avatars/` 下的图片（数据库 `users.avatar` 里存的就是这些路径）；接口层会拒绝 emoji 头像（传 emoji 返回 422）。
- 演示帖的配图用网络占位图（picsum.photos），需联网加载；吧图用 `static/images/bars` 下的本地图（数据库 `bars.image` 里存的就是这些路径）。
- `components/post-card/` 为早期遗留组件，暂未使用，可删除。
- 数据全部由数据库提供：清除浏览器缓存只会清掉**登录态与搜索历史**，帖子、收藏、关注、足迹都在服务器上。
- 上传到后端的真实图片落在 Render 的磁盘上（免费实例是临时盘，重新部署会丢）；数据库里只存图片地址。
