import React, { useEffect } from 'react'
import styled from 'styled-components'
import { useData } from '../utils/useData'
import { SpinnerSplash } from './Spinner'
import { getClient } from '../net/ClubHouseApi'
import { delay, forever } from '../utils/time'

const RoomBlock = styled.div<{ selected: boolean }>`
    padding: 25px;
    border-bottom: solid 1px #E7E8EC; 
`

const RoomTitle = styled.div`
    font-weight: 600;
    font-size: 17px;
    line-height: 24px;
`

const RoomMembers = styled.div`
    color: #71747A;
    font-size: 15px;
    line-height: 20px;
`

const AvatarsBox = styled.div`
    display: flex;
    flex-wrap: wrap;
`

const AvatarBox = styled.img`
    margin-right: 10px;
    margin-bottom: 10px;
    border-radius: 100%;
    width: 50px;
    height: 50px;
`

const Avatars = ({ users }: { users: any[] }) => {
    return (
        <AvatarsBox>
            {users.map((u: any) => <AvatarBox key={u.user_id} src={u.photo_url}/>)}
        </AvatarsBox>
    )
}

const Spacer = ({ h }: { h: number }) => {
    return <div style={{ width: '100%', height: h }}></div>
}

interface RoomsListProps {
    onJoinRoom(room: any): void
    activeRoom: string | null
}

export const RoomsList = (props: RoomsListProps) => {
    const { activeRoom, onJoinRoom } = props
    const [list, setList] = useData(() => getClient().call('/get_channels', {}))

    useEffect(() => {
        return forever(async () => {
            await delay(10000)
            setList(await getClient().call('/get_channels', {}))
        })
    }, [])

    const joinRoom = async (channel: any) => onJoinRoom(channel)

    if (!list || !list.channels) {
        return <SpinnerSplash/>
    }

    return (
        <div>
            {list.channels.map((channel: any) => {
                let isActive = activeRoom === channel.channel
                let playing = isActive ? '🔊' : ''

                return (
                    <RoomBlock key={channel.channel} selected={isActive} onClick={() => joinRoom(channel)}>
                        <RoomTitle>{`${channel.topic} ${playing}`}</RoomTitle>
                        <Spacer h={10}/>
                        <Avatars users={channel.users}/>
                        <RoomMembers>
                            {channel.users.map((user: any) => <div key={user.user_id}>{user.name}</div>)}
                        </RoomMembers>
                    </RoomBlock>
                )
            })}
        </div>
    )
}