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
        url: "https://media.istockphoto.com/id/182476243/photo/abandoned-towels-on-sandy-beach.jpg?s=612x612&w=0&k=20&c=WLbaxX1-8cAoRTMAHwb3RI-dBdJo0obmVGILcBhLwks=",
        preview: true
      },
      {
        spotId: 2,
        url: "https://www.scienceabc.com/wp-content/uploads/2021/12/igloo-2021-08-26-17-02-27-utc.jpg",
        preview: true
      },
      {
        spotId: 3,
        url: "https://content.mattressadvisor.com/wp-content/uploads/2019/08/floor-mattress-1024x665.jpeg",
        preview: true
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
