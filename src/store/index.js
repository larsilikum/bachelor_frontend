import { defineStore } from 'pinia'
import { WBK } from 'wikibase-sdk'
const wbk = WBK({
    instance: 'https://localhost',
    sparqlEndpoint: 'http://localhost:8834/proxy/wdqs/bigdata/namespace/wdq/sparql' // Required to use `sparqlQuery` and `getReverseClaims` functions, optional otherwise
})

const headers = { 'User-Agent': '<client name>/<version> (<contact information>) <library/framework name>/<version>' }; // see https://meta.wikimedia.org/wiki/User-Agent_policy

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
                return state.items.find(i => i.id === id)

            }
        }
    },
    actions: {
        fetchItems() {
            this.items = [{title: 'test', description: 'test description', id: '0'}]
        },
        async fetchItemById(id) {
            const sparql =
                `
                SELECT ?source ?sourceLabel ?innerwikiLabel ?display (group_concat(distinct ?ref ;separator=", ") as ?refs)
                WHERE {
                    OPTIONAL { 
                        wd:${id} wdt:P4 ?source ;
                               wdt:P5 ?innerwiki ;
                               wdt:P6 ?display ;
                               wdt:P7 ?ref . 
                      }
                SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
                } 
                group by ?source ?sourceLabel ?innerwikiLabel ?display
                LIMIT 100
                `
            const url = wbk.sparqlQuery(sparql)
            const response = await fetch(url)
            console.table((await response.json()).results.bindings)
        }
    }
})