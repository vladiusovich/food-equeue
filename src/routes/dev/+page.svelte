<script lang="ts">
    import UI from "$lib/components/ui";
    import Buttons from "./buttons.svelte";
    import Chips from "./chips.svelte";
    import Placeholders from "./placeholders.svelte";
    import Typo from "./typo.svelte";
</script>

<div class="flex flex-col gap-5">
    <h2>UI kit</h2>

    {#snippet typo()}
        <Typo />
    {/snippet}

    {#snippet buttons()}
        <Buttons />
    {/snippet}

    {#snippet placeholders()}
        <Placeholders />
    {/snippet}

    {#snippet chips()}
        <Chips />
    {/snippet}

    <UI.Tabs
        tabs={[
            {
                title: "Typography",
                value: "Typography",
                content: typo,
            },
            {
                title: "Buttons",
                value: "Buttons",
                content: buttons,
            },
            {
                title: "Chips",
                value: "Chips",
                content: chips,
            },
            {
                title: "Placeholders",
                value: "Placeholders",
                content: placeholders,
            },
        ]}
    />
</div>
