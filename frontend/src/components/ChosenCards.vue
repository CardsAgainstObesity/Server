<script setup>
import Card from '@/components/Card.vue'
let cards = [
  {
    text: "Bondrewd",
    dark: false
  },
  {
    text: "Mitty",
    dark: false
  },
  {
    text: "Reg",
    dark: false
  },
  {
    text: "Riko",
    dark: false
  },
  {
    text: "McDonald's",
    dark: false
  }
]
</script>
<template>
    <div class="container">
      <Card text="Made in Abyss" :dark="true" />
    </div>
    <div class="container">
      <Card v-for="card in cards" :text="card.text" :dark="card.dark" />
    </div>
</template>

<style>
.container {
	display: flex;
	flex-wrap: wrap;
	justify-content: center;
}
</style>
