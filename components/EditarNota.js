import React from "react";
import { Keyboard, View, KeyboardAvoidingView, ScrollView, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback } from "react-native";
import { styles } from './AddNota';
import { useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const EditarNota = ({ route, navigation, ...props }) => {
    const { i, n } = route.params;
    const [novoEdit, setNovoEdit] = useState(n);

    function EditarNota() {
        let edited = [...props.notas];
        edited[i] = {...edited[i], text: novoEdit};
        props.setNotas(edited);

        navigation.navigate('Notas');

        AsyncStorage.setItem('storedNotas', JSON.stringify(edited)).then(() => {
            props.setNotas(edited)
        }).catch(error => console.log(error))
    }

    return (
        <ScrollView>
            <KeyboardAvoidingView
                behavior='padding'
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={{ padding: 20, justifyContent: 'space-around' }}>
                        <TextInput
                            style={[styles.input]}
                            placeholder="Escreva algo..."
                            value={novoEdit.toString()}
                            onChangeText={(text) => setNovoEdit(text)}
                        />

                        <TouchableOpacity style={styles.button} onPress={() => EditarNota()}>
                            <Text style={styles.buttonText}>Editar</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </ScrollView>
    )
}

export default EditarNota;