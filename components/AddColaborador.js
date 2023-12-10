import React, { useState } from 'react'
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import NavBar from './NavBar'
import * as SQLite from 'expo-sqlite';
import * as Style from '../assets/styles';
import { useNavigation } from '@react-navigation/native';
import db from './BancoLembraAi';

const AddColaborador = () => {
    const [nomeColaborador, setNomeColaborador] = useState();
    const navigation = useNavigation();

    const handleAddColaborador = () => {
        if (!nomeColaborador) {
            console.log('Preencha o campo!');
            Alert.alert('Preencha o campo!')
            return;
        }

        const checkExistingSql = `
            SELECT COUNT(*) as count
            FROM Colaboradores
            WHERE Nome = ?
        `;

        const checkExistingParams = [nomeColaborador];

        db.transaction((tx) => {
            tx.executeSql(
                checkExistingSql,
                checkExistingParams,
                (_, result) => {
                    const count = result.rows.item(0).count;

                    if (count > 0) {
                        console.log('Já existe um colaborador com esse nome')
                        Alert.alert('Aviso', 'Já existe um colaborador com esse nome')
                    } else {
                        const insertSql = `
                        INSERT INTO Colaboradores(Nome) VALUES(?)`


                        const insertParams = [nomeColaborador];

                        tx.executeSql(
                            insertSql,
                            insertParams,
                            (_, result) => {
                                console.log('Dado cadastrado com sucesso!', result)
                                Alert.alert('Sucesso', 'Colaborador cadastrado com sucesso!');
                            },
                            (_, error) => {
                                console.log('Erro ao cadastrar o dado!', error)
                                Alert.alert('Erro', 'Erro ao cadastrar colaborador!')
                            }
                        );

                        navigation.navigate('Colaboradores')
                    }
                },
                (_, error) => {
                    console.error('Erro ao verificar colaborador existente!', error);
                }
            )
        })
    }

    return (
        <>
            <NavBar />
            <ScrollView>
                <Text style={styles.TextoAzul}>Adicionar novo colaborador</Text>
                <View style={styles.container}>
                    <Text style={styles.label}>Nome:</Text>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Nome do colaborador"
                            value={nomeColaborador}
                            onChangeText={(text) => setNomeColaborador(text)}
                        />
                    </View>
                </View>

                <View>
                    <TouchableOpacity onPress={handleAddColaborador} style={styles.button}>
                        <Text style={styles.buttonText}>Adicionar</Text>
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
        marginTop: 80
    },
    label: {
        fontSize: 18,
        marginBottom: 5,
        fontWeight: 'bold',
        textAlign: 'left',
        marginLeft: 76
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
    TextoAzul: {
        color: Style.color,
        fontSize: 22,
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 10,
        marginBottom: 10
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 30,
        marginTop: 10,
        alignItems: 'center', // Centraliza os elementos horizontalmente
    },
    button: {
        backgroundColor: Style.color,
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
})

export default AddColaborador