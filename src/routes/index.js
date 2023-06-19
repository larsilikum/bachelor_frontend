import Home from "../pages/Home.vue"
import ItemPage from "../pages/ItemPage.vue"
import {createRouter, createWebHashHistory} from "vue-router"
import MapPage from "../pages/MapPage.vue";
import PosterPage from "../pages/PosterPage.vue";
import StickerPage from "../pages/StickerPage.vue";

const routes = [
    {
        path: '/',
        component: Home
    },
    {
        path: '/item/:id',
        name: 'Item',
        component: ItemPage
    },
    {
        path: '/map',
        component: MapPage
    },
    {
        path: '/poster',
        component: PosterPage
    },
    {
        path: '/sticker',
        component: StickerPage
    }
]

export const router = createRouter({
    history: createWebHashHistory(),
    routes
})