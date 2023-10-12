export async function initialize(this: any):Promise<boolean> {
    try {
        const response = await this.getUser();
        //console.log(response?.data?.response?.user)
        this.user = response?.data?.response?.user;
        return true;
    }
    catch (error) {
        this.error("Could not authenticate user")
        return false;
    }
}