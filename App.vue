<script>
	import { initStore } from './utils/store'

	export default {
		onLaunch: function() {
			console.log('BBS App Launch')
			initStore()
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
