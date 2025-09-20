<script>
import { mapState, mapActions, mapMutations } from 'vuex';
import { request } from '@/utils/request';
import { getToken } from '@/utils/token';
import { initVoice } from '@/utils/voice';
export default {
	onLaunch: function () {
		this.getSystemInfo();
		if (this.token) {
			this.getAliyunConfig();
			this.getUserInfo();
		}
		console.log('App Launch');
	},
	onShow: function () {
		console.log('App Show');
	},
	onHide: function () {
		console.log('App Hide');
	},
	computed: {
		...mapState(['token'])
	},
	watch: {
		token() {
			this.getAliyunConfig();
		}
	},
	methods: {
		...mapActions(['login', 'getUserInfo', 'getSystemInfo']),
		...mapMutations(['setAKID', 'setAKKEY', 'setAPPKEY', 'setVoiceToken']),
		getAliyunConfig() {
			request({
				url: '/api/health-service/aliyun/aliyun_voice_config',
				isRobot: true,
				success: async (res) => {
					// 获取 token 等配置
					const token = await getToken(res.AKID, res.AKKEY);
					this.setVoiceToken(token);
					this.setAKID(res.AKID);
					this.setAKKEY(res.AKKEY);
					this.setAPPKEY(res.appKey);
					initVoice(res.appKey, token);
				}
			});
		}
	}
};
</script>

<style lang="scss">
text,
input,
textarea,
view {
	box-sizing: border-box;
}
.placeholder {
	font-size: 32rpx;
	color: $uni-text-color-gray3;
}
</style>
