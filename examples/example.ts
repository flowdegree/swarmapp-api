
import 'dotenv/config'
import  SwarmappApi  from '../src';

const token:string = process.env.token || "";
const username:string = process.env.username || "";
const password:string = process.env.password || "";
const client_id:string = process.env.client_id || "";
const client_secret:string = process.env.client_secret || "";


console.log(token);
const swarm = new SwarmappApi(token);

const  run = async() =>{
    let result: any;

    result = await swarm.initialize();
    console.log(result);

    // attempt authentication multifactor
    result = await swarm.initiatemultifactorlogin(username, password, client_id, client_secret);
    console.log(result);
    process.exit(0);


    // test friends
    result = await swarm.getFriends();
    console.log("friends", result);

    // test recent checkins
    result = await swarm.getRecent({limit:1});
    console.log("checkins", result);

    // test like
    const lastCheckin = await swarm.getRecent({limit:1});
    result = await swarm.likeCheckin(lastCheckin[0].id);
    console.log("like", result);

    // test checkin
    result = await swarm.checkIn("4b5a8e1cf964a520a0b628e3");
    console.log("checkin", result);

    // test like unliked
    result = await swarm.likeUnliked();
    console.log("like unliked", result);

    


}

run();