# Swarmapp-api

A JavaScript wrapper for SwarmApp (foursquare) API

## Installation

Only offered through NPM
`$ npm install --save swarmapp-api`

## Usage

To be revised  

### Initialize

```javascript
const swarmappapi = require('swarmapp-api');
const swarm = new swarmappapi({ api_key: <your-api-key> });
```

### Call a function

```javascript
function exampleGetFriends() {
    try {
        return api.getFriends();
    }
    catch (error) {
        console.error('error: ' + error); 
    }
}
```

## Dependencies

1. Lodash: for prefilling API call parameters
2. Axios: to make the actual API calls
3. querystring: to prepare url query parameters

## Feature request

I will be glad ♥ (for the time-being) to add the feature you are missing, just open an issue.

## Contributions

1. Fork
2. Edit
3. Push