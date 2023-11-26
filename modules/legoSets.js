/********************************************************************************
* WEB322 – Assignment 05
*
* I declare that this assignment is my own work in accordance with Seneca's
* Academic Integrity Policy:
*
* https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
*
* Name: Harsh Patel Student ID: 114085228 Date: 25/11/2023
*
* Published URL:
*
********************************************************************************/
const Sequelize = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DB_DATABASE, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: { rejectUnauthorized: false },
    },
});

const Theme = sequelize.define('Theme', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: Sequelize.STRING,
});

const Set = sequelize.define('Set', {
    set_num: {
        type: Sequelize.STRING,
        primaryKey: true,
    },
    name: Sequelize.STRING,
    year: Sequelize.INTEGER,
    num_parts: Sequelize.INTEGER,
    theme_id: Sequelize.INTEGER,
    img_url: Sequelize.STRING,
});

Set.belongsTo(Theme, { foreignKey: 'theme_id' });

function initialize() {
    return sequelize
        .sync()
        .then(() => {
            console.log('Database synced successfully');
        })
        .catch((err) => {
            throw new Error(`Unable to sync database: ${err}`);
        });
}

function addSet(setData) {
    return Set.create(setData)
        .then(() => {
            console.log('Set added successfully');
        })
        .catch((err) => {
            throw new Error(err.errors[0].message);
        });
}

function getAllThemes() {
    return Theme.findAll()
        .then((themes) => themes.map((theme) => theme.dataValues));
}

function getAllSets() {
    return Set.findAll({ include: [Theme] })
        .then((sets) => {
            if (sets.length === 0) {
                throw new Error('No sets available');
            }
            return sets.map((set) => ({ ...set.dataValues, theme: set.Theme.name }));
        });
}

function getSetByNum(setNum) {
    return Set.findOne({
        where: { set_num: setNum },
        include: [Theme],
    }).then((set) => {
        if (!set) {
            throw new Error('Unable to find requested set');
        }
        return { ...set.dataValues, theme: set.Theme.name };
    });
}

function getSetsByTheme(theme) {
    return Set.findAll({
        include: [Theme],
        where: {
            '$Theme.name$': {
                [Sequelize.Op.iLike]: `%${theme}%`,
            },
        },
    }).then((sets) => {
        if (sets.length === 0) {
            throw new Error('Unable to find requested sets');
        }
        return sets.map((set) => ({ ...set.dataValues, theme: set.Theme.name }));
    });
}

function editSet(setNum, setData) {
    return Set.update(setData, {
        where: { set_num: setNum },
    }).then(() => {
        console.log('Set updated successfully');
    }).catch((err) => {
        throw new Error(`Error updating set: ${err.errors[0].message}`);
    });
}
function deleteSet(setNum) {
    console.log('Deleting set:', setNum);
    return Set.destroy({
        where: { set_num: setNum },
    })
        .then(() => {
            console.log('Set deleted successfully');
        })
        .catch((err) => {
            console.error('Error deleting set:', err);
            throw new Error(`Error deleting set: ${err.errors[0].message}`);
        });
}




module.exports = { initialize, addSet, getAllThemes, getAllSets, getSetByNum, deleteSet,getSetsByTheme, editSet, Theme, Set };
