import React, { useState } from 'react'
import styled from 'styled-components'
import { TextField } from './TextField'
import { Button } from './Button'
import { getClient } from '../net/ClubHouseApi'
import { SpinnerSplash } from './Spinner'

const Panel = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100vh;
    padding: 50px;
`

const Title = styled.div`
    font-size: 25px;
`

const Spacer = ({ h }: { h: number }) => {
    return <div style={{ width: '100%', height: h }}></div>
}

export const AuthScreen = () => {
    const [phone, setPhone] = useState('')
    const [authCode, setAuthCode] = useState('')
    const [state, setState] = useState<'phone' | 'code'>('phone')
    const [loading, setLoading] = useState(false)

    const sendCode = async () => {
        setLoading(true)
        let res = await getClient().call('/start_phone_number_auth', { phone_number: phone })
        console.log(res)
        if (!res.success) {
            alert(res.error_message || 'wrong phone')
            return
        }
        setState('code')
        setLoading(false)
    }

    const authorize = async () => {
        setLoading(true)
        let res = await getClient().call('/complete_phone_number_auth', {
            verification_code: authCode,
            phone_number: phone,
        })
        console.log(res)
        if (!res.success) {
            alert('error' || res.error_message)
        }
        if (!res.is_verified) {
            alert('wrong code, try again')
        }
        if (res.auth_token) {
            await getClient().setToken(res.user_profile.user_id, res.auth_token)
        }
        setLoading(false)
    }

    if (loading) {
        return (
            <>
                <SpinnerSplash/>
            </>
        )
    }

    if (state === 'phone') {
        return (
            <div>
                <Panel>
                    <Title>Enter your phone</Title>
                    <Spacer h={10}/>
                    <TextField width={150} value={phone} onChange={(v) => setPhone(v)}/>
                    <Spacer h={20}/>
                    <Button
                        text="send code"
                        onClick={async () => {
                            await sendCode()
                        }}
                    />
                </Panel>
            </div>
        )
    }

    if (state === 'code') {
        return (
            <div>
                <Panel>
                    <Title>Enter your code</Title>
                    <Spacer h={10}/>
                    <TextField width={150} value={authCode} onChange={(v) => setAuthCode(v)}/>
                    <Spacer h={20}/>
                    <Button
                        text="login"
                        onClick={async () => {
                            await authorize()
                        }}
                    />
                </Panel>
            </div>
        )
    }

    return null
}