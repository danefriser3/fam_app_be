import { buildSchema } from 'graphql';
import { pool } from './db';

export const schema = buildSchema(`
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
    credito_iniziale: Float!
    start_date: String
  }
  
  input ExpenseInput {
    card_id: ID!
    description: String!
    amount: Float!
    date: String!
    category: String
  }

  type Expense {
    id: ID!
    card_id: ID!
    description: String!
    amount: Float!
    date: String!
    category: String
  }

  type ExpenseProduct {
    id: ID!
    expense_id: ID!
    name: String!
    quantity: Int!
    price: Float!
  }

  input ExpenseProductInput {
    name: String!
    quantity: Int!
    price: Float!
  }

  input IncomeInput {
    card_id: ID!
    description: String!
    amount: Float!
    date: String!
    category: String
  }

  input CardUpdateInput {
    credito_iniziale: Float
    start_date: String
  }

  type Income {
    id: ID!
    card_id: ID!
    description: String!
    amount: Float!
    date: String!
    category: String
  }

  type Query {
    users: [User]
    cards: [Card]
    expenses(card_id: ID): [Expense]
    hello: String
    expenseProducts(expenseId: ID!): [ExpenseProduct]
    incomes(card_id: ID): [Income]
  }

  type Mutation {
    addExpense(expenseInput: ExpenseInput): Expense
    deleteExpense(id: ID!): Expense
    deleteExpenses(ids: [ID!]!): [Expense]
    addExpenseProduct(expenseId: ID!, product: ExpenseProductInput!): ExpenseProduct
    addIncome(incomeInput: IncomeInput): Income
    deleteIncome(id: ID!): Income
    deleteIncomes(ids: [ID!]!): [Income]
    updateCard(id: ID!, input: CardUpdateInput!): Card
  }

`);


// Resolver con query reali Postgres
export const root = {
  updateCard: async ({ id, input }: { id: string; input: { credito_iniziale?: number; start_date?: string } }) => {
    // Costruisci dinamicamente la query di update solo con i campi forniti
    const fields = [];
    const values = [];
    let idx = 1;

    if (input.credito_iniziale !== undefined) {
      fields.push(`credito_iniziale = $${idx++}`);
      values.push(input.credito_iniziale);
    }
    if (input.start_date !== undefined) {
      fields.push(`start_date = $${idx++}`);
      values.push(input.start_date);
    }

    if (fields.length === 0) {
      return null; // Nessun campo da aggiornare
    }

    values.push(id); // id come ultimo parametro

    const query = `UPDATE cards SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`;

    try {
      const res = await pool.query(query, values);
      return res.rows[0];
    } catch (err) {
      console.error("Error updating card:", err);
      return null;
    }
  },
  users: async () => {
    const res = await pool.query('SELECT * FROM users');
    return res.rows;
  },
  cards: async () => {
    const res = await pool.query('SELECT * FROM cards');
    return res.rows;
  },
  expenses: async ({ card_id }: { card_id?: string }) => {
    try {
      if (card_id) {
        const res = await pool.query('SELECT * FROM expenses WHERE card_id = $1 ORDER BY id DESC', [card_id]);
        return res.rows;
      } else {
        const res = await pool.query('SELECT * FROM expenses ORDER BY id DESC');
        return res.rows;
      }
    } catch (err) {
      console.error("Error fetching expenses:", err);
      return null;
    }
  },
  hello: () => {
    console.log("Hello function called");
    return 'Hello world!';
  },
  addExpense: async ({ expenseInput }: { expenseInput: { card_id: string; description: string; amount: number; date: string; category?: string } }) => {

    const { card_id, description, amount, date, category } = expenseInput;

    try {
      const res = await pool.query(
        'INSERT INTO expenses (card_id, description, amount, date, category) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [card_id, description, amount, date, category]
      );
      return res.rows[0];
    } catch (err) {
      console.error("Error adding expense:", err);
      return null;
    }
  },
  deleteExpense: async ({ id }: { id: string }) => {
    try {
      const res = await pool.query('DELETE FROM expenses WHERE id = $1 RETURNING *', [id]);
      return res.rows[0];
    } catch (err) {
      console.error("Error deleting expense:", err);
      return null;
    }
  },
  deleteExpenses: async ({ ids }: { ids: string[] }) => {
    try {
      const res = await pool.query('DELETE FROM expenses WHERE id = ANY($1) RETURNING *', [ids]);
      return res.rows;
    } catch (err) {
      console.error("Error deleting expenses:", err);
      return null;
    }
  },
  expenseProducts: async ({ expenseId }: { expenseId: string }) => {
    try {
      const res = await pool.query('SELECT * FROM items WHERE expense_id = $1', [expenseId]);
      return res.rows;
    } catch (err) {
      console.error("Error fetching expense products:", err);
      return null;
    }
  },
  addExpenseProduct: async ({ expenseId, product }: { expenseId: string; product: { name: string; quantity: number; price: number } }) => {
    const { name, quantity, price } = product;

    try {
      const res = await pool.query(
        'INSERT INTO items (expense_id, name, quantity, price) VALUES ($1, $2, $3, $4) RETURNING *',
        [expenseId, name, quantity, price]
      );
      return res.rows[0];
    } catch (err) {
      console.error("Error adding expense product:", err);
      return null;
    }
  },
  incomes: async ({ card_id }: { card_id?: string }) => {
    try {
      if (card_id) {
        const res = await pool.query('SELECT * FROM incomes WHERE card_id = $1 ORDER BY id DESC', [card_id]);
        return res.rows;
      } else {
        const res = await pool.query('SELECT * FROM incomes ORDER BY id DESC');
        return res.rows;
      }
    } catch (err) {
      console.error("Error fetching incomes:", err);
      return null;
    }
  },
  addIncome: async ({ incomeInput }: { incomeInput: { card_id: string; description: string; amount: number; date: string; category?: string } }) => {
    const { card_id, description, amount, date, category } = incomeInput;
    try {
      const res = await pool.query(
        'INSERT INTO incomes (card_id, description, amount, date, category) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [card_id, description, amount, date, category]
      );
      return res.rows[0];
    } catch (err) {
      console.error("Error adding income:", err);
      return null;
    }
  },
  deleteIncome: async ({ id }: { id: string }) => {
    try {
      const res = await pool.query('DELETE FROM incomes WHERE id = $1 RETURNING *', [id]);
      return res.rows[0];
    } catch (err) {
      console.error("Error deleting income:", err);
      return null;
    }
  },
  deleteIncomes: async ({ ids }: { ids: string[] }) => {
    try {
      const res = await pool.query('DELETE FROM incomes WHERE id = ANY($1) RETURNING *', [ids]);
      return res.rows;
    } catch (err) {
      console.error("Error deleting incomes:", err);
      return null;
    }
  },
};
