import Sequelize, { Model } from 'sequelize';
import { isBefore, subHours } from 'date-fns';

class Subscription extends Model {
  static init(sequelize) {
    super.init(
      {},
      {
        sequelize,
      }
    );

    return this;
  }

  // add relationships
  static associate(models) {
    this.belongsTo(models.Subscription, { foreignKey: 'meetup_id' });
    this.belongsTo(models.User, { foreignKey: 'user_id' });
  }
}

export default Meetup;
