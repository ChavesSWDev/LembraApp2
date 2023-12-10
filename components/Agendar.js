import React, { useEffect, useState } from 'react'
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import * as Style from '../assets/styles';
import NavBar from './NavBar';
import { Picker } from '@react-native-picker/picker';
import * as SQLite from 'expo-sqlite';
import { useNavigation, useRoute } from '@react-navigation/native';
import db from './BancoLembraAi';

const Agendar = () => {
    const [dados, setDados] = useState({
        Nome: '',
        CNPJ: '',
        Servicos: '',
        Logotipo: '',
    });
    const [ramo, setRamo] = useState('');
    const [selectedService, setSelectedService] = useState('');
    const [nomeCliente, setNomeCliente] = useState('');
    const [telefoneCliente, setTelefoneCliente] = useState('');
    const [data, setData] = useState('');
    const [horario, setHorario] = useState('');
    const navigation = useNavigation();
    const [serviceOptionss, setServiceOptionss] = useState([]);
    const [agendamentos, setAgendamentos] = useState([]);
    const [status, setStatus] = useState("Aguardando")

    const route = useRoute();
    const { appointment } = route.params;

    useEffect(() => {
        if (appointment) {
            setNomeCliente(appointment.Nome);
            setTelefoneCliente(appointment.Telefone);
            setData(appointment.Data);
            setHorario(appointment.Horario);
        }
    }, [appointment]);

    const handleAgendar = () => {
        if (!nomeCliente || !telefoneCliente || !data || !horario || !selectedService) {
            console.log('Por favor, preencha todos os campos.');
            return;
        }

        // Verifica se já existe um agendamento para a mesma data e horário
        const checkExistingSql = `
            SELECT COUNT(*) as count
            FROM Agendamento
            WHERE Data = ? AND Horario = ?
        `;

        const checkExistingParams = [data, horario];

        db.transaction((tx) => {
            tx.executeSql(
                checkExistingSql,
                checkExistingParams,
                (_, result) => {
                    const count = result.rows.item(0).count;

                    if (count > 0) {
                        console.log('Já existe um agendamento para esta data e horário.');
                        Alert.alert('Aviso', 'Já existe um agendamento para esta data e horário.');
                    } else {
                        // Se não houver agendamento, procede com a inserção
                        const insertSql = `
                            INSERT INTO Agendamento (Nome, Telefone, Data, Horario, Servicos, Status)
                            VALUES (?, ?, ?, ?, ?, ?)
                        `;

                        const insertParams = [nomeCliente, telefoneCliente, data, horario, selectedService, status];

                        tx.executeSql(
                            insertSql,
                            insertParams,
                            (_, result) => {
                                console.log('Dado cadastrado com sucesso!', result);
                            },
                            (_, error) => {
                                console.error('Erro ao cadastrar os dados!', error);
                            }
                        );

                        navigation.navigate('MainMenu');
                    }
                },
                (_, error) => {
                    console.error('Erro ao verificar agendamento existente!', error);
                }
            );
        });
    };

    const handleLimpar = () => {
        setNomeCliente('');
        setTelefoneCliente('');
        setData('');
        setHorario('');
        setSelectedService('Selecione um serviço')
    }

    const handleVoltar = () => {
        navigation.navigate('MainMenu')
    }

    useEffect(() => {
        async function buscarDados() {
            db.transaction(
                (tx) => {
                    tx.executeSql(
                        'SELECT * FROM Servico',
                        [],
                        (_, resultado) => {
                            // Processar os resultados aqui
                            console.log('Dados recuperados com sucesso:', resultado);

                            let options = [];
                            if (resultado.rows.length > 0) {
                                for (let i = 0; i < resultado.rows.length; i++) {
                                    const registro = resultado.rows.item(i);
                                    options.push(registro["Nome"]);
                                }
                            }

                            setServiceOptionss(options); // Atualize o estado com os dados do serviço
                            console.log(serviceOptionss)
                        },
                        (_, erro) => {
                            console.error('Erro ao recuperar dados:', erro);
                        }
                    );
                },
                (erro) => {
                    console.error('Erro na transacao', erro);
                }
            );
        }

        buscarDados();
    }, []);

    return (
        <>
            <NavBar />
            <ScrollView>
                <View style={styles.container}>
                    <Text style={styles.label}>Nome:</Text>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Nome do cliente"
                            value={nomeCliente}
                            onChangeText={(text) => setNomeCliente(text)} />
                    </View>

                    <Text style={styles.label}>Telefone:</Text>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Telefone do cliente"
                            value={telefoneCliente}
                            onChangeText={(text) => setTelefoneCliente(text)} />
                    </View>

                    <Text style={styles.label}>Data:</Text>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Data do agendamento"
                            value={data}
                            onChangeText={(text) => setData(text)} />
                    </View>

                    <Text style={styles.label}>Horário:</Text>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Horário do agendamento"
                            value={horario}
                            onChangeText={(text) => setHorario(text)} />
                    </View>

                    <Text style={styles.label}>Serviços:</Text>
                    <View style={styles.pickerContainer}>
                        <Picker
                            style={styles.Picker}
                            selectedValue={selectedService}
                            onValueChange={(itemValue) => setSelectedService(itemValue)}
                        >
                            <Picker.Item label="Selecione um serviço" value="" />
                            {serviceOptionss.map((service, index) => (
                                <Picker.Item key={index} label={service} value={service} />
                            ))}
                        </Picker>
                    </View>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={styles.button}>
                            <Text onPress={handleAgendar} style={styles.buttonText}>Agendar</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.buttonGray}>
                            <Text onPress={handleLimpar} style={styles.buttonText}>Limpar</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.buttonRed}>
                            <Text onPress={handleVoltar} style={styles.buttonText}>Voltar</Text>
                        </TouchableOpacity>
                    </View>

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
    logo: {
        width: 250,
        height: 250,
        marginBottom: 20,
        alignSelf: 'center'
    },
    textCadastrado: {
        marginTop: 50,
        marginLeft: 47
    },
    textCadastradoRed: {
        color: 'red'
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
    pickerContainer: {
        borderColor: '#ccc',
        borderWidth: 2,
        borderRadius: 8,
        fontSize: 16,
        height: 55,
        justifyContent: 'center',
        width: 250,
        alignSelf: 'center',
    },
    picker: {
        height: 40,
    },
    editText: {
        color: 'blue',
        fontSize: 16,
        marginRight: 5
    },
    removeText: {
        color: 'red',
        fontSize: 16,
    },
    label: {
        fontSize: 18,
        marginBottom: 5,
        fontWeight: 'bold',
        textAlign: 'left',
        marginLeft: 76
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
    buttonRed: {
        backgroundColor: 'red',
        paddingVertical: 10,
        borderRadius: 10,
        marginBottom: 10,
        marginTop: 50,
        width: '30%',
        alignSelf: 'center',
    },
    buttonGray: {
        backgroundColor: 'gray',
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

});

export default Agendar