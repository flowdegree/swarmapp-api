

module.exports = (self: any, axios: any, querystring: any) => () => ({
    // TODO: requires testing, does not accept non swarmapp (mobile) oauth tokens
	async getFriends(user_id: string = 'self') {
        self.config.user_id = user_id;
		try {
			const result = await axios.get(self.basePath + 'users/' + user_id + '/friends', { 'params': self.config });
			return result.data.response.friends;
		} catch (error: any) {
			self.error(error)
		}  
	},

	// TODO: works only for foursquare client, requires more testing
	async getFollowings(user_id: string = 'self') {
		self.config.m = 'foursquare';
        self.config.user_id = user_id;

		try {
			const result = await axios.get(self.basePath + 'users/' + user_id + '/following', { 'params': self.config });
			return result.data.response.following;
		} catch (error: any) {
			self.error(error)
		}  
	},

	// TODO: works only for foursquare client, requires more testing
	async getFollowers(user_id: string = 'self') {
		self.config.m = 'foursquare';
        self.config.user_id = user_id;

		try {
			const result = await axios.get(self.basePath + 'users/' + user_id + '/followers', { 'params': self.config });
			return result.data.response.followers;
		} catch (error: any) {
			self.error(error)
		}  
	},
  
    // TODO: should get user, then get checkins and location of last check-in
	getLastSeen(user_id: string = 'self', limit: number = 100) {
        self.config.user_id = user_id;
        self.config.limit = limit;
		
		try {    
			return this.getUser(user_id);
		} catch (error: any) {
			self.error(error)
		}	
	},

	async getUser(user_id: string = 'self') {
		try {
			const result = await axios.get(`${self.basePath}users/${user_id}`, { 'params': self.config });
			return result;
		} catch (error: any) {
			throw new Error("Error getting user data, maybe an authentication error ?");
			return;
		} 
	},

    // not sure if it is working
	async getGeos(user_id: string = 'self'){
		self.config.user_id = user_id;

		delete self.config.afterTimeStamp;

		try {
			const response = await axios.get(self.basePath + '/users/' + user_id + '/map', { 'params': self.config });
			return response.data.response;
		} catch (error: any) {
			self.error(error)
		}
	},

    async addFriendByID(user_id: number) {
        try {
            const result = await this.getUser(user_id.toString());
            const new_friend = result?.data?.response?.user;
            
            //console.log(new_friend);
            self.log(`Checking ${new_friend?.firstName} ${new_friend?.lastName}`)
            self.log(`Relationship status is ${new_friend.relationship}`)
            
            if(new_friend.relationship == 'none'){
                const result = await axios.post(self.basePath + 'users/' + user_id + '/request', querystring.stringify(self.config));
                self.log(`Added ${new_friend?.firstName} ${new_friend?.lastName}`)
                return result.data.response.user.relationship;
            }
		} 
        catch (error: any) {
			self.error(error)
			return;
		} 
	}
});


