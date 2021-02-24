import { sharedRoomEngine } from '../media/RoomController';
import styled, { css } from 'styled-components';
import React from 'react';
import { SpinnerSplash } from './Spinner';
import { Avatar } from './Avatar';

const UserBox = styled.div`
    margin-right: 25px;
    margin-bottom: 15px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
`

const RoomTitle = styled.div`
    font-weight: 600;
    font-size: 21px
`

const SubTitle = styled.div`
    color: #71747A;
    font-size: 17px;
    line-height: 20px;
`

const UsersList = styled.div`
    display: flex;
    flex-wrap: wrap;
`

const sizes = {
    s: 50,
    m: 60,
    l: 70
}

const UserName = styled.div<{ size: 's' | 'm' | 'l' }>`
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    ${({ size }) => {
        let width = sizes[size]

        return css`max-width: ${width}px;`
    }}
`

const Spacer = ({h}: {h: number}) => {
    return <div style={{ width: '100%', height: h }}></div>
}

export const RoomScreen = () => {
    const speaking = sharedRoomEngine.useCurrentlySpeaking()
    const currentRoom = sharedRoomEngine.useCurrentRoom()
    const members = sharedRoomEngine.useMembers()

    if (!currentRoom) {
        return <SpinnerSplash/>
    }

    let speakers = members.filter(u => u.is_speaker)
    let followedBySpeakers = members.filter(u => !u.is_speaker && u.is_followed_by_speaker)
    let listeners = members.filter(u => !u.is_speaker && !u.is_followed_by_speaker)

    return (
        <div style={{ padding: 20 }}>
            <RoomTitle>{currentRoom.topic}</RoomTitle>
            <Spacer h={10}/>
            <UsersList>
                {speakers.map(u => {
                    return (
                        <UserBox key={u.user_id}>
                            <Avatar user={u} size="l" speaking={speaking.includes(u.user_id)}/>
                            <Spacer h={4}/>
                            <UserName size="l">
                                {u.first_name}
                            </UserName>
                        </UserBox>
                    )
                })}
            </UsersList>


            <SubTitle>Followed by speakers:</SubTitle>
            <Spacer h={10}/>
            <UsersList>
                {followedBySpeakers.map(u => {
                    return (
                        <UserBox key={u.user_id}>
                            <Avatar user={u} size="m"/>
                            <Spacer h={4}/>
                            <UserName size="m">
                                {u.first_name}
                            </UserName>
                        </UserBox>
                    )
                })}
            </UsersList>

            <SubTitle>Others in the room:</SubTitle>
            <Spacer h={10}/>
            <UsersList>
                {listeners.map(u => {
                    return (
                        <UserBox key={u.user_id}>
                            <Avatar user={u} size="s"/>
                            <Spacer h={4}/>
                            <UserName size="s">
                                {u.first_name}
                            </UserName>
                        </UserBox>
                    )
                })}
            </UsersList>
        </div>
    )
}