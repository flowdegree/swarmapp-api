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
	getVenue,
	getLastSeen, 
	getGeos,
	getUserProfile,
	login,
	register_device,
	private_log,
	likeCheckin

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
	getLastSeen: any;
	getGeos: any;
	getUserProfile: any;

	checkIn: any;
	getRecent: any;
	getCheckins: any;
	likeCheckin: any;

	completemultifactorlogin: any;
	initiatemultifactorlogin: any;

	getTrending: any;
	getVenue: any;

	log: any;
	error: any;
	getLL: any;

	login: any;
	register_device: any;
	private_log: any;



	
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
		this.getLastSeen = getLastSeen.bind(this);
		this.getGeos = getGeos.bind(this);
		this.getUserProfile = getUserProfile.bind(this);
		this.login = login.bind(this);
		this.register_device = register_device.bind(this);
		this.private_log = private_log.bind(this);
		this.likeCheckin = likeCheckin.bind(this);

	  	 
	}

	// TODO: move to client
	async addHereNow(checkin: any, females_only: boolean = true): Promise<{ hereNow: any, friendships: any[] }> {
		const hereNow = checkin?.venue?.hereNow;
		const friendships: any[] = [];

		if (hereNow?.count > 0) {
			console.log(`Found ${hereNow.count} friends from ${checkin.venue.name}...`);
			for (const group of hereNow.groups) {
				console.log(`${group.count} friends in ${group.name} group...`);
				if (group.count > 0) {
					// if females only condition is set
					const filteredItems = females_only ? group.items.filter((item: any) => item.user?.gender === 'female') : group.items;
					//console.log(filteredItems)
					const friendNames = filteredItems.map((friend: any) => `${friend.user.firstName} (${friend.user.handle}) # ${friend.user.id}`);

					console.log(`Adding ${filteredItems.length} friends from ${group.name}...`);
					console.log(friendNames.join(', '));

					const newFriendships = await Promise.all(
						filteredItems.map(async (item:any) => {
							return await this.addFriendByID(item.user.id);
						})
					);

					friendships.push(...newFriendships);
					console.log(`Added ${newFriendships.length} friends from ${group.name}...`);
					
					//console.log(newFriendships)
					console.log(friendNames)
				}
			}
		}

		return {
			"hereNow": hereNow,
			"friendships": friendships
		};
	}

	// auto add trending function
	// TODO: maybe move it to the client, not the library
	async autoAddTrending(location_name: string, limit_trending: number): Promise<any[]> {
		try {
			// get trending venues
			const trending = await this.getTrending(limit_trending, undefined, location_name);

			// add here now from trending venues
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
			console.log("An error occurred while auto adding trending:");
			this.error("An error occurred:", error);
			return [];
		}
	}

	// TODO: move to client
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