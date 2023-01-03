'use strict';

/** @type {import('sequelize-cli').Migration} */

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}
module.exports = {
  up: async (queryInterface, Sequelize) => {
    options.tableName = 'Spots';
    return queryInterface.bulkInsert(options, [
      {
        ownerId: 1,
        address: 'A Street',
        city: 'Irvine',
        state: 'CA',
        country: 'US',
        lat: 1,
        lng : 1,
        name: '2Bed/2Bath',
        description: 'first house',
        price: 500
      },
      {
        ownerId: 2,
        address: 'B street',
        city: 'Irvine',
        state: 'CA',
        country: 'US',
        lat: 0,
        lng : 0,
        name: '1Bed/1Bath',
        description: 'second house',
        price: 200
      },
      {
        ownerId: 3,
        address: 'C street',
        city: 'San Francisco',
        state: 'CA',
        country: 'US',
        lat: 1,
        lng : 1,
        name: '4Bed/2Bath',
        description: 'third house',
        price: 700
      },
      {
        ownerId: 1,
        address: 'D street',
        city: 'Los Angeles',
        state: 'CA',
        country: 'US',
        lat: 1,
        lng : 1,
        name: '4Bed/4Bath',
        description: 'fourth house',
        price: 900
      },
      {
        ownerId: 3,
        address: ' E street',
        city: 'Riverside',
        state: 'CA',
        country: 'US',
        lat: 1,
        lng : 1,
        name: '8Bed/7Bath',
        description: 'fifth house',
        price: 900
      }
    ])
  },

  down: async (queryInterface, Sequelize) => {
    options.tableName = 'Spots';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      name: { [Op.in]: ['2Bed/2Bath', '1Bed/1Bath', '4Bed/2Bath', '4Bed/4Bath', '8Bed/7Bath'] }
    }, {})
  }
};
