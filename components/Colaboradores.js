import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import * as SQLite from 'expo-sqlite';
import NavBar from './NavBar';
import * as Style from '../assets/styles';
import db from './BancoLembraAi';

const Colaboradores = () => {
    const navigation = useNavigation();
    const [estabelecimento, setEstabelecimento] = useState({});
    const [colaboradores, setColaboradores] = useState([]);

    const buscarDados = async () => {
        await db.transaction((tx) => {
            // Buscar dados do estabelecimento
            tx.executeSql(
                'SELECT * FROM Estabelecimento',
                [],
                (_, resultado) => {
                    if (resultado.rows.length > 0) {
                        setEstabelecimento(resultado.rows.item(0));
                    }
                },
                (_, erro) => {
                    console.error('Erro ao buscar dados:', erro);
                }
            );

            // Buscar dados dos colaboradores
            tx.executeSql(
                'SELECT * FROM Colaboradores',
                [],
                (_, resultado2) => {
                    if (resultado2.rows.length > 0) {
                        const colaboradoresArray = [];
                        for (let i = 0; i < resultado2.rows.length; i++) {
                            const registro2 = resultado2.rows.item(i);
                            colaboradoresArray.push(registro2);
                        }
                        setColaboradores(colaboradoresArray);
                    }
                },
                (_, erro) => {
                    console.error('Erro ao buscar dados dos colaboradores:', erro);
                }
            );
        });
    };

    useFocusEffect(
        React.useCallback(() => {
            buscarDados();
        }, [])
    );

    const irParaAddColaborador = () => {
        navigation.navigate('AddColaborador');
    };

    return (
        <>
            <NavBar />
            <ScrollView>
                <View>
                    <TouchableOpacity onPress={irParaAddColaborador} style={styles.button}>
                        <Text style={styles.buttonText}>Adicionar colaborador</Text>
                    </TouchableOpacity>
                </View>
                <Text style={styles.TextoAzul}>Colaboradores cadastrados</Text>
                {colaboradores.map((colaborador, index) => (
                    <View key={`${colaborador.Id}_${index}`} style={styles.card}>
                        <Text style={styles.cardHeader}>{colaborador.Nome}</Text>
                        <Text style={styles.cardText}>Colaborador da {estabelecimento.Nome}.</Text>
                    </View>
                ))}

            </ScrollView>
        </>
    );
};

const styles = StyleSheet.create({
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
    TextoAzul: {
        color: Style.color,
        fontSize: 22,
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 10,
        marginBottom: 10
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
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
    },
})

export default Colaboradores