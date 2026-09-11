// ---------------------------------------------------------------------------
// 后端接口封装（核心页面使用）
//   底层：utils/request.js（uni.request 封装：自动带 token、统一响应体、错误提示）
//   地址：utils/config.js（开发=本地 127.0.0.1:8000，发行=Render 线上域名）
//
//   覆盖范围（B 方案）：登录注册、首页信息流、帖子详情、评论、帖子点赞/收藏、关注贴吧
//   未接后端的页面（进吧瀑布流、发布、消息、我的帖子/收藏等）继续使用 utils/store.js 的本地数据
// ---------------------------------------------------------------------------
import { http } from './request'
import { resolveImageUrl } from './config'
import { getBars } from './store'

// ------------------------------- 认证 -------------------------------
/** 登录 → { token, tokenType, expiresIn, user } */
export function apiLogin(username, password) {
  return http.post('/auth/login', { username, password })
}

/** 注册（成功即返回 token，可直接当登录用） */
export function apiRegister({ username, password, nickname, avatar }) {
  return http.post('/auth/register', { username, password, nickname, avatar })
}

/** 当前登录用户（用于校验 token 是否有效） */
export function apiMe() {
  return http.get('/auth/me')
}

// ------------------------------- 贴吧 -------------------------------
/** 贴吧列表（登录状态下每项带 followed） */
export function apiBars(keyword) {
  return http.get('/bars', keyword ? { keyword } : {})
}

/** 我关注的吧（需登录） */
export function apiFollowedBars() {
  return http.get('/users/me/followed-bars')
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

// --------------------------- 数据归一化助手 ---------------------------
/** 按吧 id 取前端本地吧图（后端吧图的 image 字段可能为空） */
export function barImgOf(barId) {
  const bar = getBars().find((b) => b.id === barId)
  return bar ? bar.img : ''
}

/**
 * 把后端返回的帖子整理成页面直接可用的结构：
 *   - images：/uploads/... 这类相对地址补成完整域名（外链原样返回）
 *   - barImg：后端为空时回落到前端本地吧图，保证卡片上的吧标好看
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
