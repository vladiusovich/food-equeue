<script lang="ts">
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
    import { page } from "$app/state";
    import { getAppContext } from "$lib/stores";

    let hash: string | null;
    const app = getAppContext();

    onMount(() => {
        hash = page.url.searchParams.get("hash");
        handleRedirect();
    });

    async function handleRedirect() {
        if (hash) {
            app.user.auth.logout();
            await app.user.auth.login(hash);
            if (app.user.auth.isLoggedIn) {
                goto("order", { replaceState: true });
            } else {
                goto("welcome", { replaceState: true });
            }
        }

        // window.history.replaceState({}, "", window.location.pathname + window.location.hash);
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
