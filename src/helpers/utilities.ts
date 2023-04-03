module.exports = (self: any) => ({
    createLatLngString(lat: string, lng: string){
        return `${lat},${lng}`;
    },

    // Utility functions
	between(min: number, max: number) {
		return Math.floor(Math.random() * (max - min) + min);
	}
})