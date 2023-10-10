import React from "react";
import { ScrollView, Text, View, StyleSheet, TouchableOpacity, Alert } from "react-native";
import * as Style from '../assets/styles';
import { styles } from './Notas';
import AsyncStorage from "@react-native-async-storage/async-storage";

const DeletarNota = ({ ...props }) => {

    function esvaziarLixeira() {
        if (props.moverParaLixeira.length === 0) {
            Alert.alert(
                'Não existem notas na lixeira',
                'Não há nenhuma nota na lixeira para ser deletada.',
                [
                    {
                        text: 'Ok',
                        onPress: () => console.log('Ok pressionado'),
                    }
                ]
            );
        } else {
            Alert.alert(
                'Deletar todas as notas',
                'Você tem certeza que quer deletar permanentemente todas as notas da lixeira?',
                [
                    {
                        text: 'Não',
                        onPress: () => console.log('Não pressionado'),
                        style: 'cancel'
                    },
                    {
                        text: 'Sim',
                        onPress: () => {
                            let esvaziarArray = [...props.moverParaLixeira];
                            esvaziarArray = [];
                            props.setMoverParaLixeira(esvaziarArray);

                            AsyncStorage.setItem('deletarNota', JSON.stringify(esvaziarArray)).then(() => {
                                props.setNotas(esvaziarArray)
                            }).catch(error => console.log(error))
                        }
                    }
                ]
            )
        }
    }

    function deletarPermanentemente(index) {
        Alert.alert(
            'Deletar permanentemente',
            'Você tem certeza que quer deletar permanentemente essa nota da lixeira?',
            [
                {
                    text: 'Não',
                    onPress: () => console.log('Não pressionado'),
                    styles: 'cancel',
                },
                {
                    text: 'Sim',
                    onPress: () => {
                        let newArray = [...props.moverParaLixeira];
                        newArray.splice(index, 1);
                        props.setMoverParaLixeira(newArray);

                        AsyncStorage.setItem('deletarNota', JSON.stringify(newArray)).then(() => {
                            props.setNotas(newArray)
                        }).catch(error => console.log(error))
                    }
                }
            ]
        )
    }

    function recuperarNotas() {
        if (props.moverParaLixeira.length === 0) {
            Alert.alert(
                'Não existem notas na lixeira',
                'Não há nenhuma nota na lixeira para ser recuperada.',
                [
                    {
                        text: 'Ok',
                        onPress: () => console.log('Ok pressionado'),
                    }
                ]
            );
        } else {
            Alert.alert(
                'Recuperar todas as notas',
                'Você tem certeza que quer recuperar todas as notas da lixeira?',
                [
                    {
                        text: 'Não',
                        onPress: () => console.log('Não pressionado'),
                        style: 'cancel'
                    },
                    {
                        text: 'Sim',
                        onPress: () => {
                            let notasRecuperadas = [...props.moverParaLixeira];
                            let notas = [...props.notas];

                            notasRecuperadas.forEach((item) => {
                                notas.push(item);
                            });

                            props.setMoverParaLixeira([]);
                            props.setNotas(notas);


                            AsyncStorage.setItem('storedNotas', JSON.stringify(notas)).then(() => {
                                props.setNotas(notas)
                            }).catch(error => console.log(error))

                            AsyncStorage.setItem('deletarNota', JSON.stringify([])).then(() => {
                                props.setMoverParaLixeira([])
                            }).catch(error => console.log(error))
                        }
                    }
                ]
            );
        }
    }

    function recuperarNota(index) {
        Alert.alert(
            'Recuperar nota',
            'Você tem certeza que quer recuperar essa nota da lixeira?',
            [
                {
                    text: 'Não',
                    onPress: () => console.log('Não pressionado'),
                    style: 'cancel'
                },
                {
                    text: 'Sim',
                    onPress: async () => {
                        try {
                            const recuperar = props.moverParaLixeira[index];
                            const newArray = [...props.moverParaLixeira];
                            newArray.splice(index, 1);

                            const array = [recuperar, ...props.notas];

                            await AsyncStorage.setItem('storedNotas', JSON.stringify(array));
                            props.setNotas(array);

                            await AsyncStorage.setItem('deletarNota', JSON.stringify(newArray));
                            props.setMoverParaLixeira(newArray);
                        } catch (error) {
                            console.log(error);
                        }
                    }
                }
            ]
        );
    }

    return (
        <ScrollView>
            <View style={[styles.notesContainer]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <TouchableOpacity onPress={() => recuperarNotas()} style={style.emptyButton}>
                        <Text style={style.emptyButtonText}>Recuperar</Text>
                    </TouchableOpacity>

                    <Text style={{ fontWeight: '700', fontSize: 18, color: Style.color }}>
                        Total: {props.moverParaLixeira.length}
                    </Text>

                    <TouchableOpacity onPress={() => esvaziarLixeira()} style={style.emptyButton}>
                        <Text style={style.emptyButtonText}>Esvaziar</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.divider}></View>

                {props.moverParaLixeira.length === 0

                    ?

                    <View style={styles.emptyNoteContainer}>
                        <Text style={styles.emptyNoteText}>Nenhuma nota foi deletada ainda...</Text>
                    </View>

                    :

                    props.moverParaLixeira.map((item, index) =>
                        <View style={styles.item} key={index}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>

                                <View style={styles.nota}>
                                    <Text style={styles.index}>
                                        {index + 1}.
                                    </Text>
                                    <Text style={styles.text}>
                                        {item.text}
                                    </Text>
                                </View>

                                <TouchableOpacity onPress={() => recuperarNota(index)}>
                                    <Text style={styles.delete}>
                                        Recuperar
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.dataContainer}>
                                <Text>Data: {item.data}</Text>

                                <TouchableOpacity onPress={() => deletarPermanentemente(index)}>
                                    <Text style={styles.delete}>Deletar</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
            </View>
        </ScrollView>
    )
}

export const style = StyleSheet.create({
    emptyButton: {
        backgroundColor: Style.color,
        width: '25%',
        borderRadius: 100,
        justifyContent: 'center',
        alignItems: 'center',
        height: 35,
        marginBottom: 5,
        marginRight: 5,
        marginLeft: 5,
        top: 5
    },
    emptyButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '700'
    }
})

export default DeletarNota;