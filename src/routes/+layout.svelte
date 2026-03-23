<script lang="ts">
	import "../app.css";
	import { goto } from "$app/navigation";
	import favicon from "$lib/assets/favicon.svg";
	import { getAppContext, initAppContext } from "$lib/stores";

	let { children } = $props();

	initAppContext();

	const app = getAppContext();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div id="app-shell">
	{@render children()}
</div>
