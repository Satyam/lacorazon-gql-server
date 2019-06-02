import {
  getWithId,
  getAllLimitOffset,
  createWithId,
  updateWithId,
  deleteWithId,
} from './utils';

const TABLE = 'Users';

export default {
  Query: {
    user: (parent, { id }, { db }) => getWithId(TABLE, id, db),
    users: (parent, args, { db }) => getAllLimitOffset(TABLE, args, db),
  },
  Mutation: {
    createUser: (parent, args, { db }) => createWithId(TABLE, args, db),
    updateUser: (parent, args, { db }) => updateWithId(TABLE, args, db),
    deleteUser: (parent, { id }, { db }) => deleteWithId(TABLE, id, db),
  },
  User: {
    ventas: (parent, { offset = 0, limit, last }, { db }) => {
      if (last) {
        return db
          .all(
            'select * from Ventas where vendedor = $vendedor order by fecha desc, id desc limit $last',
            {
              $vendedor: parent.id,
              $last: last,
            }
          )
          .then(data => data.reverse());
      }
      if (limit) {
        return db.all(
          'select * from Ventas where vendedor = $vendedor order by fecha, id limit $limit offset $offset',
          {
            $vendedor: parent.id,
            $limit: limit,
            $offset: offset,
          }
        );
      }
      return db.all(
        'select * from Ventas where vendedor = $vendedor order by fecha, id',
        {
          $vendedor: parent.id,
        }
      );
    },
  },
};
