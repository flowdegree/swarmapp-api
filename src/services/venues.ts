const querystring = require('querystring');

module.exports = (self: any, axios: any) => () => ({
    async getVenue(venue_id: string) {
		try {
			const result = await axios.get(`${self.basePath}venues/${venue_id}/`, { 'params': self.config });
			return result.data.response.venue;
		} catch (error: any) {
			throw new Error("Error getting venue data, maybe an authentication error ?");
			return;
		} 
	},
    // Get Trending Venues
    async getTrending(limit: number = 50, ll?: string, near?: string, radius:number = 100000) {
		self.config.limit = limit;
        self.config.radius = radius;

        if(typeof ll !== 'undefined'){
            self.config.ll = ll;
            // just make any call to mimic updating location
            //await this.getUser(); 
        }
        else{
            self.config.near = near;
        }

        // not sure how to mimic user location here
        // it might not be needed

		try {
			const result = await axios.get(self.basePath + 'venues/trending', { 
				params: self.config, 
				paramsSerializer: (params: any) => { 
					return querystring.stringify(params);
				}
			});
	
			return result.data.response.venues;
		} 
        catch (error: any) {
			self.error(error)
			return;
		} 
	}
});


