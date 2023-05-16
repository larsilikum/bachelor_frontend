import Home from "../pages/Home.vue"
import ItemPage from "../pages/ItemPage.vue"
import {createRouter, createWebHashHistory} from "vue-router"
import MapPage from "../pages/MapPage.vue";

const routes = [
    {
        path: '/',
        component: Home
    },
    {
        path: '/item/:id',
        component: ItemPage
    },
    {
        path: '/map',
        component: MapPage
    }
]

export const router = createRouter({
    history: createWebHashHistory(),
    routes
})