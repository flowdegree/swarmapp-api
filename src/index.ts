import _ from 'lodash';
import axios from 'axios';
import querystring from 'querystring';

import { swarmConfig } from './types'
import { between, createLatLngString, error, getLL, log } from './utils';
import { 
	initialize, 
	getFriends, 
	getFollowings, 
	getFollowers, 
	getUser, checkIn, 
	getRecent, 
	getCheckins, 
	addFriendByID,
	completemultifactorlogin,
	initiatemultifactorlogin,
	getTrending,
	getVenue
 } from './api';

export default class SwarmappApi {
	config: swarmConfig;
	basePath: string;
	headers: any;
	user: any;
	flowId?: string;

	initialize: any;
	getFriends: any;
	getFollowings: any;
	getFollowers: any;
	getUser: any;
	addFriendByID: any;

	checkIn: any;
	getRecent: any;
	getCheckins: any;

	completemultifactorlogin: any;
	initiatemultifactorlogin: any;

	getTrending: any;
	getVenue: any;

	log: any;
	error: any;
	getLL: any;
	
	constructor();

	constructor(oauth_token: string);

	constructor(oauth_token?: string) {
		this.config = {
			m: 'swarm',
			v: '20221101',
			// A random coordinate to use between calls imitating regular behavior
			ll: createLatLngString('26.30' + between(340000000000, 499999999999), '50.1' + between(2870000000000, 3119999999999)), //latitude/longitude
			altAcc: "30.000000",
			llAcc: "14.825392",
			floorLevel: "2146959360",
			alt: "12.275661"
		};

		this.basePath = 'https://api.foursquare.com/v2/';

		this.headers = {
			'User-Agent': 'com.foursquare.robin.ios.phone:20230316.2230.52:20221101:iOS 16.1.1:iPhone13,4'
		}

		if (oauth_token) {
			this.config.oauth_token = oauth_token;
		}

		this.initialize = initialize.bind(this);
		this.getFriends = getFriends.bind(this);
		this.getFollowings = getFollowings.bind(this);  
		this.getFollowers = getFollowers.bind(this);
		this.getUser = getUser.bind(this);
		this.error = error.bind(this);
		this.log = log.bind(this);
		this.getLL = getLL.bind(this);
		this.checkIn = checkIn.bind(this);
		this.getRecent = getRecent.bind(this);
		this.getCheckins = getCheckins.bind(this);
		this.addFriendByID = addFriendByID.bind(this);
		this.completemultifactorlogin = completemultifactorlogin.bind(this);
		this.initiatemultifactorlogin = initiatemultifactorlogin.bind(this);
		this.getTrending = getTrending.bind(this);
		this.getVenue = getVenue.bind(this);
	  	 
	}

	// Get Commands
	// TODO: should get user, then get checkins and location of last check-in
	getLastSeen(user_id: string = 'self', limit: number = 100) {
		this.config.user_id = user_id;
		this.config.limit = limit;

		try {
			return this.getUser(user_id);
		} catch (error: any) {
			this.error(error.response.data)
		}
	}

	// not sure if it is working
	async getGeos(user_id: string = 'self') {
		this.config.user_id = user_id;

		delete this.config.afterTimeStamp;

		try {
			const response = await axios.get(this.basePath + '/users/' + user_id + '/map', { 'params': this.config });
			return response.data.response;
		} catch (error: any) {
			this.error(error.response.data)
		}
	}

	// Suspect this method to update user location, doesn't work
	async private_log() {
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
			this.error(error.response.data)
			return;
		}
	}

	async register_device() {
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
			this.error(error.response.data)
			return;
		}



	}

	async addHereNow(checkin: any, females_only: boolean = true): Promise<{ hereNow: any, friendships: any[] }> {
		const hereNow = checkin?.venue?.hereNow;
		const friendships: any[] = [];

		if (hereNow?.count > 0) {
			for (const group of hereNow.groups) {
				if (group.count > 0) {
					// if females only condition is set
					const filteredItems = females_only ? group.items.filter((item: any) => item.user?.gender === 'female') : group.items;

					const newFriendships = await Promise.all(
						filteredItems.map(async (item:any) => {
							return await this.addFriendByID(item.user.id);
						})
					);

					friendships.push(...newFriendships);
				}
			}
		}

		return {
			"hereNow": hereNow,
			"friendships": friendships
		};
	}

	// auto add trending function
	async autoAddTrending(location_name: string, limit_trending: number): Promise<any[]> {
		try {
			const trending = await this.getTrending(limit_trending, undefined, location_name);
			const resultPromises = trending.map(async (venue:any) => {
				if (venue.hereNow.count > 0) {
				  const checkin = await this.checkIn(venue.id, true);
				  return this.addHereNow(checkin);
				}
				return null;
			  });
		  
			  const result = await Promise.all(resultPromises);
			  return result.filter(item => item !== null);
		  
		} catch (error) {
			console.error("An error occurred:", error);
			return [];
		
		}
	}

	// Like Functions
	async likeCheckin(checkin_id: string) {
		try {
			const result = await axios.post(this.basePath + 'checkins/' + checkin_id + '/like', querystring.stringify(this.config));
			return result;
		} 
		catch (error: any) {
			this.error(error.response.data)
			return;
		}
	}

	async likeUnliked(limit: number = 40): Promise<{ succeeded: any[], failed: any[] }> {
		try {
			const succeeded: any[] = [];
			const failed: any[] = [];

			const recent = await this.getRecent(limit);

			const likePromises = recent.map(async (checkin: any) => {
				if (!checkin.like) {
				  try {
					const liked_result = await this.likeCheckin(checkin.id);
					succeeded.push(liked_result);
				  } catch (likeError: any) {
					failed.push(checkin.id);
				  }
				} else {
				  failed.push(checkin.id);
				}
			  });
		  
			  await Promise.all(likePromises);
		  
			  return { succeeded, failed };
		} 
		catch (error: any) {
			console.error("An error occurred:", error);
			return { succeeded: [], failed: [] };
		  }
	}
}