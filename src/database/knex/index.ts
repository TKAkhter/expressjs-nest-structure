import Knex from 'knex';
import knexConfig from './knex-file';

const knex = Knex(knexConfig[process.env.NODE_ENV || 'development']);
export default knex;