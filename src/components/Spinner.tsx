import React, { useState } from 'react'
import styled, { keyframes } from 'styled-components'

const rotate360 = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`

export const Spinner = styled.div`
  animation: ${rotate360} 1s linear infinite;
  transform: translateZ(0);
  
  border-top: 3px solid transparent;
  border-right: 3px solid #99A2AE;
  border-bottom: 3px solid #99A2AE;
  border-left: 3px solid #99A2AE;
  background: transparent;
  width: 44px;
  height: 44px;
  border-radius: 50%;
`

const SpinnerSplashContainer = styled.div`
    display: flex;
    justify-content: center;
    padding: 50px
`

export const SpinnerSplash = () =>
    <SpinnerSplashContainer>
        <Spinner/>
    </SpinnerSplashContainer>