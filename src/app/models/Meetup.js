import Sequelize, { Model } from 'sequelize';
import { isBefore, subHours } from 'date-fns';

class Meetup extends Model {
  static init(sequelize) {
    super.init(
      {
        title: Sequelize.STRING,
        description: Sequelize.STRING,
        location: Sequelize.STRING,
        date: Sequelize.DATE,
        // Virtual field to inform if a Meetup is a past date
        past: {
          type: Sequelize.VIRTUAL,
          get() {
            return isBefore(this.date, new Date());
          },
        },
        // Virtual field to check if the time is cancelable
        cancelable: {
          type: Sequelize.VIRTUAL,
          get() {
            return isBefore(new Date(), subHours(this.date));
          },
        },
      },
      {
        sequelize,
      }
    );

    return this;
  }

  // add relationships
  static associate(models) {
    this.hasMany(models.Subscription, { foreignKey: 'meetup_id' });
    this.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    this.belongsTo(models.File, { foreignKey: 'file_id', as: 'file' });
  }
}

export default Meetup;
