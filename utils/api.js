// ---------------------------------------------------------------------------
// 后端接口封装（★ 所有页面的数据都从这里取，数据只有一个来源：数据库）
//   底层：utils/request.js（uni.request 封装：自动带 token、统一响应体、错误提示）
//   地址：utils/config.js（开发=本地 127.0.0.1:8000，发行=Render 线上域名）
//
//   数据来源说明（2026-09 数据收口后）：
//     · 全部社区数据（帖子 / 评论 / 贴吧 / 收藏 / 关注 / 足迹 / 消息 / 资料）都来自数据库
//     · utils/store.js 只保留「设备私有状态」：登录态 token、当前用户缓存、搜索历史
// ---------------------------------------------------------------------------
import { http, getToken } from './request'
import { resolveImageUrl, API_BASE_URL } from './config'

// ------------------------------- 认证 -------------------------------
/** 登录 → { token, tokenType, expiresIn, user } */
export function apiLogin(username, password) {
  return http.post('/auth/login', { username, password })
}

/** 注册（成功即返回 token，可直接当登录用） */
export function apiRegister({ username, password, nickname, avatar }) {
  return http.post('/auth/register', { username, password, nickname, avatar })
}

/** 当前登录用户（用于校验 token 是否有效）；options 可传 { silent: true } 静默失败 */
export function apiMe(options) {
  return http.get('/auth/me', {}, options)
}

// ------------------------------- 贴吧 -------------------------------
/** 贴吧列表（登录状态下每项带 followed）；顺带缓存吧图供列表页使用 */
export function apiBars(keyword) {
  return http.get('/bars', keyword ? { keyword } : {}).then((bars) => {
    cacheBars(bars)
    return bars
  })
}

/** 贴吧详情（吧页头部：吧名 / 吧主 / 帖数 / 关注数 / 是否已关注） */
export function apiBarDetail(barId) {
  return http.get(`/bars/${barId}`).then((bar) => {
    cacheBars([bar])
    return bar
  })
}

/** 吧内帖子分页 → { bar, list, page, pageSize, total, totalPages, hasMore } */
export function apiBarPosts(barId, params = {}) {
  return http.get(`/bars/${barId}/posts`, { page: 1, pageSize: 10, ...params })
}

/** 记录足迹：我进过这个吧（幂等；失败也不打扰用户） */
export function apiVisitBar(barId) {
  return http.post(`/bars/${barId}/visit`, {}, { silent: true })
}

/** 我关注的吧（需登录） */
export function apiFollowedBars(options) {
  return http.get('/users/me/followed-bars', {}, options)
}

/** 关注贴吧 → { followed: true, followCount } */
export function apiFollowBar(barId) {
  return http.post(`/bars/${barId}/follow`)
}

/** 取消关注贴吧 */
export function apiUnfollowBar(barId) {
  return http.del(`/bars/${barId}/follow`)
}

// ------------------------------- 帖子 -------------------------------
/** 信息流分页 → { list, page, pageSize, total, totalPages, hasMore } */
export function apiPosts(params = {}) {
  return http.get('/posts', { page: 1, pageSize: 10, ...params })
}

/** 帖子详情（后端会顺手把浏览量 +1） */
export function apiPostDetail(postId) {
  return http.get(`/posts/${postId}`)
}

export function apiLikePost(postId) {
  return http.post(`/posts/${postId}/like`)
}
export function apiUnlikePost(postId) {
  return http.del(`/posts/${postId}/like`)
}
export function apiFavoritePost(postId) {
  return http.post(`/posts/${postId}/favorite`)
}
export function apiUnfavoritePost(postId) {
  return http.del(`/posts/${postId}/favorite`)
}

// ------------------------------- 评论 -------------------------------
export function apiComments(postId, params = {}) {
  return http.get(`/posts/${postId}/comments`, { page: 1, pageSize: 50, ...params })
}

/** 发表评论 → 返回新建的评论对象（后端同时把帖子 commentCount +1） */
export function apiAddComment(postId, text) {
  return http.post(`/posts/${postId}/comments`, { text })
}

export function apiLikeComment(commentId) {
  return http.post(`/comments/${commentId}/like`)
}
export function apiUnlikeComment(commentId) {
  return http.del(`/comments/${commentId}/like`)
}

// --------------------------- 转发 ---------------------------
/** 转发帖子 → { id, forwards } */
export function apiForwardPost(postId) {
  return http.post(`/posts/${postId}/forward`)
}

// --------------------------- 我的（后端「我」系列） ---------------------------
/** 我的帖子（分页） */
export function apiMyPosts(params = {}, options) {
  return http.get('/users/me/posts', { page: 1, pageSize: 10, ...params }, options)
}

/** 我的收藏（分页） */
export function apiMyFavorites(params = {}, options) {
  return http.get('/users/me/favorites', { page: 1, pageSize: 10, ...params }, options)
}

/** 我的足迹（进过的吧，含"上次浏览后新增帖数"角标） */
export function apiFootprints(limit = 12, options) {
  return http.get('/users/me/footprints', { limit }, options)
}

/** 修改我的资料（昵称 / 头像）→ 返回最新的用户信息 */
export function apiUpdateMe(payload) {
  return http.patch('/users/me', payload)
}

// --------------------------- 搜索 ---------------------------
/** 搜索帖子（分页） */
export function apiSearch(keyword, params = {}) {
  return http.get('/search', { keyword, page: 1, pageSize: 10, ...params })
}

// --------------------------- 互动消息 ---------------------------
/** 互动消息：type = all / like / reply / mention */
export function apiNotifications(type = 'all', params = {}, options) {
  return http.get('/users/me/notifications', { type, page: 1, pageSize: 20, ...params }, options)
}

/** 未读互动消息数（tab-bar 角标） */
export function apiUnreadCount() {
  return http.get('/users/me/notifications/unread', {}, { silent: true })
}

/** 标记互动消息已读（角标清零） */
export function apiReadNotifications(options) {
  return http.post('/users/me/notifications/read', {}, options)
}

// --------------------------- 发布（multipart 上传） ---------------------------
/**
 * 发布帖子（可带图）—— 走 uni.uploadFile 的 multipart/form-data
 * @param {object} payload
 * @param {number} payload.barId 发到哪个吧
 * @param {string} payload.title
 * @param {string} payload.content
 * @param {string} [payload.tag] 分类标签
 * @param {string[]} [payload.filePaths] 本地图片路径（uni.chooseImage 的 tempFilePaths）
 * @returns {Promise<object>} 新建的帖子（含 id / images）
 */
export function apiCreatePost({ barId, title, content, tag, filePaths = [] }) {
  const token = getToken()
  return new Promise((resolve, reject) => {
    const options = {
      url: `${API_BASE_URL}/posts`,
      name: 'files',
      formData: { barId, title, content, tag: tag || '未分类' },
      header: token ? { Authorization: `Bearer ${token}` } : {},
      timeout: 60000,
      success: (res) => {
        let body = res.data
        try {
          body = typeof body === 'string' ? JSON.parse(body) : body
        } catch (e) {
          uni.showToast({ title: '返回数据解析失败', icon: 'none' })
          return reject(new Error('parse error'))
        }
        if (body && body.code === 0) return resolve(body.data)
        const msg = (body && body.message) || '发布失败'
        uni.showToast({ title: msg, icon: 'none' })
        reject(new Error(msg))
      },
      fail: (err) => {
        uni.showToast({ title: '网络异常，发布失败', icon: 'none' })
        reject(err)
      }
    }
    const paths = (filePaths || []).filter(Boolean)
    if (paths.length === 1) {
      // 单图：filePath + name（各端兼容性最好）
      options.filePath = paths[0]
    } else if (paths.length > 1) {
      // 多图：files 数组（App / H5 都支持）
      options.files = paths.map((p) => ({ name: 'files', uri: p }))
    }
    uni.uploadFile(options)
  })
}

/** 健康检查：App 启动时预热后端（缓解云部署冷启动），失败静默忽略 */
export function apiHealth() {
  return http.get('/health', {}, { silent: true, timeout: 60000 })
}

/**
 * 上传自定义头像（multipart，字段名 file）→ 返回更新后的用户信息
 * 后端会直接把图片地址写进 users.avatar，前端拿到结果同步本机缓存即可
 * @param {string} filePath uni.chooseImage 拿到的本地临时路径
 */
export function apiUploadAvatar(filePath) {
  const token = getToken()
  return new Promise((resolve, reject) => {
    uni.uploadFile({
      url: `${API_BASE_URL}/users/me/avatar`,
      filePath,
      name: 'file',
      header: token ? { Authorization: `Bearer ${token}` } : {},
      timeout: 90000,
      success: (res) => {
        let body = res.data
        try {
          body = typeof body === 'string' ? JSON.parse(body) : body
        } catch (e) {
          uni.showToast({ title: '返回数据解析失败', icon: 'none' })
          return reject(new Error('parse error'))
        }
        if (body && body.code === 0) return resolve(body.data)
        const msg = (body && body.message) || '头像上传失败'
        uni.showToast({ title: msg, icon: 'none' })
        reject(new Error(msg))
      },
      fail: (err) => {
        uni.showToast({ title: '头像上传失败，请稍后重试', icon: 'none' })
        reject(err)
      }
    })
  })
}

// --------------------- 头像（统一使用后端 /static/avatars 下的图片） ---------------------
export const DEFAULT_AVATAR = '/static/avatars/default.png'
export const AVATAR_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8]
  .map((i) => `/static/avatars/avatar-${i}.png`)
  .concat([DEFAULT_AVATAR])

// 便捷再导出：图片地址工具（页面可以直接从 api.js 引入，不必再多引一个 config.js）
export { resolveImageUrl } from './config'

/**
 * 头像地址：数据库里存的是 /static/avatars/xxx.png（相对后端），这里补成完整地址
 * @param {object|string} userOrPath 用户对象（取 avatar）或直接的路径
 */
export function avatarUrl(userOrPath) {
  const raw = typeof userOrPath === 'string' ? userOrPath : (userOrPath && userOrPath.avatar)
  return resolveImageUrl(raw || DEFAULT_AVATAR)
}

// --------------------------- 数据归一化助手 ---------------------------
// 吧图缓存：由 apiBars() / apiBarDetail() 填充，值来自数据库 bars.image
const barImageCache = {}

/** 缓存一批吧图（后端 bars.image，形如 /static/images/bars/前端.jpg） */
export function cacheBars(bars = []) {
  ;(bars || []).forEach((b) => {
    if (b && b.id != null) barImageCache[b.id] = b.img || ''
  })
}

/** 按吧 id 取吧图（取不到返回空字符串，页面用 v-if 兜底） */
export function barImgOf(barId) {
  return barImageCache[barId] || ''
}

/**
 * 把后端返回的帖子整理成页面直接可用的结构：
 *   - images：/uploads/... 这类相对地址补成完整域名（外链原样返回）
 *   - barImg：直接用数据库给的吧图，为空时回落到已缓存的吧图
 */
export function normalizePost(post) {
  if (!post) return post
  return {
    ...post,
    images: (post.images || []).map(resolveImageUrl),
    barImg: post.barImg || barImgOf(post.barId)
  }
}

/** 列表批量归一化 */
export function normalizePosts(list) {
  return (list || []).map(normalizePost)
}
