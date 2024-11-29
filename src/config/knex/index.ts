import Knex from "knex";
import knexConfig from "./knex-file";

const knex = Knex(knexConfig);
export default knex;
