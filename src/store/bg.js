import {defineStore} from "pinia";

export const useColorStore = defineStore('colors', {
    state: () => ({
        colors: {
            bg: '#CBCACA',
            highlight: '#331917'
        },
        categoryColors: {
            image: {
                bg: '#CECFC5',
                highlight: '#848D13'
            },
            text: {
                bg: '#C7D6DD',
                highlight: '#048ECA'
            },
            symbol: {
                bg: '#DCCBC9',
                highlight: '#FE4936'
            },
            person: {
                bg: '#D7CCB9',
                highlight: '#C58714'
            },
            defaultCol: {
                bg: '#CBCACA',
                highlight: '#331917'
            }
        }
    }),
    getters: {
        getColors() {
            return this.colors
        },
        getColorsOfCategory: (state) => {
            return cat => {
                const col = state.categoryColors[cat]
                if(col) return col
                return state.categoryColors.defaultCol
            }
        }
    },
    actions: {
       setBgColor(cat) {
           const getColorsOfCategory = this.getColorsOfCategory
           this.colors = getColorsOfCategory(cat)
       }
    }
})