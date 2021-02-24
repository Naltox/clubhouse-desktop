import React from 'react';
import { render } from 'react-dom';

import { AuthScreen } from './components/AuthScreen';
import { GlobalStyle } from './styles/GlobalStyle';
import { getClient } from './net/ClubHouseApi';
import { MainScreen } from './components/MainScreen';

const mainElement = document.createElement('div');
mainElement.setAttribute('id', 'root');
document.body.appendChild(mainElement);

const App = () => {
    let useAuthorized = getClient().useAuthorized()

    if (useAuthorized) {
        return (
            <>
                <GlobalStyle/>
                <MainScreen/>
            </>
        )
    }

    return (
        <>
            <GlobalStyle/>
            <AuthScreen/>
        </>
    )
}

render(<App/>, mainElement)
