const _ = require('lodash');
const axios = require('axios').default;
const querystring = require('querystring');

// some functions willl not work if the oauth_token was generated through an application created after 2021.
// you may use a man in the middle proxy to detect your mobile app oauth token

type swarmConfig =   {
    radius?: number;
    near?: string | undefined;
    broadcast?: string;
    venueId?: string;
    oauth_token?: string;
    m?: string; // application type
    v: string;  // version number
    ll: string;  //long lat,
    altAcc: string;
    llAcc: string;
    alt?: string;
    user_id?: string;
    limit?: number;
    afterTimeStamp?: string;
    floorLevel?: string;
}

class SwarmappApi { 
	config: swarmConfig;
	basePath: string;
	headers: any;
	user: any;
	flowId?: string;

	constructor();

	constructor(oauth_token?: string) {
		this.config = {
			m: 'swarm',
			v: '20221101',
			// A random coordinate to use between calls imitating regular behavior
			ll: this.createLatLngString('26.30' + this.between(340000000000, 499999999999), '50.1' + this.between(2870000000000, 3119999999999)), //latitude/longitude
            altAcc: "30.000000",
            llAcc: "14.825392",
            floorLevel: "2146959360",
            alt: "12.275661"
		};
		
		if(oauth_token){
			this.config.oauth_token = oauth_token;
		}

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
		} 
        catch (error) {
			this.error("Could not authenticate user")
		}
	}

    getLL(){
        return this.config.ll;
    }
	
	log(message: string){
		console.log(`${new Date().toLocaleString()} - ${this?.user?.firstName}(${this?.user?.id}) - `, message);
	}

	error(message: any){
		console.error(`${new Date().toLocaleString()} - ${this?.user?.firstName}(${this?.user?.id}) - Error:`, message);
		console.error(message);
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
			
			return response.data;
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

    async getVenue(venue_id: string) {
		try {
			const result = await axios.get(`${this.basePath}venues/${venue_id}/`, { 'params': this.config });
			return result.data.response.venue;
		} catch (error: any) {
			throw new Error("Error getting venue data, maybe an authentication error ?");
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

    // Get Trending Venues
    async getTrending(limit: number = 50, ll?: string, near?: string, radius:number = 100000) {
		this.config.limit = limit;
        this.config.radius = radius;

        if(typeof ll !== 'undefined'){
            this.config.ll = ll;
            // just make any call to mimic updating location
            //await this.getUser(); 
        }
        else{
            this.config.near = near;
        }

        // not sure how to mimic user location here
        // it might not be needed

		try {
			const result = await axios.get(this.basePath + 'venues/trending', { 
				params: this.config, 
				paramsSerializer: (params: any) => { 
					return querystring.stringify(params);
				}
			});
	
			return result.data.response.venues;
		} 
        catch (error: any) {
			this.error(error)
			return;
		} 
	}
    
    // Checkin Functions
	async checkIn(venue_id: string, silent: boolean) {
        if(silent){
            this.config.broadcast = 'private';
        }
        this.config.venueId = venue_id;

        // probably updates user LL
        const venue_info = await this.getVenue(venue_id);
        this.config.ll = this.createLatLngString(venue_info.location.lat, venue_info.location.lng);

		try {
			const result = await axios.post(this.basePath + 'checkins/add', querystring.stringify(this.config));
            const checkin = result.data.response?.checkin;
			return checkin;
		} catch (error: any) {
			this.error(error)
			return;
		} 
	}

    // Suspect this method to update user location, doesn't work
    async private_log(){
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

        const script = [{"name":"ios-metrics","csid":1243,"ctc":4,"metrics":[{"rid":"642a1e4371f95f2eb16b8eda","n":"SwarmTimelineFeedViewController","im":"3-3","vc":1}],"event":"background","cts":1680481860.378182}];
        const stringified = JSON.stringify(script);        
    
        formData.append('loglines', stringified, { filename : 'loglines', contentType: 'application/json' });
        //console.log(formData);
        
        try {
			const result = await axios.post(this.basePath + 'private/log', formData, {
                headers: {
                ...formData.getHeaders()
                }
            });
			return result;
		} catch (error: any) {
			this.error(error)
			return;
		}
    }

	async register_device(){
		const params = {
			limitAdsTracking:	'1',
			carrier:	'stc',
			hasWatch:	'1',
			csid:	'1242',
			alt:	'11.791945',
			llAcc:	'14.825392',
			otherDeviceIds:	'6054750ee01fbc1e3492a745,61187d1fceb2110097a0fc02',
			ll:	'21.530136,39.172863',
			altAcc:	'17.547791',
			locationAuthorizationStatus:	'authorizedwheninuse',
			token:	'ec0718c5d042b63587c14d461bb077d1262811456c4799558e1df2616f02cc9a',
			oauth_token:	'DW233H4JWJZ0E14QU01LFWUZL4RDQPLAF10BAJEI2FTWNOKH',
			iosSettings:	'0',
			m:	'swarm',
			floorLevel:	'2146959360',
			measurementSystem:	'metric',
			uniqueDevice:	'6054750ee01fbc1e3492a745',
			v:	'20221101',
			backgroundRefreshStatus:	'available',
		}

		try {
			const result = await axios.post(this.basePath + '/private/registerdevice ', querystring.stringify(params));
            const registeration = result.data.response?.checkin;
			return registeration;
		} catch (error: any) {
			this.error(error)
			return;
		} 


		
	}

	async addHereNow(checkin: any, females_only: boolean = true) {
        const hereNow = checkin?.venue?.hereNow;
        this.log(`Adding hereNows from ${checkin.venue.name}`);
        this.log(`Females only setting is ${females_only}`)
        this.log(`Found ${hereNow.count} people checked in classified under ${hereNow.groups.length} groups`)
        
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
            this.log(`Checking ${new_friend?.firstName}`)
            //console.log(new_friend);
            this.log(`Relationship status is ${new_friend.relationship}`)
            if(new_friend.relationship == 'none'){
                const result = await axios.post(this.basePath + 'users/' + user_id + '/request', querystring.stringify(this.config));
                this.log(`Added ${new_friend?.firstName}`)
                return result.data.response.user.relationship;
            }
		} 
        catch (error: any) {
			this.error(error)
			return;
		} 
	}

    // auto add trending function
    async autoAddTrending(location_name: string, limit_trending: number){
        const trending = await this.getTrending(limit_trending,undefined,location_name);
        
        for(const venue of trending){
            if(venue.hereNow.count > 0){
                this.log(`venue location is ${venue.location.lat} ${venue.location.lng}`)
                let checkin = await this.checkIn(venue.id, true);
                this.log(`my ll after checkin is ${this.getLL()}`)
                await this.addHereNow(checkin);
            }
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
    
    createLatLngString(lat: string, lng: string){
        return `${lat},${lng}`;
    }
}

module.exports = SwarmappApi;
