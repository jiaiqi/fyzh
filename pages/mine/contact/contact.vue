<template>
	<view>
		<view class="contact-list">
			<view class="contact-item" v-for="item in list" :key="item.id">
				<image :src="$u.api.getImagePath(item.hy_profile_url)" class="profile" mode="aspectFit"
					v-if="item.hy_profile_url"></image>
				<view class="profile ">
					<text class="cuIcon-profile"></text>
				</view>
				<view class="label">
					{{item.hy_name||'未知用户'}}
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				list: []
			}
		},
		methods: {
			getList() {
				if (!this.vuex_memberInfo?.hy_no) {
					return
				}
				const url = '/fyzhmd/select/srvstore_member_mgmt_select'
				const req = {
					"serviceName": "srvstore_member_mgmt_select",
					"colNames": ["*"],
					"condition": [{
						colName: 'add_hy_no',
						ruleType: 'eq',
						value: this.vuex_memberInfo.hy_no
					}],
					"page": {
						"pageNo": 1,
						"rownumber": 50
					}
				}
				this.$u.post(url, req).then(res => {
					if (res.state === 'SUCCESS') {
						this.list = res.data
					}
				})

			}
		},
		created() {
			this.getList()
		}
	}
</script>

<style lang="scss" scoped>
	.contact-list {
		display: flex;
		padding: 20rpx;
		.contact-item {
			display: flex;
			flex-direction: column;
			border-radius: 20rpx;
			overflow: hidden;
			padding: 20rpx;
			background-color: #fff;
			margin-right: 10rpx;
			margin-bottom: 10rpx;
			.profile {
				width: 100rpx;
				height: 100rpx;
				font-size: 60rpx;
				display: flex;
				justify-content: center;
				align-items: center;
				background-color: #F0F0F0;
				border-radius: 50%;
			}
			.label{
				margin-top: 10rpx;
				text-align: center;
			}
		}
	}
</style>
