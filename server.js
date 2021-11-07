const express = require('express');
const expressGraphql = require('express-graphql').graphqlHTTP;
const { GraphQLSchema, GraphQLObjectType, GraphQLString, GraphQLInt, GraphQLList, GraphQLNonNull } = require('graphql');
const { cars, carType, company } = require('./graphQL/CarData');
const app = express();

const demoObj = { fName: 'shivam', lName: 'Chaudhary', age: 24, company: 'walmart' }

app.listen(5000, () => {
    console.log('Server is Running');
});

app.get('/', (_, res) => {
    res.send('request is succesfully sent')
});

const helloWorldSchema = new GraphQLObjectType({
    name: 'name',
    description: 'this is the first schema we have created',
    fields: () => ({
        fName: { type: GraphQLString },
        lName: { type: GraphQLString },
        age: { type: GraphQLInt },
        message: {
            type: GraphQLString,
            resolve: (name) => `${name.fName} ${name.lName} has a age ${name.age} and profile is ${name.company}`
        }
    })
});

const companySchema = new GraphQLObjectType({
    name: 'company',
    description: "this is company list",
    fields: () => ({
        cmpid: { type: GraphQLInt },
        name: { type: GraphQLString },
        country: { type: GraphQLString },
        carsByCompany: { type: GraphQLList(carsSchema), resolve: (cmp) => cars.filter(el => el.cmpid === cmp.cmpid) },
    })
})

const carTypeSchema = new GraphQLObjectType({
    name: 'carTypes',
    description: "this is car types list",
    fields: () => ({
        typeid: { type: GraphQLInt },
        type: { type: GraphQLString },
        cars: { type: GraphQLList(carsSchema), resolve: (type) => cars.filter(el => el.typeid === type.typeid) }
    })
})

const carsSchema = new GraphQLObjectType({
    name: 'cars',
    description: "this is cars list",
    fields: {
        carid: { type: GraphQLInt },
        year: { type: GraphQLInt },
        price: { type: GraphQLInt },
        model: { type: GraphQLString },
        typeData: { type: carTypeSchema, resolve: (car) => carType.find(el => el.typeid == car.typeid) },
        companyData: { type: companySchema, resolve: (car) => company.find(el => el.cmpid === car.cmpid) },
    }
})

const rootQuery = new GraphQLObjectType({
    name: 'rootQuery',
    description: 'this is a root query',
    fields: {
        name: { type: helloWorldSchema, resolve: () => demoObj },
        company: {
            type: companySchema,
            args: {
                id: { type: GraphQLInt }
            },
            resolve: (_, args) => company.find(el => el.cmpid === args.id),
        },
        companies: { type: GraphQLList(companySchema), resolve: () => company },
        car: {
            type: carsSchema,
            args: {
                id: { type: GraphQLInt }
            },
            resolve: (_, args) => cars.find(el => el.carid === args.id),
        },
        cars: { type: GraphQLList(carsSchema), resolve: () => cars },
        carType: {
            type: carTypeSchema,
            args: {
                id: { type: GraphQLInt }
            },
            resolve: (_, args) => carType.find(el => el.typeid === args.id),
        },
        carTypes: { type: GraphQLList(carTypeSchema), resolve: () => carType },
    }

});


const rootMutation = new GraphQLObjectType({
    name: 'rootMutation',
    description: 'this will update the data',
    fields: {
        carType: {
            type: carTypeSchema, args: {
                type: { type: GraphQLNonNull(GraphQLString) },
            },
            resolve: (_, args) => {
                const obj = { typeid: carType.length + 1, type: args.type }
                carType.push(obj);
                return obj;
            }
        },
        company: {
            type: companySchema, args: {
                country: { type: GraphQLNonNull(GraphQLString) },
                name: { type: GraphQLNonNull(GraphQLString) }
            },
            resolve: (_, args) => {
                const obj = { cmpid: company.length + 1, country: args.country, name: args.name }
                company.push(obj);
                return obj;
            }
        },
        cars: {
            type: carsSchema, args: {
                typeid: { type: GraphQLNonNull(GraphQLInt) },
                cmpid: { type: GraphQLNonNull(GraphQLInt) },
                price: { type: GraphQLNonNull(GraphQLInt) },
                year: { type: GraphQLNonNull(GraphQLInt) },
                model: { type: GraphQLNonNull(GraphQLString) }
            },
            resolve: (_, args) => {
                const obj = { carid: cars.length + 1, model: args.model, year: args.year, typeid: args.typeid, cmpid: args.cmpid, price: args.price }
                cars.push(obj);
                return obj;
            }
        }
    }
})

const schema = new GraphQLSchema({
    query: rootQuery,
    mutation: rootMutation
})

app.use('/graphql', expressGraphql({
    schema,
    graphiql: true
}));