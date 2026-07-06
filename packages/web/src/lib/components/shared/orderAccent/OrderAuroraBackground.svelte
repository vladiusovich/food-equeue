<script lang="ts">
    import UI from "$lib/components/ui";
    import { useOrderAccent } from "./useOrderAccent.svelte";

    const orderAccent = useOrderAccent();
</script>

<UI.AuroraBackground accent={orderAccent.accent} />
