<script lang="ts">
    import { goto } from "$app/navigation";
    import { page } from "$app/state";
    import { getAppContext } from "$lib/stores/index.svelte";

    const app = getAppContext();

    const hash = $derived(page.url.searchParams.get("hash"));

    $effect(() => {
        if (hash !== null) {
            handleRedirect(hash);
        }
    });

    async function handleRedirect(currentHash: string) {
        app.user.auth.logout();
        await app.user.auth.login(currentHash);

        if (app.user.auth.isLoggedIn) {
            goto("order", { replaceState: true });
        } else {
            goto("/", { replaceState: true });
        }
    }
</script>

<div class="stack-column">
    <span class="text-small">Looking for your order</span>
    <div class="stack-row">Loading...</div>
</div>

<style>
    .stack-column {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
        align-items: center;
    }

    .stack-row {
        display: flex;
        flex-direction: row;
        gap: 0.5rem;
        align-items: center;
    }

    .text-small {
        font-size: 0.875rem;
    }
</style>
