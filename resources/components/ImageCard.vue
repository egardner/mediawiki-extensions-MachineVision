<template>
	<div class="wbmad-image-with-suggestions-container">
		<div class="wbmad-image-with-suggestions-image">
			<div class="wbmad-image-with-suggestions-image-wrapper">
				<a v-bind:href="descriptionUrl" target="_blank">
					<img v-bind:src="thumbUrl" alt="">
				</a>
			</div>
		</div>

		<div class="wbmad-image-with-suggestions-tags">
			<div class="wbmad-suggestion-group">
				<ul>
					<li v-for="(suggestion, index) in suggestions"
						v-bind:key="index"
						v-on:click="toggleConfirmed( suggestion )">
						{{ suggestion }}
					</li>
				</ul>
			</div>

			<div class="wbmad-buttons">
				BUTTONS GO HERE
			</div>
		</div>
	</div>
</template>

<script>
module.exports = {
	name: 'ImageCard',

	props: {
		image: {
			type: Object,
			required: true
		}
	},

	data: function () {
		return {
			// copy suggestions from props into state so we can modify their
			// "confirmed" properties in place
			suggestions: this.image.suggestions
		};
	},

	computed: {
		title: function () {
			return this.image.title;
		},

		thumbUrl: function () {
			return this.image.thumburl;
		},

		descriptionUrl: function () {
			return this.image.descriptionurl;
		},

		confirmedSuggestions: function () {
			return this.suggestions.filter( function ( suggestion ) {
				return suggestion.confirmed;
			} );
		}
	},

	methods: {
		toggleConfirmed: function ( suggestion ) {
			suggestion.confirmed = !suggestion.confirmed;
		}
	}
};
</script>
