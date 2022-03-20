<script setup>
defineProps({
    text: {
        type: String,
        required: true
    },
    dark: {
        type: Boolean,
        required: true
    },
    clickable: {
        type: Boolean,
        required: true
    }
});
</script>

<template>
    <div :class="'event-card ' + (dark ? 'dark':' ') + (clickable ? 'clickable':' ')">
        <p class="noselect">{{text}}</p>
    </div>
</template>
