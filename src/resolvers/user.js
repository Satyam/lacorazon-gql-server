export default {
  Query: {
    user: (parent, { id }, { data }) => data.users[id],
    users: (parent, args, { data }) => Object.values(data.users),
  },
  User: {
    ventas: (parent, args, { data }) =>
      Object.values(data.ventas).filter(venta => venta.vendedor === parent.id),
  },
};
