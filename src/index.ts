const _ = require('lodash');
const axios = require('axios').default;
const querystring = require('querystring');

// some functions willl not work if the oauth_token was generated through an application created after 2021.
// you may use a man in the middle proxy to detect your mobile app oauth token

interface swarmConfig {
    broadcast?: string;
    venueId?: string;
    oauth_token: string;
    m?: string; // application type
    v: string;  // version number
    ll: string;  //long lat,
    altAcc: string;
    llAcc: string;
    alt?: string;
    user_id?: string;
    limit?: number;
    afterTimeStamp?: string;
}

class SwarmappApi {
    config: swarmConfig;
    basePath: string;
    user: any;
    headers: any;
    flowId!: string;

	constructor(oauth_token: string) {
		this.config = {
			oauth_token: oauth_token,
			m: 'swarm',
			v: '20221101',
			// A random coordinate to use between calls imitating regular behavior
			ll: '26.30' + this.between(340000000000, 499999999999) + ',50.1' + this.between(2870000000000, 3119999999999),
            altAcc: "30.000000",
            llAcc: "14.825392"
		};
		this.basePath = 'https://api.foursquare.com/v2/';
        this.headers = {
            'User-Agent': 'com.foursquare.robin.ios.phone:20230316.2230.52:20221101:iOS 16.1.1:iPhone13,4'
        }
		this.initialize();
	}

	async initialize(){
		try {
			const response = await this.getUser();
			this.user = response?.data?.response?.user;
			this.log("hello");
		} catch (error) {
			this.error("Could not authenticate user")
		}
	}
	
	log(message: string){
		console.log(`${new Date().toLocaleString()} - ${this?.user?.firstName}(${this?.user?.id}) - `, message);
	}

	error(message: string){
		console.error(`${new Date().toLocaleString()} - ${this?.user?.firstName}(${this?.user?.id}) - Error:`, message);
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

	// Get Commands
	// TODO: requires testing, does not accept non swarmapp (mobile) oauth tokens
	async getFriends(user_id: string = 'self') {
        this.config.user_id = user_id;
		try {
			const result = await axios.get(this.basePath + 'users/' + user_id + '/friends', { 'params': this.config });
			return result.data.response.friends;
		} catch (error: any) {
			this.error(error)
		}  
	}

	// TODO: works only for foursquare client, requires more testing
	async getFollowings(user_id: string = 'self') {
		this.config.m = 'foursquare';
        this.config.user_id = user_id;

		try {
			const result = await axios.get(this.basePath + 'users/' + user_id + '/following', { 'params': this.config });
			return result.data.response.following;
		} catch (error: any) {
			this.error(error)
		}  
	}

	// TODO: works only for foursquare client, requires more testing
	async getFollowers(user_id: string = 'self') {
		this.config.m = 'foursquare';
        this.config.user_id = user_id;

		try {
			const result = await axios.get(this.basePath + 'users/' + user_id + '/followers', { 'params': this.config });
			return result.data.response.followers;
		} catch (error: any) {
			this.error(error)
		}  
	}
  
    // TODO: should get user, then get checkins and location of last check-in
	getLastSeen(user_id: string = 'self', limit: number = 100) {
        this.config.user_id = user_id;
        this.config.limit = limit;
		
		try {    
			return this.getUser(user_id);
		} catch (error: any) {
			this.error(error)
		}	
	}

	async getUser(user_id: string = 'self') {
		try {
			const result = await axios.get(`${this.basePath}users/${user_id}`, { 'params': this.config });
			return result;
		} catch (error: any) {
			throw new Error("Error getting user data, maybe an authentication error ?");
			return;
		} 
	}

	async getCheckins(user_id: string = 'self', limit: number = 100, afterTimestamp?: string) {

        if(typeof afterTimestamp !== 'undefined'){
            this.config.afterTimeStamp = afterTimestamp;
        }
        this.config.user_id = user_id;
        this.config.limit = limit;
        
		try {
			const result = await axios.get(this.basePath + 'users/' + user_id + '/checkins', { 'params': this.config });
			return result;
		} catch (error: any) {
			this.error(error)
			return;
		}        
	}

    // not sure if it is working
	async getGeos(user_id: string = 'self'){
		this.config.user_id = user_id;

		delete this.config.afterTimeStamp;

		try {
			const response = await axios.get(this.basePath + '/users/' + user_id + '/map', { 'params': this.config });
			return response.data.response;
		} catch (error: any) {
			this.error(error)
		}
	}

	// returns user timeline after timestamp
	async getRecent(limit: number = 100, ll?: string) {
       
		this.config.limit = limit;
        this.config.afterTimeStamp = (Math.floor(Date.now() / 1000) - (1 * 24 * 60 * 60)).toString();

        if(typeof ll !== 'undefined'){
            this.log('found location');
			this.config.ll = ll;
        }

		try {
			const result = await axios.get(this.basePath + 'checkins/recent', { 
				params: this.config, 
				paramsSerializer: (params: any) => { 
					return querystring.stringify(params);
				}
			}); 
	
			return result.data.response.recent;
		} catch (error: any) {
			this.error(error)
			return;
		} 
	}

    // Checkin Functions
	async checkIn(location_id: string, silent: boolean) {
        if(silent){
            this.config.broadcast = 'private';
        }
        this.config.venueId = location_id;

		try {
			const result = await axios.post(this.basePath + 'checkins/add', querystring.stringify(this.config));
			return result;
		} catch (error: any) {
			this.error(error)
			return;
		} 
	}

	async addHereNow(checkin: any, females_only: boolean = true) {
        const hereNow = checkin?.venue?.hereNow;
        this.log(`Adding hereNows from ${checkin.venue.name}`);
        this.log(`Females only setting is ${females_only}`)
        this.log(`Found ${hereNow.count} people checked in classified under ${hereNow.groups.length()} groups`)
        
        if(hereNow.count > 0){
            for(const group of hereNow.groups){
                this.log(`Found ${group.count} in group ${group.name}`)
                if(group.count > 0){
                    for(const item of group.items){
                        if(females_only){
                            if(item.user?.gender == 'female'){
                                await this.addFriendByID(item.user.id);
                            }
                        }
                        else{
                            await this.addFriendByID(item.user.id);
                        }
                    } 
                }
            }
        }
        else{
            return 'no one is here';
        }
	}

	async addFriendByID(user_id: number) {
        try {
            const result = await this.getUser(user_id.toString());
            const new_friend = result?.data?.response?.user;
            this.log(`Checking ${new_friend?.firstName} ${new_friend?.lastName}`)
            //console.log(new_friend);
            this.log(`Relationship status is ${new_friend.relationship}`)
            if(new_friend.relationship == 'none'){
                const result = await axios.post(this.basePath + 'users/' + user_id + '/request');
                this.log(`Added ${new_friend?.firstName} ${new_friend?.lastName}`)
                return result.data.response.user.relationship;
            }
		} 
        catch (error: any) {
			this.error(error)
			return;
		} 
	}

    // Like Functions
	async likeCheckin(checkin_id: string) {
		try {
			const result = await axios.post(this.basePath + 'checkins/' + checkin_id + '/like', querystring.stringify(this.config));
			return result;
		} catch (error: any) {
			this.error(error)
			return;
		}	
	}

	async likeUnliked(limit: number = 40) {
        try {
            const succeeded: any[] = [];

            const recent = await this.getRecent(limit);

            for(const checkin of recent){
                this.log(`Checkin ${checkin.id} liked before = ${checkin.like}`);
                if(checkin.like == false) {
                    const liked_result = await this.likeCheckin(checkin.id);
                    this.log(`liked ${checkin.id}`);
                    succeeded.push(liked_result);
                }
            }

            return succeeded;
        } catch (error: any) {
            this.error(error);
        }	
	}

    // Utility functions
	between(min: number, max: number) {
		return Math.floor(Math.random() * (max - min) + min);
	}
}

module.exports = SwarmappApi;
