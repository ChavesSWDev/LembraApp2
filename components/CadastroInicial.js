import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Text, View, TextInput, Button, Image, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { ScrollView } from 'react-native';
import * as SQLite from 'expo-sqlite';
import ConnectBanco from './BancoLembraAi';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import * as Style from '../assets/styles';
import { convertImageToBase64 } from './BancoLembraAi';
import { CheckBox } from 'react-native-elements';



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
    const [logoTipoPath, setLogoTipoPath] = useState('');
    const [selectedServices, setSelectedServices] = useState([]);
    const [cardAberto, setCardAberto] = useState(false);
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

            // Salve o caminho da imagem no banco de dados
            const logotipoPath = result.uri;
            setLogotipoPath(logotipoPath);

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
                console.log(nomeEstabelecimento, cnpj, selectedService)
                // Se não houver registros, tenta inserir o novo registro
                const sql = `INSERT INTO Estabelecimento (Nome, CNPJ, Ramo, Logotipo, Tuto) VALUES (?, ?, ?, ?, ?)`;
                const params = [nomeEstabelecimento, cnpj, selectedService, logoTipoPath, 1];

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

    const handleCardRamos = () => {
        if (cardAberto === true) {
            setCardAberto(false);
        } else {
            setCardAberto(true);
        }
    }

    const handleServiceToggle = (service) => {
        const isSelected = selectedService.includes(service);

        if (isSelected) {
            // Se o serviço já estiver selecionado, desmarque-o
            const updatedSelectedService = selectedService.filter(
                (selected) => selected !== service
            );
            setSelectedService(updatedSelectedService);
        } else {
            // Se o serviço não estiver selecionado, desmarque os outros e selecione o atual
            setSelectedService([service]);
        }
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

            {/* <TouchableOpacity style={styles.buttonRamos} onPress={() => handleCardRamos()}>
                <Text style={styles.buttonText}>Ramos</Text>
            </TouchableOpacity>
            {cardAberto && (
                <View style={styles.card}>
                    <Text style={styles.cardHeader}>Selecionar ramos</Text>
                    <View style={styles.containerCheck}>
                        {serviceOptions.map((service, index) => (
                            <View key={index} style={styles.checkboxContainer}>
                                <CheckBox
                                    title={service}
                                    checked={selectedService.includes(service)}
                                    onPress={() => handleServiceToggle(service)}
                                    containerStyle={styles.checkbox}
                                />
                            </View>
                        ))}
                    </View>
                </View>
            )} */}
            <View style={styles.formGroup}>
                <Text style={styles.label}>Ramos:</Text>
                <View>
                    <Picker
                        selectedValue={selectedService}
                        style={styles.picker}
                        onValueChange={(itemValue) => {
                            setSelectedService(itemValue);
                        }}
                    >
                        <Picker.Item style={styles.pickerText} label='Selecione um ramo' />
                        {serviceOptions.map((service, index) => (
                            <Picker.Item style={styles.pickerText} key={index} label={service} value={service} />
                        ))}
                    </Picker>
                </View>
            </View>

            <View style={styles.formGroup2}>
                <Text style={styles.label}>Logotipo:</Text>
                <TouchableOpacity style={styles.button} onPress={selectImage}>
                    <Text style={styles.buttonText}>Selecionar Imagem</Text>
                </TouchableOpacity>
                {logotipo && <Image source={{ uri: logotipo }} style={styles.logoImage} />}
            </View>

            <View style={styles.formGroupCadastrar}>
                <TouchableOpacity style={styles.button} onPress={handleCadastro}>
                    <Text style={styles.buttonText}>Cadastrar</Text>
                </TouchableOpacity>
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
    cardHeader: {
        color: Style.color,
        fontWeight: 'bold',
        alignSelf: 'center'
    },
    containerCheck: {
        backgroundColor: '#ccc',
        paddingVertical: 10,
        borderRadius: 10,
        marginBottom: 10,
        width: '80%',
        alignSelf: 'center',
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 5,
    },
    textCadastrado: {
        marginTop: 30
    },
    textCadastradoRed: {
        color: 'red'
    },
    formGroup: {
        marginBottom: 16,
        marginTop: 15
    },
    formGroup2: {
        marginTop: 90,
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
        backgroundColor: Style.color,
        marginHorizontal: 10,
        marginBottom: 10,
        marginTop: 10,
        width: '100%',
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
    logoImage: {
        width: 100,
        height: 100,
        marginTop: 8,
    },
    formGroupCadastrar: {
        marginTop: 16,
    },
    button: {
        backgroundColor: Style.color,
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        padding: 10,
        borderRadius: 8,
        textAlign: 'center',
    },
    buttonRamos: {
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
    checkbox: {
        marginLeft: 15,
        width: '90%'
    },
});

export default CadastroInicial;
