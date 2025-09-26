"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
const pg_1 = require("pg");
const connectionString = 'postgresql://default:4p5hDVCAuSin@ep-snowy-scene-a40k3p50-pooler.us-east-1.aws.neon.tech/verceldb?sslmode=require&channel_binding=require';
exports.pool = new pg_1.Pool({
    connectionString,
});
