<script lang="ts">
	import { MarkdownEditor, Carta } from 'carta-md'
	import placeholder from './placeholder.md?raw'
	import { hashtag } from '$lib/plugin'

	import 'carta-md/default.css'
	import 'github-markdown-css/github-markdown-light.css'
	import '$lib/styles.css'

	const carta = new Carta({
		sanitizer: false,
		extensions: [hashtag()]
	})

	let value = placeholder
</script>

<main>
	<MarkdownEditor {carta} bind:value />
</main>
