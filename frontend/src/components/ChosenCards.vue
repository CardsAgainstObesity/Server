<script setup>
import Card from "@/components/Card.vue";
let cards = [
  {
    text: "Bondrewd",
    dark: false,
  },
  {
    text: "Mitty",
    dark: false,
  },
  {
    text: "Reg",
    dark: false,
  },
  {
    text: "Riko",
    dark: false,
  },
  {
    text: "McDonald's",
    dark: false,
  },
];
</script>
<template>
  <div>
    <div class="container">
      <Card text="Made in Abyss" :dark="true" />
    </div>
    <div class="container">
      <Card v-for="card in cards" :text="card.text" :dark="card.dark" />
    </div>
  </div>
</template>

<style>
.container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}

.dark {
  background: #2e3440 !important;
  width: 320px !important;
  min-height: 450px !important;
}

.event-card {
  height: auto;
  width: 160px;
  min-height: 225px;
  background: #5e81ac;
  border-radius: 20px;
  overflow: hidden;
  padding: 10px 15px;
  margin-bottom: 24px;
  margin-right: 10px;
  transition: all 0.2s linear;
  cursor: pointer;
  color: white;
}

.event-card:hover {
  transform: scale(1.01);
  box-shadow: 0 3px 12px 0 rgba(0, 0, 0, 0.2), 0 1px 15px 0 rgba(0, 0, 0, 0.19);
}

.event-card > .title {
  margin: 0;
}

.noselect {
  -webkit-touch-callout: none; /* iOS Safari */
  -webkit-user-select: none; /* Safari */
  -khtml-user-select: none; /* Konqueror HTML */
  -moz-user-select: none; /* Old versions of Firefox */
  -ms-user-select: none; /* Internet Explorer/Edge */
  user-select: none; /* Non-prefixed version, currently
                                  supported by Chrome, Edge, Opera and Firefox */
}
</style>
