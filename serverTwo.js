const express = require("express");
const axios = require("axios");
const expressGraphql = require("express-graphql").graphqlHTTP;
const {
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLInt,
  GraphQLString,
  GraphQLNonNull,
  GraphQLList,
} = require("graphql");

const app = express();

app.listen(4000, () => {
  console.log("Server is Running");
});

app.get("/", (_, res) => {
  res.send("request is succesfully sent");
});

const companySchema = new GraphQLObjectType({
  name: "Company",
  description: "this is the company Schema",
  fields: () => ({
    id: { type: GraphQLString },
    name: { type: GraphQLString },
    country: { type: GraphQLString },
    users: {
      type: new GraphQLList(userSchema),
      resolve: (parent) =>
        axios
          .get(`http://localhost:8000/companies/${parent.id}/users`)
          .then((res) => res.data),
    },
  }),
});

const userSchema = new GraphQLObjectType({
  name: "User",
  description: "this is the user Schema",
  fields: {
    id: { type: GraphQLString },
    name: { type: GraphQLString },
    age: { type: GraphQLInt },
    companyId: { type: GraphQLInt },
    company: {
      type: companySchema,
      resolve: (parent) =>
        axios
          .get(`http://localhost:8000/companies/${parent.companyId}`)
          .then((res) => res.data),
    },
  },
});

const myRootQuery = new GraphQLObjectType({
  name: "rootQuery",
  description: "this is a root query",
  fields: {
    users: {
      type: new GraphQLList(userSchema),
      resolve: () =>
        axios.get(`http://localhost:8000/users`).then((res) => res.data),
    },
    companies: {
      type: new GraphQLList(companySchema),
      resolve: () =>
        axios.get(`http://localhost:8000/companies`).then((res) => res.data),
    },
    company: {
      type: companySchema,
      args: { id: { type: GraphQLNonNull(GraphQLInt) } },
      resolve: (_, args) =>
        axios
          .get(`http://localhost:8000/companies/${args.id}`)
          .then((res) => res.data),
    },
    user: {
      type: userSchema,
      args: { id: { type: GraphQLNonNull(GraphQLInt) } },
      resolve: (_, args) =>
        axios
          .get(`http://localhost:8000/users/${args.id}`)
          .then((res) => res.data),
    },
  },
});

const rootMutation = new GraphQLObjectType({
  name: "rootMutation",
  description: "this will update the data",
  fields: {
    addUser: {
      type: userSchema,
      args: {
        name: { type: new GraphQLNonNull(GraphQLString) },
        age: { type: GraphQLNonNull(GraphQLInt) },
        companyId: { type: GraphQLInt },
      },
      resolve: (_, args) =>
        axios.post(`http://localhost:8000/users`, { ...args }).then((res) => {
          return res.data;
        }),
    },
    addCompany: {
      type: companySchema,
      args: {
        name: { type: new GraphQLNonNull(GraphQLString) },
        country: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: (_, args) =>
        axios
          .post(`http://localhost:8000/companies`, { ...args })
          .then((res) => {
            return res.data;
          }),
    },
    updateUser: {
      type: userSchema,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) },
        name: { type: GraphQLString },
        age: { type: GraphQLInt },
        companyId: { type: GraphQLInt },
      },
      resolve: (_, args) =>
        axios
          .patch(`http://localhost:8000/users/${args.id}`, { ...args })
          .then((res) => {
            return res.data;
          }),
    },
    updateCompany: {
      type: companySchema,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) },
        name: { type: GraphQLString },
        country: { type: GraphQLString },
      },
      resolve: (_, args) =>
        axios
          .patch(`http://localhost:8000/companies/${args.id}`, { ...args })
          .then((res) => {
            return res.data;
          }),
    },
    deleteUser: {
      type: userSchema,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: (_, args) =>
        axios.delete(`http://localhost:8000/users/${args.id}`).then((res) => {
          return res.data;
        }),
    },
    deleteCompany: {
      type: companySchema,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: (_, args) =>
        axios
          .delete(`http://localhost:8000/companies/${args.id}`)
          .then((res) => {
            return res.data;
          }),
    },
  },
});

const schema = new GraphQLSchema({
  query: myRootQuery,
  mutation: rootMutation,
});

app.use(
  "/graphql",
  expressGraphql({
    schema,
    graphiql: true,
  })
);
