import { XPubSub } from './PubSub'

type MultiListCategoryChecker<T> = (item: T) => boolean
type SubListDeclaration<T> = { name: string, checker: MultiListCategoryChecker<T> }
type SubList<T> = SubListDeclaration<T> & { list: T[] }

export class MultiList<T, Key extends keyof T> {
    public readonly events = new XPubSub<{ type: 'list_updated', list: SubListDeclaration<T>['name'] }>()
    private subLists = new Map<SubListDeclaration<T>['name'], SubList<T>>()

    constructor(
        private subListDeclarations: SubListDeclaration<T>[],
        private idKey: Key
    ) {
        for (let d of subListDeclarations) {
            this.subLists.set(d.name, { ...d, list: [] })
        }
    }

    insert(item: T) {
        for (let entry of this.subLists.entries()) {
            let [,list] = entry
            if (list.checker(item)) {
                let ex = list.list.find(v => v[this.idKey] === item[this.idKey])
                if (ex) {
                    continue
                }
                list.list.push(item)
                this.events.post({ type: 'list_updated', list: list.name })
            }
        }
    }

    insertBulkUnsafe(items: T[]) {
        for (let entry of this.subLists.entries()) {
            let [,list] = entry
            list.list.push(...items.filter(list.checker))
            this.events.post({ type: 'list_updated', list: list.name })
        }
    }

    clear = () => {
        for (let entry of this.subLists.entries()) {
            let [,list] = entry
            list.list = []
        }
    }

    remove(id: T[Key]) {
        for (let entry of this.subLists.entries()) {
            let [,list] = entry
            let index = list.list.findIndex(v => v[this.idKey] === id)
            if (index === -1) {
                continue
            }
            list.list.splice(index, 1)
            this.events.post({ type: 'list_updated', list: list.name })
        }
    }

    update(newItem: T) {
        for (let entry of this.subLists.entries()) {
            let [,list] = entry
            let exIndex = list.list.findIndex(v => v[this.idKey] === newItem[this.idKey])

            if (exIndex > -1) {
                if (list.checker(newItem)) {
                    list.list[exIndex] = { ...newItem }
                } else {
                    list.list.splice(exIndex, 1)
                }
                this.events.post({ type: 'list_updated', list: list.name })
            } else {
                if (list.checker(newItem)) {
                    list.list.push(newItem)
                    this.events.post({ type: 'list_updated', list: list.name })
                }
            }
        }
    }

    getList = (listName: SubListDeclaration<T>['name']) => {
        return this.subLists.get(listName)!.list
    }
}