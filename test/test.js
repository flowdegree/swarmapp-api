const swarmappapi = require('swarmapp-api');
const swarm = new swarmappapi({ api_key: "" });

async function test(){
    const result = await swarm.getFriends();
    console.log(result);
}


test();