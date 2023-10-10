import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { Text, View, TextInput, Button, Image, StyleSheet } from 'react-native';
import { ScrollView } from 'react-native';
import ImagePicker from 'react-native-image-picker';
import { Picker } from '@react-native-picker/picker';
import * as SQLite from 'expo-sqlite';
import ConnectBanco from './BancoLembraAi';
function CadastroInicial() {
    const [nomeEstabelecimento, setNomeEstabelecimento] = useState('');
    const [cnpj, setCnpj] = useState('');
    const [logotipo, setLogotipo] = useState('');
    const [ramo, setRamo] = useState('');
    const [selectedService, setSelectedService] = useState(''); // Adicione esta linha
    print(CadastroInicial);
    const db = SQLite.openDatabase('BancoLembraAi.db');

    const navigation = useNavigation();

    const serviceOptions = [
        'Salão de Beleza',
        'Oficina Mecânica',
        'Barbeiro',
    ];

    

    function handleCadastro() {
        try {
            const sql = 'INSERT INTO Estabelecimento (Nome, CNPJ, Servicos, Logotipo) VALUES (?, ?, ?, ?)';
            const params = [nomeEstabelecimento, cnpj, selectedService, logotipo];

            db.transaction(async (tx) => {
                tx.executeSql(sql, params);

                navigation.navigate('MainMenu');
            });

        } catch (error) {
            console.error('Erro ao cadastrar os dados', error);
        }
    };

    function handleIr() {
        navigation.navigate('MainMenu');
    }
       

    // const handleCadastro = () => {
    //     navigation.navigate('MainMenu')
    // };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.formGroup}>
                <Text style={styles.label}>Nome do Estabelecimento:</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Digite o nome do estabelecimento"
                    value={nomeEstabelecimento}
                    onChangeText={(text) => setNomeEstabelecimento(text)}
                />
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>CNPJ:</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Digite o CNPJ"
                    value={cnpj}
                    onChangeText={(text) => setCnpj(text)}
                />
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>Serviços:</Text>
                <View style={styles.pickerContainer}>
                    <Picker
                        selectedValue={selectedService}
                        onValueChange={(itemValue) => setSelectedService(itemValue)}
                        style={styles.picker}
                    >
                        <Picker.Item label="Selecione um serviço" value="" />
                        {serviceOptions.map((service, index) => (
                            <Picker.Item key={index} label={service} value={service} />
                        ))}
                    </Picker>
                </View>
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>Logotipo:</Text>
                <Button title="Selecionar Imagem" />
                {logotipo && <Image source={{ uri: logotipo }} style={styles.logoImage} />}
            </View>

            <View style={styles.formGroupCadastrar}>
                <Button title="Cadastrar" onPress={handleCadastro} style={styles.button} />
            </View>

            <View>
                <Text style={styles.textCadastrado}>
                    Já tem o seu negócio? Clique <Text onPress={handleIr} style={styles.textCadastradoRed}>aqui</Text>
                </Text>
            </View>
        </ScrollView>
    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    textCadastrado: {
        marginTop: 30
    },
    textCadastradoRed: {
        color: 'red'
    },
    formGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 18,
        marginBottom: 8,
    },
    input: {
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 4,
        fontSize: 16,
    },
    pickerContainer: {
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        fontSize: 16,
        height: 55,
    },
    picker: {
        height: 40,
    },
    logoImage: {
        width: 100,
        height: 100,
        marginTop: 8,
    },
    formGroupCadastrar: {
        marginTop: 16,
    },
    button: {
        backgroundColor: 'blue',
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        padding: 10,
        borderRadius: 8,
        textAlign: 'center',
    },
});

export default CadastroInicial;
