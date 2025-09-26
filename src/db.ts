import { Pool } from 'pg';

const connectionString = 'postgresql://default:4p5hDVCAuSin@ep-snowy-scene-a40k3p50-pooler.us-east-1.aws.neon.tech/verceldb?sslmode=require&channel_binding=require';

export const pool = new Pool({
  connectionString,
});
