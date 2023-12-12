import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('BancoLembraAi.db');

db.transaction((tx) => {
  tx.executeSql(
    `CREATE TABLE IF NOT EXISTS Estabelecimento (
      ID INTEGER PRIMARY KEY AUTOINCREMENT,
      Nome TEXT NOT NULL,
      CNPJ INTEGER NOT NULL,
      Ramo TEXT,
      Logotipo TEXT NOT NULL,
      Tuto INTEGER NOT NULL
    );`,
    [],
    (_, result) => {
      console.log('Tabela Estabelecimento criada.');
    },
    (_, error) => {
      console.error('Erro ao criar a tabela Estabelecimento', error);
    }
  );

  tx.executeSql(
    `CREATE TABLE IF NOT EXISTS Servico (
      ID INTEGER PRIMARY KEY AUTOINCREMENT,
      Nome TEXT NOT NULL,
      Ramo TEXT,
      EstabelecimentoID INTEGER NOT NULL,
      FOREIGN KEY (EstabelecimentoID) REFERENCES Estabelecimento(ID)
    );`,
    [],
    (_, result) => {
      console.log('Tabela Servico criada.');
    },
    (_, error) => {
      console.error('Erro ao criar a tabela Servico.', error);
    }
  );

  tx.executeSql(
    `CREATE TABLE IF NOT EXISTS Agendamento (
      ID INTEGER PRIMARY KEY AUTOINCREMENT,
      Nome TEXT NOT NULL,
      Telefone TEXT NOT NULL,
      Data TEXT NOT NULL,
      Horario TEXT NOT NULL,
      Servicos TEXT NOT NULL,
      Status TEXT NOT NULL,
      ColaboradorNome TEXT NOT NULL
    );`,
    [],
    (_, result) => {
      console.log('Tabela Agendamento criada.');
    },
    (_, error) => {
      console.error('Erro ao criar a tabela Agendamento.', error);
    }
  );

  tx.executeSql(
    `CREATE TABLE IF NOT EXISTS Colaboradores (
      ID INTEGER PRIMARY KEY AUTOINCREMENT,
      Nome TEXT NOT NULL
    );`,
    [],
    (_, result) => {
      console.log('Tabela Colaboradores criada.');
    },
    (_, error) => {
      console.error('Erro ao criar a tabela Colaboradores.', error);
    }
  );
});

export default db;
