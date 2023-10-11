import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { Text, View, TextInput, Button, Image, StyleSheet } from 'react-native';
import { ScrollView } from 'react-native';
import * as SQLite from 'expo-sqlite';
import ConnectBanco from './BancoLembraAi';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { convertImageToBase64 } from './BancoLembraAi';

function CadastroInicial() {
    const [nomeEstabelecimento, setNomeEstabelecimento] = useState('');
    const [cnpj, setCnpj] = useState('');
    const [logotipo, setLogotipo] = useState('');
    const [ramo, setRamo] = useState('');
    const [selectedService, setSelectedService] = useState('');
    const [base64Logotipo, setBase64Logotipo] = useState('');
    print(CadastroInicial);
    const db = SQLite.openDatabase('BancoLembraAi.db');

    const navigation = useNavigation();

    const serviceOptions = [
        'Salão de Beleza',
        'Oficina Mecânica',
        'Barbeiro',
    ];


    async function selectImage() {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (permissionResult.granted === false) {
            console.log('Permissão para acessar a galeria não concedida');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
        });

        if (!result.cancelled && result.uri) {
            // Atualize o estado 'logotipo' com a URI da imagem selecionada
            setLogotipo(result.uri);

            // Converta a imagem para uma string base64
            const base64String = await convertImageToBase64(result.uri);

            // Atualize o estado 'base64Logotipo' com a string base64
            setBase64Logotipo(base64String);
        }
    }

    async function handleCadastro() {
        try {
            const sql = 'INSERT INTO Estabelecimento (Nome, CNPJ, Servicos, Logotipo) VALUES (?, ?, ?, ?)';
            const params = [nomeEstabelecimento, cnpj, selectedService, base64Logotipo];

            db.transaction(async (tx) => {
                tx.executeSql(sql, params);

                navigation.navigate('MainMenu');
            });

        } catch (error) {
            console.error('Erro ao cadastrar os dados', error);
        }
    };

    const ImageBase64 = ({ base64String }) => {
        const source = {
            uri: `data:image/png;base64,${base64String}`,
        };

        return <Image source={source} />;
    };

    function handleIr() {
        navigation.navigate('MainMenu');
    }


    const convertImageToBase64 = async (uri) => {
        const response = await fetch(uri);
        const buffer = await response.blob();

        const base64String = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (reader.result) {
                    resolve(reader.result);
                } else {
                    reject(new Error('Erro ao converter imagem para base64'));
                }
            };
            reader.readAsDataURL(buffer);
        });

        return base64String;
    };

    
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
                <Button title="Selecionar Imagem" onPress={selectImage} />
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
