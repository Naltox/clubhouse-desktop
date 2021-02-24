import { useEffect, useState } from 'react';

export function useData<T>(req: () => Promise<T>) {
    const [data, setData] = useState<T|null>(null)

    const realFetch = async () => {
        setData(await req())
    }

    useEffect(() => {
        realFetch()
    }, [])

    return [data, setData]
}