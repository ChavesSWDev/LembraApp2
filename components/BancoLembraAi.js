import React, { useEffect } from 'react';
import { View } from 'react-native';
import * as SQLite from 'expo-sqlite';

// Step 1: Open the database (or create it if it doesn't exist)
const db = SQLite.openDatabase('BancoLembraAi.db');

// db.transaction(
//     (tx) => {
//       tx.executeSql(
//         'DELETE FROM Estabelecimento',
//         [],
//         () => {
//           console.log('Tabela Estabelecimento excluída com sucesso.');
//         },
//         (_, erro) => { 
//           console.error('Erro ao excluir tabela Estabelecimento:', erro);
//         }
//       );
//     },
//     (erro) => {
//       console.error('Erro na transação', erro);
//     }
//   );


export default function ConnectBanco() {
  useEffect(() => {
    // Step 3: Create the 'Estabelecimento' table if it doesn't exist
    db.transaction((tx) => {
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS Estabelecimento (
          ID INTEGER PRIMARY KEY AUTOINCREMENT,
          Nome TEXT NOT NULL,
          CNPJ INTEGER NOT NULL,
          Servicos TEXT,
          Logotipo TEXT
        );`,
        [],
        (_, result) => {
          console.log('Table Estabelecimento created successfully');
        },
        (_, error) => {
          console.error('Error creating table Estabelecimento:', error);
        }
      );
    });
    
  }, []);

  return (
    <View>
      {/* Your React Native components go here */}
    </View>
  );
}