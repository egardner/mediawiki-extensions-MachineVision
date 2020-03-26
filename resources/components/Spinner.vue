<template>
	<div class="wbmad-spinner">
		<div class="wbmad-spinner-bounce" />
	</div>
</template>

<script>
module.exports = {
	name: 'Spinner'
};
</script>

<style lang="less">
@import 'mediawiki.mixins';
@import '../style-variables.less';

.wbmad-spinner {
	@keyframes wbmadSpinnerBouncedelay {
		0%,
		50%,
		100% {
			transform: scale( 0.625 );
		}

		20% { // Equals 320ms.
			opacity: 0.87;
			transform: scale( 1 );
		}
	}

	.flex-display();
	align-items: center;
	justify-content: center;
	padding: 48px 16px;
	white-space: nowrap;

	& .wbmad-spinner-bounce,
	&:before,
	&:after {
		animation: wbmadSpinnerBouncedelay 1600ms ease-in-out -160ms infinite both;
		background-color: @base30;
		border-radius: 100%;
		content: '';
		display: block;
		float: left;
		height: @wbmad-spinner-size;
		width: @wbmad-spinner-size;
	}

	&:before {
		animation-delay: -330ms;
		margin-right: 4px;
	}

	&:after {
		animation-delay: 0s;
		margin-left: 4px;
	}
}
</style>
