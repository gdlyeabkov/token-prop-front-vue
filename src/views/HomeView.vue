<script setup>
import { onMounted, ref } from 'vue'
import { useStore } from 'vuex'
import { useDisplay } from 'vuetify'
import { useRouter, useRoute } from 'vue-router'

const store = useStore()
const { xs: isMobile } = useDisplay()
const router = useRouter()
const route = useRoute()

/*
 * force not use sort menu
 * const isShowSortMenu = ref(false)
 * const sortMenuItem = ref(null)
 * const sortOptions = ref([
 * { label: 'Цена объекта', value: 'obj-price' },
 * { label: 'Цена токена', value: 'token-price' },
 * { label: 'Доходность', value: 'yield' },
 * ])
 * const isShowFilterMenu = ref(false)
 * const filterMenuItem = ref(null)
 * const filterOptions = ref([
 * { label: 'По гео', value: 'geo' },
 * { label: 'Провайдер', value: 'provider' },
 * { label: 'Тип сделки', value: 'deal' },
 * { label: 'Доступны/не доступны токены', value: 'tokens' },
 * { label: 'Сеть блокчейна', value: 'blockchain' },
 * ])
 */

const db = ref(null)

const isShowSnackbar = ref(false)
const snackbarContent = ref('')

/*
 * const selectSort = (item) => {
 * isShowSortMenu.value = false
 * sortMenuItem.value = item.value
 * }

 * const selectFilter = (item) => {
 * isShowFilterMenu.value = false
 * filterMenuItem.value = item.value
 * }
 */

const onObjImgError = (obj) => {
  obj.photos[0].url = ''
}

onMounted(async () => {
  const budget = route.query.budget
  if (budget) portfolioBudget.value = budget
  const propType = route.query.prop_type
  if (propType) propTypeInPortfolio.value = propType
  const numOfProps = route.query.num_of_props
  if (numOfProps) numOfPropsForPortfolio.value = numOfProps
  const geo = route.query.geo
  if (geo) {
    geoDiversification.value = 'COUNTRY'
    countries.value = geo.split(',')
  }
  const deal = route.query.deal_type
  if (deal) dealType.value = deal
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
        for (let obj of store.state.objs ?? []) {
          const data = {
            id: obj.id,
            like: false
          }
          // create entry if db not contain
          const getRequest = iDbStore.get(obj.id)
          getRequest.onsuccess = function () { 
            const existingData = getRequest.result
            if (!existingData) {
              iDbStore.add(data)
              obj.isFavorite = false
            } else {
              obj.isFavorite = existingData?.like ?? false
            }
          }
          getRequest.onerror = () => {
            isShowSnackbar.value = true
            snackbarContent.value = 'Произошла ошибка'
            console.error('Error retrieving entry')
          }
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

const MAX_DESC_LENGTH = 150

const toggleLike = (obj) => {
  obj.isFavorite = !(obj.isFavorite ?? false)
  if (isLocalCacheLikes) {
    const transaction = db.value.transaction('obj2like', 'readwrite')
    const iDbStore = transaction.objectStore('obj2like')
    const getRequest = iDbStore.get(obj.id)
    getRequest.onsuccess = function () { 
      const existingData = getRequest.result
      existingData.like = obj.isFavorite
      // Update the entry in the object store
      const updateRequest = iDbStore.put({
        id: obj.id,
        like: obj.isFavorite
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

const isTableView = ref(false)
const isLocalCacheLikes = true

const toggleViewMode = () => {
  isTableView.value = !isTableView.value
  // update data after toggle view mode
  // reset filters for return to grid view mode because or else invalid behaviour or transfer filters only for isTableView
  updateTableItems()
}

const resetFilters = () => {
  /*
   * force not use sort and filter menus
   * isShowSortMenu.value = false
   * sortMenuItem.value = null
   * isShowFilterMenu.value = false
   * filterMenuItem.value = null
   */
  dealType.value = 'Balanced (higher projected total yield)'
  numOfPropsForPortfolio.value = 10
  portfolioBudget.value = undefined
  propTypeInPortfolio.value = 'Mixed'
  geoDiversification.value = 'ALL'
  countries.value = []
  // update data after reset filters
  updateTableItems()
  syncQuery()
}

const updateTableItems = () => {
  const filters = {
    'name': ['icontains'],
    'provider__name': ['icontains'],
    'deal_type': ['exact'],
    // 'deal_type': dealType.value,
    // 'property_type': ['exact'],
    'address': ['icontains'],
    'province': ['exact'],
    'country': countries.value.length && geoDiversification.value === 'COUNTRY' ? countries.value[0] : [],
    'projected_rental_yield': ['gte', 'lte'],
    'projected_appreciation': ['gte', 'lte'],
    'tokens_total': ['gte', 'lte'],
    'tokens_sold': ['gte', 'lte'],
    'tokens_available': ['gte', 'lte'],
    // 'property_price': ['gte', 'lte'],
    'property_price': [portfolioBudget.value],
  }
  // transfer country filters as ['Turkey', 'Africa', ...] not working 
  if (isTableView.value) store.dispatch('getObjs', filters)
  else store.dispatch('getObjs')
}

const dealType = ref('Balanced (higher projected total yield)')

const numOfPropsForPortfolio = ref(10)

const portfolioBudget = ref()

const propTypeInPortfolio = ref('Mixed')

const geoDiversification = ref('ALL')

const countries = ref([])

const onCountryToggled = () => {
  // update data after toggle view mode
  updateTableItems()
  syncQuery()
}

const portfolioBudgetChanged = () => {
  // update data after toggle view mode
  updateTableItems()
  syncQuery()
}

const syncQuery = () => {
  const query = {
    budget: portfolioBudget.value,
    num_of_props: numOfPropsForPortfolio.value,
    prop_type: propTypeInPortfolio.value,
    deal_type: dealType.value
  }
  if (geoDiversification.value === 'COUNTRY' && countries.value.length) query.geo = countries.value.join(',')
  router.replace({
    query
  })
}

const onGeoDiversificationChanged = () => {
  // update data after toggle view mode
  updateTableItems()
  syncQuery()
}

const dealTypeChanged = () => {
  // update data after toggle view mode
  updateTableItems()
  syncQuery()
}

const DEAL_TYPES = [
  {
    display: 'Conservative (higher rental yields)',
    value: 'CONSERVATIVE',
  },
  {
    display: 'Balanced (higher projected total yield)',
    value: 'BALANCED',
  },
  {
    display: 'Riskier (higher projected appreciation)',
    value: 'RISKIER',
  },
]

const PROP_TYPES = [
  {
    display: 'Commercial Only',
    value: 'COMMERCIAL_ONLY',
  },
  {
    display: 'Residential Only',
    value: 'RESIDENTIAL_ONLY',
  },
  {
    display: 'Mixed',
    value: 'MIXED',
  },
]

const numOfPropsChanged = () => {
  // update data after toggle view mode
  updateTableItems()
  syncQuery()
}

const propTypeChanged = () => {
  // update data after toggle view mode
  updateTableItems()
  syncQuery()
}
</script>
<template>
  <div v-if="store.state.fetched" :class="{ 'pa-8': (store.state.objs?.length ?? false) || isTableView }">
    <!-- <div v-if="store.state.objs?.length ?? false"> -->
    <div v-if="(store.state.objs?.length ?? false) || isTableView">
      <p class="text-h5 mb-4">Могут подойти</p>
      <v-row no-gutters>
        <v-spacer />
        <v-btn color="primary" dark icon class="mb-4" @click="toggleViewMode">
          <v-icon v-if="isTableView">mdi-table</v-icon>
          <v-icon v-else>mdi-grid</v-icon>
        </v-btn>
      </v-row>
    </div>
    <div v-else class="h-screen w-screen d-flex flex-column gap-4 justify-center align-center">
      <v-img
        src="@/assets/token_prop_placeholder.jpg"
        width="auto"
        :height="281.31"
        :max-height="281.31"
        :draggable="false" />
      <p class="text-h5">Объекты не найдены</p>
    </div>
    <!-- force not use menus -->
    <!-- <v-expand-transition>
      <div v-if="isTableView" class="d-flex flex-column mb-4" style="gap: 16px">
        <v-row justify="end">
          <v-col cols="auto">
            <v-menu
              :location="'start'"
              v-model="isShowSortMenu"
              :close-on-content-click="false"
              offset-y
              :offset="[10, 0]">
              <template #activator="{ props }">
                <v-btn v-bind="props" color="primary" dark icon>
                  <v-icon>mdi-sort</v-icon>
                </v-btn>
              </template>
              <v-list class="pa-0">
                <v-list-item
                  v-for="(option, index) in sortOptions"
                  :key="index"
                  :variant="sortMenuItem === option.value ? 'tonal' : null"
                  @click="selectSort(option)">
                  <v-list-item-title>{{ option.label }}</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </v-col>
          <v-col cols="auto">
            <v-menu
              :location="'start'"
              v-model="isShowFilterMenu"
              :close-on-content-click="false"
              offset-y
              :offset="[10, 0]">
              <template #activator="{ props }">
                <v-btn v-bind="props" color="secondary" dark icon>
                  <v-icon>mdi-filter</v-icon>
                </v-btn>
              </template>
              <v-list class="pa-0">
                <v-list-item
                  v-for="(option, index) in filterOptions"
                  :key="index"
                  :variant="filterMenuItem === option.value ? 'tonal' : null"
                  @click="selectFilter(option)">
                  <v-list-item-title>{{ option.label }}</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </v-col>
        </v-row>
      </div>
    </v-expand-transition> -->
    <v-row :align="'stretch'">
      <!-- cols="4" for filters in aside -->
      <v-col v-if="isTableView" cols="12">
        <p class="text-subtitle-2 mb-4">Portfolio budget</p>
        <v-text-field v-model="portfolioBudget" :type="'number'" class="mb-4" :append-icon="'mdi-currency-usd'" @input="portfolioBudgetChanged" />
        <p class="text-subtitle-2 mb-4">Number of properties for portfolio</p>
        <v-slider
          :min="1"
          :max="20"
          :step="1"
          :thumb-label="'always'"
          :tick-size="0"
          :show-ticks="'always'"
          v-model="numOfPropsForPortfolio"
          class="mb-4"
          @update:modelValue="(val) => numOfPropsChanged = val">
          <template #tick-label="{ index }">
            <p v-if="index === 0">1</p>
            <p v-else-if="index === 19">20</p>
          </template>
        </v-slider>
        <p class="text-subtitle-2 mb-4">Property type in portfolio</p>
        <v-select
          v-model="propTypeInPortfolio"
          :items="PROP_TYPES"
          :item-title="'display'"
          :item-value="'value'"
          class="mb-4"
          @update:modelValue="propTypeChanged" />
        <p class="text-subtitle-2 mb-4">GEO diversification</p>
        <v-form>
          <v-radio-group v-model="geoDiversification">
            <v-radio
              :label="'Country'"
              :value="'COUNTRY'"
              :checked="geoDiversification === 'COUNTRY' || Array.isArray(geoDiversification)"
              @change="onGeoDiversificationChanged" />
            <v-selection-control-group v-model="countries">
              <v-expand-transition>
                <div v-show="geoDiversification === 'COUNTRY'" class="ms-4">
                  <v-checkbox
                    class="mb-0 pa-0"
                    :label="'North America'"
                    :value="'NORTH_AMERICA'"
                    v-model="countries"
                    @change="onCountryToggled" />
                  <v-checkbox
                    class="mb-0 pa-0"
                    :label="'South America'"
                    :value="'SOUTH_AMERICA'"
                    v-model="countries"
                    @change="onCountryToggled" />
                  <v-checkbox
                    class="mb-0 pa-0"
                    :label="'Asia'"
                    :value="'ASIA'"
                    v-model="countries"
                    @change="onCountryToggled" />
                  <v-checkbox
                    class="mb-0 pa-0"
                    :label="'Australia & Oceania'"
                    :value="'AUSTRALIA_AND_OCEANIA'"
                    v-model="countries"
                    @change="onCountryToggled" />
                  <v-checkbox
                    class="mb-0 pa-0"
                    :label="'Africa'"
                    :value="'AFRICA'"
                    v-model="countries"
                    @change="onCountryToggled" />
                  <v-checkbox
                    class="mb-0 pa-0"
                    :label="'Middle East'"
                    :value="'MIDDLE_EAST'"
                    v-model="countries"
                    @change="onCountryToggled" />
                </div>
              </v-expand-transition>
            </v-selection-control-group>
            <v-radio
              :label="'All'"
              :value="'ALL'"
              @change="onGeoDiversificationChanged" />
          </v-radio-group>
        </v-form>
        <p class="text-subtitle-2 mb-4">Deal type diversification</p>
        <v-select
          v-model="dealType"
          :items="DEAL_TYPES"
          class="mb-4"
          :item-title="'display'"
          :item-value="'value'"
          @update:modelValue="dealTypeChanged" />
        <div class="d-flex flex-column" style="gap: 10px;">
          <v-btn color="red" class="text-none" @click="resetFilters">
            Reset Filters
          </v-btn>
          <v-btn color="primary" class="text-none" @click="updateTableItems">
            Show me best deals
          </v-btn>
        </div>
      </v-col>
      <!-- cols="8" for filters in aside -->
      <v-col v-if="isTableView" cols="12">
        <!-- TODO: fix header -->
        <!-- example: fixed-header height="68vh" -->
        <v-data-table
          fixed-header
          :item-key="'id'"
          :must-sort="true"
          :headers="[
            { title: 'Property name', key: 'name' },
            { title: 'Country', key: 'country' },
            { title: 'Deal Type', key: 'deal_type' },
            { title: 'Provider', key: 'provider.name' },
            { title: 'Property price', key: 'property_price' },
            { title: 'Projected Rental Yield', key: 'projected_rental_yield' },
            { title: 'Projected Appreciation', key: 'projected_appreciation' },
            { title: 'Projected Total Yield', value: 'PROJECTED_TOTAL_YIELD' },
            { title: 'Suggested to buy', value: 'SUGGESTED_TO_BUY' },
            { title: 'Add to favorites', value: 'ADD_TO_FAVORITES' },
          ]"
          :items="store.state.objs ?? []">
          <template #[`item.name`]="{ item }">
            {{ item.name }}
          </template>
          <template #[`item.country`]="{ item }">
            {{ item.country.code }}
          </template>
          <template #[`item.deal_type`]="{ item }">
            {{ item.deal_type }}
          </template>
          <template #[`item.provider.name`]="{ item }">
            {{ item.provider.name }}
          </template>
          <template #[`item.property_price`]="{ item }">
            {{ item.property_price?.length ? `$${item.property_price}` : '' }}
          </template>
          <template #[`item.projected_rental_yield`]="{ item }">
            {{ item.projected_rental_yield?.length ? `$${item.projected_rental_yield}` : '' }}
          </template>
          <template #[`item.projected_appreciation`]="{ item }">
            {{ item.projected_appreciation?.length ? `$${item.projected_appreciation}` : '' }}
          </template>
          <template #[`item.PROJECTED_TOTAL_YIELD`]>
            <!-- ? -->
          </template>
          <template #[`item.SUGGESTED_TO_BUY`]>
            <!-- ? -->
          </template>
          <template #[`item.ADD_TO_FAVORITES`]="{ item }">
            <v-fade-transition leave-absolute @click="toggleLike(item)">
              <v-icon v-if="item.isFavorite ?? false" :color="'#f00'">mdi-heart</v-icon>
              <v-icon v-else :color="'#bbb'">mdi-heart-outline</v-icon>
            </v-fade-transition>
          </template>
        </v-data-table>
      </v-col>
      <template v-else>
        <v-col v-for="obj in store.state.objs ?? []" :key="obj.id" :cols="isMobile ? 12 : 'auto'">
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
      </template>
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
<style>
.v-data-table th {
  white-space: nowrap; /* Prevent wrapping */
}
</style>
