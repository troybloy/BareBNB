'use strict';
const bcrypt = require("bcryptjs");

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    options.tableName = 'Bookings'

     await queryInterface.bulkInsert(options, [
      {
        spotId:1,
        userId:1,
        startDate: '2021-11-25',
        endDate:'2021-11-28'
      },
      {
        spotId:2,
        userId:2,
        startDate: '2021-12-25',
        endDate:'2021-12-31'
      },
      {
        spotId:3,
        userId:3,
        startDate: '2021-11-30',
        endDate:'2021-12-10'
      }

    ], {});

  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'Bookings'
    const Op = Sequelize.Op

    await queryInterface.bulkDelete(options, {
      spotId: { [Op.in] : [1, 2, 3, 4, 5]}
    }, {});

  }
};
