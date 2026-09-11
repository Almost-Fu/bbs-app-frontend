// ---------------------------------------------------------------------------
// 后端接口地址配置（★ 部署 / 云打包时只需要改这一个文件）
//
//   H5 网页版（Vercel）：与后端不同域 → 必须用绝对地址（Render 域名）
//   App（HBuilderX 云打包 APK）：同样用绝对地址；App 端没有跨域限制
//   本地联调：127.0.0.1:8000
//
//   上线前要做两件事：
//     1) 把 PROD_API_ORIGIN 换成你自己的 Render 地址
//     2) 到后端 Render 的环境变量 CORS_ORIGINS 里加上本 H5 的 Vercel 域名
// ---------------------------------------------------------------------------
const PROD_API_ORIGIN = 'https://bbs-app-backend-zuzm.onrender.com' // ← 改这里（末尾不要带 /）
const DEV_API_ORIGIN = 'http://127.0.0.1:8000'

// HBuilderX 运行/发行时会注入 NODE_ENV：开发运行时为 development
const isDev = process.env.NODE_ENV === 'development'

/** 后端服务根地址（接口与上传图片都在这个域名下） */
export const API_ORIGIN = isDev ? DEV_API_ORIGIN : PROD_API_ORIGIN

/** RESTful 接口前缀，例如 `${API_BASE_URL}/bars`、`${API_BASE_URL}/auth/login` */
export const API_BASE_URL = `${API_ORIGIN}/api`

/** 上传资源前缀：后端把帖子图片挂在 /uploads 下 */
export const STATIC_ORIGIN = API_ORIGIN

/**
 * 把后端返回的图片相对地址补成完整地址
 * 后端返回形如 /uploads/posts/202609/xxx.png
 */
export function resolveImageUrl(url) {
  if (!url) return ''
  if (/^https?:\/\//i.test(url)) return url
  return `${STATIC_ORIGIN}${url}`
}
