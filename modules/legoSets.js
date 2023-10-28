/********************************************************************************
* WEB322 – Assignment 02
*
* I declare that this assignment is my own work in accordance with Seneca's
* Academic Integrity Policy:
*
* https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
*
* Name: Harsh Patel Student ID: 114085228 Date: 16/10/23
*
********************************************************************************/
const setData = require("../data/setData");
const themeData = require("../data/themeData");

const initialize = () => 
    new Promise((resolve, reject) => {
        const enrichedSets = setData.map(set => {
            const themeObject = themeData.find(theme => theme.id === set.theme_id);
            return themeObject ? { ...set, themeName: themeObject.name } : null;
        }).filter(Boolean);
        
        enrichedSets.length ? resolve(enrichedSets) : reject("Initialization error");
    });

const getAllSets = (sets) => 
    new Promise((resolve, reject) => {
        sets.length ? resolve(sets) : reject('No sets found');
    });

const getSetByNum = (sets, setN) => 
    new Promise((resolve, reject) => {
        const foundSet = sets.find(set => set.set_num === setN);
        foundSet ? resolve(foundSet) : reject(`Unable to find requested set: ${setN}`);
    });

const getSetsByTheme = (sets, themeOfArray) => 
    new Promise((resolve, reject) => {
        const themeSets = sets.filter(set => set.themeName.toLowerCase().includes(themeOfArray.toLowerCase()));
        themeSets.length ? resolve(themeSets) : reject(`Unable to find requested sets for theme: ${themeOfArray}`);
    });

async function main() {
    try {
        const sets = await initialize();
        console.log("All sets:", await getAllSets(sets));

        const requestedSet = await getSetByNum(sets, '10591-1');
        console.log("Requested set:", requestedSet);

        const themeSets = await getSetsByTheme(sets, 'Universal Building Set');
        console.log("Sets by theme:", themeSets);
    } catch (error) {
        console.error("Error:", error);
    }
}

main();

module.exports = { initialize, getAllSets, getSetByNum, getSetsByTheme }; 

