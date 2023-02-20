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
        address: 'unknown',
        city: 'Newport Beach',
        state: 'CA',
        country: 'US',
        lat: 1,
        lng : 1,
        name: 'Beach Towel',
        description: 'Incredibly lush beach towel on the fine coast of Newport',
        price: 1500
      },
      {
        ownerId: 2,
        address: 'unknown2',
        city: 'North Pole',
        state: 'Arctic Ocean',
        country: 'Unclaimed',
        lat: 1,
        lng : 1,
        name: 'Igloo',
        description: 'Artisan-crafted Igloo equipped with snowshoes and heated flooring',
        price: 2200
      },
      {
        ownerId: 3,
        address: '2405 Fulton St',
        city: 'Berkeley',
        state: 'CA',
        country: 'US',
        lat: 1,
        lng : 1,
        name: 'Instagrammable Minimalist Room',
        description: 'An extremely bare room -- bedsheets and chair not included. Bed itself can be included for an additional fee',
        price: 3700
      }
    ])
  },

  down: async (queryInterface, Sequelize) => {
    options.tableName = 'Spots';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      name: { [Op.in]: ['Beach Towel', 'Igloo', 'Instagrammable Minimalist Room'] }
    }, {})
  }
};
