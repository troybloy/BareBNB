'use strict'

let options = {}
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA // define your schema in options object
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    options.tableName = 'Reviews'
    await queryInterface.bulkInsert(
      options,
      [
        {
          spotId: 1,
          userId: 1,
          review: 'Amazing view',
          stars: 5
        },
        {
          spotId: 2,
          userId: 2,
          review: 'Dirty but cute dogs',
          stars: 2
        },
        {
          spotId: 3,
          userId: 3,
          review: 'Cozy',
          stars: 4
        },
        {
          spotId: 4,
          userId: 4,
          review: 'Great stuff',
          stars: 5
        },
        {
          spotId: 5,
          userId: 5,
          review: 'Friendly Host',
          stars: 5
        }
      ],
      {}
    )
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'Reviews'
    const Op = Sequelize.Op

    await queryInterface.bulkDelete(
      options,
      {
        spotId: { [Op.in]: [1, 2, 3, 4, 5] }
      },
      {}
    )
  }
}
