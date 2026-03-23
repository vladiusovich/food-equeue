<script lang="ts">
	import "../app.css";
	import favicon from "$lib/assets/favicon.svg";
	import { initAppContext } from "$lib/stores";

	let { children } = $props();

	initAppContext();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div id="app-shell">
	{@render children()}
</div>
