import React, { useCallback, useState } from 'react'
import styled from 'styled-components'
import { sharedRoomEngine } from '../media/RoomController'
import { RoomsList } from './RoomsList'
import { GlobalStyle } from '../styles/GlobalStyle'
import { RoomScreen } from './RoomScreen'

const SplitScreen = styled.div`
    display:flex;
`

const RoomsListTab = styled.div`
    width: 100%;
    height: 100vh;
    overflow-y: scroll;
`

const RoomTab = styled.div`
    width: 450px;
    min-width: 450px;
    height: 100vh;
    overflow-y: scroll;
`

export const MainScreen = () => {
    const [activeRoom, setActiveRoom] = useState<string | null>(null)

    const onJoin = useCallback(async (room) => {
        setActiveRoom(room.channel)
        await sharedRoomEngine.joinRoom(room)
    }, [])

    return (
        <SplitScreen>
            <GlobalStyle/>
            <RoomsListTab>
                <RoomsList activeRoom={activeRoom} onJoinRoom={onJoin}/>
            </RoomsListTab>
            {activeRoom && <RoomTab><RoomScreen/></RoomTab>}
        </SplitScreen>
    )
}