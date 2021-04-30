module.exports.checkForUser = (req, res) => {
    return () => {
        if(!req.user) {
            return res.status(400).send({ status: 'error', message: 'Not Authenticated'});
        }
    }
}