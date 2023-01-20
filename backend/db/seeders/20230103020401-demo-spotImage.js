'use strict';
const bcrypt = require("bcryptjs");

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    options.tableName = 'SpotImages';
    return queryInterface.bulkInsert(options, [
      {
        spotId: 1,
        url: "https://a0.muscache.com/im/pictures/miso/Hosting-21409981/original/a8fa243d-dac8-4238-93e5-f7aa33072ff8.jpeg?im_w=720",
        preview: true
      },
      {
        spotId: 1,
        url: "spot-1-picture-2",
        preview: false
      },
      {
        spotId: 2,
        url: "https://a0.muscache.com/im/pictures/128c623f-c401-4aa4-80bc-446165fd6884.jpg?im_w=720",
        preview: true
      },
      {
        spotId: 2,
        url: "spot-2-picture-2",
        preview: false
      },
      {
        spotId: 3,
        url: "https://a0.muscache.com/im/pictures/miso/Hosting-46695796/original/38bc8081-9415-453a-b8bf-9f4aeb146819.jpeg?im_w=720",
        preview: true
      },
      {
        spotId: 3,
        url: "spot-3-picture-2",
        preview: false
      },
      {
        spotId: 4,
        url: "spot-4-picture-1",
        preview: true
      },
      {
        spotId: 5,
        url: "spot-5-picture-1",
        preview: false
      }

    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    options.tableName = 'SpotImages';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      spotId: { [Op.in]: [1, 2, 3, 4, 5] }
    }, {});
  }
};
