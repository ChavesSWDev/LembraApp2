import React from "react";
import { Text, StyleSheet, View, ScrollView, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, TextInput, Pressable, Alert } from "react-native";
import * as Style from '../assets/styles';

const AddNota = ({navigation, ...props}) => {
    return (
        <ScrollView>
            <KeyboardAvoidingView
                behavior="padding"
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={{ padding: 20, justifyContent: 'space-around' }}>
                    <Text style={styles.title}>Adicionar uma nota</Text>
                        <TextInput style={[styles.input]} placeholder='Tenho que lembrar que...' multiline value={props.nota} onChangeText={(text) => props.setNota(text)} />

                        <Pressable
                            style={({ pressed }) => [styles.button, { opacity: pressed ? 0.7 : 1 }]}
                            onPress={() => {
                                if(props.note === '' || props.note === null) {
                                    Alert.alert('Por favor escreva alguma coisa.');
                                } else {
                                    props.handleNota();
                                    navigation.navigate('Notas');
                                }
                            }}
                        >
                            <Text style={styles.buttonText}>Adicionar</Text>
                        </Pressable>
                    </View>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </ScrollView>
    )
}

export const styles = StyleSheet.create({
    addNotaContainer: {
        paddingHorizontal: 20,
        marginTop: 20,
        alignItems: 'center',
        justifyContent: 'center'
    },
    title: { // Estilos do título
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 20,
        textAlign: 'center',
    },
    button: {
        backgroundColor: Style.color,
        width: '40%',
        borderRadius: 100,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'flex-end',
        height: 40,
        marginTop: 20,
    },
    buttonText: {
        color: 'white',
        fontSize: 20,
        fontWeight: '700'
    },
    input: {
        paddingTop: 10,
        padding: 20,
        width: '100%',
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
        borderRadius: 5,
        height: 300,
    }
})
export default AddNota;