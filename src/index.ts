

import express from 'express';
import cors from 'cors';
import { graphqlHTTP } from 'express-graphql';
import { schema, root } from './schema';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use('/graphql', graphqlHTTP({
  schema,
  rootValue: root,
  graphiql: true,
}));

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
  console.log(`GraphQL endpoint available at http://localhost:${port}/graphql`);
});
