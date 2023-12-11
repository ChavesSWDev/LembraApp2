import React, { useEffect, useState } from 'react'
import { ScrollView, StyleSheet, Text, TextInput, ToastAndroid, TouchableOpacity, View } from 'react-native'
import * as Style from '../assets/styles';
import NavBar from './NavBar';
import { Picker } from '@react-native-picker/picker';
import * as SQLite from 'expo-sqlite';
import { useNavigation, useRoute } from '@react-navigation/native';
import db from './BancoLembraAi';
import { CheckBox } from 'react-native-elements';

const EditarAgendamento = () => {
    const route = useRoute();
    const { appointmentData, name } = route.params;
    const [nomeCliente, setNomeCliente] = useState(appointmentData?.Nome ?? '');
    const [telefoneCliente, setTelefoneCliente] = useState(appointmentData?.Telefone ?? '');
    const [data, setData] = useState(appointmentData?.Data ?? '');
    const [horario, setHorario] = useState(appointmentData?.Horario ?? '');
    const [selectedStatus, setSelectedStatus] = useState(appointmentData?.Status ?? '');
    const [selectedServices, setSelectedServices] = useState([]);
    const [cardAberto, setCardAberto] = useState(false)
    const [cardColaboradorAberto, setCardColaboradorAberto] = useState(false);
    const navigation = useNavigation();
    const [selectedColaborador, setSelectedColaborador] = useState([]);
    const [colaborador, setColaborador] = useState([]);

    const [serviceOptions, setServiceOptions] = useState([]);
    const [selectedServicesInAppointment, setSelectedServicesInAppointment] = useState(appointmentData?.ColaboradorNome || []);
    const [selectedColaboradorInAppointment, setSelectedColaboradorInAppointment] = useState(appointmentData?.ColaboradorNome || []);


    const statusOptions = ['Aguardando', 'Atrasado', 'Atendido', 'Cancelado'];

    const handleAgendar = () => {
        if (!nomeCliente || !telefoneCliente || !data || !horario || !selectedServicesInAppointment || !selectedStatus) {
            console.log('Por favor, preencha todos os campos.');
            console.log("Dados att:" + nomeCliente, telefoneCliente, data, horario, selectedServices, selectedStatus);
            return;
        }

        const sql = `
            UPDATE Agendamento
            SET Nome = ?, Telefone = ?, Data = ?, Horario = ?, Servicos = ?, Status = ?, ColaboradorNome = ?
            WHERE ID = ?
        `;

        const servicosString = Array.isArray(selectedServicesInAppointment)
            ? selectedServicesInAppointment.join(', ')
            : '';

        const colaboradoresString = Array.isArray(selectedColaboradorInAppointment)
            ? JSON.stringify(selectedColaboradorInAppointment)
            : selectedColaboradorInAppointment;

        const params = [nomeCliente, telefoneCliente, data, horario, servicosString, selectedStatus, colaboradoresString, appointmentData.ID];

        db.transaction((tx) => {
            tx.executeSql(
                sql,
                params,
                (_, result) => {
                    console.log('Dado atualizado com sucesso!', result);
                },
                (_, error) => {
                    console.error('Erro ao atualizar os dados!', error);
                }
            );
        });

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
                            // Processar os resultados aqui
                            // console.log('Dados recuperados com sucesso:', resultado);

                            let options = [];
                            if (resultado.rows.length > 0) {
                                for (let i = 0; i < resultado.rows.length; i++) {
                                    const registro = resultado.rows.item(i);
                                    options.push(registro["Nome"]);
                                }
                            }

                            setServiceOptions(options); // Atualize o estado com os dados do serviço
                            console.log(serviceOptions)
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
        async function buscarDados() {
            db.transaction(
                (tx) => {
                    tx.executeSql(
                        'SELECT * FROM Colaboradores',  // Replace with your actual table name for collaborators
                        [],
                        (_, resultadoColaborador) => {
                            let colaboradorOptions = [];
                            if (resultadoColaborador.rows.length > 0) {
                                for (let i = 0; i < resultadoColaborador.rows.length; i++) {
                                    const registroColaborador = resultadoColaborador.rows.item(i);
                                    colaboradorOptions.push(registroColaborador["Nome"]);
                                }
                            }
                            setColaborador(colaboradorOptions);
                        },
                        (_, erro) => {
                            console.error('Erro ao recuperar dados de colaboradores:', erro);
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
        // Set selected services in appointment
        setSelectedServicesInAppointment((appointmentData.Servicos || '').split(', '));
    }, [appointmentData.Servicos]);

    useEffect(() => {
        setSelectedColaboradorInAppointment((appointmentData.ColaboradorNome) || []);
    }, [appointmentData.ColaboradorNome]);

    const handleVoltar = () => {
        navigation.navigate('MainMenu')
    }

    const handleServiceToggle = (service) => {
        const isSelected = selectedServicesInAppointment.includes(service);

        // Toggle the selection state of the service
        if (isSelected) {
            setSelectedServicesInAppointment((prevSelectedServices) =>
                prevSelectedServices.filter((selected) => selected !== service)
            );
        } else {
            setSelectedServicesInAppointment((prevSelectedServices) => [
                ...prevSelectedServices,
                service,
            ]);
        }
    };


    const handleColaboradorToggle = (colaborator) => {
        const isSelected = selectedColaborador.includes(colaborator);

        // If the current collaborator is already selected, do nothing
        if (isSelected) {
            return;
        }

        // Deselect all previously selected collaborators
        const updatedSelectedColaborador = selectedColaborador.filter(
            (selected) => !colaborator.includes(selected)
        );

        // Select the current collaborator
        const newSelectedColaborador = [...updatedSelectedColaborador, colaborator];
        setSelectedColaborador(newSelectedColaborador);

        // Save as a JSON string or as an array, depending on your data model
        // If you need to store it as a JSON string:
        setSelectedColaboradorInAppointment(JSON.stringify(newSelectedColaborador));
        // If you need to store it as an array:
        // setSelectedColaboradorInAppointment(newSelectedColaborador);
        console.log(newSelectedColaborador);
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

    const calcularNovoStatus = (novaData, novoHorario) => {
        const [day, month, year] = novaData.split('/');
        const [hours, minutes] = novoHorario.split(':');
        const agendamentoDate = new Date(`${year}-${month}-${day}T${hours}:${minutes}`);
    
        const currentDate = new Date();
    
        // Compare only the time part of the dates
        const agendamentoTime = agendamentoDate.getHours() * 60 + agendamentoDate.getMinutes();
        const currentTime = currentDate.getHours() * 60 + currentDate.getMinutes();
    
        let novoStatus;
    
        if (agendamentoDate > currentDate) {
            novoStatus = "Aguardando";
        } else if (currentTime - agendamentoTime <= 5) {
            // Assuming a 5-minute grace period after the scheduled time
            novoStatus = "Atrasado";
        } else {
            novoStatus = "Atrasado";
        }
    
        return novoStatus;
    };

    const handleDataChange = (novaData) => {
        setData(novaData);

        // Se quiser atualizar automaticamente o status ao mudar a data
        const novoStatus = calcularNovoStatus(novaData, horario);
        setSelectedStatus(novoStatus);
    };

    const handleHorarioChange = (novoHorario) => {
        setHorario(novoHorario);

        // Se quiser atualizar automaticamente o status ao mudar o horário
        const novoStatus = calcularNovoStatus(data, novoHorario);
        setSelectedStatus(novoStatus);
    };


    return (
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
                        onChangeText={(text) => {
                            setData(text);
                            // Mova a chamada da função para depois da atualização do estado
                            handleDataChange(text);
                        }}
                    />
                </View>

                <Text style={styles.label}>Horário:</Text>
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Horário do agendamento"
                        value={horario}
                        onChangeText={(text) => {
                            setHorario(text);
                            // Mova a chamada da função para depois da atualização do estado
                            handleHorarioChange(text);
                        }}
                    />
                </View>

                <TouchableOpacity style={styles.button} onPress={() => handleCardServicos()}>
                    <Text style={styles.buttonText}>Serviços</Text>
                </TouchableOpacity>
                {cardAberto && (
                    <View style={styles.card}>
                        <Text style={styles.cardHeader}>Selecionar serviços</Text>
                        {/* Render service options with checkboxes */}
                        <View style={styles.containerCheck}>
                            {serviceOptions.map((service, index) => (
                                <View key={index} style={styles.checkboxContainer}>
                                    <CheckBox
                                        title={service}
                                        checked={selectedServicesInAppointment.includes(service)}
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
                                        checked={selectedColaboradorInAppointment.includes(colaborator)}
                                        onPress={() => handleColaboradorToggle(colaborator)}
                                        containerStyle={styles.checkbox} // Apply the checkbox styles
                                    />
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                <Text style={styles.label}>Status:</Text>
                <View style={styles.pickerContainer}>
                    <Picker
                        style={styles.Picker}
                        selectedValue={selectedStatus}
                        onValueChange={(itemValue) => setSelectedStatus(itemValue)}
                    >
                        {statusOptions.map((status, index) => (
                            <Picker.Item key={index} label={status} value={status} />
                        ))}
                    </Picker>
                </View>

                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.button}>
                        <Text onPress={handleAgendar} style={styles.buttonText}>Atualizar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.buttonRed}>
                        <Text onPress={handleVoltar} style={styles.buttonText}>Voltar</Text>
                    </TouchableOpacity>
                </View>

            </View>
        </ScrollView>
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

export default EditarAgendamento