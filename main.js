const _ = require('lodash');
const axios = require('axios').default;
const querystring = require('querystring');

// some functions willl not work if the oauth_token was generated through an application created after 2021.
// you may use a man in the middle proxy to detect your mobile app oauth token

class SwarmappApi {
	constructor(config) {
		this.config = {
			'oauth_token': config.api_key,
			'm': 'swarm',
			'v': '20200917',
			// A random coordinate to use between calls imitating regular behavior
			'll': '26.30' + this.between(340000000000, 499999999999) + ',50.1' + this.between(2870000000000, 3119999999999),
		};
		this.basePath = 'https://api.foursquare.com/v2/';
	}
	
	async login(username, password, client_id, client_secret) {
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
			console.error("Error occured", error)
			return;
		}
	}

	// Get Commands
	async getFriends(options = {}) {

		_.defaults(options, {
			'user_id': 'self',
		});

		_.defaults(this.config, {
			'USER_ID': 'self',
			'limit': 100,
		});

		try {
			const result = await axios.get(this.basePath + 'users/' + options.user_id + '/friends', { 'params': this.config });
			return result.data.response.friends;
		} catch (error) {
			console.error("Error occured", error)
		}  
	}
  
	getLastSeen(options = {}) {

		_.defaults(options, {
			'user_id': 'self',
            'something': 'else',
			'limit': 100,
		});

		_.defaults(this.config, {
			'USER_ID': options.user_id,
			'limit': options.limit,
		});

		try {
			return this.getUser(options);
		} catch (error) {
			console.error("Error occured", error)
		}	
	}

	async getUser(options = {}) {
		_.defaults(options, {
			'user_id': 'self',
		});

		_.defaults(this.config, {
			'USER_ID': 'self',
			'limit': 100,
		});

		try {
			const result = await axios.get(this.basePath + 'users/' + options.user_id, { 'params': this.config });
			return result;
		} catch (error) {
			console.error("Error occured", error)
			return;
		} 
	}

	async getCheckins(options = {}) {
        _.defaults(options, {
			'user_id': 'self',
		});

        delete this.config.afterTimeStamp;
		
		_.defaults(this.config, {
			'USER_ID': 'self',
			'limit': 100,
			'afterTimestamp': options.afterTimestamp,
		});

		try {
			const result = await axios.get(this.basePath + 'users/' + options.user_id + '/checkins', { 'params': this.config });
			return result;
		} catch (error) {
			console.error("Error occured", error)
			return;
		}        
	}

	async getCheckinsByUserId(userId) {
		_.defaults(this.config, {
			'user_id': userId
		});

		delete this.config.afterTimeStamp;

		_.defaults(this.config, {
			'user_id': userId,
			'limit': 100,
			'afterTimestamp': options.afterTimestamp,
		});

		try {
			const response = await axios.get(this.basePath + '/users/' + options.user_id + '/checkins', { 'params': this.config });
			return response.data;
		} catch (error) {
			console.error("Error occured", error)
		}
	}

	// returns user timeline after timestamp
	async getRecent(options = {}) {
       
		_.defaults(options, {
			'limit': 60,
		});
        
        delete this.config.limit;

		_.defaults(this.config, {
			'afterTimeStamp': (Math.floor(Date.now() / 1000) - (1 * 24 * 60 * 60)).toString(),
			'limit': options.limit,
		});
        
		if(options.ll) {
			console.log('found location');
			this.config.ll = options.ll;
		}

		try {
			const result = await axios.get(this.basePath + 'checkins/recent', { 
				'params': this.config, 
				paramsSerializer: params => { 
					return querystring.stringify(params);
				}
			}); 
	
			return result.data.response.recent;
		} catch (error) {
			console.error("Error occured", error)
			return;
		} 
	}

    // Checkin Functions
	async checkIn(location_id) {
        this.config.venueId = location_id;

		try {
			const result = await axios.post(this.basePath + 'checkins/' + '/add', querystring.stringify(this.config));
			return result;
		} catch (error) {
			console.error("Error occured", error)
			return;
		} 
	}

	silentCheckIn(location_id) {
		return location_id;
	}

	addHereNow() {
		// update ll to this location location
		// do a random explore request
		// checkin
		// get here now
		// call addFriend function
		return;
	}

	addFriendByID(id) {
		return id;
	}

    // Like Functions
	async likeCheckin(checkin_id) {
		try {
			const result = await axios.post(this.basePath + 'checkins/' + checkin_id + '/like', querystring.stringify(this.config));
			return result;
		} catch (error) {
			console.error("Error occured", error)
			return;
		}	
	}

	async likeUnliked(limit = 40) {
        try {
            const succeeded = [];

            const recent = await this.getRecent({limit: limit});

            recent.forEach(async (checkin) => {
                console.log(`Checkin ${checkin.id} liked before = ${checkin.like}`);
                if(checkin.like == false) {
                    const liked_result = await this.likeCheckin(checkin.id);
                    console.log('liked');
                    succeeded.push(liked_result);
                }
            });

            return succeeded;
        } catch (error) {
            console.error("Error occured", error);
        }	
	}

    // Utility functions
	between(min, max) {
		return Math.floor(Math.random() * (max - min) + min);
	}

	getToken() {
		this.desktopLogin(false);
		this.get_cookie_info();
	}

	desktopLogin(booleanthing) {
		return booleanthing;
	}

	get_cookie_info() {
		return;
	}
}

module.exports = SwarmappApi;
