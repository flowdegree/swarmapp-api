module.exports = (self: any, axios: any) => () => ({
    async addHereNow(checkin: any, females_only: boolean = true) {
        const hereNow = checkin?.venue?.hereNow;
        self.log(`Adding hereNows from ${checkin.venue.name}`);
        self.log(`Females only setting is ${females_only}`)
        self.log(`Found ${hereNow.count} people checked in classified under ${hereNow.groups.length} groups`)
        
        if(hereNow.count > 0){
            for(const group of hereNow.groups){
                self.log(`Found ${group.count} in group ${group.name}`)
                if(group.count > 0){
                    for(const item of group.items){
                        if(females_only){
                            if(item.user?.gender == 'female'){
                                await self.users().addFriendByID(item.user.id);
                            }
                        }
                        else{
                            await self.users().addFriendByID(item.user.id);
                        }
                    } 
                }
            }
        }
        else{
            return 'no one is here';
        }
	},

    async likeUnliked(limit: number = 40) {
        try {
            const succeeded: any[] = [];

            const recent = await self.users().getRecent(limit);

            for(const checkin of recent){
                self.log(`Checkin ${checkin.id} liked before = ${checkin.like}`);
                if(checkin.like == false) {
                    const liked_result = await self.checkins().likeCheckin(checkin.id);
                    self.log(`liked ${checkin.id}`);
                    succeeded.push(liked_result);
                }
            }

            return succeeded;
        } catch (error: any) {
            self.error(error);
        }	
	}

})