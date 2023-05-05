import { defineStore } from 'pinia'

export const useItemStore = defineStore('item', {
    state: () => ({
        items: []
    }),
    getters: {
        getItems() {
            return this.items
        },
        getItemById: (state) => {
            return (id) => {
                const item = state.items.find(i => i.id === id)
                return item
            }
        }
    },
    actions: {
        fetchItems() {
            this.items = [{title: 'test', description: 'test description', id: '0'}]
        }
    }
})