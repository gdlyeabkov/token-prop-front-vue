<script setup>
import { onMounted, ref } from 'vue'
import { useStore } from 'vuex'
import { useDisplay } from 'vuetify'
import { useRoute } from 'vue-router'

const store = useStore()
const { xs: isMobile } = useDisplay()

const db = ref(null)

const isShowSnackbar = ref(false)
const snackbarContent = ref('')

const isShowAllPhotos = ref(false)
const detailPhotoIndex = ref(0)

const tab = ref('DESC')
const tokensPurchased = ref(1)
const appreciation = ref(1)

const onObjImgError = () => {
  store.state.obj.photos[0].url = ''
}

onMounted(async () => {
  const route = useRoute()
  try {
    await store.dispatch('getObj', route.params.id)
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
        const data = {
          id: store.state.obj?.id,
          like: false
        }
        // create entry if db not contain
        const getRequest = iDbStore.get(store.state.obj.id)
        getRequest.onsuccess = function () { 
          const existingData = getRequest.result
          if (!existingData) {
            iDbStore.add(data)
            store.state.obj.isFavorite = false
          } else {
            store.state.obj.isFavorite = existingData?.like ?? false
          }
        }
        getRequest.onerror = () => {
          isShowSnackbar.value = true
          snackbarContent.value = 'Произошла ошибка'
          console.error('Error retrieving entry')
        }
        
        transaction.oncomplete = () => console.log('Data written successfully')
        transaction.onerror = () => {
          isShowSnackbar.value = true
          snackbarContent.value = 'Произошла ошибка'
          console.error('Error writing data')
        }
      }
    }
  } catch (e) {
    isShowSnackbar.value = true
    snackbarContent.value = 'Произошла ошибка'
  }
})

const toggleLike = () => {
  store.state.obj.isFavorite = !(store.state.obj.isFavorite ?? false)
  if (isLocalCacheLikes) {
    const transaction = db.value.transaction('obj2like', 'readwrite')
    const iDbStore = transaction.objectStore('obj2like')
    const getRequest = iDbStore.get(store.state.obj.id)
    getRequest.onsuccess = function () { 
      const existingData = getRequest.result
      existingData.like = store.state.obj.isFavorite
      // Update the entry in the object store
      const updateRequest = iDbStore.put({
        id: store.state.obj.id,
        like: store.state.obj.isFavorite
      })
      updateRequest.onsuccess = () => console.log('Entry updated successfully')
      updateRequest.onerror = () => {
        isShowSnackbar.value = true
        snackbarContent.value = 'Произошла ошибка'
        console.error('Error updating entry')
      }
    }
    getRequest.onerror = () => {
      isShowSnackbar.value = true
      snackbarContent.value = 'Произошла ошибка'
      console.error('Error retrieving entry')
    }
  }
}

const isLocalCacheLikes = true

const viewAllPhotos = () => {
  isShowAllPhotos.value = true
}

const prevPhoto = () => {
  detailPhotoIndex.value--
}

const nextPhoto = () => {
  detailPhotoIndex.value++
}

const closeGallery = () => {
  isShowAllPhotos.value = false
}
</script>
<template>
  <div v-if="store.state.fetched">
    <div v-if="store.state.obj" :elevation="0">
      <v-col :cols="12">
        <div style="position: relative" class="mb-8">
          <v-row>
            <v-col :cols="4" class="pa-0">
              <v-img
                :src="store.state.obj.photos.length ? store.state.obj.photos[0].url : require('@/assets/token_prop_placeholder.jpg')"
                :height="400"
                :draggable="false"
                class="align-end text-white"
                cover
                @error="onObjImgError">
                <template #placeholder>
                  <div class="d-flex justify-center align-center h-100">
                    <v-progress-circular
                      :bg-color="'transparent'"
                      color="primary"
                      indeterminate />
                  </div>
                </template>
              </v-img>
            </v-col>
            <v-col :cols="4" class="pa-0">
              <v-img
                :src="store.state.obj.photos.length ? store.state.obj.photos[1].url : require('@/assets/token_prop_placeholder.jpg')"
                :height="400"
                :draggable="false"
                class="align-end text-white"
                cover
                @error="onObjImgError">
                <template #placeholder>
                  <div class="d-flex justify-center align-center h-100">
                    <v-progress-circular
                      :bg-color="'transparent'"
                      color="primary"
                      indeterminate />
                  </div>
                </template>
              </v-img>
            </v-col>
            <v-col :cols="4" class="pa-0">
              <v-img
                :src="store.state.obj.photos.length ? store.state.obj.photos[2].url : require('@/assets/token_prop_placeholder.jpg')"
                :height="400"
                :draggable="false"
                class="align-end text-white"
                cover
                @error="onObjImgError">
                <template #placeholder>
                  <div class="d-flex justify-center align-center h-100">
                    <v-progress-circular
                      :bg-color="'transparent'"
                      color="primary"
                      indeterminate />
                  </div>
                </template>
              </v-img>
            </v-col>
          </v-row>
          <v-btn
            icon
            class="text-none mt-auto ma-0"
            style="position: absolute; left: 15px; top: 35px"
            :elevation="0"
            @click="$router.go(-1)">
            <v-icon>mdi-chevron-left</v-icon>
          </v-btn>
          <v-btn
            :min-height="40"
            class="text-none mt-auto ma-0"
            style="position: absolute; right: 15px; top: 35px"
            :color="'#fff'"
            :elevation="0"
            :text="'View all photos'"
            @click="viewAllPhotos">
            <template #prepend>
              <v-icon :color="'#ccc'">mdi-image</v-icon>
            </template>
          </v-btn>
        </div>
        <div style="position: relative">
          <div>
            <v-card-title>
              <v-row align="center" no-gutters>
                <p class="text-wrap text-h4 me-4">
                  {{ store.state.obj.name }}
                </p>
                <v-fade-transition leave-absolute>
                  <v-icon v-if="store.state.obj.isFavorite ?? false" :size="20" :color="'#f00'" @click="toggleLike">mdi-heart</v-icon>
                  <v-icon v-else :size="20" :color="'#bbb'" @click="toggleLike">mdi-heart-outline</v-icon>
                </v-fade-transition>
              </v-row>
            </v-card-title>
            <v-card-subtitle class="text-wrap">
              <!-- not use desc -->
              <!-- <p class="mb-3">
                {{ store.state.obj.description }}
              </p> -->
              <p class="mb-3 text-h5">{{ store.state.obj.address }}</p>
              <p class="mb-3 text-h5">Price per token ${{ store.state.obj.token_price }}</p>
            </v-card-subtitle>
          </div>
          <div :style="`${isMobile ? '' : 'position: absolute; '} height: 100%; top: -100px; right: 50px`">
            <div style="position: sticky; top: 50px; right: 0px; margin-left: auto; z-index: 999">
              <v-card
                class="border"
                :width="isMobile ? '100%' : 460"
                :color="'#fff'"
                :elevation="0"
                :rounded="'lg'">
                <div style="background-color: rgb(242 240 255)" class="pa-4 mb-6">
                  <v-row no-gutters align="end">
                    <p class="text-h5">Starting Price</p>
                    <v-spacer />
                    <span class="text-h6">$</span>
                    <!-- <p class="text-h4">50.63</p> -->
                    <!-- TODO:bind -->
                    <p class="text-h4">{{ store.state.obj.property_price }}</p>
                  </v-row>
                </div>
                <v-card-text>
                  <!-- force not use Projected Annual Return -->
                  <!--
                  <v-row no-gutters class="mb-6">
                    <p class="text-h6">Projected Annual Return</p>
                    <v-spacer />
                    <p class="text-h6">16.04%</p>
                  </v-row>
                  -->
                  <v-row no-gutters class="mb-6">
                    <p class="text-h6">Projected Rental Yield</p>
                    <v-spacer />
                    <p class="text-h6">{{ store.state.obj.projected_rental_yield }}%</p>
                  </v-row>
                  <!-- force not use Rental Yield -->
                  <!--
                  <v-row no-gutters class="mb-6">
                    <p class="text-h6">Rental Yield</p>
                    <v-spacer />
                    <p class="text-h6">16.04%</p>
                  </v-row>
                  -->
                </v-card-text>
                <v-card-actions class="pa-4 ms-auto mt-auto">
                  <v-row no-gutters>
                    <v-col class="me-4">
                      <v-btn
                        variant="elevated"
                        :color="'#9083F7'"
                        :rounded="'lg'"
                        :min-height="40"
                        class="text-none mt-auto ma-0"
                        :elevation="0"
                        :text="'Buy'"
                        block
                        :size="'x-large'" />
                    </v-col>
                    <v-col>
                      <v-btn
                        variant="outlined"
                        :color="'#9083F7'"
                        :rounded="'lg'"
                        :min-height="40"
                        class="text-none mt-auto ma-0"
                        :elevation="0"
                        :text="'Sell'"
                        block
                        :size="'x-large'" />
                    </v-col>
                  </v-row>
                </v-card-actions>
              </v-card>
            </div>
          </div>
          <v-col :cols="isMobile ? null : 7" class="pa-0">
            <div style="position: relative" class="pa-4">
              <v-tabs v-model="tab" class="mb-6">
                <v-tab :value="'DETAILS'" class="text-none">Details</v-tab>
                <v-tab :value="'FINANCIALS'" class="text-none">Financials</v-tab>
                <v-tab :value="'DOCS'" class="text-none">Documents</v-tab>
              </v-tabs>
              <div v-if="tab === 'DETAILS'">
                <p class="text-subtitle-2 mb-4">
                  {{ store.state.obj.description }}
                </p>
              </div>
              <div v-if="tab === 'FINANCIALS'">
                <v-card rounded="lg" :elevation="0" color="#08175D" class="mb-6">
                  <v-card-title class="pa-0">
                    <v-row no-gutters class="pa-4" align="center">
                      <p class="text-h5">Total Investment Value</p>
                      <v-spacer />
                      <p class="text-subtitle-2">
                        ${{ store.state.obj.amount_available_to_invest }}
                      </p>
                    </v-row>
                    <v-divider />
                    <v-row no-gutters class="pa-4">
                      <p class="text-subtitle-2">Underlying asset price</p>
                      <v-spacer />
                      <p class="text-subtitle-2">
                        ${{ store.state.obj.property_price }}
                      </p>
                    </v-row>
                  </v-card-title>
                </v-card>
                <p class="text-h5 mb-4">Projected returns per token</p>
                <v-card rounded="lg" :elevation="0" color="#08175D" class="mb-4">
                  <v-card-title class="pa-0">
                    <v-row no-gutters class="pa-4" align="center">
                      <p class="text-subtitle-2">Tokens purchased</p>
                      <v-spacer />
                      <p class="text-subtitle-2">
                        {{ tokensPurchased }} / ${{ store.state.obj.token_price * tokensPurchased }}
                      </p>
                    </v-row>
                    <!-- :thumb-color="'#08175D'" -->
                    <v-slider
                      :show-ticks="'always'"
                      :tick-size="0"
                      :step="1"
                      :min="1"
                      :max="store.state.obj.tokens_available"
                      :track-color="'#1E2B7A'"
                      :track-fill-color="'#4D3FED'"
                      :thumb-color="'#fff'"
                      :thumb-label="'always'"
                      v-model="tokensPurchased"
                      class="pa-4">
                      <template #thumb-label>
                        {{ tokensPurchased }}
                      </template>
                      <template #tick-label="{ index }">
                        <p v-if="index === 0">
                          {{ 1 }}
                        </p>
                        <p v-else-if="index === store.state.obj.tokens_available - 1">
                          {{ store.state.obj.tokens_available }}
                        </p>
                      </template>
                    </v-slider>
                    <v-row no-gutters class="pa-4" align="center">
                      <p class="text-subtitle-2">Appreciation</p>
                      <v-spacer />
                      <p class="text-subtitle-2">
                        {{ appreciation }}%
                      </p>
                    </v-row>
                    <!-- :thumb-color="'#08175D'" -->
                    <v-slider
                      :show-ticks="'always'"
                      :tick-size="0"
                      :min="1"
                      :max="100"
                      :step="1"
                      :track-color="'#1E2B7A'"
                      :track-fill-color="'#4D3FED'"
                      :thumb-color="'#fff'"
                      :thumb-label="'always'"
                      v-model="appreciation"
                      class="pa-4">
                      <template #thumb-label>
                        {{ (Number.parseFloat(store.state.obj.projected_appreciation) * appreciation).toFixed(2) }}
                      </template>
                      <template #tick-label="{ index }">
                        <p v-if="index === 0">
                          {{ 1 }}
                        </p>
                        <p v-else-if="index === 99">
                          {{ 100 }}
                        </p>
                      </template>
                    </v-slider>
                  </v-card-title>
                </v-card>
              </div>
              <div v-if="tab === 'DOCS'">
                <a class="text-subtitle-2 mb-4" :href="store.state.obj.property_smart_contract">
                  {{ store.state.obj.property_smart_contract }}
                </a>
              </div>
            </div>
          </v-col>
        </div>
      </v-col>
    </div>
    <div v-else class="h-screen w-screen d-flex flex-column gap-4 justify-center align-center">
      <v-img
        src="@/assets/token_prop_placeholder.jpg"
        width="auto"
        :height="281.31"
        :max-height="281.31"
        :draggable="false" />
      <p class="text-h5">Объект не найден</p>
    </div>
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
  <v-dialog v-model="isShowAllPhotos" fullscreen :width="'100%'" :height="'100%'" content-class="custom-dialog">
    <!-- src="@/assets/token_prop_placeholder.jpg" -->
    <v-img
      :src="detailPhotoIndex < store.state.obj.photos.length ? store.state.obj.photos[detailPhotoIndex].url : require('@/assets/token_prop_placeholder.jpg')"
      width="100%"
      :height="'100%'"
      :draggable="false" />
    <v-btn
      style="left: 15px; top: 50%"
      :color="'#fff'"
      :position="'absolute'"
      :elevation="store.state.obj.tokens_available <= 0 ? 0 : undefined"
      :disabled="detailPhotoIndex === 0"
      class="like-btn"
      icon
      @click="prevPhoto">
      <v-icon>mdi-chevron-left</v-icon>
    </v-btn>
    <v-btn
      style="right: 15px; top: 50%"
      :color="'#fff'"
      :position="'absolute'"
      :elevation="store.state.obj.tokens_available <= 0 ? 0 : undefined"
      :disabled="detailPhotoIndex >= store.state.obj.photos.length - 1"
      class="like-btn"
      icon
      @click="nextPhoto">
      <v-icon>mdi-chevron-right</v-icon>
    </v-btn>
    <v-btn
      style="right: 15px; top: 15px"
      :color="'#fff'"
      :position="'absolute'"
      :elevation="store.state.obj.tokens_available <= 0 ? 0 : undefined"
      :disabled="detailPhotoIndex >= store.state.obj.photos.length - 1"
      class="like-btn"
      icon
      @click="closeGallery">
      <v-icon>mdi-close</v-icon>
    </v-btn>
    <v-row style="width: 100%; position: absolute; left: 0; bottom: 35px" no-gutters class="mt-auto text-none" :justify="'center'">
      <v-btn
        :color="'#fff'"
        :elevation="store.state.obj.tokens_available <= 0 ? 0 : undefined"
        class="like-btn"
        style="pointer-events: none">
        {{ detailPhotoIndex + 1 }} / {{ store.state.obj.photos.length }}
      </v-btn>
    </v-row>
  </v-dialog>
</template>
<style>
.like-btn {
  right: 15px;
  top: 15px;
}

.custom-dialog {
  background-color: #020724; /* Change to desired color */
}
</style>
