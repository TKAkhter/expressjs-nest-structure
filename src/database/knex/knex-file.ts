import type { Knex } from "knex";
import { env } from "../../config/env";

const knexConfig: Knex.Config = {
  client: "pg",
  connection: `${env.DATABASE_URL}?ssl=${env.KNEX_REJECT_UNAUTHORIZED ? "true" : "false"}`,
  pool: {
    min: 2,
    max: 10,
  },
  migrations: {
    tableName: "knex_migrations",
    directory: "./migrations",
  },
};

export default knexConfig;
