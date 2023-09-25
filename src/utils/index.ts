// Utility functions
export const between = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min) + min);
}

export const createLatLngString = (lat: string, lng: string) => {
    return `${lat},${lng}`;
}

export function getLL(this: any) { return this.config.ll; }

export function log(this: any, message: string) {
    let _prefix = `${new Date().toLocaleString()} - `;
    _prefix += typeof this?.user?.firstName != 'undefined' ? this?.user?.firstName : this?.user?.id
    console.log(`${_prefix}) `, message);
}

// I think it should throw error instead of logging
export function error(this: any, error: any) {
    let _prefix = `${new Date().toLocaleString()} - `;
    _prefix += typeof this?.user?.firstName != 'undefined' ? this?.user?.firstName : "unknown user"
    _prefix += ' - Error: '

    switch (error?.meta?.code) {
        case 401:
            console.error(`${_prefix} [${error.meta.errorType}] ${error.meta.errorDetail}`)
            throw new Error(error)

        default:
            console.error(JSON.stringify(`${_prefix} ${error}`, null, 4))
            throw new Error(error)
    }
}