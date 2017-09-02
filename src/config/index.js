console.log(process.env.MONGODB_URI='mongodb://localhost:27017/imhungry');

module.exports = {
    secret   : `I'mSoHungryWhat'sOnTheStreets`,
    database : `${process.env.MONGODB_URI}`,
};