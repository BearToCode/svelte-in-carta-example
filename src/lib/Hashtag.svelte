<script lang="ts">
	export let value: string
</script>

<button
	on:click={() => {
		console.log('Hashtag clicked!')
	}}
>
	#{value}
</button>
