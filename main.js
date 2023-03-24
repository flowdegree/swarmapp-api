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
			'v': '20220917',
			// A random coordinate to use between calls imitating regular behavior
			'll': '26.30' + this.between(340000000000, 499999999999) + ',50.1' + this.between(2870000000000, 3119999999999),
		};
		this.basePath = 'https://api.foursquare.com/v2/';
		this.initialize();
	}

	async initialize(){
		try {
			const response = await this.getUser();
			this.user = response.data.response.user;
			this.log("hello");
		} catch (error) {
			this.error(error)
		}
	}
	
	log(message){
		console.log(`${new Date().toLocaleString()} - ${this?.user?.firstName}(${this.user.id}) - `, message);
	}
	error(message){
		console.error(`${new Date().toLocaleString()} - ${this?.user?.firstName}(${this.user.id}) - Error:`, message);
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
			this.error(error)
			return;
		}
	}

	// Get Commands
	// TODO: requires testing, does not accept non swarmapp (mobile) oauth tokens
	async getFriends(options = {}) {
		_.defaults(options, {
			'user_id': 'self',
		});

		delete this.config.m;


		_.defaults(this.config, {
			'user_id': 'self',
			'm': 'swarm'
		});

		try {
			const result = await axios.get(this.basePath + 'users/' + options.user_id + '/friends', { 'params': this.config });
			return result.data.response.friends;
		} catch (error) {
			this.error(error)
		}  
	}

	// TODO: works only for foursquare client, requires more testing
	async getFollowings(options = {}) {
		_.defaults(options, {
			'user_id': 'self',
		});

		delete this.config.m;

		_.defaults(this.config, {
			'USER_ID': 'self',
			'm': 'foursquare',
		});

		try {
			const result = await axios.get(this.basePath + 'users/' + options.user_id + '/following', { 'params': this.config });
			return result.data.response.following;
		} catch (error) {
			this.error(error)
		}  
	}

	// TODO: works only for foursquare client, requires more testing
	async getFollowers(options = {}) {
		_.defaults(options, {
			'user_id': 'self',
		});

		delete this.config.m;

		_.defaults(this.config, {
			'user_id': 'self',
			'm': 'foursquare',
		});

		try {
			const result = await axios.get(this.basePath + 'users/' + options.user_id + '/followers', { 'params': this.config });
			return result.data.response.followers;
		} catch (error) {
			this.error(error)
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
			this.error(error)
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
			this.error(error)
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
			this.error(error)
			return;
		}        
	}

	async getCheckinsByUserId(userId = 'SELF') {
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
			this.error(error)
		}
	}

	async getGeos(userId){
		_.defaults(this.config, {
			'user_id': this.user.id
		});

		delete this.config.afterTimeStamp;


		try {
			const response = await axios.get(this.basePath + '/users/' + this.config.user_id + '/map', { 'params': this.config });
			return response.data.response;
		} catch (error) {
			this.error(error)
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
			this.log('found location');
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
			this.error(error)
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
			this.error(error)
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
			this.error(error)
			return;
		}	
	}

	async likeUnliked(limit = 40) {
        try {
            const succeeded = [];

            const recent = await this.getRecent({limit: limit});

            recent.forEach(async (checkin) => {
                this.log(`Checkin ${checkin.id} liked before = ${checkin.like}`);
                if(checkin.like == false) {
                    const liked_result = await this.likeCheckin(checkin.id);
                    this.log('liked');
                    succeeded.push(liked_result);
                }
            });

            return succeeded;
        } catch (error) {
            this.error(error);
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
