import { defineStore } from 'pinia'

import { Directus } from '@directus/sdk'

const directus = new Directus('http://localhost:8055');

export const useItemStore = defineStore('item', {
    state: () => ({
        items: []
    }),
    getters: {
        async getItems() {
            await this.fetchItems()
            return this.items
        },
        async getCategories() {
            await this.fetchCategories()
            return this.categories
        },
        getItemById: (state) => {
            return async id => {
                const item = state.items.find(i => i.id == id, state)
                if(item) return item
                return await state.fetchItemById(id)
            }
        },
        getReferencingItems: (state) => {
            return async id => {
                return await state.fetchReferencingItems(id)
            }
        }
    },
    actions: {
        async fetchItems() {
            const response = await directus.items('item').readByQuery({
                fields: ['*.*.*.*.*']
            })
            this.items = response.data
        },
        async fetchItemById(id) {
            const response = await directus.items('item').readByQuery({
                fields: ['*.*.*.*', 'display.image.*'],
                filter: {
                    id
                }
            })
            const item = response.data[0]
            this.items.push(item)
            return item
        },
        async fetchCategories() {
            const response = await directus.items('category').readByQuery({
                fields: ['*.*.*']
            })
            this.categories = response.data
        },
        async fetchReferencingItems(id) {
            const response = await directus.items('item').readByQuery({
                fields: ['*.*.*.*.*'],
                filter: {
                    references: {
                        related_item_id: {
                            id
                        }
                    }
                }
            })
            console.log(response.data)
            return response.data
        }
    }
})