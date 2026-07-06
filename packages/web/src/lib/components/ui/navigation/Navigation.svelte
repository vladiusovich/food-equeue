<script lang="ts">
    import { type IconProps } from "@lucide/svelte";
    import { Navigation, type NavigationRootProps } from "@skeletonlabs/skeleton-svelte";
    import type { Component } from "svelte";
    import { page } from "$app/state";
    import { type Accent } from "$lib/components/ui/types/Accent";

    interface Link {
        label: string;
        href: string;
        icon: Component<IconProps, {}, "">;
    }

    interface NavigationProps extends NavigationRootProps {
        links: Link[];
        accent?: Accent;
    }

    const colsClass: Record<number, string> = {
        1: "grid-cols-1",
        2: "grid-cols-2",
        3: "grid-cols-3",
        4: "grid-cols-4",
    };

    const activeClasses: Record<Accent, string> = {
        neutral: "bg-surface-50/16 text-surface-50",
        primary: "bg-primary-500/16 text-primary-500",
        success: "bg-success-500/16 text-success-500",
        warning: "bg-warning-500/16 text-warning-500",
        error: "bg-error-500/16 text-error-500",
    };

    let { links, layout = "bar", accent = "primary", ...props }: NavigationProps = $props();

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
                    "flex flex-col items-center gap-1 rounded-full px-1 transition-colors",
                    active ? activeClasses[accent] : "text-surface-200",
                ]}
            >
                <Icon class="size-4.5" />
                <Navigation.TriggerText class="text-[10px] font-bold">{link.label}</Navigation.TriggerText>
            </Navigation.TriggerAnchor>
        {/each}
    </Navigation.Menu>
</Navigation>
