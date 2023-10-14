import 'dotenv/config'
import  SwarmappApi  from '../src';

async function runTests(){
    try {
        // Test login
        const swarm = new SwarmappApi();
        const username = "mohannad.otaibi@gmail.com";
        const password = "otaifh0a";
        const client_id = '0K3FWRFCJXZW3D4H4FK554XXGPYSEKDQ3GJF2LH2DENPCY3P'; 
        const client_secret = 'YKFAFSRJRKBR1RBSGZLTTYALSJDMJSDO441DWPPKTEI5XLAY';
        try {
            const result = await swarm.initiatemultifactorlogin(username, password, client_id, client_secret);
            const flowId = result.response.flowId;
            console.log(result);
        } 
        catch (error) {
            console.log(error)
        }
        
        //return;


        //const swarm = new swarmappapi(process.env.token);
        // test getting friends list
        await swarm.initialize();

        //const followings = await swarm.getFollowings();
        const trending = await swarm.getTrending(10,undefined,"Khobar");
        
        for(const venue of trending){
            if(venue.hereNow.count > 0){
                console.log(`venue location is ${venue.location.lat} ${venue.location.lng}`)
                let checkin = await swarm.checkIn(venue.id, true);
                console.log(`my ll after checkin is ${swarm.getLL()}`)
                await swarm.addHereNow(checkin);
            }
        }

        //console.log(trending);
        //return;
        const checkin_response = await swarm.checkIn("51913aca498e2fe60905351d"); 
        const checkin = checkin_response.data.response?.checkin;
        console.log(checkin)
        await swarm.addHereNow(checkin);
        
        const followers = await swarm.getFollowers();
        const friends = await swarm.getFriends();
        //console.log(followings);
        console.log(followers.items[0]);
        //console.log(friends);
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
