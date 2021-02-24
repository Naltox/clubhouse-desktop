export const delay = (ms: number) => new Promise(resolve => setTimeout(() => resolve(), ms))

export function forever(cb: () => Promise<void>) {
    let running = true

    ;(async () => {
        while (running) {
            await cb()
        }
    })()

    return () => {
        running = false
    }
}