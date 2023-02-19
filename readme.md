# Swarmapp-api

The `swarmapp-api` repository is a Node.js library that provides a programmatic interface to the SwarmApp API (Foursquare), which is the official API for the SwarmApp social networking app.

> SwarmApp allows users to check-in to places and share their experiences with friends. The API provides various endpoints for creating and retrieving check-ins, as well as for authenticating users and managing their profiles.

The `swarmapp-api` library provides a set of functions that make it easy to interact with the SwarmApp API programmatically. These functions abstract away the details of making HTTP requests to the API and handling the responses, so that you can focus on building your application logic.

The library includes modules for authentication, check-ins, places, users, and more. Each module provides a set of functions that correspond to the endpoints of the SwarmApp API, making it easy to perform the most common operations.

The `swarmapp-api` library is designed to be used by developers who want to build integrations with the SwarmApp platform. By using the library, you can build applications that leverage the data and functionality of the SwarmApp social network, such as location-based recommendations, social analytics, and more.



## Getting Started

To get started with the SwarmApp API, follow these steps:

1. `$ npm i swarmapp-api`

## Example Usage

Let's say you want to retrieve the list of check-ins for a particular user on SwarmApp using the API.

1. First, you'll need to authenticate the user and get an access token. You can do this by calling the login function from the auth module:

    ```javascript
    const swarmappapi = require('swarmapp-api');
    const swarm = new swarmappapi({ api_key: API_KEY });

    const email = 'user@example.com';
    const password = 'password123';
    const client_id = 'xxxxxxxxx';
    const client_secret = 'xxxxxxxxxx';

    const accessToken = await swarm.login(email, password, client_id, client_secret);

    ```

    The `login` function returns an object that includes the access token, which you'll use in the next step.

2. Next, you can use the access token to retrieve the list of check-ins for the user. You can do this by calling the `getCheckinsByUserId` function from the `checkins` module:

    ```javascript
    const swarmappapi = require('swarmapp-api');
    const swarm = new swarmappapi({ api_key: API_KEY });

    const userId = '123';

    const checkins = await swarm.getCheckinsByUserId(userId, accessToken);

    console.log(checkins);

    ```

    The `getCheckinsByUserId` function returns an array of check-ins for the specified user.

    That's it! You've now retrieved the list of check-ins for the user on SwarmApp using the API.

## Dependencies

1. Lodash: for prefilling API call parameters
2. Axios: to make the actual API calls
3. querystring: to prepare url query parameters

## Feature request

I will be glad ♥ (for the time-being) to add the feature you are missing, just open an issue.

## Contributing

We welcome contributions from the community! To contribute to the SwarmApp API, follow these steps:

1. Fork the repository
2. Create a new branch for your changes: git checkout -b my-feature-branch
3. Make your changes and commit them: git commit -am "Add new feature"
4. Push your changes to your fork: git push origin my-feature-branch
5. Create a pull request against the main branch of the `6degrees/swarmapp-api` repository

## License

The SwarmApp API is licensed under the MIT License. See the LICENSE file for details.
