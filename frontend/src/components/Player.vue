<script setup>
import IconPlayer from "@/components/icons/IconPlayer.vue";
import IconPlayerReady from "@/components/icons/IconPlayerReady.vue";
import IconPlayerCzar from "@/components/icons/IconPlayerCzar.vue";
defineProps({
    name: {
        type: String,
        required: true
    },
    ready: {
        type: Boolean,
        required: false
    },
    avatar: {
        type: String,
        required: false
    },
    czar: {
        type: Boolean,
        required: true
    }
})
</script>

<template>
    <div class="player">
        <IconPlayerCzar v-if="czar" />
        <IconPlayer v-else />
        <span>{{name}}</span>
    </div>
</template>