module.exports = (self: any) => ({
    log(message: string){
		console.log(`${new Date().toLocaleString()} - ${self?.user?.firstName}(${self?.user?.id}) - `, message);
	},

	error(message: string){
		console.error(`${new Date().toLocaleString()} - ${self?.user?.firstName}(${self?.user?.id}) - Error:`, message);
	}
})
