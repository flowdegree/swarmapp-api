import axios from 'axios';
import querystring from 'querystring';

export async function login(this:any, username: any, password: any, client_id: any, client_secret: any) {
    const params = {
        client_id: client_id,
        client_secret: client_secret,
        username: username,
        password: password,
        grant_type: 'password',
      };

    try {
        const response = await axios.post(this.basePath + '/oauth2/access_token', null, { params });
        this.config.access_token = response.data.access_token;
        
        return response.data.access_token;
    } catch (error) {
        this.error(error)
        return;
    }
}

export async function initiatemultifactorlogin(this:any, username: string, password: string, client_id: string, client_secret: string) {
    const params = {
        ...this.config,
        client_id: client_id,
        client_secret: client_secret,
        username: username,
        password: password,
    };

    console.log(password)
    try {
        const response = await axios.post(this.basePath + 'private/initiatemultifactorlogin', querystring.stringify(params));
        this.flowId = response.data.flowId;

        return response.data;
    } catch (error: any) {
        this.error(error.response.data)
        return error;
    }
}

export async function completemultifactorlogin(this:any, code: string, client_id: string, client_secret: string) {
    const params = {
        ...this.config,
        client_id: client_id,
        client_secret: client_secret,
        code: code,
        flowId: this.flowId
    };

    try {
        const response = await axios.post(this.basePath + 'private/completemultifactorlogin', querystring.stringify(params));
        this.config.oauth_token = response.data.oauth_token;

        return response.data.access_token;
    } catch (error: any) {
        this.error(error.response.data)
        return;
    }
}