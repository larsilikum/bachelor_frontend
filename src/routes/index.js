import Home from "../pages/Home.vue"
import ItemPage from "../pages/ItemPage.vue"
import {createRouter, createWebHashHistory} from "vue-router"

const routes = [
    {
        path: '/',
        component: Home
    },
    {
        path: '/item/:id',
        component: ItemPage
    }
]

export const router = createRouter({
    history: createWebHashHistory(),
    routes
})