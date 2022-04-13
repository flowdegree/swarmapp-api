const _ = require('lodash');
const axios = require('axios').default;
const querystring = require('querystring');

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

	// Get Commands
	async getFriends(options = {}) {

		_.defaults(options, {
			'user_id': 'self',
		});

		_.defaults(this.config, {
			'USER_ID': 'self',
			'limit': 100,
		});

        const result = await axios.get(this.basePath + 'users/' + options.user_id + '/friends', { 'params': this.config });

		return result;
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

		return this.getUser(options);
	}

	async getUser(options = {}) {
		_.defaults(options, {
			'user_id': 'self',
		});

		_.defaults(this.config, {
			'USER_ID': 'self',
			'limit': 100,
		});

        const result = await axios.get(this.basePath + 'users/' + options.user_id, { 'params': this.config });

		return result;
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

        const result = await axios.get(this.basePath + 'users/' + options.user_id + '/checkins', { 'params': this.config });
		return result;
	}

	// returns user timeline after timestamp
	async getRecent(options) {
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

        const result = await axios.get(this.basePath + 'checkins/recent', { 
            'params': this.config, 
            paramsSerializer: params => { 
                return querystring.stringify(params);
            }
        }); 

		return result;
	}

    // Checkin Functions
	check_in(location_id) {
		return location_id;
	}

	silent_check_in(location_id) {
		return location_id;
	}

	add_here_now() {
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
		const result = await axios.post(this.basePath + 'checkins/' + checkin_id + '/like', querystring.stringify(this.config));
		return result;
	}

	likeUnliked() {
        try {
            const succeeded = [];

            const result = this.getRecent();

            result.response.recent.forEach(checkin => {
                if(checkin.like == false) {
                    const liked_result = this.likeCheckin(checkin.id);
                    console.log(liked);  
                    succeeded.push(liked_result);
                }
            });

            return succeeded;
        } catch (error) {
            console.error(error);
        }	
	}

	auto_like() {
		return;
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
