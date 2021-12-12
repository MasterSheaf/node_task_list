
// Our Authentication Middlware Handler
const auth = async (req, res, next) => {
    console.log(req.method, req.path);
    next();
};

module.exports = auth;