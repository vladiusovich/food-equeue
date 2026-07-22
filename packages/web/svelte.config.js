import adapter from "@sveltejs/adapter-static";

/** @type {import('@sveltejs/kit').Config} */
const config = {
    kit: {
        // Client-only SPA: pre-render nothing, serve index.html for every route
        // and let client-side routing take over from there.
        adapter: adapter({
            fallback: "index.html",
        }),
    },
    vitePlugin: {
        dynamicCompileOptions: ({ filename }) => (filename.includes("node_modules") ? undefined : { runes: true }),
    },
};

export default config;
