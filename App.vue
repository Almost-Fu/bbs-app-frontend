<script>
	import { initStore } from './utils/store'
	import { apiHealth } from './utils/api'

	export default {
		onLaunch: function() {
			console.log('BBS App Launch')
			initStore()
			// 预热后端：Render 免费实例休眠后首次请求要 30~60 秒，启动时先静默 ping 一次，
			// 让唤醒尽早开始（失败忽略，不影响使用；请求层会给慢请求显示"正在唤醒"提示）。
			apiHealth().catch(() => {})
		},
		onShow: function() {
			console.log('BBS App Show')
		},
		onHide: function() {
			console.log('BBS App Hide')
		}
	}
</script>

<style>
	/* 全局公共样式 */
	page {
		background-color: #f5f6f7;
		font-size: 28rpx;
		color: #333;
		line-height: 1.6;
	}
</style>
