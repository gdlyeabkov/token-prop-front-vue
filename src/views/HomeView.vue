<script setup>
import { onMounted, ref } from 'vue'
import { useStore } from 'vuex'
import { useDisplay } from "vuetify"

const store = useStore()
const { xs: isMobile } = useDisplay()

const sortMenu = ref(false)
const filterMenu = ref(false)
const sortOptions = ref([
  { label: 'Цена объекта', value: 'obj-price' },
  { label: 'Цена токена', value: 'token-price' },
  { label: 'Доходность', value: 'yield' },
])
const filterOptions = ref([
  { label: "По гео", value: "geo" },
  { label: "Провайдер", value: "provider" },
  { label: "Тип сделки", value: "deal" },
  { label: "Доступны/не доступны токены", value: "tokens" },
  { label: "Сеть блокчейна", value: "blockchain" },
])
const db = ref(null)

const isShowSnackbar = ref(false)
const snackbarContent = ref('')

const selectSort = () => {
  sortMenu.value = false
  filterMenu.value = false
  // TODO: use item.id
}

const onObjImgError = (obj) => {
  obj.photos[0].url = ''
}

onMounted(async () => {
  try {
    await store.dispatch('getObjs')
    if (isLocalCacheLikes) {
      const request = indexedDB.open('token_prop', 1)
      request.onupgradeneeded = function (event) {
        db.value = event.target.result
        // Create an object store if it doesn't exist
        if (!db.value.objectStoreNames.contains('obj2like')) {
          db.value.createObjectStore(
            'obj2like',
            {
              keyPath: 'id'
            }
          )
        }
      }
      request.onsuccess = function (event) {
        db.value = event.target.result
        
        // Write data
        const transaction = db.value.transaction('obj2like', 'readwrite')
        const iDbStore = transaction.objectStore('obj2like')
        for (let obj of store.state.objs) {
          const data = {
            id: obj.id,
            like: false
          }
          // create entry if db not contain
          if (!iDbStore.get(obj.id)) {
            iDbStore.add(data)
            obj.isFavorite = false
          } else {
            const getRequest = iDbStore.get(obj.id)
            getRequest.onsuccess = function () { 
              const existingData = getRequest.result
              obj.isFavorite = existingData.like
            }
            getRequest.onerror = () => console.error('Error retrieving entry')
          }
        }

        transaction.oncomplete = () => console.log('Data written successfully')
        transaction.onerror = () => console.error('Error writing data')
      }
    }
  } catch (e) {
    isShowSnackbar.value = true
    snackbarContent.value = 'Произошла ошибка'
  }
})

const MAX_DESC_LENGTH = 150

const toggleLike = (obj) => {
  obj.isFavorite = !(obj.isFavorite ?? false)
  if (isLocalCacheLikes) {
    const transaction = db.value.transaction('obj2like', 'readwrite')
    const iDbStore = transaction.objectStore('obj2like')
    const getRequest = iDbStore.get(obj.id)
    getRequest.onsuccess = function () { 
      const existingData = getRequest.result
      existingData.like = obj.isFavorite ?? false
      // Update the entry in the object store
      const updateRequest = iDbStore.put(existingData)
      updateRequest.onsuccess = () => console.log('Entry updated successfully')
      updateRequest.onerror = () => console.error('Error updating entry')
    }
    getRequest.onerror = () => console.error('Error retrieving entry')
  }
}

const isTableView = false
const isLocalCacheLikes = true
</script>
<template>
  <div v-if="store.state.fetched" :class="{ 'pa-8': store.state.objs?.length ?? false }">
    <p v-if="store.state.objs?.length ?? false" class="text-h5 mb-4">Могут подойти</p>
    <div v-else class="h-screen w-screen d-flex flex-column gap-4 justify-center align-center">
      <v-img
        src="@/assets/token_prop_placeholder.jpg"
        width="auto"
        :height="281.31"
        :max-height="281.31"
        :draggable="false" />
      <p class="text-h5">Объекты не найдены</p>
    </div>
    <v-row v-if="isTableView" justify="end">
      <v-col cols="auto">
        <v-menu
          :location="'start'"
          v-model="sortMenu"
          :close-on-content-click="false"
          offset-y
          :offset="[10, 0]">
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
          offset-y
          :offset="[10, 0]">
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
    <v-row v-if="store.state.objs" :align="'stretch'">
      <v-col v-for="obj in store.state.objs" :key="obj.id" :cols="isMobile ? 12 : 'auto'">
        <v-card
          :disabled="obj.tokens_available <= 0"
          :elevation="0"
          :rounded="'lg'"
          class="mx-auto border d-flex flex-column"
          :min-width="isMobile ? 323.5 - 16 * 2 : 323.5"
          :max-width="isMobile ? null : 323.5"
          :min-height="403.31"
          :height="'100%'">
          <!-- :height="'100%'" for stretch cards by vertically for other cards height in row -->
          <!-- 85% of height card for img style="min-height: 85% !important; height: 85%" -->
          <!-- https://cdn.vuetifyjs.com/images/cards/docks.jpg -->
          <v-img
            :src="obj.photos.length ? obj.photos[0].url : require('@/assets/token_prop_placeholder.jpg')"
            :height="281.31"
            :max-height="281.31"
            :draggable="false"
            class="align-end text-white"
            cover
            @error="onObjImgError(obj)">
            <template #placeholder>
              <div class="d-flex justify-center align-center h-100">
                <v-progress-circular
                  :bg-color="'transparent'"
                  color="primary"
                  indeterminate />
              </div>
            </template>
          </v-img>
          <v-card-title>
            <p class="text-wrap">
              {{ obj.name }}
            </p>
          </v-card-title>
          <v-card-subtitle class="text-wrap">
            <p class="mb-3">
              {{ obj.description.length > MAX_DESC_LENGTH ? `${obj.description.substring(0, MAX_DESC_LENGTH)}...` : obj.description }}
            </p>
            <p class="mb-3">{{ obj.address }}</p>
          </v-card-subtitle>
          <!-- hide below btn because btn can not be aligned to footer, but btn must be in DOM -->
          <v-btn
            class="text-none mt-auto"
            :color="'#9083F7'"
            :text="`Available ${obj.tokens_available} tokens at $${obj.token_price}`"
            :width="'100%'" />
          <v-btn
            v-if="obj.tokens_available > 0"
            :color="'#fff'"
            :position="'absolute'"
            :elevation="obj.tokens_available <= 0 ? 0 : undefined"
            class="like-btn"
            icon
            @click="toggleLike(obj)">
            <v-fade-transition leave-absolute>
              <v-icon v-if="obj.isFavorite ?? false" :color="'#f00'">mdi-heart</v-icon>
              <v-icon v-else :color="'#bbb'">mdi-heart-outline</v-icon>
            </v-fade-transition>
          </v-btn>
        </v-card>
      </v-col>
    </v-row>
  </div>
  <v-row v-else :justify="'center'" :align-content="'center'" class="h-screen me-0">
    <v-progress-circular
      :bg-color="'transparent'"
      size="100"
      color="primary"
      indeterminate />
  </v-row>
  <v-snackbar v-model="isShowSnackbar" color="#f00" absolute :offset="[10, 0]" :location="'top end'">
    {{ snackbarContent }}
  </v-snackbar>
</template>
<style scoped>
.like-btn {
  right: 15px;
  top: 15px;
}
</style>
