const jwt = require('jsonwebtoken');
const User = require('../models/user');

// Our Authentication Middlware Handler
const auth = async (req, res, next) => {

    try {

        console.log("middlware:", req.method, req.path);

        // this gets us the header field we want, called Authorization
        // from MDM: The HTTP Authorization request header can be used 
        // to provide credentials that authenticate a user agent with a 
        // server, allowing access to a protected resource
        //
        // syntax:  Authorization: <auth-scheme> <authorisation-parameters>
        const fullToken = req.header('Authorization');

        // if the header is missing Authorization then we don't want to continue
        if (!fullToken)
            throw new Error("Autorization header field not found");

        console.log("middlware: Authorization header found");

        // get the JWT portion from the token
        // it should come in as "Bearer token..."
        // replace just replaces the Bearer portion with nothing
        const token = fullToken.replace('Bearer ', '');

        if (!token)
            throw new Error("Autorization header field not formatted correctly");
        
        console.log("middlware: Token string extracted");

        // verify the token
        // this will return the object we provided in the 
        // jwt.sign method when we created the original token
        // it has one member which is the _id of the user
        const decodedToken = jwt.verify(token, 'secretstringgoeshere');
        
        console.log("middlware: Token verified");

        // query the database looking for one user who has the id
        // and the matching token in the tokens array which contains
        // a list of tokens
        // token here is still the encoded base64 token which should
        // be stored in the database under the token list
        // decodedToken is the original token object we created when
        // we created the user which has the _id in it
        // the token is really just an encrypted version of the id
        const user = await User.findOne({_id: decodedToken._id,
                                         'tokens.token': token });
        
        if (!user)
            throw new Error(`Database lookup of user ${decodedToken._id} failed`);

        console.log("middlware: User found in database");

        // at this point the user has proven thay are authenticated
        // so we can let the route handlers rock and roll

        // we've already fetched the user we want for this route
        // so we want to pass that along to the next step so they 
        // don't have to query again

        // we'll add a property onto the req object using magic javascript
        req.user = user;
        req._id = decodedToken._id; // save off the _id of the user in the database
        req.token = token;  // save off the token for future handlers (logout needs it for example)

        next();

    }catch (e) {
        if (e instanceof Error)
            res.status(401).send({error: e.message});
        else 
            res.status(401).send(e);
    }
};

module.exports = auth;