import React, { useEffect, useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import * as Style from '../assets/styles';
import { Picker } from '@react-native-picker/picker';
import * as SQLite from 'expo-sqlite';
import { useNavigation, useRoute } from '@react-navigation/native';

const db = SQLite.openDatabase('BancoLembraAi.db');

const Agendar = () => {
    const relatedServiceSalaoOptions = [
        'Corte de cabelo',
        'Manicure e pedicure',
        'Maquiagem',
        'Tratamentos para cabelos',
        'Depilação'
    ];

    const relatedServiceOficinaOptions = [
        'Troca de óleo',
        'Troca de pneus',
        'Revisão',
        'Consertos',
        'Instalação de acessórios',
    ];

    const relatedServiceBarbeiroOptions = [
        'Corte de cabelo',
        'Barba',
        'Bigode',
        'Depilação facial',
        'Hidratação capilar',
    ];

    const [agendamentoData, setAgendamentoData] = useState({
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
    const [serviceOptions, setServiceOptions] = useState([]);
    const [agendamentos, setAgendamentos] = useState([]);
    const [status, setStatus] = useState('Aguardando');
    const [telefoneClienteError, setTelefoneClienteError] = useState('');
    const [dataError, setDataError] = useState('');
    const [horarioError, setHorarioError] = useState('');
    const [campoError, setCampoError] = useState('');
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
            Alert.alert('Erro', 'Por favor, preencha todos os campos.');
            return;
        }
        const handleAgendar = () => {
            if (!nomeCliente || !telefoneCliente || !data || !horario || !selectedService) {
                console.log('Por favor, preencha todos os campos.');
                return;
            }

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
                            const insertSql = `
                  INSERT INTO Agendamento (Nome, Telefone, Data, Horario, Servicos, Status)
                  VALUES (?, ?, ?, ?, ?, ?)
                `;

                            const insertParams = [
                                nomeCliente,
                                telefoneCliente,
                                data,
                                horario,
                                selectedService,
                                status,
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
                        }
                    },
                    (_, error) => {
                        console.error('Erro ao verificar agendamento existente!', error);
                    }
                );
            });
        };
    };

    const handleNomeClienteChange = (text) => {
        if (!text) {
            Alert.alert('Erro', 'Por favor, preencha o nome do cliente.');
        } else {
            setNomeCliente(text);
        }
    };

    const handleLimpar = () => {
        setNomeCliente('');
        setTelefoneCliente('');
        setData('');
        setHorario('');
        setSelectedService('Selecione um serviço');
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
                            console.log('Dados recuperados com sucesso:', resultado);

                            let options = [];
                            if (resultado.rows.length > 0) {
                                for (let i = 0; i < resultado.rows.length; i++) {
                                    const registro = resultado.rows.item(i);
                                    options.push(registro['Nome']);
                                }
                            }

                            setServiceOptions(options); // Correção do nome da variável aqui
                            console.log(serviceOptions);
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


    const handleTelefoneChange = (text) => {
        const formattedText = text.replace(/\D/g, ''); // Remove todos os caracteres não numéricos

        // Verifica se o tamanho do número de telefone está incorreto
        if (formattedText.length < 11 || formattedText.length > 1) {
            setTelefoneClienteError('Formato inválido de telefone');
        } else {
            setTelefoneClienteError('');
        }

        setTelefoneCliente(formattedText);
    };

    const formatarTelefone = (input) => {
        let output = input.replace(/\D/g, ''); // Remove todos os caracteres não numéricos
    
        // Verifica se o número excede o limite máximo de caracteres para cada formato
        if (output.length > 14) {
            output = output.slice(0, 14); // Limita o número de caracteres
        }
    
        // Adiciona formatação ao número de telefone
        if (output.length >= 2 && output.length <= 5) {
            output = `(${output.slice(0, 2)}) ${output.slice(2)}`;
        } else if (output.length >= 6 && output.length <= 10) {
            output = `(${output.slice(0, 2)}) ${output.slice(2, 6)}-${output.slice(6)}`;
        } else if (output.length >= 11 && output.length <= 14) {
            output = `+${output.slice(0, 2)} (${output.slice(2, 3)}) ${output.slice(3, 7)}-${output.slice(7)}`;
        }
    
        return output;
    };
    
    const handleDataChange = (text) => {
        let formattedDate = text.replace(/\D/g, ''); // Remove caracteres não numéricos

        // Limita a entrada a um máximo de 10 caracteres (DD/MM/AAAA)
        if (formattedDate.length > 8) {
            formattedDate = formattedDate.slice(0, 8);
        }

        // Adiciona a barra automaticamente ao digitar a data (DD/MM/AAAA)
        if (formattedDate.length > 2) {
            formattedDate = `${formattedDate.slice(0, 2)}/${formattedDate.slice(2)}`;
        }
        if (formattedDate.length > 5) {
            formattedDate = `${formattedDate.slice(0, 5)}/${formattedDate.slice(5)}`;
        }

        // Verifica se a data é válida e atualiza o estado 'dataError' conforme necessário
        const { valor, valido } = formatarData(formattedDate);
        if (!valido) {
            setDataError('Data inválida');
        } else {
            setDataError('');
        }

        // Atualiza o estado 'data' com a data formatada (corrigida ou não)
        setData(valido ? formattedDate : valor);
    };
    const handleHorarioChange = (text) => {
        let formattedTime = text.replace(/\D/g, ''); // Remove caracteres não numéricos
    
        // Adiciona os dois pontos automaticamente ao digitar o horário (HH:MM)
        if (formattedTime.length > 2) {
            formattedTime = `${formattedTime.slice(0, 2)}:${formattedTime.slice(2)}`;
        }
    
        // Remove o último caractere sobressalente se o formato exceder "HH:MM"
        if (formattedTime.length > 5) {
            formattedTime = formattedTime.slice(0, 5);
        }

        // Verifica se o formato tem menos de 5 caracteres (menor que HH:MM)
        if (formattedTime.length < 5) {
            setHorarioError('Horário inválido');
        } else {
            setHorarioError('');
        }
    
        // Verifica se o formato final do horário está incorreto
        const { valor, valido } = formatarHora(formattedTime);
    
        // Atualiza o estado 'horario' com o horário formatado (corrigido ou não)
        setHorario(valido ? formattedTime : valor);
    };
    




    const formatarHora = (input) => {
        let output = input.replace(/\D/g, ''); // Remove qualquer caractere não numérico
        output = output.replace(/^(\d{2})(\d)/g, '$1:$2'); // Adiciona os dois pontos após os primeiros dois dígitos

        // Verifica se a hora é válida
        const [hora, minuto] = output.split(':').map(Number);
        if (hora < 0 || hora > 23 || minuto < 0 || minuto > 59) {
            return { valor: '', valido: false }; // Retorna uma string vazia se a hora não for válida
        }

        return { valor: output.slice(0, 5), valido: true }; // Limita o tamanho da hora para 'hh:mm'
    };


    const formatarData = (input) => {
        let output = input.replace(/\D/g, ''); // Remove qualquer caractere não numérico
        output = output.replace(/^(\d{2})(\d)/g, '$1/$2'); // Adiciona a barra após os primeiros dois dígitos
        output = output.replace(/(\d{2})(\d)/, '$1/$2'); // Adiciona a barra após os próximos dois dígitos

        // Verifica se a entrada tem o tamanho de uma data (DD/MM/AAAA) completa
        if (output.length === 10) {
            const [dia, mes, ano] = output.split('/').map(Number);
            const data = new Date(ano, mes - 1, dia); // -1 no mês porque no JS os meses começam do zero (janeiro é 0)

            if (dia !== data.getDate() || mes - 1 !== data.getMonth() || ano !== data.getFullYear()) {
                return { valor: '', valido: false }; // Retorna a data vazia e inválida se não for uma data correta
            }

            return { valor: output, valido: true }; // Retorna a data formatada apenas se for válida
        }

        return { valor: output, valido: false }; // Retorna a entrada atualizada para permitir edição
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
                        onChangeText={handleNomeClienteChange} />
                </View>

                <Text style={styles.label}>Telefone:</Text>
                <View style={styles.inputContainer}>
                    <TextInput
                        style={[
                            styles.input,
                            telefoneClienteError && { borderColor: 'red' } // Altera a borda se houver um erro
                        ]}
                        placeholder="Telefone do cliente"
                        value={formatarTelefone(telefoneCliente)}
                        onChangeText={handleTelefoneChange}
                    />
                </View>
                {telefoneClienteError ? (
                    <Text style={{ color: 'red', marginLeft: 76 }}>{telefoneClienteError}</Text>
                ) : null}



                <Text style={styles.label}>Data:</Text>
                <View style={[
                    styles.inputContainer,
                    dataError && { borderColor: 'red' }
                ]}>
                    <TextInput
                        style={[
                            styles.input,
                            dataError && { color: 'red' }
                        ]}
                        placeholder="DD/MM/AAAA"
                        value={formatarData(data).valor}
                        onChangeText={handleDataChange}
                    />
                </View>
                {dataError ? (
                    <Text style={{ color: 'red', marginLeft: 76 }}>{dataError}</Text>
                ) : null}



                <Text style={styles.label}>Horário:</Text>
                <View style={[
                    styles.inputContainer,
                    horarioError && { borderColor: 'red' }
                ]}>
                    <TextInput
                        editable={true}
                        style={[
                            styles.input,
                            horarioError && { color: 'red' }
                        ]}
                        placeholder="Horário do agendamento"
                        value={formatarHora(horario).valor}
                        onChangeText={handleHorarioChange}
                    />
                </View>
                {horarioError ? (
                    <Text style={{ color: 'red', marginLeft: 76 }}>{horarioError}</Text>
                ) : null}



                <Text style={styles.label}>Serviços:</Text>
                <View style={styles.pickerContainer}>
                    <Picker
                        style={styles.picker}
                        selectedValue={selectedService}
                        onValueChange={(itemValue) => setSelectedService(itemValue)}
                    >
                        <Picker.Item label="Selecione um serviço" value="" />
                        {serviceOptions.map((service, index) => (
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
export default Agendar;