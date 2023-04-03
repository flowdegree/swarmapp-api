const _ = require('lodash');
const axios = require('axios').default;
const querystring = require('querystring');

// some functions willl not work if the oauth_token was generated through an application created after 2021.
// you may use a man in the middle proxy to detect your mobile app oauth token

import {swarmConfig} from "./interfaces/swarmConfig"
const venuesAPI = require('./services/venues')
const usersAPI = require('./services/Users')
const checkinsAPI = require('./services/checkins')
const privateAPI = require('./services/private')
const playAPI = require('./services/play')
const { log, error } = require('../helpers/logging')(this);
const { between } = require('./helpers/utilities');

class SwarmappApi {
    config: swarmConfig;
    basePath: string;
    user: any;
    headers: any;
    flowId!: string;

    log = log;
    error = error;

    venues = venuesAPI(this, axios);
    users = usersAPI(this, axios);
    checkins = checkinsAPI(this, axios);
    play = playAPI(this, axios);
    private = privateAPI(this, axios);

    
	constructor(oauth_token: string) {
		this.config = {
			oauth_token: oauth_token,
			m: 'swarm',
			v: '20221101',
			// A random coordinate to use between calls imitating regular behavior
			ll: '26.30' + between(340000000000, 499999999999) + ',50.1' + between(2870000000000, 3119999999999), //latitude/longitude
            altAcc: "30.000000",
            llAcc: "14.825392",
            floorLevel: "2146959360",
            alt: "12.275661"
		};
		this.basePath = 'https://api.foursquare.com/v2/';
        this.headers = {
            'User-Agent': 'com.foursquare.robin.ios.phone:20230316.2230.52:20221101:iOS 16.1.1:iPhone13,4'
        }
		this.initialize();
	}

	async initialize(){
		try {
			const response = await this.users().getUser();
			this.user = response?.data?.response?.user;
			this.log("hello");
		} catch (error) {
			this.error("Could not authenticate user")
		}
	}
	
	async initiatemultifactorlogin(username: string, password: string, client_id: string, client_secret: string) {
		const params = {
			client_id: client_id,
			client_secret: client_secret,
			username: username,
			password: password,
		  };

		try {
			const response = await axios.post(this.basePath + '/private/initiatemultifactorlogin', null, { params });
			this.flowId = response.data.flowId;
			
			return response.data.access_token;
		} catch (error: any) {
			this.error(error)
			return;
		}
	}

    async completemultifactorlogin(code: string, client_id: string, client_secret: string) {
		const params = {
			client_id: client_id,
			client_secret: client_secret,
			code: code,
            flowId: this.flowId
		  };

		try {
			const response = await axios.post(this.basePath + '/private/completemultifactorlogin', null, { params });
			this.config.oauth_token = response.data.oauth_token;
			
			return response.data.access_token;
		} catch (error: any) {
			this.error(error)
			return;
		}
	}

}

module.exports = SwarmappApi;