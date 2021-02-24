import AgoraRtcEngine from 'agora-electron-sdk'

const agoraKey = '938de3e8055e42b281bb8c6f69c21f78'

function initializeMediaEngine() {
    let engine = new AgoraRtcEngine()
    engine.initialize(agoraKey)
    engine.setChannelProfile(1)
    engine.enableAudioVolumeIndication(300, 3, true)
    return engine
}

export const sharedMediaEngine = initializeMediaEngine()