module.exports = (self: any, axios: any) => () => ({
    // Suspect this method to update user location
    async private_log(){
        const FormData = require('form-data');

        const formData = new FormData();
        formData.append('altAcc', self.config.altAcc);
        formData.append('llAcc', self.config.llAcc);
        formData.append('floorLevel', self.config.floorLevel);
        formData.append('alt', self.config.alt);
        formData.append('csid', '1243');
        formData.append('v', self.config.v);
        formData.append('oauth_token', self.config.oauth_token);
        formData.append('m', self.config.m);
        formData.append('ll', self.config.ll);
        formData.append('background', 'true');
        const loglines = [{"name":"ios-metrics","csid":1243,"ctc":4,"metrics":[{"rid":"642a1e4371f95f2eb16b8eda","n":"SwarmTimelineFeedViewController","im":"3-3","vc":1}],"event":"background","cts":1680481860.378182}];
        formData.append('loglines', JSON.stringify(loglines), {
            contentType: 'application/json'
        });

        try {
			const result = await axios.post(self.basePath + 'private/log', formData, self.headers);
			return result;
		} catch (error: any) {
			self.error(error)
			return;
		}
    }
})