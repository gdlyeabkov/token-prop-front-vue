<script setup>
import { ref } from 'vue'
const sortMenu = ref(false)
const filterMenu = ref(false)
const sortOptions = ref([
  { label: "Name: A-Z", value: "name_asc" },
  { label: "Name: Z-A", value: "name_desc" },
  { label: "Date: Newest", value: "date_desc" },
  { label: "Date: Oldest", value: "date_asc" },
])
const filterOptions = ref([
  { label: "Name: A-Z", value: "name_asc" },
  { label: "Name: Z-A", value: "name_desc" },
  { label: "Date: Newest", value: "date_desc" },
  { label: "Date: Oldest", value: "date_asc" },
])
</script>
<template>
  <div class="pa-8">
    <p class="text-h5 mb-4">Могут подойти</p>
    <v-row justify="end">
      <v-col cols="auto">
        <v-menu
          :location="'start'"
          v-model="sortMenu"
          :close-on-content-click="false"
          offset-y>
          <template #activator="{ props }">
            <v-btn v-bind="props" color="primary" dark icon>
              <v-icon>mdi-sort</v-icon>
            </v-btn>
          </template>
          <v-list>
            <v-list-item
              v-for="(option, index) in sortOptions"
              :key="index"
              @click="selectSort(option)">
              <v-list-item-title>{{ option.label }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </v-col>
      <v-col cols="auto">
        <v-menu
          :location="'start'"
          v-model="filterMenu"
          :close-on-content-click="false"
          offset-y>
          <template #activator="{ props }">
            <v-btn v-bind="props" color="secondary" dark icon>
              <v-icon>mdi-filter</v-icon>
            </v-btn>
          </template>
          <v-list>
            <v-list-item
              v-for="(option, index) in filterOptions"
              :key="index"
              @click="selectSort(option)">
              <v-list-item-title>{{ option.label }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </v-col>
    </v-row>
    <v-row :align="'stretch'">
      <v-col v-for="e in 12" :key="e">
        <v-card
          :elevation="0"
          :rounded="'lg'"
          class="mx-auto border"
          :min-width="323.5"
          :min-height="403.31"
          :height="'100%'">
          <!-- :height="'100%'" for stretch cards by vertically for other cards height in row -->
          <!-- 85% of height card for img style="min-height: 85% !important; height: 85%" -->
          <v-img
            class="align-end text-white"
            src="https://cdn.vuetifyjs.com/images/cards/docks.jpg"
            cover />
          <v-card-title>
            26 749 615 ₽
          </v-card-title>
          <v-card-subtitle>
            <div class="mb-3">
              {{
                [
                  '1-комн. кв.',
                  '24,20 м²',
                  '23/26 этаж'
                ].join(' · ')
              }}
            </div>
            <v-row no-gutters style="gap: 10px" justify="start">
              <v-row no-gutters :align="'center'" style="gap: 5px; flex-grow: 0">
                <v-icon color="#050">mdi-subway-variant</v-icon>
                <span>Павелецкая</span>
              </v-row>
              <v-row no-gutters :align="'center'" style="gap: 5px; flex-grow: 0">
                <v-icon>mdi-walk</v-icon>
                <span>10</span>
              </v-row>
            </v-row>
          </v-card-subtitle>
          <v-card-text>
            Хай Лайф жилой комплекс
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>
