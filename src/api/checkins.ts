import axios from 'axios';
import querystring from 'querystring';
import { createLatLngString } from '../utils';

// Checkin Functions
export async function checkIn(this:any, venue_id: string, silent: boolean = false) {
    if (silent) {
        this.config.broadcast = 'private';
    }
    this.config.venueId = venue_id;

    // probably updates user LL
    const venue_info = await this.getVenue(venue_id);
    this.config.ll = createLatLngString(venue_info.location.lat, venue_info.location.lng);

    try {
        const result = await axios.post(this.basePath + 'checkins/add', querystring.stringify(this.config));
        const checkin = result.data.response?.checkin;
        return checkin;
    } catch (error: any) {
        console.log(`error occured while checking in`)
        this.error(error)
        return;
    }
}

// returns user timeline after timestamp
export async function getRecent(this:any, limit: number = 100, ll?: string) {

    this.config.limit = limit;
    this.config.afterTimeStamp = (Math.floor(Date.now() / 1000) - (1 * 24 * 60 * 60)).toString();

    if (typeof ll !== 'undefined') {
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
        console.log(`error occured while getting recent`)
        this.error(error)
        return;
    }
}

export async function likeCheckin(this:any, checkin_id: string) {
    try {
        const result = await axios.post(this.basePath + 'checkins/' + checkin_id + '/like', querystring.stringify(this.config));
        return result;
    } 
    catch (error: any) {
        this.error(error.response.data)
        return;
    }
}