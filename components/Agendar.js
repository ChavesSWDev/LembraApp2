import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import * as Style from '../assets/styles';
import NavBar from './NavBar';
import { CheckBox } from 'react-native-elements'; // Certifique-se de ter instalado o pacote react-native-elements
import * as SQLite from 'expo-sqlite';
import { useNavigation, useRoute } from '@react-navigation/native';
import db from './BancoLembraAi';
import Icon from "react-native-vector-icons/FontAwesome"
import Colaboradores from './Colaboradores';

const Agendar = () => {
    const [dados, setDados] = useState({
        Nome: '',
        CNPJ: '',
        Servicos: '',
        Logotipo: '',
    });
    const [ramo, setRamo] = useState('');
    const [selectedServices, setSelectedServices] = useState([]);
    const [selectedColaborador, setSelectedColaborador] = useState([]);
    const [nomeCliente, setNomeCliente] = useState('');
    const [telefoneCliente, setTelefoneCliente] = useState('');
    const [data, setData] = useState('');
    const [horario, setHorario] = useState('');
    const navigation = useNavigation();
    const [serviceOptions, setServiceOptions] = useState([]);
    const [agendamentos, setAgendamentos] = useState([]);
    const [status, setStatus] = useState('');
    const [colaborador, setColaborador] = useState([])
    const [cardAberto, setCardAberto] = useState(false);
    const [cardColaboradorAberto, setCardColaboradorAberto] = useState(false);

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

    const handleServiceToggle = (service) => {
        // Toggle the selection state of the service
        const isSelected = selectedServices.includes(service);
        if (isSelected) {
            setSelectedServices(selectedServices.filter((selected) => selected !== service));
        } else {
            setSelectedServices([...selectedServices, service]);
        }
    };

    const handleColaboradorToggle = (colaborator) => {
        const isSelected = selectedColaborador.includes(colaborator);

        // If the current service is already selected, do nothing
        if (isSelected) {
            return;
        }
        // Deselect all previously selected collaborators
        const updatedSelectedColaborador = selectedColaborador.filter(
            (selected) => !colaborador.includes(selected)
        );
        // Select the current service
        setSelectedColaborador([...updatedSelectedColaborador, colaborator]);
        console.log(selectedColaborador);
    };

    const handleCardServicos = () => {
        if (cardAberto === true) {
            setCardAberto(false);
        } else {
            setCardAberto(true);
        }
    }

    const handleCardColaboradores = () => {
        if (cardColaboradorAberto === true) {
            setCardColaboradorAberto(false);
        } else {
            setCardColaboradorAberto(true);
        }
    }

    const setAppointmentStatus = (newStatus, callback) => {
        setStatus(newStatus);
        callback();
    };

    // ...

    const handleAgendar = () => {
        if (!nomeCliente || !telefoneCliente || !data || !horario || selectedServices.length === 0) {
            console.log('Por favor, preencha todos os campos.');
            Alert.alert('Por favor, preencha todos os campos.');
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

                        // Converte a data e horário do agendamento para o formato esperado
                        const [day, month, year] = data.split('/');
                        const [hours, minutes] = horario.split(':');
                        const agendamentoDate = new Date(`${year}-${month}-${day}T${hours}:${minutes}`);

                        // Obtém a data e hora atual
                        const currentDate = new Date();
                        const formattedCurrentDate = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${currentDate.getDate().toString().padStart(2, '0')}T${currentDate.getHours().toString().padStart(2, '0')}:${currentDate.getMinutes().toString().padStart(2, '0')}`;

                        // Lógica para determinar o status com base na comparação da data e horário
                        let newStatus;
                        if (agendamentoDate > new Date(formattedCurrentDate)) {
                            newStatus = "Aguardando";
                        } else {
                            newStatus = "Atrasado";
                        }

                        // Se necessário, você pode adicionar mais lógica para outros casos

                        // Atualiza o status e executa a inserção no banco de dados
                        setAppointmentStatus(newStatus, () => {
                            const insertSql = `
                                INSERT INTO Agendamento (Nome, Telefone, Data, Horario, Servicos, Status, ColaboradorNome)
                                VALUES (?, ?, ?, ?, ?, ?, ?)
                            `;

                            const insertParams = [
                                nomeCliente,
                                telefoneCliente,
                                data,
                                horario,
                                selectedServices.join(', '), // serviços selecionados
                                newStatus,
                                JSON.stringify(selectedColaborador) // convertendo a array para string JSON
                            ];

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
                        });
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
        setSelectedServices([]);
        setSelectedColaborador([])
    };

    const handleVoltar = () => {
        navigation.navigate('MainMenu');
    };

    useEffect(() => {
        async function buscarDados() {
            db.transaction(
                (tx) => {
                    tx.executeSql(
                        'SELECT * FROM Servico',
                        [],
                        (_, resultado) => {
                            let options = [];
                            if (resultado.rows.length > 0) {
                                for (let i = 0; i < resultado.rows.length; i++) {
                                    const registro = resultado.rows.item(i);
                                    options.push(registro["Nome"]);
                                }
                            }

                            setServiceOptions(options);
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

    useEffect(() => {
        async function buscarDados2() {
            db.transaction(
                (tx) => {
                    tx.executeSql(
                        'SELECT * FROM Colaboradores',
                        [],
                        (_, resultado) => {
                            let options = [];
                            if (resultado.rows.length > 0) {
                                for (let i = 0; i < resultado.rows.length; i++) {
                                    const registro = resultado.rows.item(i);
                                    options.push(registro["Nome"]);
                                }
                            }

                            setColaborador(options);
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

        buscarDados2();
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

                    <TouchableOpacity style={styles.button} onPress={() => handleCardServicos()}>
                        <Text style={styles.buttonText}>Serviços</Text>
                    </TouchableOpacity>
                    {cardAberto && (
                        <View style={styles.card}>
                            <Text style={styles.cardHeader}>Selecionar serviços</Text>

                            {/* Renderizar opções de serviços */}
                            <View style={styles.containerCheck}>
                                {serviceOptions.map((service, index) => (
                                    <View key={index} style={styles.checkboxContainer}>
                                        <CheckBox
                                            title={service}
                                            checked={selectedServices.includes(service)}
                                            onPress={() => handleServiceToggle(service)}
                                            containerStyle={styles.checkbox} // Apply the checkbox styles
                                        />
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}

                    <TouchableOpacity style={styles.button} onPress={() => handleCardColaboradores()}>
                        <Text style={styles.buttonText}>Colaborador</Text>
                    </TouchableOpacity>
                    {cardColaboradorAberto && (
                        <View style={styles.card}>
                            <Text style={styles.cardHeader}>Selecionar colaborador</Text>

                            {/* Renderizar opções de serviços */}
                            <View style={styles.containerCheck}>
                                {colaborador.map((colaborator, index) => (
                                    <View key={index} style={styles.checkboxContainer}>
                                        <CheckBox
                                            title={colaborator}
                                            checked={selectedColaborador.includes(colaborator)}
                                            onPress={() => handleColaboradorToggle(colaborator)}
                                            containerStyle={styles.checkbox} // Apply the checkbox styles
                                        />
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}

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
    );
};

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
    cardHeader: {
        color: Style.color,
        fontWeight: 'bold',
        alignSelf: 'center'
    },
    inputContainer: {
        flexDirection: 'row',
        alignSelf: 'center',
        marginBottom: 15,
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 5,
    },
    checkbox: {
        marginLeft: 15,
        width: '90%'
    },
    containerCheck: {
        backgroundColor: '#ccc',
        paddingVertical: 10,
        borderRadius: 10,
        marginBottom: 10,
        width: '80%',
        alignSelf: 'center',
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