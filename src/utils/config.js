import * as SpeechSDK from 'microsoft-cognitiveservices-speech-sdk'
import { getTokenOrRefresh } from './token_util'
export const useConfig = () => {
    const STT_LOCALES = process.env.STT_LOCALES.split(',')
    const initializeServices = () => {
        return new Promise(async (resolve, reject) => {
            getTokenOrRefresh().then((tokenObj) => {
                const speechConfig = SpeechSDK.SpeechConfig.fromAuthorizationToken(tokenObj.authToken, tokenObj.region)
                const browserSound = new SpeechSDK.SpeakerAudioDestination();
                const audioConfig = SpeechSDK.AudioConfig.fromSpeakerOutput(browserSound);

                const SpeechSynthesizer = new SpeechSDK.SpeechSynthesizer(speechConfig, audioConfig);
                speechConfig.setProperty(SpeechSDK.PropertyId.SpeechServiceConnection_LanguageIdMode, "Continuous")
                var autoDetectSourceLanguageConfig = SpeechSDK.AutoDetectSourceLanguageConfig.fromLanguages(STT_LOCALES)

                const SpeechRecognizer = SpeechSDK.SpeechRecognizer.FromConfig(speechConfig, autoDetectSourceLanguageConfig, SpeechSDK.AudioConfig.fromDefaultMicrophoneInput())
                resolve({ SpeechRecognizer, SpeechSynthesizer })
            }).catch((err) => {
                reject(err.error)
            })
        })
    }

    return {
        initializeServices
    }
}