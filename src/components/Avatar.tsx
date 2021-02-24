import React from 'react';
import styled, { css } from 'styled-components';

const sizes = {
    s: [50, 50],
    m: [60, 60],
    l: [70, 70]
}

const AvatarBox = styled.img<{ size: 's' | 'm' | 'l', speaking?: boolean }>`
    border-radius: 100%;
    ${({ size }) => {
        let [width, height] = sizes[size]

        return css`
            width: ${width}px;
            height: ${height}px;
        `
    }}
    
     ${props => props.speaking && css`
        border: solid 3px #604FFF;
    `}
`

const AvatarPlaceholder = styled.div<{ size: 's' | 'm' | 'l', speaking?: boolean }>`
    border-radius: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 20px;
    background-image: linear-gradient(135deg, #f24973 0%, #3948e6 100%);
    color: white;
    
    ${({ size }) => {
        let [width, height] = sizes[size]
    
        return css`
            width: ${width}px;
            height: ${height}px;
        `
    }}
    
    ${props => props.speaking && css`
        border: solid 3px #604FFF;
    `}
`

interface AvatarProps {
    user: {
        user_id: number,
        name: string,
        photo_url?: string,
        username: string,
        first_name: string,
    },
    size: 's' | 'm' | 'l'
    speaking?: boolean
}

export const Avatar = (props: AvatarProps) => {
    const {user, size, speaking} = props

    if (user.photo_url) {
        return <AvatarBox src={user.photo_url} size={size} speaking={speaking}/>
    } else {
        let initials = user.first_name[0].toUpperCase() + user.name.replace(user.first_name, '').trim()[0].toUpperCase()
        return (
            <AvatarPlaceholder size={size} speaking={speaking}>
                {initials}
            </AvatarPlaceholder>
        )
    }
}