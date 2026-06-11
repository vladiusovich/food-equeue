<script lang="ts">
    import { type IconProps } from "@lucide/svelte";
    import { Navigation, type NavigationRootProps } from "@skeletonlabs/skeleton-svelte";
    import type { Component } from "svelte";

    interface Link {
        label: string;
        href: string;
        icon: Component<IconProps, {}, "">;
    }

    interface Props extends NavigationRootProps {
        links: Link[];
    }

    const colsClass: Record<number, string> = {
        1: "grid-cols-1",
        2: "grid-cols-2",
        3: "grid-cols-3",
        4: "grid-cols-4",
    };

    let { links, layout = "bar", ...props }: Props = $props();
</script>

<Navigation {...props} {layout} class="rounded-full border border-neutral-700">
    <Navigation.Menu class={`grid gap-2 ${colsClass[links.length] ?? "grid-cols-2"}`}>
        {#each links as link (link)}
            {@const Icon = link.icon}
            <Navigation.TriggerAnchor href={link.href} class="rounded-full">
                <Icon class="size-5" />
                <Navigation.TriggerText>{link.label}</Navigation.TriggerText>
            </Navigation.TriggerAnchor>
        {/each}
    </Navigation.Menu>
</Navigation>
