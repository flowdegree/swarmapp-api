export type swarmConfig = {
	radius?: number;
	near?: string | undefined;
	broadcast?: string;
	venueId?: string;
	oauth_token?: string;
	m?: string; // application type
	v: string;  // version number
	ll: string;  //long lat,
	altAcc: string;
	llAcc: string;
	alt?: string;
	user_id?: string;
	limit?: number;
	afterTimeStamp?: string;
	floorLevel?: string;
}