const {ApolloServer, gql} = require('apollo-server');
const lifts = require("./data/lifts.json");
const trails = require("./data/trails.json");

const typeDefs = gql`
    type Lift {
        id: ID!
        name: String!
        status: LiftStatus
        capacity: Int!
        night: Boolean!
        elevationGain: Int!
        url: String!
        trailAccess: [Trail!]!
    }

    type Trail {
        id: ID!
        name: String!
        lift: [Lift!]!
        difficulty: TrailDificulty!
        status: TrailStatus
        groomed: Boolean!
        snowmaking: Boolean!
        trees: Boolean!
        night: Boolean!

    }

    enum LiftStatus {
        OPEN
        CLOSED
        HOLD
    }

    enum TrailStatus {
        OPEN
        CLOSED
    }

    enum TrailDificulty {
        beginner
        intermedite
        advanced
        expert
    }

    type Query {
        liftCount: Int!
        allLifts: [Lift!]!
        getLift(id: ID!): Lift!
        trailCount(status: TrailStatus): Int!
        allTrails: [Trail!]!
        getTrail(id: ID!): Trail!
    }

    type Mutation {
        setLiftStatus(id: ID!, status: LiftStatus): SetLiftStatusResponse!
    }
    
    type SetLiftStatusResponse {
        dateChanged: String!
        lift: Lift!
    }
`;

const resolvers = {
    Mutation: {
        setLiftStatus: (parent, {id, status}) => {
            let updatedLift = lifts.find(lift => id === lift.id);
            updatedLift.status = status;
            return {
                lift: updatedLift,
                dateChanged: new Date().toISOString()
            };
        }
    },
    Query: {
        liftCount: () => lifts.length,
        allLifts: () => lifts,
        getLift: (parent, args) => lifts.find(lift => args.id === lift.id),
        trailCount: (parent, args) => {
            !args.status ? trails.length : trails.filter(t => t.status === args.status).length
        },
        allTrails: () => trails,
        getTrail: (parent, {id}) => trails.find(trail => id === trail.id)
    },
    Lift: {
        url: (parent) => `/${parent.id}.html`,
        trailAccess: parent => parent.trails.map(id => trails.find(t => id === t.id))
    }
};

const server = new ApolloServer({typeDefs, resolvers});

server.listen().then(({url}) => console.log(`Server Running at ${url} `));

console.log(`Build your GraphQL Server Here!`);
