import axios from 'axios';
import querystring from 'querystring';

export async function getVenue(this:any, venue_id: string) {
    try {
        const result = await axios.get(`${this.basePath}venues/${venue_id}/`, { 'params': this.config });
        return result.data.response.venue;
    } catch (error: any) {
        throw new Error("Error getting venue data, maybe an authentication error ?");
        return;
    }
}

// Get Trending Venues
export async function getTrending(this:any, limit: number = 50, ll?: string, near?: string, radius: number = 100000) {
    this.config.limit = limit;
    this.config.radius = radius;

    if (typeof ll !== 'undefined') {
        this.config.ll = ll;
        // just make any call to mimic updating location
        //await this.getUser(); 
    }
    else {
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
        this.error(error.response.data)
        return;
    }
}