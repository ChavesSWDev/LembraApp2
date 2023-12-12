import React, { useState } from 'react';
import { Text, StyleSheet, View, TouchableOpacity, Alert, Keyboard } from 'react-native';
import * as Style from '../assets/styles';
import Icon from 'react-native-vector-icons/FontAwesome';
import { TextInput } from 'react-native';
import { ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Notas = ({ navigation, ...props }) => {

    const [pesquisarNota, setPesquisarNota] = useState();
    const [highlightedIndex, setHighlightedIndex] = useState(-1);

    function deletarNota(index) {
        let newArray = [...props.notas];
        let moverParaLixeira = newArray[index];
        newArray.splice(index, 1);
        props.setNotas(newArray);

        let bin = [moverParaLixeira, ...props.moverParaLixeira]
        props.setMoverParaLixeira(bin);

        AsyncStorage.setItem('storedNotas', JSON.stringify(newArray)).then(() => {
            props.setNotas(newArray)
        }).catch(error => console.log(error))

        AsyncStorage.setItem('deletarNota', JSON.stringify(bin)).then(() => {
            props.setMoverParaLixeira(bin)
        }).catch(error => console.log(error))

        Alert.alert('Nota enviada à lixeira.');
    }

    async function limparTodasNotas() {
        if (props.notas.length === 0) {
            Alert.alert(
                'Não existe nenhuma nota',
                'Não há nenhuma nota existente para ser enviada à lixeira.',
                [
                    {
                        text: 'Ok',
                        onPress: () => console.log('Ok pressionado'),
                    }
                ]
            );
        } else {
            Alert.alert(
                'Limpando todas as notas...',
                'Você tem certeza que deseja enviar todas as notas para a lixeira?',
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
                                const emptyArray = [];
                                const deletedCompArray = [...props.moverParaLixeira, ...props.notas];

                                await AsyncStorage.setItem('storedNotas', JSON.stringify(emptyArray));
                                props.setNotas(emptyArray);

                                await AsyncStorage.setItem('deletarNota', JSON.stringify(deletedCompArray));
                                props.setMoverParaLixeira(deletedCompArray);
                            } catch (error) {
                                console.log(error);
                            }
                        }
                    }
                ]
            );
        }
    }


    function pesquisar() {
        if (pesquisarNota === '') {
            Alert.alert('Escreva alguma coisa para ser pesquisada!');
        } else if (pesquisarNota !== '') {
            props.notas.forEach((item, index) => {
                if (item.text.includes(pesquisarNota)) {
                    let pesquisarItem = [...props.notas];
                    let firstElOfArray = pesquisarItem[0];
                    let index = pesquisarItem.indexOf(item);
                    pesquisarItem[0] = item;
                    pesquisarItem[index] = firstElOfArray;
                    props.setNotas(pesquisarItem);
                    setHighlightedIndex(0);  // Destaque a nota retornada para a posição [0]

                    setTimeout(() => {
                        setHighlightedIndex(-1);  // Remova o destaque após 3 segundos
                    }, 3000);
                }
            })
        }
        setPesquisarNota('');

        Keyboard.dismiss();
    }



    return (
        <View style={[styles.notasContainer]}>
            <View style={styles.headingContainer}>
                <Text style={styles.heading}>Suas Anotações...</Text>

                <View style={{ flexDirection: 'row' }}>
                    <TouchableOpacity style={[styles.button, { marginLeft: 10 }]} onPress={() => navigation.navigate('DeletarNota')}>
                        <Icon name='trash-o' size={25} color="white" />
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.button, { marginLeft: 10 }]} onPress={() => navigation.navigate('AddNota')}>
                        <Icon name='plus' size={25} color="white" />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ fontWeight: '700', fontSize: 18, color: Style.color }}>
                    Total: {props.notas.length}
                </Text>
            </View>

            <View style={styles.divider}></View>

            <View style={styles.searchContainer}>
                <TextInput value={pesquisarNota} onChangeText={(text) => setPesquisarNota(text)} placeholder='Pesquisar...' placeholderTextColor={Style.color} style={[styles.input, { borderWidth: 2 }]} />

                <TouchableOpacity onPress={() => pesquisar()} style={[styles.searchButton, { width: 40 }]}>
                    <Icon name='search' size={17} color="white" />
                </TouchableOpacity>

                <TouchableOpacity onPress={() => limparTodasNotas()} style={styles.searchButton}>
                    <Text style={styles.searchButtonText}>Limpar</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {props.notas.length === 0

                    ?

                    <View style={styles.emptyNoteContainer}>
                        <Text style={styles.emptyNoteText}>Não há nenhuma anotação ainda. Clique no + para adicionar uma nova nota!</Text>
                    </View>

                    :

                    props.notas.map((item, index) =>
                        <View style={[
                            styles.item,
                            index === highlightedIndex && { borderColor: 'red' },
                        ]} key={index}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>


                                <View style={styles.nota}>
                                    <Text style={styles.index}>{index + 1}.</Text>
                                    <Text style={styles.text}>{item.text}</Text>
                                </View>

                                <TouchableOpacity onPress={() => deletarNota(index)}>
                                    <Text style={styles.delete}>X</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.dataContainer}>
                                <Text>Data: {item.data}</Text>

                                <TouchableOpacity onPress={() => navigation.navigate('EditarNota', {
                                    i: index,
                                    n: item.text
                                })}>
                                    <Text style={styles.delete}>Editar</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
            </ScrollView>
        </View>
    )
}

export const styles = StyleSheet.create({
    notasContainer: {
        paddingTop: 50,
        paddingHorizontal: 20,
        marginBottom: 70,
        opacity: 0.9,
        marginTop:50
    },
    heading: {
        fontSize: 30,
        fontWeight: '700',
        color: Style.color,
    },
    headingSmall: {
        fontSize: 20,
        fontWeight: '700',
        color: Style.color,
        textAlign: 'center'
    },
    headingVerySmall: {
        fontSize: 16,
        fontWeight: '500',
        color: Style.color,
        textAlign: 'center',
        marginTop: 20
    },
    divider: {
        width: '100%',
        height: 2,
        backgroundColor: Style.color,
        marginTop: 5,
        marginBottom: 5
    },
    item: {
        marginBottom: 20,
        padding: 15,
        color: 'black',
        opacity: 0.8,
        marginTop: 10,
        shadowColor: Style.color,
        shadowOpacity: 0.5,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 8,
        elevation: 5,
        backgroundColor: 'white',
        borderColor: Style.color,
        borderWidth: 2,
        borderRadius: 5,
        borderLeftWidth: 15,
    },
    index: {
        fontSize: 20,
        fontWeight: '800',
    },
    headingContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    button: {
        backgroundColor: Style.color,
        width: 50,
        borderRadius: 100,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 10,
        height: 50,
    },
    buttonText: {
        color: 'white',
        fontSize: 32,
        fontWeight: '800'
    },
    scrollView: {
        marginBottom: 70
    },
    nota: {
        flexDirection: 'row',
        width: '75%'
    },
    text: {
        fontWeight: '700',
        fontSize: 17,
        alignSelf: 'center'
    },
    delete: {
        color: Style.color,
        fontWeight: '700',
        fontSize: 15
    },
    input: {
        height: 40,
        paddingHorizontal: 20,
        width: '65%',
        fontSize: 19,
        color: 'black',
        fontWeight: '600',
        opacity: 0.8,
        shadowColor: Style.color,
        shadowOpacity: 0.4,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 8,
        elevation: 5,
        backgroundColor: 'white',
        borderColor: Style.color,
        borderWidth: 2,
        borderRadius: 5
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginVertical: 8
    },
    searchButton: {
        backgroundColor: Style.color,
        alignItems: 'center',
        justifyContent: 'center',
        width: 60,
        borderRadius: 5,
        height: 40
    },
    searchButtonText: {
        color: 'white',
        fontWeight: '700',
        fontSize: 12
    },
    emptyNoteContainer: {
        alignItems: 'center',
        marginTop: 240
    },
    emptyNoteText: {
        color: Style.color,
        fontWeight: '600',
        fontSize: 15
    },
    dataContainer: {
        marginTop: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20
    },
})


export default Notas;