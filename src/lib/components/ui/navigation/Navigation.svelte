<script lang="ts">
    import { type IconProps } from "@lucide/svelte";
    import {
        Navigation,
        type NavigationRootProps,
    } from "@skeletonlabs/skeleton-svelte";
    import type { Component } from "svelte";

    interface Link {
        label: string;
        href: string;
        icon: Component<IconProps, {}, "">;
    }

    interface Props extends NavigationRootProps {
        links: Link[];
    }

    let { links, layout = "bar", ...props }: Props = $props();
</script>

<Navigation {...props} {layout} class="rounded-full">
    <Navigation.Menu class="grid grid-cols-4 gap-2">
        {#each links as link (link)}
            {@const Icon = link.icon}
            <Navigation.TriggerAnchor href={link.href}>
                <Icon class="size-5" />
                <Navigation.TriggerText>{link.label}</Navigation.TriggerText>
            </Navigation.TriggerAnchor>
        {/each}
    </Navigation.Menu>
</Navigation>
