// utils/store.js
// 统一数据层：用本地存储（Storage）模拟后端，所有页面共享同一份数据，保证数据联动。

// ---------- 初始贴吧列表（img：吧图 / 吧 logo，位于 static/images/bars/） ----------
const BARS = [
  { id: 1, icon: '💻', name: '前端吧', img: '/static/images/bars/前端.jpg' },
  { id: 2, icon: '🍜', name: '美食吧', img: '/static/images/bars/美食.jpg' },
  { id: 3, icon: '🎮', name: '游戏吧', img: '/static/images/bars/游戏.jpg' },
  { id: 4, icon: '🎬', name: '电影吧', img: '/static/images/bars/电影.jpg' },
  { id: 5, icon: '📚', name: '读书吧', img: '/static/images/bars/读书.jpg' },
  { id: 6, icon: '🎵', name: '音乐吧', img: '/static/images/bars/音乐.jpg' },
  { id: 7, icon: '⚽', name: '足球吧', img: '/static/images/bars/足球.jpg' },
  { id: 8, icon: '🚀', name: '科技吧', img: '/static/images/bars/科技.jpg' },
  { id: 9, icon: '📷', name: '摄影吧', img: '/static/images/bars/摄影.jpg' },
  { id: 10, icon: '🎸', name: '吉他吧', img: '/static/images/bars/吉他.jpg' },
  { id: 11, icon: '🐱', name: '养猫吧', img: '/static/images/bars/养猫.jpg' },
  { id: 12, icon: '🏃', name: '跑步吧', img: '/static/images/bars/跑步.jpg' },
  { id: 13, icon: '🍰', name: '烘焙吧', img: '/static/images/bars/烘焙.jpg' },
  { id: 14, icon: '🔨', name: '手工吧', img: '/static/images/bars/手工.jpg' },
  { id: 15, icon: '🎣', name: '钓鱼吧', img: '/static/images/bars/钓鱼.jpg' },
  { id: 16, icon: '✈️', name: '旅游吧', img: '/static/images/bars/旅游.jpg' }
]

// ---------- 初始足迹（登录用户默认展示，游客为空） ----------
const DEFAULT_FOOTPRINTS = [
  { id: 1, icon: '💻', name: '前端吧', badge: 3 },
  { id: 2, icon: '🍜', name: '美食吧', badge: 0 },
  { id: 3, icon: '🎮', name: '游戏吧', badge: 5 },
  { id: 4, icon: '🎬', name: '电影吧', badge: 0 },
  { id: 5, icon: '📚', name: '读书吧', badge: 2 },
  { id: 6, icon: '🎵', name: '音乐吧', badge: 0 },
  { id: 7, icon: '⚽', name: '足球吧', badge: 1 }
]

// ---------- 初始帖子 ----------
const DEFAULT_POSTS = [
  {
    id: 1, barId: 1, barIcon: '💻', barName: '前端吧', tag: '技术交流',
    author: '前端小白', authorAvatar: '🧑‍💻', time: '3小时前',
    title: '自学前端半年，终于拿到 offer 了！',
    content: '从零开始学 HTML/CSS/JS，再到 Vue3，一路踩坑无数，分享几点心得给同样在路上的你……',
    images: ['https://picsum.photos/seed/bbs1/640/360'],
    likes: 128, commentCount: 45, forwards: 12, liked: false
  },
  {
    id: 2, barId: 2, barIcon: '🍜', barName: '美食吧', tag: '探店',
    author: '干饭人', authorAvatar: '🍜', time: '5小时前',
    title: '周末探店：这家螺蛳粉真的绝了',
    content: '汤底浓郁，酸笋给得超多，加个炸蛋直接封神。坐标学校后街第二条巷子……',
    images: ['https://picsum.photos/seed/bbs2/400/400', 'https://picsum.photos/seed/bbs3/400/400', 'https://picsum.photos/seed/bbs4/400/400'],
    likes: 86, commentCount: 30, forwards: 6, liked: false
  },
  {
    id: 3, barId: 3, barIcon: '🎮', barName: '游戏吧', tag: '攻略',
    author: '摸鱼达人', authorAvatar: '🧑', time: '昨天',
    title: '新赛季上分阵容推荐，亲测好用',
    content: '这套阵容稳吃鸡，前期运营思路简单，适合和我一样的休闲玩家……',
    images: ['https://picsum.photos/seed/bbs5/640/400'],
    likes: 233, commentCount: 98, forwards: 40, liked: false
  },
  {
    id: 4, barId: 4, barIcon: '🎬', barName: '电影吧', tag: '推荐',
    author: '电影迷', authorAvatar: '🎬', time: '昨天',
    title: '推荐几部值得二刷的冷门高分电影',
    content: '都是豆瓣 8.5 以上的冷门佳作，周末片荒的可以收藏了慢慢看……',
    images: [],
    likes: 156, commentCount: 52, forwards: 28, liked: false
  },
  {
    id: 5, barId: 1, barIcon: '💻', barName: '前端吧', tag: '求助',
    author: '爱码仕', authorAvatar: '👩', time: '6小时前',
    title: 'Vue3 的 computed 和 watch 到底什么时候用哪个？',
    content: '最近在重构项目，经常纠结该用 computed 还是 watch。有没有大佬能给个清晰的判断标准？',
    images: [],
    likes: 56, commentCount: 28, forwards: 3, liked: false
  },
  {
    id: 6, barId: 1, barIcon: '💻', barName: '前端吧', tag: '闲聊',
    author: '摸鱼达人', authorAvatar: '🧑', time: '昨天',
    title: '分享一下我的办公桌面，全是快乐',
    content: '机械键盘 + 双屏 + 升降桌，摸鱼也要摸得有仪式感。桌面摆件越看越舒服。',
    images: ['https://picsum.photos/seed/b3/400/300', 'https://picsum.photos/seed/b4/400/300', 'https://picsum.photos/seed/b5/400/300'],
    likes: 201, commentCount: 67, forwards: 8, liked: false
  },
  {
    id: 7, barId: 1, barIcon: '💻', barName: '前端吧', tag: '资源分享',
    author: '代码搬运工', authorAvatar: '👧', time: '2天前',
    title: '整理了 50 个前端面试高频考点，需要的自取',
    content: '涵盖 HTML/CSS/JS/Vue/网络/算法几大模块，每个考点都附了简短答案，适合面试前突击。',
    images: ['https://picsum.photos/seed/b6/400/300'],
    likes: 432, commentCount: 89, forwards: 156, liked: true
  },
  {
    id: 8, barId: 5, barIcon: '📚', barName: '读书吧', tag: '书单',
    author: '读书人', authorAvatar: '📖', time: '3天前',
    title: '2026 上半年读过最值得推荐的 5 本书',
    content: '从小说到社科，每一本都认真读完了，附上简单书评，书荒的同学可以参考。',
    images: ['https://picsum.photos/seed/b7/400/300'],
    likes: 98, commentCount: 21, forwards: 15, liked: false
  }
]

// ---------- 初始评论（种子评论） ----------
const DEFAULT_COMMENTS = {
  1: [
    { id: 101, author: '爱码仕', authorAvatar: '👩', text: '恭喜恭喜，太励志了！', time: '2小时前', likes: 12, liked: false },
    { id: 102, author: '摸鱼达人', authorAvatar: '🧑', text: '求分享简历模板，蹲一个！', time: '1小时前', likes: 3, liked: false }
  ],
  7: [
    { id: 103, author: '前端小白', authorAvatar: '🧑‍💻', text: '正好需要，感谢整理！', time: '1天前', likes: 8, liked: false }
  ]
}

// ---------- 存储 key ----------
const K = {
  posts: 'bbs_posts',
  comments: 'bbs_comments',
  favorites: 'bbs_favorites',
  followedBars: 'bbs_followed_bars',
  searchHistory: 'bbs_search_history',
  unread: 'bbs_unread',
  users: 'bbs_users',
  currentUser: 'bbs_current_user'
}

// ---------- 初始化（App onLaunch 调用） ----------
export function initStore() {
  const posts = uni.getStorageSync(K.posts)
  if (!Array.isArray(posts) || posts.length === 0) {
    uni.setStorageSync(K.posts, DEFAULT_POSTS)
  }
  // 评论的存储结构是 { [postId]: comment[] }：缺失，或类型异常（被写成数组 / 空字符串）时才重新写入种子数据
  const comments = uni.getStorageSync(K.comments)
  const commentsValid = !!comments && typeof comments === 'object' && !Array.isArray(comments)
  if (!commentsValid) {
    uni.setStorageSync(K.comments, DEFAULT_COMMENTS)
  }
  if (!Array.isArray(uni.getStorageSync(K.favorites))) {
    uni.setStorageSync(K.favorites, [])
  }
  if (!Array.isArray(uni.getStorageSync(K.followedBars))) {
    uni.setStorageSync(K.followedBars, [1, 2, 3])
  }
  if (!Array.isArray(uni.getStorageSync(K.searchHistory))) {
    uni.setStorageSync(K.searchHistory, [])
  }
  if (typeof uni.getStorageSync(K.unread) !== 'number') {
    uni.setStorageSync(K.unread, 3)
  }
}

// ---------- 帖子 ----------
// 给帖子补上对应吧的吧图（barImg），兼容本地旧数据里没有该字段的情况
function withBarImg(p) {
  const b = BARS.find(x => x.id === p.barId)
  return b ? { ...p, barImg: b.img } : p
}
export function getPosts() {
  const posts = uni.getStorageSync(K.posts)
  if (Array.isArray(posts) && posts.length > 0) return posts.map(withBarImg)
  // 兜底：数据未初始化或为空时，返回默认帖子
  return DEFAULT_POSTS.map(withBarImg)
}
function savePosts(posts) {
  uni.setStorageSync(K.posts, posts)
}
export function getPost(id) {
  return getPosts().find(p => p.id === id)
}
export function getPostsByBar(barId) {
  return getPosts().filter(p => p.barId === barId)
}
export function addPost(post) {
  const posts = getPosts()
  posts.unshift(post)
  savePosts(posts)
}
export function likePost(id) {
  const posts = getPosts()
  const p = posts.find(x => x.id === id)
  if (!p) return null
  p.liked = !p.liked
  p.likes += p.liked ? 1 : -1
  savePosts(posts)
  return p
}
export function forwardPost(id) {
  const posts = getPosts()
  const p = posts.find(x => x.id === id)
  if (!p) return null
  p.forwards += 1
  savePosts(posts)
  return p
}

export function searchPosts(keyword) {
  const kw = keyword.trim().toLowerCase()
  if (!kw) return []
  return getPosts().filter(p =>
    p.title.toLowerCase().includes(kw) ||
    p.content.toLowerCase().includes(kw) ||
    p.author.toLowerCase().includes(kw) ||
    p.barName.includes(kw)
  )
}

// ---------- 收藏 ----------
export function getFavorites() {
  return uni.getStorageSync(K.favorites) || []
}
export function isFavorite(id) {
  return getFavorites().includes(id)
}
export function toggleFavorite(id) {
  let favs = getFavorites()
  if (favs.includes(id)) {
    favs = favs.filter(x => x !== id)
  } else {
    favs.unshift(id)
  }
  uni.setStorageSync(K.favorites, favs)
  return favs.includes(id)
}
export function getFavoritePosts() {
  const favs = getFavorites()
  return getPosts().filter(p => favs.includes(p.id))
}

// ---------- 足迹 / 关注吧 ----------
export function getFootprints() {
  if (!getCurrentUser()) return []
  return DEFAULT_FOOTPRINTS
}
export function getFollowedBars() {
  if (!getCurrentUser()) return []
  return uni.getStorageSync(K.followedBars) || []
}
export function isFollowedBar(barId) {
  return getFollowedBars().includes(barId)
}
export function toggleFollowBar(barId) {
  let bars = getFollowedBars()
  if (bars.includes(barId)) {
    bars = bars.filter(x => x !== barId)
  } else {
    bars.push(barId)
  }
  uni.setStorageSync(K.followedBars, bars)
  return bars.includes(barId)
}

// ---------- 评论 ----------
export function getComments(postId) {
  const map = uni.getStorageSync(K.comments) || {}
  return map[postId] || []
}
export function addComment(postId, comment) {
  const map = uni.getStorageSync(K.comments) || {}
  if (!map[postId]) map[postId] = []
  map[postId].push(comment)
  uni.setStorageSync(K.comments, map)
  // 同步帖子的评论数：commentCount 是评论总数的唯一来源，避免各页面显示不一致
  const posts = getPosts()
  const p = posts.find(x => x.id === postId)
  if (p) {
    p.commentCount += 1
    savePosts(posts)
  }
}
export function likeComment(postId, commentId) {
  const map = uni.getStorageSync(K.comments) || {}
  const list = map[postId] || []
  const c = list.find(x => x.id === commentId)
  if (c) {
    c.liked = !c.liked
    c.likes += c.liked ? 1 : -1
    uni.setStorageSync(K.comments, map)
  }
  return c
}

// ---------- 搜索历史 ----------
export function getSearchHistory() {
  return uni.getStorageSync(K.searchHistory) || []
}
export function addSearchHistory(kw) {
  let list = getSearchHistory()
  list = list.filter(x => x !== kw)
  list.unshift(kw)
  if (list.length > 10) list = list.slice(0, 10)
  uni.setStorageSync(K.searchHistory, list)
}
export function clearSearchHistory() {
  uni.setStorageSync(K.searchHistory, [])
}

// ---------- 用户 ----------
export function getUsers() {
  return uni.getStorageSync(K.users) || []
}
export function getCurrentUser() {
  return uni.getStorageSync(K.currentUser) || null
}
// 登录校验：未登录时提示并跳转登录页，返回是否已登录
export function requireLogin() {
  if (getCurrentUser()) return true
  uni.showToast({ title: '请先登录', icon: 'none' })
  setTimeout(() => {
    uni.navigateTo({ url: '/pages/login/login' })
  }, 500)
  return false
}
export function setCurrentUser(user) {
  uni.setStorageSync(K.currentUser, user)
}
export function clearCurrentUser() {
  uni.removeStorageSync(K.currentUser)
}
export function updateUser(username, patch) {
  const users = getUsers()
  const i = users.findIndex(u => u.username === username)
  if (i >= 0) {
    users[i] = { ...users[i], ...patch }
    uni.setStorageSync(K.users, users)
  }
  const cur = getCurrentUser()
  if (cur && cur.username === username) {
    setCurrentUser({ ...cur, ...patch })
  }
}

// ---------- 贴吧 ----------
export function getBars() {
  return BARS
}
export function getBar(id) {
  return BARS.find(b => b.id === id)
}

// ---------- 未读消息 ----------
export function getUnreadCount() {
  return uni.getStorageSync(K.unread) || 0
}
export function setUnreadCount(n) {
  uni.setStorageSync(K.unread, n)
}
