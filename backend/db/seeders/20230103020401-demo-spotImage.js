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
        url: "https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.missminimalist.com%2F2009%2F11%2Fminimalist-furniture-the-bare-essentials%2F&psig=AOvVaw1TRdo2qz0MaljkNU7Dga_-&ust=1674275882656000&source=images&cd=vfe&ved=0CA8QjRxqFwoTCLi15Oup1fwCFQAAAAAdAAAAABAO",
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
