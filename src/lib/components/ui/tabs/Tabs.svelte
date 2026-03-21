<script lang="ts">
    import { Tabs } from "@skeletonlabs/skeleton-svelte";
    import type { TabsRootProps } from "@skeletonlabs/skeleton-svelte";
    import type { Snippet } from "svelte";

    interface Tab {
        title: string | Snippet;
        content: string | Snippet;
        value: string;
    }

    interface TabsProps extends TabsRootProps {
        tabs: Tab[];
    }

    let { tabs }: TabsProps = $props();
</script>

<Tabs defaultValue="overview">
    <Tabs.List>
        {#each tabs as tab}
            <Tabs.Trigger value={tab.value}>
                {#if typeof tab.title === "string"}
                    {tab.title}
                {:else}
                    {@render tab.title()}
                {/if}
            </Tabs.Trigger>
        {/each}
        <Tabs.Indicator />
    </Tabs.List>

    {#each tabs as tab}
        <Tabs.Content value={tab.value}>
            {#if typeof tab.content === "string"}
                {tab.content}
            {:else}
                {@render tab.content()}
            {/if}
        </Tabs.Content>
    {/each}
</Tabs>
