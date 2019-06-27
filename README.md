# MeetApp back-end

Event aggregator for developers.

1. Create a `.env` file for the environment variables used in the code. The contents:

```.env
# Authentication
JWT_SECRET=AnyMD5Hash
JWT_EXPIRES_IN=7d

# Database
DB_HOST=localhost
DB_NAME=DbName
DB_USER=DbUserName
DB_PASS=YourPass
```

2. Run these commands:

```
$ yarn
$ yarn dev
```

3. Import `insomnia-requests.json` file into Insomnia to have an example of the requests you can do.

**PS:** To update a user, you must first create one, create session and then use the token provided by the session as a bearer header on the update user request.
