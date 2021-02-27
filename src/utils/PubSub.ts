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

type BaseEvent = { type: string }
type SubscriptionCallback<T> = (ev: T) => void
type Subscription<T extends BaseEvent> = { cb: SubscriptionCallback<T>, type?: T['type'] }

export class XPubSub<T extends BaseEvent> {
    private subs: Subscription<T>[] = []

    subscribeAll(cb: SubscriptionCallback<T>) {
        let sub = { cb }
        this.subs.push(sub)
        return () => this.removeSubscriber(sub)
    }

    subscribe<Type extends T['type']>(type: Type, cb: SubscriptionCallback<Extract<T, { type: Type }>>) {
        let sub = { cb: cb as SubscriptionCallback<T>, type }
        this.subs.push(sub)
        return () => this.removeSubscriber(sub)
    }

    post = (ev: T) => {
        process.nextTick(() => {
            for (let sub of this.subs) {
                if (!sub.type) {
                    sub.cb(ev)
                } else if (ev.type === sub.type) {
                    sub.cb(ev)
                }
            }
        })
    }

    private removeSubscriber = (sub: Subscription<T>) => {
        let index = this.subs.indexOf(sub)
        if (index === -1) {
            throw new Error('Double unsubscribe')
        }
        this.subs.splice(index, 1)
    }
}