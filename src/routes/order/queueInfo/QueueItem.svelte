<script lang="ts">
    interface Props {
        title: string;
        value: number;
    }

    let props = $props();
</script>

<div class="flex flex-col gap-2">
    <h4>{props.title}</h4>
    <div class="flex flex-col gap-1">
        <p>{props.value}</p>
        <p>orders</p>
    </div>
</div>
