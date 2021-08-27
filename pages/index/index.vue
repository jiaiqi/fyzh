<template>
	<view class="page-item-list">
			<PageItem v-for="item in pageItemList" :key="item.id" :pageItem="item"></PageItem>
	</view>
</template>

<script>
	import PageItem from './components/page-item.vue'
	import {
		wxLogin
	} from '@/common/api.js'
	export default {
		components: {
			PageItem
		},
		data() {
			return {
				pageItemList: []
			};
		},
		async created() {
			// #ifdef MP-WEIXIN
			await wxLogin()
			// #endif
			debugger
			this.$u.api.getPageItem().then(res => {
				debugger
				if (res.state === 'SUCCESS') {
					this.pageItemList = res.data
				}
			})
		}
	}
</script>

<style lang="scss">
.page-item-list{
	background-color: #fff;
	min-height: calc(100vh - var(--window-bottom) - var(--window-top));
}
</style>
