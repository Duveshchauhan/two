import axios from "axios";
import Cookies from "universal-cookie";

export function getTokenOrRefresh() {
    const cookie = new Cookies(null, { path: '/' });
    return new Promise((resolve, reject) => {
        const speechToken = cookie.get('speech-token');
        if (speechToken === undefined) {
            axios.get(`${process.env.BASE_URL}/get-speech-token`).then((res) => {
                const token = res.data.token;
                const region = res.data.region;
                cookie.set('speech-token', region + ':' + token, { maxAge: 3000, path: '/' });
                resolve({ authToken: token, region: region })
            }).catch((err) => {
                reject({ authToken: null, error: err.response.data })
            })
        } else {
            const idx = speechToken.indexOf(':');
            resolve({ authToken: speechToken.slice(idx + 1), region: speechToken.slice(0, idx) })
        }
    })

}