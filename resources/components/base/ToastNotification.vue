<template>
	<div v-if="showWrapper" class="mw-toast">
		<transition
			appear
			name="mw-toast"
			appear-class="mw-toast-appear"
			appear-active-class="mw-toast-appear-active"
			appear-to-class="mw-toast-appear-to"
			v-on:appear="onAppear"
			v-on:after-leave="afterLeave"
		>
			<div
				v-if="show"
				class="mw-toast__notification"
				v-bind:aria-live="type !== 'error' ? 'polite' : false"
				v-bind:role="type === 'error' ? 'alert' : false "
			>
				<div class="mw-toast__notification__content">
					<slot />
				</div>
			</div>
		</transition>
	</div>
</template>

<script>
/**
 * A small pop-up notification.
 *
 * When specifying duration, ensure the user will have sufficient time to read
 * and process the notification. Message content should be as concise as
 * possible.
 *
 * Specifitying notification type provides helpful information to screen readers.
 * Type can be one of "success" or "error".
 */
// @vue/component
module.exports = {
	name: 'ToastNotification',

	props: {
		type: {
			type: String,
			default: 'notice'
		},
		duration: {
			type: Number, // in seconds
			default: 10
		}
	},

	data: function () {
		return {
			show: true,
			showWrapper: true
		};
	},

	methods: {
		/**
		 * When this component appears, start a countdown based on the provided
		 * duration, then hide the toast, which kicks off leave transitions.
		 */
		onAppear: function () {
			var self = this;
			setTimeout( function () {
				self.show = false;
			}, this.duration * 1000 );
		},
		/**
		 * After the leave transitions finish, remove the toast and wrapper.
		 */
		afterLeave: function () {
			this.showWrapper = false;
		}
	}
};
</script>

<style lang="less">
@import 'mediawiki.mixins';
@import '../../style-variables.less';

.mw-toast {
	// Center the toast within the parent container.
	.flex-display();
	justify-content: center;
}

.mw-toast__notification {
	background-color: @base10;
	border-radius: @outer-border-radius;
	bottom: 5vh;
	color: @base100;
	display: inline-block;
	margin: 0;
	padding: 8px 32px;
	position: fixed;
	text-align: center;
	width: 95%;

	@media screen and ( min-width: @width-breakpoint-tablet ) {
		width: auto;
	}
}

.mw-toast__notification__content {
	// In case slot content isn't wrapped in a paragraph tag, let's duplicate
	// the margins here (they'll collapse if a p tag is used).
	margin: 0.5em 0;
}

// Transitions.
.mw-toast-appear,
.mw-toast-leave-to {
	bottom: 0;
	opacity: 0;
}

.mw-toast-appear-active,
.mw-toast-leave-active {
	transition: bottom 1s, opacity 1s;
}

.mw-toast-appear-to {
	bottom: 5vh;
	opacity: 1;
}

</style>
