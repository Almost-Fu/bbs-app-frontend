// ---------------------------------------------------------------------------
// 网络请求统一封装（uni.request，等价于 Web 端的 axios 封装）
//
//   数据来源：App 端所有会变化的数据都来自数据库（经 Render 上的 FastAPI 接口），
//   请求都通过 utils/api.js 发起（本文件只负责：拼地址、带 token、统一响应体、错误提示）。
//   本机只保存两样东西：登录 token（bbs_token）与当前用户缓存 + 搜索历史（utils/store.js）。
//
//   统一约定（与后端一致）：响应体 {code, message, data}，code=0 为成功
//   接口清单见 bbs-app-backend/README.md，地址在 utils/config.js 里单点配置。
// ---------------------------------------------------------------------------
import { API_BASE_URL } from './config'

const TOKEN_KEY = 'bbs_token'

export function getToken() {
  return uni.getStorageSync(TOKEN_KEY) || ''
}
export function setToken(token) {
  uni.setStorageSync(TOKEN_KEY, token || '')
}
export function clearToken() {
  uni.removeStorageSync(TOKEN_KEY)
}

/**
 * 发起请求
 * @param {object} options
 * @param {string} options.url     以 / 开头则自动拼 API_BASE_URL，也可传完整 http 地址
 * @param {string} [options.method] 默认 GET
 * @param {object} [options.data]   GET 为 query，其余为 body
 * @param {boolean} [options.auth]  true 时未登录直接跳登录页
 * @param {boolean} [options.loading] 是否显示 loading
 * @param {boolean} [options.silent]  是否静默（不弹错误提示）
 */
export function request(options = {}) {
  const {
    url,
    method = 'GET',
    data = {},
    header = {},
    auth = false,
    loading = false,
    silent = false,
    timeout = 15000
  } = options

  const token = getToken()
  if (auth && !token) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    setTimeout(() => uni.navigateTo({ url: '/pages/login/login' }), 500)
    return Promise.reject(new Error('未登录'))
  }

  const finalHeader = { 'Content-Type': 'application/json', ...header }
  if (token) finalHeader.Authorization = `Bearer ${token}`

  if (loading) uni.showLoading({ title: '加载中', mask: true })

  return new Promise((resolve, reject) => {
    uni.request({
      url: /^https?:\/\//i.test(url) ? url : `${API_BASE_URL}${url}`,
      method,
      data,
      header: finalHeader,
      timeout,
      success: (res) => {
        const body = res.data
        // 后端统一响应体
        if (body && typeof body === 'object' && 'code' in body) {
          if (body.code === 0) return resolve(body.data)
          if (!silent) uni.showToast({ title: body.message || '请求失败', icon: 'none' })
          return reject(Object.assign(new Error(body.message || '请求失败'), { code: body.code }))
        }
        if (res.statusCode >= 200 && res.statusCode < 300) return resolve(body)
        if (!silent) uni.showToast({ title: `请求失败(${res.statusCode})`, icon: 'none' })
        reject(new Error(`HTTP ${res.statusCode}`))
      },
      fail: (err) => {
        if (!silent) {
          uni.showToast({ title: '网络异常，请确认后端已启动', icon: 'none' })
        }
        reject(err)
      },
      complete: () => {
        if (loading) uni.hideLoading()
      }
    })
  })
}

/** 常用的语法糖 */
export const http = {
  get: (url, params, options) => request({ url, method: 'GET', data: params, ...options }),
  post: (url, data, options) => request({ url, method: 'POST', data, ...options }),
  put: (url, data, options) => request({ url, method: 'PUT', data, ...options }),
  patch: (url, data, options) => request({ url, method: 'PATCH', data, ...options }),
  del: (url, data, options) => request({ url, method: 'DELETE', data, ...options })
}

export default request
