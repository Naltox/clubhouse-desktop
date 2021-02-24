export class PubSub<T> {
    private subs: ((ev: T) => void)[] = []

    subscribe(cb: (ev: T) => void) {
        this.subs.push(cb)
        return () => {
            this.subs.splice(this.subs.indexOf(cb), 1)
        }
    }

    publish(ev: T) {
        this.subs.forEach(s => s(ev))
    }
}