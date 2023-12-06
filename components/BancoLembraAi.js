import React, { useEffect } from 'react';
import { View } from 'react-native';
import * as SQLite from 'expo-sqlite';
import AsyncStorage from "@react-native-async-storage/async-storage";

const db = SQLite.openDatabase('BancoLembraAi.db');
// db.transaction(
//   (tx) => {
//     tx.executeSql(
//       'DELETE FROM Estabelecimento',
//       [],
//       () => {
//         console.log('Tabela Estabelecimento excluída com sucesso.');
//       },
//       (_, erro) => {
//         console.error('Erro ao excluir tabela Estabelecimento:', erro);
//       }
//     );
//   },
//   (erro) => {
//     console.error('Erro na transação', erro);
//   }
// );

// db.transaction(
//   (tx) => {
//     tx.executeSql(
//       'DELETE FROM Servico',
//       [],
//       () => {
//         console.log('Tabela Servico excluída com sucesso.');
//       },
//       (_, erro) => {
//         console.error('Erro ao excluir tabela Estabelecimento:', erro);
//       }
//     );
//   },
//   (erro) => {
//     console.error('Erro na transação', erro);
//   }
// );

// db.transaction(
//   (tx) => {
//     tx.executeSql(
//       'DELETE FROM Agendamento',
//       [],
//       () => {
//         console.log('Tabela Agendamento excluída com sucesso.');
//       },
//       (_, erro) => {
//         console.error('Erro ao excluir tabela Agendamento:', erro);
//       }
//     );
//   },
//   (erro) => {
//     console.error('Erro na transação', erro);
//   }
// );



export default function ConnectBanco() {
  useEffect(() => {
    db.transaction((tx) => {
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS Estabelecimento (
          ID INTEGER PRIMARY KEY AUTOINCREMENT,
          Nome TEXT NOT NULL,
          CNPJ INTEGER NOT NULL,
          Ramo TEXT,
          Logotipo BLOB NOT NULL
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
          Status TEXT NOT NULL
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

    
  }, []);

  return (
    <View>

    </View>
  );
}