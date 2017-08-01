const DataLoader = require('dataloader');

async function batchUsers (Users, keys) {
  return await Users.find({_id: {$in: keys}}).toArray();
}

async function genericFind(collection, keys) {
  return await collection.find({_id: {$in: keys}}).toArray();
}

function cacheKeyFn(key) {
  return key.toString();
}

module.exports = ({Users, BusinessProducts}) =>({
  userLoader: new DataLoader(
    keys => genericFind(Users, keys), {cacheKeyFn},
  ),
});
