import React, { useEffect, useState } from 'react'
import { ScrollView, StyleSheet, Text, TextInput, ToastAndroid, TouchableOpacity, View } from 'react-native'
import * as Style from '../assets/styles';
import NavBar from './NavBar';
import { Picker } from '@react-native-picker/picker';
import * as SQLite from 'expo-sqlite';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Clipboard } from 'react-native';
import db from './BancoLembraAi';

const EditarAgendamento = () => {
    const route = useRoute();
    const { appointmentData, name } = route.params;
    console.log("tentando achar nome estabelecimento:" + name)
    const [ramo, setRamo] = useState('');
    const [idAgendamento, setIdAgendamento] = useState(appointmentData?.ID);
    const [nomeCliente, setNomeCliente] = useState(appointmentData?.Nome || '');
    const [telefoneCliente, setTelefoneCliente] = useState(appointmentData?.Telefone || '');
    const [data, setData] = useState(appointmentData?.Data || '');
    const [horario, setHorario] = useState(appointmentData?.Horario || '');
    const [selectedService, setSelectedService] = useState(appointmentData?.Servicos || '');
    const [selectedStatus, setSelectedStatus] = useState(appointmentData?.Status || '');
    const [dadosCopiados, setDadosCopiados] = useState('');
    const navigation = useNavigation();
    const [serviceOptionss, setServiceOptionss] = useState([]);
    const [statusOptionss, setStatusOptionss] = useState([]);
    const [agendamentos, setAgendamentos] = useState([]);
    const statusOptions = ['Aguardando', 'Atrasado', 'Atendido', 'Cancelado'];
    console.log(appointmentData);

    const handleAgendar = () => {
        if (!nomeCliente || !telefoneCliente || !data || !horario || !selectedService || !selectedStatus) {
            console.log('Por favor, preencha todos os campos.');
            console.log("Dados att:" + nomeCliente, telefoneCliente, data, horario, selectedService, selectedStatus)
            return;
        }

        const sql = `
            UPDATE Agendamento
            SET Nome = ?, Telefone = ?, Data = ?, Horario = ?, Servicos = ?, Status = ?
            WHERE ID = ?
        `;

        const params = [nomeCliente, telefoneCliente, data, horario, selectedService, selectedStatus, appointmentData.ID];

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

    const handleVoltar = () => {
        navigation.navigate('MainMenu')
    }

    const handleCopiar = async () => {
        try {
            const dadosString =
                "Olá " + nomeCliente + ", tudo bem com você?" +
                "\nNão se esqueça que você tem um agendamento na " + name + " na seguinte data: \nData: " + data + "\nHorário: " + horario + "\n\nObrigado pela preferência!";

            Clipboard.setString(dadosString);
            console.log('Dados copiados:', dadosString);
            ToastAndroid.show('Dados copiados para a área de transferência!', ToastAndroid.SHORT);
        } catch (error) {
            console.error('Erro ao definir a área de transferência:', error);
            ToastAndroid.show('Erro ao copiar dados!', ToastAndroid.SHORT);
        }
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

                    <TouchableOpacity style={styles.buttonGray} onPress={handleCopiar}>
                        <Text style={styles.buttonText}>Copiar dados</Text>
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

export default EditarAgendamento