const userModel = require("../models/userModel");

const getUsers = async (req, res) => {

    try {

        const users = await userModel.getUsers();

        res.json(users);

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }

};

module.exports = {
    getUsers
};