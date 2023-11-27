import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Notas from './components/Notas';
import AddNota from './components/AddNota';
import DeletarNota from './components/DeletarNota';
import EditarNota from './components/EditarNota';
import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BemVindo from './components/BemVindo';
import Tutorial from './components/Tutorial';
import CadastroInicial from './components/CadastroInicial';
import MainMenu from './components/MainMenu';
import Agendar from './components/Agendar';
import EditarAgendamento from './components/EditarAgendamento';
import MeuPerfil from './components/MeuPerfil';
import Opcoes from './components/Opcoes';
import Form from './components/form';


import * as SQLite from 'expo-sqlite';
const db = SQLite.openDatabase('BancoLembraAi.db');

const Stack = createNativeStackNavigator();

export default function App() {

  const [nota, setNota] = useState('');
  const [notas, setNotas] = useState([]);
  const [moverParaLixeira, setMoverParaLixeira] = useState([]);

  function handleNota() {
    const newNota = {
      text: nota,
      data: new Date().toLocaleString(),
    };
    const newNotas = [newNota, ...notas];
    setNotas(newNotas);
    setNota('');

    AsyncStorage.setItem('storedNotas', JSON.stringify(newNotas)).then(() => {
      setNotas(newNotas);
    }).catch(error => console.log(error))
  }

  useEffect(() => {
    carregarNotas();
  }, []);

  const carregarNotas = () => {
    AsyncStorage.getItem('storedNotas').then(data => {
      if (data !== null) {
        setNotas(JSON.parse(data));
      }
    }).catch((error) => console.log(error))

    AsyncStorage.getItem('deletarNota').then(data => {
      if (data !== null) {
        setMoverParaLixeira(JSON.parse(data));
      }
    }).catch((error) => console.log(error))

    AsyncStorage.getItem('data');
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {/* <Stack.Screen name='form'>
        {props => <Form/>}
        </Stack.Screen> */}
        <Stack.Screen name='BemVindo'>
          {props => <BemVindo />}
        </Stack.Screen>

        <Stack.Screen name="Tutorial">
          {props => <Tutorial {...props} moverParaLixeira={moverParaLixeira} setMoverParaLixeira={setMoverParaLixeira} notas={notas} setNotas={setNotas} nota={nota} setNota={setNota} />}
        </Stack.Screen>

        <Stack.Screen name='Notas'>
          {props => <Notas {...props} moverParaLixeira={moverParaLixeira} setMoverParaLixeira={setMoverParaLixeira} notas={notas} setNotas={setNotas} nota={nota} setNota={setNota} />}
        </Stack.Screen>

        <Stack.Screen name='AddNota'>
          {props => <AddNota {...props} nota={nota} setNota={setNota} handleNota={handleNota} />}
        </Stack.Screen>

        <Stack.Screen name="DeletarNota">
          {props => <DeletarNota {...props} moverParaLixeira={moverParaLixeira} setMoverParaLixeira={setMoverParaLixeira} notas={notas} setNotas={setNotas} />}
        </Stack.Screen>

        <Stack.Screen name="EditarNota">
          {props => <EditarNota {...props} notas={notas} setNotas={setNotas} />}
        </Stack.Screen>

        <Stack.Screen name="CadastroInicial">
          {props => <CadastroInicial />}
        </Stack.Screen>

        <Stack.Screen name="MainMenu">
          {props => <MainMenu />}
        </Stack.Screen>

        <Stack.Screen name="Agendar">
          {props => <Agendar/>}
        </Stack.Screen>

        <Stack.Screen name="EditarAgendamento">
          {props => <EditarAgendamento/>}
        </Stack.Screen>

        <Stack.Screen name="MeuPerfil">
          {props => <MeuPerfil/>}
        </Stack.Screen>

        <Stack.Screen name="Opcoes">
          {props => <Opcoes/>}
        </Stack.Screen>

      </Stack.Navigator>
    </NavigationContainer>
  );
}


//Set-ExecutionPolicy RemoteSigned
//npm install -g expo-cli
//npm install react-native-image-picker
//npm install @react-native-picker/picker
//npm install react-native-screens
//storyset é o site de imagem vector bonitinha
// tutorial bacana do git https://balta.io/blog/git-github-primeiros-passos