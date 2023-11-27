import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { Text, View, TextInput, Button, Image, StyleSheet, Alert, TouchableOpacity } from 'react-native';
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
    const [serviceCount, setServiceCount] = useState(0);
    const [relatedServices, setRelatedServices] = useState([]);
    const [selectedRelatedService, setSelectedRelatedService] = useState('');
    const [base64Logotipo, setBase64Logotipo] = useState('');
    const [selectedServices, setSelectedServicess] = useState([]);
    print(CadastroInicial);
    const db = SQLite.openDatabase('./BancoLembraAi.db');

    const navigation = useNavigation();

    const serviceOptions = [
        'Salão de Beleza',
        'Oficina Mecânica',
        'Barbeiro',
    ];

    const relatedServiceSalaoOptions = [
        'Corte de cabelo',
        'Manicure e pedicure',
        'Maquiagem',
        'Tratamentos para cabelos',
        'Depilação'
    ]

    const relatedServiceOficinaOptions = [
        'Troca de óleo',
        'Troca de pneus',
        'Revisão',
        'Consertos',
        'Instalação de acessórios',
    ]

    const relatedServiceBarbeiroOptions = [
        'Corte de cabelo',
        'Barba',
        'Bigode',
        'Depilação facial',
        'Hidratação capilar',
    ]

    const executeSql = async (sql, params) => {
        return new Promise((resolve, reject) => {
            db.transaction((tx) => {
                tx.executeSql(sql, params, (_, result) => {
                    console.log('Query executada com sucesso:', result);
                    resolve(result);
                }, (_, error) => {
                    console.error('Erro ao executar a query:', error);
                    reject(error);
                });
            });
        });
    };

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

    const getRelatedServices = (selectedService) => {
        switch (selectedService) {
            case "Salão de Beleza":
                return relatedServiceSalaoOptions;
            case "Oficina Mecânica":
                return relatedServiceOficinaOptions;
            case "Barbeiro":
                return relatedServiceBarbeiroOptions;
            default:
                return [];
        }
    };

    // Insere os dados dos serviços selecionados na tabela Servico
    const insertServices = async () => {
        // Cria a query SQL para inserir um serviço
        const sql = `INSERT INTO Servico (Nome, Ramo, EstabelecimentoID) VALUES (?, ?, ?)`;

        // Obtém os serviços relacionados ao ramo selecionado
        const relatedServices = getRelatedServices(selectedService);

        // Insere todos os serviços relacionados no banco de dados
        for (let i = 0; i < relatedServices.length; i++) {
            // Define os parâmetros para inserir o serviço
            const params = [relatedServices[i], selectedService, cnpj];
            // Usa a função executeSql para inserir o serviço no banco de dados
            await executeSql(sql, params);
        }
    };



    async function handleCadastro() {
        // Verifique se os campos obrigatórios estão preenchidos
        if (!areInputsFilled()) {
            Alert.alert('Aviso', 'Por favor, preencha os campos vazios para continuar o cadastro', [
                {
                    text: 'Ok',
                    onPress: () => { },
                },
            ]);
            return;
        }

        try {
            // Verifica se a tabela Estabelecimento já tem algum registro
            const count = await new Promise((resolve, reject) => {
                db.transaction((tx) => {
                    tx.executeSql(
                        'SELECT COUNT(*) AS total FROM Estabelecimento',
                        [],
                        (_, result) => {
                            console.log('Número de registros na tabela Estabelecimento:', result.rows.item(0).total);
                            resolve(result.rows.item(0).total);
                        },
                        (_, error) => {
                            console.error('Erro ao contar os registros na tabela Estabelecimento:', error);
                            reject(error);
                        }
                    );
                });
            });

            // Se o número de registros for maior que zero, navegue para a página MainMenu
            if (count > 0) {
                Alert.alert("Já existe dados cadastrados, você será redirecionado ao Menu Principal.")
                navigation.navigate('MainMenu');
            } else {
                // Se não houver registros, tenta inserir o novo registro
                const sql = `INSERT INTO Estabelecimento (Nome, CNPJ, Ramo, Logotipo) VALUES (?, ?, ?, ?)`;
                const params = [nomeEstabelecimento, cnpj, selectedService, base64Logotipo];

                db.transaction(async (tx) => {
                    tx.executeSql(
                        sql,
                        params,
                        (_, result) => {
                            console.log('Dados cadastrados com sucesso:', result);
                        },
                        (_, error) => {
                            console.error('Erro ao cadastrar os dados:', error);
                        }
                    );
                });

                // Insere os serviços
                await insertServices();

                // Navega para a página MainMenu
                navigation.navigate('MainMenu');
            }
        } catch (error) {
            console.error('Erro ao cadastrar os dados', error);
        }
    }

    const ImageBase64 = ({ base64String }) => {
        const source = {
            uri: `data:image/png;base64,${base64String}`,
        };

        return <Image source={source} />;
    };

    function handleIr() {
        navigation.navigate('MainMenu');
    }

    const areInputsFilled = () => {
        return nomeEstabelecimento !== '' && cnpj !== '' && selectedService !== '';
    };


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
            <ConnectBanco />
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
                <Text style={styles.label}>Ramos:</Text>
                <View style={styles.pickerContainer}>
                    <Picker
                        selectedValue={selectedService}
                        style={styles.picker}
                        onValueChange={(itemValue) => {
                            setSelectedService(itemValue);
                        }}
                    >
                        <Picker.Item label='Selecione um ramo' />
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

            <Text style={styles.textCadastrado}>
                Já tem o seu negócio? Clique <Text onPress={handleIr} style={styles.textCadastradoRed}>aqui</Text>
            </Text>
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
