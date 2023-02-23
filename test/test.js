require('dotenv').config()
const swarmappapi = require('../main');

const swarm = new swarmappapi({ api_key: process.env.token });

// Test get friends
async function testFriends(){
    const result = await swarm.getFriends();
    console.log("friends", result);
}

async function testRecent(){
    const result = await swarm.getRecent({limit:1});
    console.log("checkins", result);
}

async function testLikeCheckin(checkinId){
    const lastCheckin = await swarm.getRecent({limit:1});
    await swarm.likeCheckin(lastCheckin[0].id);
}

async function testCheckin(checkinId){
    await swarm.checkIn("6109b153bed08d333587710b");
}

async function likeUnliked(){
    await swarm.likeUnliked();
}

async function runTests(){
    try {
        // test getting friends list
        await swarm.initialize();
        console.log(await swarm.getGeos());
        //await testFriends();

        // test getting recent checkins
        //await testRecent();
        
        // test liking last checkin
        //await testLikeCheckin();

        // test check in abqaiq
        //await testCheckin();

        // test liking recent 20 unliked 
        //await likeUnliked();
    } catch (error) {
        console.error(error);
    }
    
}

runTests();
