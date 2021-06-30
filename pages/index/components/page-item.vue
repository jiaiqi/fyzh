<template>
	<div class="page-item">
		<slideImage v-if="componentType==='carousel'" :pageItem="pageItem"></slideImage>
		<slideButton v-else-if="componentType==='buttons'" :pageItem="pageItem"></slideButton>
		<newsList v-else-if="componentType==='tablist'" :pageItem="pageItem"></newsList>
	</div>
</template>

<script>
	import slideImage from './slide-image.vue'
	import slideButton from './slide-button.vue'
	import newsList from './news-list.vue'
	export default {
		components: {
			slideImage,
			slideButton,
			newsList
		},
		props: {
			pageItem: {
				type: Object
			},
		},
		computed: {
			componentType() {
				if (this.pageItem?.div_type) {
					return this.pageItem.div_type
				}
			}
		},
	}
</script>

<style scoped lang="scss">

</style>
