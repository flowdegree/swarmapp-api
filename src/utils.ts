// Utility functions
export const between = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min) + min);
}

export const createLatLngString = (lat: string, lng: string)=>{
    return `${lat},${lng}`;
}