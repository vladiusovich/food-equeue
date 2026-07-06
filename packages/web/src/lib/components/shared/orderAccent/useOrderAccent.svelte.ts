import { getAppContext } from "$lib/stores/index.svelte";
import type { Accent } from "$lib/components/ui/types/Accent";

export const useOrderAccent = (): { readonly accent: Accent } => {
    const app = getAppContext();

    return {
        get accent(): Accent {
            return app.orders.orderIsReady ? "success" : "neutral";
        },
    };
};
