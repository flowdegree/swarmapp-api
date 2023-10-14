import axios from 'axios';
import querystring from 'querystring';
// TODO: requires testing, does not accept non swarmapp (mobile) oauth tokens

export async function getFriends(this: any, user_id: string = 'self'): Promise<any[] | null> {
    this.config.user_id = user_id || this.user?.id;
    try {
        const result = await axios.get(this.basePath + 'users/' + user_id + '/friends', { 'params': this.config });
        return result.data.response.friends;
    } catch (error: any) {
        console.log(`error occured while getting friends`)
        this.error(error)
        return null;
    }
}

// TODO: works only for foursquare client, requires more testing
export async function getFollowings(this: any, user_id: string = 'self'): Promise<any[] | null> {
    this.config.user_id = user_id || this.user?.id;
    this.config.m = 'foursquare';
    this.config.user_id = user_id;

    try {
        const result = await axios.get(this.basePath + 'users/' + user_id + '/following', { 'params': this.config });
        return result.data.response.following;
    } catch (error: any) {
        console.log(`error occured while getting followings`)
        this.error(error)
        return null;
    }
}

// TODO: works only for foursquare client, requires more testing
export async function getFollowers(this: any, user_id: string = 'self'): Promise<any[] | null> {
    this.user_id = user_id || this.user?.id;
    this.config.m = 'foursquare';
    this.config.user_id = user_id;

    try {
        const result = await axios.get(this.basePath + 'users/' + user_id + '/followers', { 'params': this.config });
        return result.data.response.followers;
    } catch (error: any) {
        console.log(`error occured while getting followers`)
        this.error(error)
        return null;
    }
}

export async function getUser(this: any, user_id: string = 'self') {
    try {
        const result = await axios.get(`${this.basePath}users/${user_id}`, { 'params': this.config });
        return result;
    } catch (error: any) {
        console.log(`error occured while getting user`)
        this.error(error)
        throw new Error("Error getting user data, maybe an authentication error ?");
        return;
    }
}

export async function getUserProfile(this: any, user_id: string = 'self') {
    try {
        const result = await axios.get(`${this.basePath}users/${user_id}/profile`, { 'params': this.config });
        return result;
    } catch (error: any) {
        console.log(`error occured while getting user`)
        this.error(error)
        throw new Error("Error getting user data, maybe an authentication error ?");
    }
}

export async function getCheckins(this: any, user_id: string = 'self', limit: number = 100, afterTimestamp?: string) {

    if (typeof afterTimestamp !== 'undefined') {
        this.config.afterTimeStamp = afterTimestamp;
    }
    this.config.user_id = user_id;
    this.config.limit = limit;

    try {
        const result = await axios.get(`${this.basePath}users/${user_id}/checkins`, { 'params': this.config });
        return result;
    } catch (error: any) {
        console.log(`error occured while getting checkins`)
        this.error(error)
        return;
    }
}

export async function addFriendByID(this: any, user_id: number): Promise<any | void> {
    try {
        const userIdStr = user_id.toString();
        
        const parameters = {
            oauth_token: this.config.oauth_token,
            v: this.config.v,
        }
        const result = await this.getUserProfile(userIdStr);
        const newFriend = result?.data?.response?.user;
        

        if (newFriend?.relationship === 'none') {
            const postUrl = `${this.basePath}users/${userIdStr}/request`;
            console.log(`Adding friend by id ${newFriend.handle}...`)

            // add querystring params to the url
            const result = await axios.post(`${postUrl}?${querystring.stringify(parameters)}`);
            return result.data.response.user;
        }
        else{
            return false;
        }
    }
    catch (error: any) {
        // skip the error as a workaround
        console.log(`error occured while adding friend by id ${user_id}`)
        //console.log(error.response);
        //this.error(error);
        return false;
    }
}

 // TODO: should get user, then get checkins and location of last check-in
 
 export async function getLastSeen(this: any, user_id: string = 'self', limit: number = 100) {
    this.config.user_id = user_id;
    this.config.limit = limit;

    try {
        return getUser(user_id);
    } catch (error: any) {
        console.log(`error occured while getting last seen`)
        this.error(error)
    }
}

export async function getGeos(this: any, user_id: string = 'self') {
    this.config.user_id = user_id;

    delete this.config.afterTimeStamp;

    try {
        const response = await axios.get(this.basePath + '/users/' + user_id + '/map', { 'params': this.config });
        return response.data.response;
    } catch (error: any) {
        console.log(`error occured while getting geos`)
        this.error(error)
    }
}