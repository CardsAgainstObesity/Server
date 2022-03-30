<script setup>
import { game } from "@/services/cards.mjs";
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
  <div @click="assignInput(text, clickable)" :class="'event-card ' + (dark ? 'dark' : ' ') + (clickable ? 'clickable' : ' ')">
    <p v-html="text.replaceAll(`___`, `${chapuza}`)" class="noselect"></p>
  </div>
</template>

<script>
const chapuza = `<span class='card_input'>[...]</span>`;
function assignInput(value, clickable) {
    if (clickable){
        if (document.querySelectorAll('.card_input').length <= game.card_index) {
          game.card = 0;
        } else {
          document.querySelectorAll('.card_input')[game.card_index].innerHTML = value.replaceAll(".","");
          game.appendCardValue(value.replaceAll(".",""));
          game.card_index++;
        }
    }
}
</script>