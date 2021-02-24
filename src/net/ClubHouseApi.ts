import { v4 as uuidv4 } from 'uuid'
import fetch from 'node-fetch'
import { PubSub } from '../utils/PubSub'
import { useEffect, useState } from 'react'
import { delay } from '../utils/time'

class ClubHouseApi {
    private token: string | undefined
    private uid: number | undefined
    private events = new PubSub<{ type: 'auth_state_change' }>()

    public apiBase = 'https://www.clubhouseapi.com/api'

    public baseHeaders = {
        'User-Agent': 'clubhouse/297 (iPhone; iOS 14.4; Scale/2.00)',
        'CH-Languages': 'en-US',
        'CH-Locale': 'en_US',
        'CH-AppVersion': '0.1.27',
        'CH-AppBuild': '297',
        'CH-DeviceId': uuidv4(),
        'CH-UserID': '(null)',
        'Content-Type': 'application/json; charset=utf-8',
    }

    isAuthorized() {
        return !!this.token && !!this.uid
    }

    getUid() {
        return this.uid
    }

    async setToken(uid: number, token: string) {
        this.uid = uid
        this.token = token
        localStorage.setItem('CH-token', token)
        localStorage.setItem('CH-uid', uid.toString(10))
        await delay(2000)
        this.events.publish({ type: 'auth_state_change' })
    }

    initialize() {
        let token = localStorage.getItem('CH-token')
        let uid = localStorage.getItem('CH-uid')

        if (token && uid) {
            this.token = token
            this.uid = parseInt(uid, 10)
        }
    }

    async call(method: string, body?: any) {
        let headers: any = { ...this.baseHeaders }
        if (this.token) {
            headers['Authorization'] = 'Token ' + this.token
        }

        let res = await fetch(this.apiBase + method, {
            headers,
            method: body ? 'POST' : 'GET',
            body: body ? JSON.stringify(body) : undefined,
        })

        return await res.json()
    }

    useAuthorized() {
        let [isAuthorized, setIsAuthorized] = useState(this.isAuthorized())
        useEffect(() => {
            return this.events.subscribe((ev) => {
                if (ev.type === 'auth_state_change') {
                    setIsAuthorized(this.isAuthorized())
                }
            })
        }, [])

        return isAuthorized
    }
}

let cached: ClubHouseApi | null = null

export const getClient = () => {
    if (cached) {
        return cached
    }
    cached = new ClubHouseApi()
    cached.initialize()
    return cached
}