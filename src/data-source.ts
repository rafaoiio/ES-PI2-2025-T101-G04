//Autor Rafael Gaudencio Dias
// Descrição: Arquivo que configura a conexão do TypeORM com o banco Oracle, definindo entidades, migrations
//  e ajustes diferentes para desenvolvimento e produção.

import 'dotenv/config';
import { DataSource } from 'typeorm';

const isBuild = process.env.TS_NODE === undefined;
// Verifico se o codigo está sendo compilado

const entities = isBuild ? ['dist/**/*.entity.js'] : ['src/**/*.entity.ts'];
// Onde estão as entidades TypeOrm
const migrations = isBuild ? ['dist/migrations/*.js'] : ['src/migrations/*.ts'];
// Onde estão as migrations TypeOrm


const dataSource = new DataSource({
  type: 'oracle',
  username: process.env.ORACLE_USER,
  password: process.env.ORACLE_PASSWORD,
  connectString: process.env.ORACLE_CONNECT_STRING, // ex.: localhost:1521/XEPDB1

  entities,               
  migrations,
  // Defino onde encontrar as entidade e as migrations

  synchronize: false,
  // Estou impedindo o TypeOrm de altera o banco automaticamente

  logging: true,
  // Ativo no console para ver se o TypeOrm está sendo executado
});
// Crio uma conexão TypeOrm com o banco de dados
// Definindo que o banco usado é o Oracle

export default dataSource;
