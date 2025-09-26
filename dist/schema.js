"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.root = exports.schema = void 0;
const graphql_1 = require("graphql");
const db_1 = require("./db");
exports.schema = (0, graphql_1.buildSchema)(`
  type User {
    id: ID!
    name: String!
    email: String!
    status: String
    role: String
    lastLogin: String
  }

  type Card {
    id: ID!
    name: String!
    color: String
  }

  type Expense {
    id: ID!
    cardId: ID!
    description: String!
    amount: Float!
    date: String!
    category: String
  }

  type Query {
    users: [User]
    cards: [Card]
    expenses(cardId: ID): [Expense]
    hello: String
  }
`);
// Resolver con query reali Postgres
exports.root = {
    users: async () => {
        const res = await db_1.pool.query('SELECT * FROM users');
        return res.rows;
    },
    cards: async () => {
        const res = await db_1.pool.query('SELECT * FROM cards');
        return res.rows;
    },
    expenses: async ({ cardId }) => {
        console.log("SELECT * FROM expenses WHERE card_id = ", cardId);
        if (cardId) {
            const res = await db_1.pool.query('SELECT * FROM expenses WHERE card_id = $1', [cardId]);
            return res.rows;
        }
        else {
            const res = await db_1.pool.query('SELECT * FROM expenses');
            console.log("All expenses: ", res.rows);
            return res.rows;
        }
    },
    hello: () => {
        console.log("Hello function called");
        return 'Hello world!';
    }
};
