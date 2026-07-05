<script lang="ts">
    import { type IconProps } from "@lucide/svelte";
    import { Navigation, type NavigationRootProps } from "@skeletonlabs/skeleton-svelte";
    import type { Component } from "svelte";
    import { page } from "$app/state";

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

    const isActive = (href: string) => page.url.pathname.startsWith(href);
</script>

<Navigation {...props} {layout} class="rounded-full border border-surface-700/40 bg-surface-800 p-1.5">
    <Navigation.Menu class={`grid gap-1.5 ${colsClass[links.length] ?? "grid-cols-2"}`}>
        {#each links as link (link)}
            {@const Icon = link.icon}
            {@const active = isActive(link.href)}
            <Navigation.TriggerAnchor
                href={link.href}
                class={[
                    "flex flex-col items-center gap-1 rounded-full px-1 py-2.5 transition-colors",
                    active ? "bg-primary-500/16 text-primary-500" : "text-surface-200",
                ]}
            >
                <Icon class="size-4.5" />
                <Navigation.TriggerText class="text-[10px] font-bold">{link.label}</Navigation.TriggerText>
            </Navigation.TriggerAnchor>
        {/each}
    </Navigation.Menu>
</Navigation>
