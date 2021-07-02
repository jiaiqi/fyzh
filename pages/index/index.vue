<template>
	<view>
		<view class="page-item-list">
			<PageItem v-for="item in pageItemList" :key="item.id" :pageItem="item"></PageItem>
		</view>
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
			this.$u.api.getPageItem().then(res => {
				if (res.state === 'SUCCESS') {
					this.pageItemList = res.data
				}
			})
		}
	}
</script>

<style lang="scss">

</style>
