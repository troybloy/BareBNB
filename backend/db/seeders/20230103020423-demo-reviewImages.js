'use strict';

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    options.tableName = 'ReviewImages';
    return queryInterface.bulkInsert(options, [
      {
        reviewId: 1,
        url: "picture-1",
      },
      {
        reviewId: 1,
        url: "picture-2",
      },
      {
        reviewId: 2,
        url: "picture-3",
      },
      {
        reviewId: 3,
        url: "picture-4",
      },
      {
        reviewId: 3,
        url: "picture-5",
      },
      {
        reviewId: 4,
        url: "picture-6",
      },
      {
        reviewId: 4,
        url: "picture-7",
      },
      {
        reviewId: 5,
        url: "picture-8",
      },
      {
        reviewId: 5,
        url: "picture-9",
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    options.tableName = 'ReviewImages';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      reviewId: { [Op.in]: [1, 2, 3, 4, 5] }
    }, {});
  }
};
