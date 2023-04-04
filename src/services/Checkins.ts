const createLatLngString = require('../helpers/utilities')().createLatLngString;

module.exports = (self: any, axios: any, querystring: any) => () => ({

    async getCheckins(user_id: string = 'self', limit: number = 100, afterTimestamp?: string) {

        if(typeof afterTimestamp !== 'undefined'){
            self.config.afterTimeStamp = afterTimestamp;
        }
        self.config.user_id = user_id;
        self.config.limit = limit;
        
		try {
			const result = await axios.get(self.basePath + 'users/' + user_id + '/checkins', { 'params': self.config });
			return result;
		} catch (error: any) {
			self.error(error)
			return;
		}        
	},

    // returns user timeline after timestamp
	async getRecent(limit: number = 100, ll?: string) {
		
		self.config.limit = limit;
        self.config.afterTimeStamp = (Math.floor(Date.now() / 1000) - (1 * 24 * 60 * 60)).toString();

        if(typeof ll !== 'undefined'){
            self.log('found location');
			self.config.ll = ll;
        }

		try {
			const result = await axios.get(self.basePath + 'checkins/recent', { 
				params: self.config, 
				paramsSerializer: (params: any) => { 
					return querystring.stringify(params);
				}
			}); 
	
			return result.data.response.recent;
		} catch (error: any) {
			self.error(error)
			return;
		} 
	},

    // Checkin Functions
	async checkIn(venue_id: string, silent: boolean) {
        if(silent){
            self.config.broadcast = 'private';
        }
        self.config.venueId = venue_id;

        // probably updates user LL
        const venue_info = await self.venues().getVenue(venue_id);
        self.config.ll = createLatLngString(venue_info.location.lat, venue_info.location.lng);

		try {
			const result = await axios.post(self.basePath + 'checkins/add', querystring.stringify(self.config));
            const checkin = result.data.response?.checkin;
			return checkin;
		} catch (error: any) {
			self.error(error)
			return;
		} 
	},

    // Like Functions
	async likeCheckin(checkin_id: string) {
		try {
			const result = await axios.post(self.basePath + 'checkins/' + checkin_id + '/like', querystring.stringify(self.config));
			return result;
		} catch (error: any) {
			self.error(error)
			return;
		}	
	}
})