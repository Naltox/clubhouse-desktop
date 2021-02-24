import React from 'react'
import styled, { css } from 'styled-components'

const InputText = styled.input<{ error?: boolean }>`
    width: 100%;
    transition: all .2s;
    
    background: #FFFFFF;
    border: 1px solid #C3CAD2;
    border-radius: 2px;
    font-size: 14px;
    color: #000;
    letter-spacing: 0.1px;
    line-height: normal;
    -webkit-appearance: none;
    outline: 0;
    padding: 0 10px;
    
    &:focus {
        border: 1px solid #b7bec6;
    }
    
    height: 42px;
    box-sizing: border-box;
    
    &::-webkit-input-placeholder {
        color:#808080;
        font-weight: 100;
    }
    
    ${({ error }) => error && css`
        background: #faeaea!important;
        border: 1px solid #dcbcb8!important;
    `}}
`

interface TextFieldProps {
    value: string

    onChange(value: string): void

    placeholder?: string
    error?: boolean
    height?: number
    width?: number
    inputRef?: any
}

export const TextField = (props: TextFieldProps) => {
    let {
        value,
        onChange,
        placeholder,
        error,
        height,
        width,
        inputRef,
    } = props


    return (
        <InputText
            error={error}
            style={{ height, width }}
            type="text"
            value={value}
            placeholder={placeholder || ''}
            onChange={e => onChange(e.target.value)}
            ref={inputRef}
        />
    )
}


