import { sharedMediaEngine } from './index'
import Pubnub from 'pubnub'
import { useCallback, useEffect, useState } from 'react'
import { getClient } from '../net/ClubHouseApi'
import { PubSub, XPubSub } from '../utils/PubSub'
import { MultiList } from '../utils/MultiList'

const PUBNUB_PUB_KEY = 'pub-c-6878d382-5ae6-4494-9099-f930f938868b'
const PUBNUB_SUB_KEY = 'sub-c-a4abea84-9ca3-11ea-8e71-f2b83ac9263d'

type Room = {
    channel_id: number,
    channel: string
}

type InternalEvents =
    { type: 'current_room_updated' } |
    { type: 'members_updated' }

export type RoomMember = {
    user_id: number,
    name: string,
    photo_url?: string,
    username: string,
    first_name: string,
    skintone: number,
    is_new: boolean,
    is_speaker: boolean,
    is_moderator: boolean,
    time_joined_as_speaker: string,
    is_followed_by_speaker: boolean,
    is_invited_as_speaker: boolean
}

const MemberFilters = {
    isSpeaker: (m: RoomMember) => m.is_speaker,
    isFollowedBySpeakers: (m: RoomMember) => !m.is_speaker && m.is_followed_by_speaker,
    isListener: (m: RoomMember) => !m.is_speaker && !m.is_followed_by_speaker
}

class RoomMembersEngine {
    list = new MultiList<RoomMember, 'user_id'>([
        { name: 'all', checker: item => true },
        { name: 'speakers', checker: MemberFilters.isSpeaker },
        { name: 'followed_by_speakers', checker: MemberFilters.isFollowedBySpeakers },
        { name: 'listeners', checker: MemberFilters.isListener },
    ], 'user_id')

    initialize = (members: RoomMember[]) => {
        this.list.clear()
        this.list.insertBulkUnsafe(members)
    }

    onJoin = (member: RoomMember) => {
        this.list.insert({...member})
    }

    onLeave = (user_id: number) => {
        this.list.remove(user_id)
    }

    onAddSpeaker = (member: RoomMember) => {
        this.list.update(member)
    }

    useList = (listName: 'all'|'speakers'|'followed_by_speakers'|'listeners') => {
        let [list, setList] = useState([...this.list.getList(listName)])
        useEffect(() => {
            return this.list.events.subscribe('list_updated', (ev) => {
                if (ev.list === listName) {
                    setList([...this.list.getList(listName)])
                }
            })
        }, [])

        return list
    }
}

class RoomEngine {
    events = new XPubSub<InternalEvents>()
    currentRoom: Room | null = null
    // TODO: split to speakers, listeners
    currentRoomMembers: RoomMember[] = []
    pubnub: Pubnub | null = null
    members = new RoomMembersEngine()

    joinRoom = async (room: Room) => {
        if (this.currentRoom) {
            await this.leaveRoom()
        }

        let uid = getClient().getUid()
        if (!uid) {
            console.log('No auth')
            return
        }

        let res = await getClient().call('/join_channel', {
            channel: room.channel,
            attribution_source: 'feed',
            attribution_details: 'eyJpc19leHBsb3JlIjpmYWxzZSwicmFuayI6MX0=',
        })

        this.currentRoom = res
        this.currentRoomMembers = res.users
        this.members.initialize(res.users)

        sharedMediaEngine.joinChannel(res.token, room.channel, '', uid)
        sharedMediaEngine.enableAudioVolumeIndication(300, 3, true)

        this.events.post({ type: 'current_room_updated' })
        this.events.post({ type: 'members_updated' })

        this.pubnub = new Pubnub({
            publishKey: PUBNUB_PUB_KEY,
            subscribeKey: PUBNUB_SUB_KEY,
            heartbeatInterval: res.pubnub_heartbeat_interval,
            authKey: res.pubnub_token,
            origin: 'clubhouse.pubnub.com',
            uuid: uid.toString(10),
            presenceTimeout: res.pubnub_heartbeat_interval,
        })

        this.pubnub.addListener({
            message: (ev: Pubnub.MessageEvent) => this.handleRoomEvent(ev),
            status: (ev: Pubnub.StatusEvent) => console.log(ev),
            signal: (ev: Pubnub.SignalEvent) => console.log(ev),
            presence: (ev: Pubnub.PresenceEvent) => console.log(ev),
        })

        this.pubnub.subscribe({
            channels: [
                'channel_all.' + room.channel,
                'channel_user.' + room.channel + '.' + uid,
                // 'channel_speakers.' + channel.channel,
                'users.' + uid,
            ],
        })

        sharedMediaEngine.on('userMuteAudio', (uid, muted) => {
            console.log('mute change', uid, muted)
        })
    }

    leaveRoom = async () => {
        this.pubnub?.unsubscribeAll()
        this.pubnub = null
        if (this.currentRoom) {
            let channelId = this.currentRoom.channel_id
            await getClient().call('/leave_channel', { channel: channelId, channel_id: null })
            sharedMediaEngine.leaveChannel()
        }
        this.currentRoomMembers = []
        this.currentRoom = null

        // Notify hooks
        this.events.post({ type: 'current_room_updated' })
        this.events.post({ type: 'members_updated' })
    }

    useCurrentlySpeaking = () => {
        const [speakers, setSpeakers] = useState<number[]>([])

        useEffect(() => {
            let listener = (speakers: {
                uid: number;
                volume: number;
                vad: number;
                channelId: string;
            }[], speakerNumber: number, totalVolume: number) => {
                setSpeakers(speakers.map(s => s.uid))
            }
            sharedMediaEngine.on('groupAudioVolumeIndication', listener)

            return () => {
                sharedMediaEngine.removeListener('groupAudioVolumeIndication', listener)
            }
        }, [])

        return speakers
    }

    useCurrentRoom = () => {
        let [currentRoom, setCurrentRoom] = useState<any>(this.currentRoom)

        useEffect(() => {
            return this.events.subscribe('current_room_updated',ev => {
                if (!this.currentRoom) {
                    setCurrentRoom(null)
                } else {
                    setCurrentRoom({...this.currentRoom})
                }
            })
        }, [])

        return currentRoom
    }

    useMembers = () => {
        // TODO: throttle for big rooms
        let [members, setMembers] = useState<RoomMember[]>(this.currentRoomMembers)

        useEffect(() => {
            return this.events.subscribe('members_updated', ev => {
                setMembers([...this.currentRoomMembers])
            })
        }, [])

        return members
    }

    private handleRoomEvent = (ev: Pubnub.MessageEvent) => {
        let action = ev.message.action
        if (action === 'join_channel') {
            let existing = this.currentRoomMembers.find(u => u.user_id === ev.message.user_profile.user_id)
            if (!existing) {
                this.currentRoomMembers.push(ev.message.user_profile)
                this.events.post({ type: 'members_updated' })
            } else {
                console.log('trying to add existing user')
            }
            this.members.onJoin(ev.message.user_profile)
        } else if (action === 'leave_channel') {
            let index = this.currentRoomMembers.findIndex(u => u.user_id === ev.message.user_id)
            if (index > -1) {
                this.currentRoomMembers.splice(index, 1)
                this.events.post({ type: 'members_updated' })
            } else {
                console.log('trying to remove non-existing user')
            }
            this.members.onLeave(ev.message.user_id)
        } else if (action === 'add_speaker') {
            let existing = this.currentRoomMembers.find(u => u.user_id === ev.message.user_profile.user_id)
            if (!existing) {
                this.currentRoomMembers.push(ev.message.user_profile)
                this.events.post({ type: 'members_updated' })
            } else {
                let index = this.currentRoomMembers.indexOf(existing)
                if (!index) {
                    console.log('member not found')
                    return
                }
                this.currentRoomMembers[index] = { ...existing, ...ev.message.user_profile }
                this.events.post({ type: 'members_updated' })
            }
            this.members.onAddSpeaker(ev.message.user_profile)
        } else {
            console.log('unknown event', ev.message)
        }
    }
}

export const sharedRoomEngine = new RoomEngine()