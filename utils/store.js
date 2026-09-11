// ---------------------------------------------------------------------------
// utils/store.js —— 只保留「设备私有状态」
//
//   ★ 数据来源说明（2026-09 数据收口后）：
//     帖子 / 评论 / 贴吧 / 收藏 / 关注 / 足迹 / 互动消息 / 个人资料 …… 全部来自数据库，
//     统一由 utils/api.js 请求（接口清单见 bbs-app-backend/README.md）。
//     本文件只负责「本来就属于这台设备」的两样东西：
//       1) 登录态缓存：token 存在 utils/request.js，这里缓存当前用户信息，避免每进一个页面都请求
//       2) 搜索历史：本机搜索记录（不需要也不适合进数据库）
// ---------------------------------------------------------------------------

const K = {
  searchHistory: 'bbs_search_history',
  currentUser: 'bbs_current_user'
}

// ---------- 初始化（App.vue onLaunch 调用） ----------
// 现在没有「种子数据」要写了：数据都在数据库里，这里只做本地状态的兜底
export function initStore() {
  if (!Array.isArray(uni.getStorageSync(K.searchHistory))) {
    uni.setStorageSync(K.searchHistory, [])
  }
}

// ---------- 登录态（当前用户缓存） ----------
export function getCurrentUser() {
  return uni.getStorageSync(K.currentUser) || null
}
export function setCurrentUser(user) {
  if (user) uni.setStorageSync(K.currentUser, user)
}
export function clearCurrentUser() {
  uni.removeStorageSync(K.currentUser)
}

/** 登录校验：未登录时提示并跳登录页，返回是否已登录 */
export function requireLogin() {
  if (getCurrentUser()) return true
  uni.showToast({ title: '请先登录', icon: 'none' })
  setTimeout(() => {
    uni.navigateTo({ url: '/pages/login/login' })
  }, 500)
  return false
}

// ---------- 搜索历史（本机记录，最多 10 条） ----------
export function getSearchHistory() {
  return uni.getStorageSync(K.searchHistory) || []
}
export function addSearchHistory(kw) {
  const word = String(kw || '').trim()
  if (!word) return
  let list = getSearchHistory().filter((x) => x !== word)
  list.unshift(word)
  if (list.length > 10) list = list.slice(0, 10)
  uni.setStorageSync(K.searchHistory, list)
}
export function clearSearchHistory() {
  uni.setStorageSync(K.searchHistory, [])
}
