
import 'dotenv/config'
import  SwarmappApi  from '../src';

const token:string = process.env.token || "";
const username:string = process.env.username || "";
const password:string = process.env.password || "";
const client_id:string = process.env.client_id || "";
const client_secret:string = process.env.client_secret || "";

const  run = async() =>{
    console.log(token);
    const swarm = new SwarmappApi(token);

    let result: any;

    result = await swarm.initialize();
    //console.log(result);

    // // attempt authentication multifactor
    // result = await swarm.initiatemultifactorlogin(username, password, client_id, client_secret);
    // console.log(result);
    // process.exit(0);


    // test friends
    result = await swarm.getFriends();
    // print the keys for the result return object
    console.log(Object.keys(result));
    //process.exit();
    console.log("friends", result.items[0]);
    

    // test recent checkins
    result = await swarm.getRecent(1);
    console.log("checkins", result);


    result = await swarm.getTrending();
    
    // print object keys
    console.log(Object.keys(result));

    console.log("trending in",result[0].name, result[0].hereNow.count);

    result = await swarm.autoAddTrending("Khobar",1);
    console.log("auto add", result);
    process.exit();
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