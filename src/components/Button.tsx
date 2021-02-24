import React from 'react'
import styled from 'styled-components'

const ButtonBox = styled.button`
    background: #E5EBF1;
    padding: 10px 20px;
    -webkit-tap-highlight-color: rgba(0,0,0,0);
    border-radius: 25px;
    font-size: 19px;
    color: #55677D;
    letter-spacing: 0.1px;
    border: none;
    zoom: 1;
    cursor: pointer;
    white-space: nowrap;
    outline: none;
    text-decoration: none;
    box-sizing: border-box;
    font-style: normal;
    font-weight: 300;
    margin: 0px;
    user-select: none;
    background: #5181b8;
    color: #FFFFFF;

    &:hover {
      background: #5b88bd;
    }
    &:active {
      background: #5D7EA4;
    }
`

interface ButtonProps {
    text: string
    onClick?(): void
    disabled?: boolean
}

export const Button = (props: ButtonProps) => {
    const {
        text,
        onClick,
        disabled,
    } = props

    return (
        <ButtonBox disabled={disabled} onClick={onClick}>
            {text}
        </ButtonBox>
    )
}