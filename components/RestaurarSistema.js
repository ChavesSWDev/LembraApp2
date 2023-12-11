import React from 'react'
import NavBar from './NavBar'
import { ScrollView } from 'react-native'
import { StyleSheet } from 'react-native'
import * as Style from '../assets/styles';
import { View } from 'react-native';
import { Text } from 'react-native';
import { TouchableOpacity } from 'react-native';
import { Alert } from 'react-native';
import * as SQLite from 'expo-sqlite';
import { useNavigation } from '@react-navigation/native';

const RestaurarSistema = () => {
    const navigation = useNavigation();
    const db = SQLite.openDatabase('BancoLembraAi.db');
    const resetarDados = () => {
        db.transaction(
            (tx) => {
                // Execute DROP TABLE para remover completamente as tabelas
                tx.executeSql('DROP TABLE IF EXISTS Estabelecimento');
                tx.executeSql('DROP TABLE IF EXISTS Servico');
                tx.executeSql('DROP TABLE IF EXISTS Agendamento');
                tx.executeSql('DROP TABLE IF EXISTS Colaboradores');

                // Em seguida, recrie as tabelas
                tx.executeSql(
                    'CREATE TABLE IF NOT EXISTS Estabelecimento (ID INTEGER PRIMARY KEY AUTOINCREMENT, Nome TEXT, CNPJ INTEGER, Ramo TEXT, Logotipo TEXT, Tuto INTEGER)'
                );
                tx.executeSql(
                    'CREATE TABLE IF NOT EXISTS Servico (ID INTEGER PRIMARY KEY AUTOINCREMENT, Nome TEXT, Ramo TEXT, EstabelecimentoID INTEGER)'
                );
                tx.executeSql(
                    'CREATE TABLE IF NOT EXISTS Agendamento (ID INTEGER PRIMARY KEY AUTOINCREMENT, Nome TEXT, Telefone TEXT, Data TEXT, Horario TEXT, Servicos TEXT, Status TEXT, ColaboradorNome TEXT)'
                );
                tx.executeSql(
                    'CREATE TABLE IF NOT EXISTS Colaboradores(ID INTEGER PRIMARY KEY AUTOINCREMENT, Nome TEXT)'
                )
            },
            (erro) => {
                console.error('Erro na transação', erro);
            }
        );
    };

    const handleResetar = () => {
        Alert.alert(
            'Confirmar Resetar',
            'Ao confirmar essa ação, todos os seus dados cadastrados até hoje, incluindo sua empresa, logotipo, agendamentos, serão EXCLUÍDOS PERMANENTEMENTE e você terá de recriar uma nova empresa do 0.',
            [
                {
                    text: 'Cancelar',
                    style: 'cancel',
                },
                {
                    text: 'Resetar',
                    onPress: () => {
                        resetarDados();
                        Alert.alert('Sistema restaurado com sucesso!')
                        // Navegue para a página CadastroInicial após a redefinição
                        navigation.navigate('BemVindo');
                    },
                    style: 'destructive',
                },
            ],
            { cancelable: false }
        );
    };

    return (
        <>
            <NavBar />
            <ScrollView>
                    <View style={styles.container}>
                        <Text style={styles.TextoAzul}>Resetar todos os dados</Text>
                        <TouchableOpacity style={styles.buttonRed}>
                            <Text onPress={handleResetar} style={styles.buttonText}>Resetar</Text>
                        </TouchableOpacity>
                    </View>
            </ScrollView>
        </>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: '#f0f0f0',
        marginTop: 50
    },
    picker: {
        backgroundColor: Style.color,
        marginHorizontal: 10,
        marginBottom: 10,
        marginTop: 10,
        width: 200,
        justifyContent: 'center',
        paddingHorizontal: 20,
        fontWeight: 'bold',
        color: 'white',
    },
    pickerText: {
        color: 'black',
        justifyContent: 'center',
        paddingHorizontal: 20,
        fontWeight: 'bold',
        fontSize: 20
    },
    filtroContainer: {
        flexDirection: 'column',
        alignItems: 'center',
        marginTop: 20,
    },
    filtroItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 1,
    },
    botaoPesquisar: {
        backgroundColor: 'blue',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
    },
    mesesContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 10,
        marginBottom: 10,
    },
    mes: {
        fontWeight: 'bold'
    },
    diasContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
        marginBottom: 20,
    },
    linhaDiasContainer: {
        justifyContent: 'space-around',
        marginTop: 10,
        fontWeight: 'bold'
    },
    fecharCard: {
        color: 'red',
        fontWeight: 'bold'
    },
    ladoAlado: {
        alignSelf: 'center',
        flexDirection: 'row',
        marginTop: 10,
    },
    card: {
        backgroundColor: '#ffffff',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 10,
        marginHorizontal: 10,
        marginBottom: 10,
        marginTop: 50,
        elevation: 2
    },
    cardHeader: {
        fontSize: 17,
        fontWeight: 'bold',
    },
    cardText: {
        fontSize: 16,
        color: Style.color2
    },
    rightSideGreen: {
        backgroundColor: 'green',
        borderTopRightRadius: 10,
        borderBottomRightRadius: 10,
        borderTopLeftRadius: 10,
        borderBottomLeftRadius: 10,
        width: 20,  // Adjust the width as needed
    },
    rightSideYellow: {
        backgroundColor: 'yellow',
        borderTopRightRadius: 10,
        borderBottomRightRadius: 10,
        borderTopLeftRadius: 10,
        borderBottomLeftRadius: 10,
        width: 20,  // Adjust the width as needed
    },
    rightSideRed: {
        backgroundColor: 'red',
        borderTopRightRadius: 10,
        borderBottomRightRadius: 10,
        borderTopLeftRadius: 10,
        borderBottomLeftRadius: 10,
        width: 20,  // Adjust the width as needed
    },
    rightSideBlue: {
        backgroundColor: Style.color,
        borderTopRightRadius: 10,
        borderBottomRightRadius: 10,
        borderTopLeftRadius: 10,
        borderBottomLeftRadius: 10,
        width: 20,  // Adjust the width as needed
    },
    cardStatus: {
        flexDirection: 'row', // Add this line to make the children align horizontally
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 5,
        borderRadius: 10,
        paddingBottom: 5
    },
    cardStatusCircleAtendido: {
        backgroundColor: 'green',
        width: 15,
        height: 15,
        borderRadius: 15,
        marginRight: 5,
    },
    cardStatusCircleAtrasado: {
        backgroundColor: 'yellow',
        width: 15,
        height: 15,
        borderRadius: 15,
        marginRight: 5,
    },
    cardStatusCircleCancelado: {
        backgroundColor: 'red',
        width: 15,
        height: 15,
        borderRadius: 15,
        marginRight: 5,
    },
    cardStatusCircleEspera: {
        backgroundColor: Style.color,
        width: 15,
        height: 15,
        borderRadius: 15,
        marginRight: 5,
    },
    cardStatusText: {
        fontSize: 14,
        textAlign: 'center',
        color: 'black',
        fontWeight: 'bold'
    },
    logo: {
        width: 250,
        height: 250,
        marginBottom: 20,
        alignSelf: 'center'
    },
    textCadastrado: {
        marginTop: 50,
        marginLeft: 47
    },
    textCadastradoRed: {
        color: 'red'
    },
    inputContainer: {
        flexDirection: 'row',
        alignSelf: 'center',
        marginBottom: 15,
    },
    input: {
        width: '60%',
        backgroundColor: '#ffffff',
        paddingVertical: 10,
        paddingHorizontal: 15,
        marginRight: 10,
        borderRadius: 8,
        elevation: 2,
        fontSize: 18,
    },
    editText: {
        color: 'blue',
        fontSize: 16,
        marginRight: 5
    },
    removeText: {
        color: 'red',
        fontSize: 16,
    },
    label: {
        fontSize: 18,
        marginBottom: 5,
        fontWeight: 'bold',
        textAlign: 'left',
        marginLeft: 55
    },
    button: {
        backgroundColor: Style.color,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 10,
        marginHorizontal: 10,
        marginBottom: 10,
        marginTop: 50
    },
    buttonGray: {
        backgroundColor: 'gray',
        paddingVertical: 10,
        borderRadius: 10,
        marginBottom: 10,
        marginTop: 50,
        width: '30%',
        alignSelf: 'center',
    },
    buttonRed: {
        backgroundColor: 'red',
        paddingVertical: 10,
        borderRadius: 10,
        marginBottom: 10,
        marginTop: 50,
        width: '30%',
        alignSelf: 'center',
    },
    buttonGreen: {
        backgroundColor: 'green',
        paddingVertical: 10,
        borderRadius: 10,
        marginBottom: 10,
        marginTop: 50,
        width: '30%',
        alignSelf: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    TextoAzul: {
        color: Style.color,
        fontSize: 22,
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 10,
        marginBottom: 10
    },
    textoMeses: {
        color: Style.color,
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10
    },
    textoDias: {
        color: Style.color,
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 5,
        marginBottom: 5
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 30,
        marginTop: 10,
        alignItems: 'center', // Centraliza os elementos horizontalmente
    },
});

export default RestaurarSistema