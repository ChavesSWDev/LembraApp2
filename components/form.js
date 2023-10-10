import React, { useState } from 'react';
import { View, TextInput, Button } from 'react-native';
import * as SQLite from 'expo-sqlite';
import { DefaultTheme } from '@react-navigation/native';
import ConnectBanco from './BancoLembraAi';


const db = SQLite.openDatabase('BancoLembraAi.db');

const inserirDados = (Nome, CNPJ, Servicos, Logotipo) => {
    
  db.transaction(
    (tx) => {
      tx.executeSql(
        'INSERT INTO Estabelecimento (Nome, CNPJ, Servicos, Logotipo) VALUES (?, ?, ?, ?)',
        [Nome, CNPJ, Servicos, Logotipo],
        (_, resultado) => {
          console.log('Dados Inseridos com sucesso!');
        },
        (_, erro) => {
          console.error('Erro ao inserir dados:', erro);
        }
      );
    },
    (erro) => {
      console.error('Erro na transacao', erro);
    }
  );
};

const handleSelect = () =>{
db.transaction(
    (tx) => {
      tx.executeSql(
        'SELECT * FROM Estabelecimento',
        [],
        (_, resultado) => {
          // Processar os resultados aqui
          console.log('Dados recuperados com sucesso:', resultado);
        },
        (_, erro) => {
          console.error('Erro ao recuperar dados:', erro);
        }
      );
    },
    (erro) => {
      console.error('Erro na transacao', erro);
    }
  );
};

export default function Form() {
  const [inputText, setInputText] = useState('');

  const handleSubmit = () => {
    if (inputText.trim() === '') {
      inserirDados('Caio', 46399999900, 'Tilapio', 'MulherGostosaEPelada');
      return;
    }
    // Handle other cases or insert data based on inputText value
  };




  return (
    <View>
    <ConnectBanco/>
      <TextInput
        value={inputText}
        onChangeText={(text) => setInputText(text)}
        placeholder="Enter something"
      />
      <Button title="Submit" onPress={handleSubmit} />
      <Button title="Select" onPress={formkrl} />
    </View>
  );
}

export function FormSelect (){
    db.transaction(
        (tx) => {
          tx.executeSql(
            'SELECT * FROM Estabelecimento',
            [],
            (_, resultado) => {
              // Processar os resultados aqui
              const registros = resultado.rows._array;
              console.log('Dados recuperados com sucesso:');
      
              // Iterar pelos registros e exibir os valores
              registros.forEach((registro) => {
                console.log('Registro:');
                console.log('ID:', registro.ID);
                console.log('Nome:', registro.Nome);
                console.log('CNPJ:', registro.CNPJ);
                console.log('Servicos:', registro.Servicos);
                console.log('Logotipo:', registro.Logotipo);
                console.log('-------------------');
              });
            },
            (_, erro) => {
              console.error('Erro ao recuperar dados:', erro);
            }
          );
        },
        (erro) => {
          console.error('Erro na transação', erro);
        }
      );
}