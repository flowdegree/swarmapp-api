import axios from 'axios';
import querystring from 'querystring';

export async function private_log(this:any) {
    const FormData = require('form-data');

    const formData = new FormData();
    formData.append('altAcc', this.config.altAcc);
    formData.append('llAcc', this.config.llAcc);
    formData.append('floorLevel', this.config.floorLevel);
    formData.append('alt', this.config.alt);
    formData.append('csid', '1243');
    formData.append('v', this.config.v);
    formData.append('oauth_token', this.config.oauth_token);
    formData.append('m', this.config.m);
    formData.append('ll', this.config.ll);
    formData.append('background', 'true');

    const script = [{ "name": "ios-metrics", "csid": 1243, "ctc": 4, "metrics": [{ "rid": "642a1e4371f95f2eb16b8eda", "n": "SwarmTimelineFeedViewController", "im": "3-3", "vc": 1 }], "event": "background", "cts": 1680481860.378182 }];
    const stringified = JSON.stringify(script);

    formData.append('loglines', stringified, { filename: 'loglines', contentType: 'application/json' });

    try {
        const result = await axios.post(this.basePath + 'private/log', formData, {
            headers: {
                ...formData.getHeaders()
            }
        });
        return result;
    } catch (error: any) {
        console.log(`error occured while private logging`)
        this.error(error)
        return;
    }
}

export async function register_device(this: any) {
    const params = {
        limitAdsTracking: '1',
        carrier: 'stc',
        hasWatch: '1',
        csid: '1242',
        alt: '11.791945',
        llAcc: '14.825392',
        otherDeviceIds: '6054750ee01fbc1e3492a745,61187d1fceb2110097a0fc02',
        ll: '21.530136,39.172863',
        altAcc: '17.547791',
        locationAuthorizationStatus: 'authorizedwheninuse',
        token: 'ec0718c5d042b63587c14d461bb077d1262811456c4799558e1df2616f02cc9a',
        oauth_token: 'DW233H4JWJZ0E14QU01LFWUZL4RDQPLAF10BAJEI2FTWNOKH',
        iosSettings: '0',
        m: 'swarm',
        floorLevel: '2146959360',
        measurementSystem: 'metric',
        uniqueDevice: '6054750ee01fbc1e3492a745',
        v: '20221101',
        backgroundRefreshStatus: 'available',
    }

    try {
        const result = await axios.post(this.basePath + '/private/registerdevice ', querystring.stringify(params));
        const registeration = result.data.response?.checkin;
        return registeration;
    } catch (error: any) {
        console.log(`error occured while registering device`)
        this.error(error)
        return;
    }
}