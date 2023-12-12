import React, { useEffect, useState } from 'react';
import { View, Platform, Text, TextInput, Image, StyleSheet, TouchableOpacity, ScrollView, ToastAndroid } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import db from './BancoLembraAi';
import * as SQLite from 'expo-sqlite';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import * as Style from '../assets/styles';
import { selectLogo } from '../utils/pega-imagem';
import { format, parseISO } from 'date-fns';
import Icon from "react-native-vector-icons/FontAwesome"
import { Picker } from '@react-native-picker/picker';
import NavBar from './NavBar';
import Toast from 'react-native-root-toast';
import Colaboradores from './Colaboradores';
import { Alert } from 'react-native';
import { DateTimePickerModal } from 'react-native-modal-datetime-picker';


async function getEstabelecimentoLogo(id) {
    const sql = 'SELECT Logotipo FROM Estabelecimento WHERE ID = ?';
    const params = [id];

    const [results] = await db.transactionAsync((tx) => {
        tx.executeSql(sql, params);
    });

    const logotipoBase64 = await db.transactionAsync(async (tx) => {
        const [results] = await tx.executeSql(
            'SELECT Logotipo FROM Estabelecimento WHERE ID = ?',
            [idEstabelecimento]
        );

        return results.rows.item(0).Logotipo;
    });
}


const MainMenu = () => {
    const [dados, setDados] = useState({
        Nome: '',
        CNPJ: '',
        Servicos: '',
        Logotipo: '',
    });
    const [isNameEditing, setNameEditing] = useState(false);
    const [name, setName] = useState(dados.Nome);
    const [isCnpjEditing, setCnpjEditing] = useState(false);
    const [cnpj, setCnpj] = useState(dados.CNPJ);
    const [isRamoEditing, setRamoEditing] = useState(false);
    const [ramo, setRamo] = useState(dados.Servicos);
    const [originalName, setOriginalName] = useState(name);
    const [originalCnpj, setOriginalCnpj] = useState(cnpj);
    const [originalRamo, setOriginalRamo] = useState(ramo);
    const [agendamentos, setAgendamentos] = useState([]);
    const [logoTipoPath, setLogoTipoPath] = useState('')
    const ele = '';

    const today = new Date();
    const todayString = format(today, 'dd/MM/yyyy');

    const handleEditName = () => {
        setNameEditing(true);
        setOriginalName(name); // Armazena o valor original
    };

    const handleEditCnpj = () => {
        setCnpjEditing(true);
        setOriginalCnpj(cnpj); // Armazena o valor original
    };

    const handleEditRamo = () => {
        setRamoEditing(true);
        setOriginalRamo(ramo); // Armazena o valor original
    };

    const handleCancelName = () => {
        setNameEditing(false);
        setName(originalName); // Restaura o valor original
    };

    const handleCancelCnpj = () => {
        setCnpjEditing(false);
        setCnpj(originalCnpj); // Restaura o valor original
    };

    const handleCancelRamo = () => {
        setRamoEditing(false);
        setRamo(originalRamo); // Restaura o valor original
    };

    const navigation = useNavigation();
    function handleIr() {
        navigation.navigate('CadastroInicial');
    }

    useEffect(() => {
        const buscarDados = async () => {
            await db.transaction((tx) => {
                tx.executeSql(
                    'SELECT * FROM Estabelecimento',
                    [],
                    (_, resultado) => {
                        if (resultado.rows.length > 0) {
                            for (let i = 0; i < resultado.rows.length; i++) {
                                const registro = resultado.rows.item(i);
                                setName(registro["Nome"]);
                                setCnpj(registro["CNPJ"]);
                                setRamo(registro["Ramo"]);
                                setLogoTipoPath(registro["Logotipo"]); // Adicione esta linha
                                console.log(registro);
                            }
                        }
                    },
                    (_, erro) => {
                        console.error('Erro ao buscar dados:', erro);
                    }
                );

                tx.executeSql(
                    'SELECT * FROM Servico',
                    [],
                    (_, resultado2) => {
                        if (resultado2.rows.length > 0) {
                            for (let i = 0; i < resultado2.rows.length; i++) {
                                const registro2 = resultado2.rows.item(i);
                                console.log("Dados TB Servico: " + registro2.Nome)
                            }
                        }
                    }
                )
            });
        };
        buscarDados();
    }, []);

    useEffect(() => {
        fetchAgendamentos();
    }, []);

    const selectLogo = (defaultLogo) => {
        return logoTipoPath ? { uri: logoTipoPath } : defaultLogo;
    };

    const fetchAgendamentos = () => {
        db.transaction((tx) => {
            tx.executeSql(
                'SELECT ID, Nome, Telefone, Data, Horario, Servicos, Status, ColaboradorNome FROM Agendamento',
                [],
                (_, { rows }) => {
                    const appointments = rows._array;
                    const sortedAppointments = sortAppointmentsByTimeAndStatus(appointments);
                    setAgendamentos(sortedAppointments);
                },
                (_, error) => {
                    console.error('Error fetching appointments:', error);
                }

            );
        });
    };

    const formatDate = (date) => {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const [currentDate, setCurrentDate] = useState(() => formatDate(new Date()));

    const [dataHoje, setDataHoje] = useState(() => formatDate(new Date()));

    const currentTime = new Date();
    const currentDateString = `${currentTime.getDate()}/${currentTime.getMonth() + 1}/${currentTime.getFullYear()}`;
    const currentTimeFormatted = new Date(currentDateString);



    const sortAppointmentsByTimeAndStatus = (appointments) => {
        // Converte o horário para um formato comparável (pode precisar de ajustes dependendo do formato real)
        const convertTimeToComparable = (time) => {
            const [hour, minute] = time.split(':').map(Number);
            return hour * 60 + minute;
        };

        // Ordena os agendamentos com base no horário e no status
        return appointments.sort((a, b) => {
            const timeA = convertTimeToComparable(a.Horario);
            const timeB = convertTimeToComparable(b.Horario);

            // Se os status são diferentes, organize por status
            if (a.Status !== b.Status) {
                return a.Status === 'Atendido' ? 1 : -1;
            }

            // Se ambos têm o mesmo status, organize por horário
            return timeA - timeB;
        });
    };

    const hasAppointmentsForCurrentDate = agendamentos.some(appointment => {
        const diaAtualAgendamento = appointment.Data;
        const dateAgendamento = new Date(
            parseInt(diaAtualAgendamento.split('/')[2], 10),
            parseInt(diaAtualAgendamento.split('/')[1], 10) - 1,
            parseInt(diaAtualAgendamento.split('/')[0], 10)
        );
        const formattedDiaAtualAgendamento = formatDate(dateAgendamento);

        return formattedDiaAtualAgendamento === currentDate;
    });

    const handleEsquerdaClick = async () => {
        const [day, month, year] = currentDate.split('/'); // Divida a string da data
        const currentDateObject = new Date(year, month - 1, day); // Crie um novo objeto Date
        console.log("Antes de decrementar:", currentDateObject);
        currentDateObject.setDate(currentDateObject.getDate() - 1);
        console.log("Depois de decrementar:", currentDateObject);
        const formattedDate = formatDate(currentDateObject);
        console.log("Formatted Date:", formattedDate);
        setCurrentDate(formattedDate);
        await fetchAgendamentos(formattedDate);
    };

    const handleDireitaClick = async () => {
        const [day, month, year] = currentDate.split('/'); // Divida a string da data
        const currentDateObject = new Date(year, month - 1, day); // Crie um novo objeto Date
        console.log("Antes de incrementar:", currentDateObject);
        currentDateObject.setDate(currentDateObject.getDate() + 1); // Adicione um dia
        console.log("Depois de incrementar:", currentDateObject);
        const formattedDate = formatDate(currentDateObject);
        console.log("Formatted Date (Direita):", formattedDate);
        setCurrentDate(formattedDate);
        await fetchAgendamentos(formattedDate);
        console.log("dataHoje" + dataHoje)
    };

    useFocusEffect(
        React.useCallback(() => {
            fetchAgendamentos();
        }, [])
    );

    const handleNotification = (message, duration) => {
        switch (Platform.OS) {
            case 'android':
                ToastAndroid.show(message, duration)
                break;

            case 'ios':
                Toast.show(message)
                break;

            default:
                break;
        }
    }

    const getStatusStyle = (status, data, horario) => {
        const [appointmentYear, appointmentMonth, appointmentDay] = data.split('/').map(Number);
        const [appointmentHour, appointmentMinute] = horario.split(':').map(Number);

        // Configurando a data e hora do agendamento
        const appointmentTime = new Date(appointmentYear, appointmentMonth - 1, appointmentDay, appointmentHour, appointmentMinute);

        // Formatando a data atual para o mesmo formato que o appointment.Data
        const currentDateString = `${currentTime.getDate()}/${currentTime.getMonth() + 1}/${currentTime.getFullYear()}`;
        const currentTimeFormatted = new Date(currentDateString);

        // Se a data do agendamento é no futuro, defina como "Aguardando"
        if (appointmentTime > currentTimeFormatted) {
            return styles.rightSideBlue;
        }

        // Se a data do agendamento é no passado, defina como "Atrasado"
        if (appointmentTime < currentTimeFormatted) {
            return styles.rightSideYellow;
        }

        // Lógica existente para outros casos
        switch (status) {
            case 'Aguardando':
                return styles.rightSideBlue;
            case 'Cancelado':
                return styles.rightSideRed;
            case 'Atendido':
                return styles.rightSideGreen;
            case 'Atrasado':
                return styles.rightSideYellow;
            default:
                return {}; // Pode adicionar um estilo padrão se nenhum dos casos acima corresponder
        }
    };


    const handleAgendar = () => {
        navigation.navigate('Agendar', {
            // estabelecimentoId: 
        });
    }

    const handleOpcoes = () => {
        navigation.navigate('Opcoes')
    }

    const handleEditarAgendamento = (appointment, name) => {
        navigation.navigate('EditarAgendamento', { appointmentData: appointment, name });
    }



    const [cardAberto, setCardAberto] = useState(false);
    const [mesSelecionado, setMesSelecionado] = useState(null);
    const [anoSelecionado, setAnoSelecionado] = useState(2000);
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
    const handleCalendarioClick = async () => {
        setCardAberto(true);
        showDatePicker();
    }

    const showDatePicker = () => {
        setDatePickerVisibility(true);
    };

    const hideDatePicker = () => {
        setDatePickerVisibility(false);
    };

    const handleDateConfirm = (date) => {
        hideDatePicker();

        // Obter dia, mês e ano a partir da data selecionada
        const day = date.getDate();
        const month = date.getMonth() + 1; // Os meses começam de 0
        const year = date.getFullYear();

        // Formatar a data para a sua representação desejada
        const formattedDate = formatDate(new Date(year, month - 1, day));

        // Atualizar o estado com a data selecionada
        setCurrentDate(formattedDate);

        // Fetch dos agendamentos para a data selecionada
        fetchAgendamentos(formattedDate);
    };


    const fecharCard = () => {
        setCardAberto(false);
        setMesSelecionado(null);
    }

    const selecionarMes = (mes) => {
        setMesSelecionado(mes);
        console.log("Mês selecionado: " + mesSelecionado)
    }

    const handleAnoChange = (valor) => {
        setAnoSelecionado(valor);
        console.log("Ano selecionado: " + anoSelecionado)
    }

    const renderizarDiasDoMes = () => {
        const diasDoMes = Array.from({ length: 31 }, (_, index) => index + 1);

        // Dividir os dias em grupos de 10
        const gruposDeDias = [];
        while (diasDoMes.length > 0) {
            gruposDeDias.push(diasDoMes.splice(0, Math.min(10, diasDoMes.length)));
        }

        return gruposDeDias.map((grupo, index) => (
            <View key={index} style={styles.linhaDiasContainer}>
                {grupo.map((dia) => (
                    <TouchableOpacity key={dia} onPress={() => console.log(`Dia selecionado: ${dia}`)}>
                        <Text style={styles.textoDias}>{dia}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        ));
    }

    const handleCopiar = async (appointment) => {
        try {
            const dadosString =
                "Olá " + appointment.Nome + ", tudo bem com você?" +
                "\nNão se esqueça que você tem um agendamento na " + name + " na seguinte data: \nData: " + appointment.Data + "\nHorário: " + appointment.Horario + "\nCom o(a) profissional " + JSON.parse(appointment.ColaboradorNome) + "\n\nObrigado pela preferência!";

            await Clipboard.setStringAsync(dadosString);
            console.log('Dados copiados:', dadosString);
            handleNotification('Dados copiados para a área de transferência!', ToastAndroid.SHORT);
        } catch (error) {
            console.error('Erro ao definir a área de transferência:', error);
            handleNotification('Erro ao copiar dados!', ToastAndroid.SHORT);
        }
    };

    const handleExcluir = (agendamentoID) => {
        // Mostra um alerta de confirmação
        Alert.alert(
            'Confirmação',
            'Tem certeza que deseja excluir este agendamento?',
            [
                {
                    text: 'Cancelar',
                    style: 'cancel',
                },
                {
                    text: 'Sim',
                    onPress: () => {
                        // Continua com a exclusão se o usuário clicar em "Sim"
                        db.transaction(
                            (tx) => {
                                tx.executeSql(
                                    'DELETE FROM Agendamento WHERE ID = ?',
                                    [agendamentoID],
                                    (_, result) => {
                                        console.log('Agendamento excluído com sucesso:', result);
                                        // Atualizar a lista de agendamentos após excluir
                                        fetchAgendamentos();
                                    },
                                    (_, error) => {
                                        console.error('Erro ao excluir agendamento:', error);
                                    }
                                );
                            },
                            (error) => {
                                console.error('Erro na transação:', error);
                            }
                        );
                    },
                },
            ],
            { cancelable: false }
        );
    };



    useEffect(() => {
        // Função para verificar e atualizar status dos agendamentos
        const verificarAgendamentos = async () => {
            const now = new Date();

            for (const appointment of agendamentos) {
                const { Data, Horario, Status, ID } = appointment;

                const appointmentDateTime = new Date(`${Data} ${Horario}`);
                const currentDateTime = new Date();

                // Verifica se a diferença entre o horário do agendamento e o horário atual é maior que 0
                const diffInMinutes = (appointmentDateTime - currentDateTime) / (1000 * 60);

                if (diffInMinutes < 0 && Status !== 'Atendido') {
                    // Atualiza o status para "Atrasado"
                    await new Promise((resolve) => {
                        db.transaction((tx) => {
                            tx.executeSql(
                                'UPDATE Agendamento SET Status = ? WHERE ID = ?',
                                ['Atrasado', ID],
                                (_, results) => {
                                    console.log('Agendamento atualizado com sucesso:', results);
                                    resolve();
                                },
                                (_, error) => {
                                    console.error('Erro ao atualizar agendamento:', error);
                                    resolve();
                                }
                            );
                        });
                    });

                    // Atualiza o estado local dos agendamentos
                    await fetchAgendamentos();
                }
            }
        };

        // Execute a verificação a cada 60 segundos
        const intervalId = setInterval(async () => {
            await verificarAgendamentos();
        }, 10000);

        return () => clearInterval(intervalId);
    }, [agendamentos]);

    return (
        <>
            <NavBar />
            <ScrollView>
                <View style={styles.container}>
                    <Image
                        source={logoTipoPath ? { uri: logoTipoPath } : require('../assets/Imagens/Logos/LogoPadrao.png')}
                        style={{ width: 150, height: 150, alignSelf: 'center' }}
                    />
                    <View>
                        <TouchableOpacity
                            style={styles.button}
                        >
                            <Text onPress={handleAgendar} style={styles.buttonText}>Realizar agendamento</Text>
                        </TouchableOpacity>
                    </View>

                    <View>
                        <Text style={styles.TextoAzul}>Agendamentos Programados</Text>
                    </View>

                    <View style={styles.ladoAlado}>
                        <View style={styles.cardStatus}>
                            <View style={styles.cardStatusCircleAtendido}></View>
                            <Text style={styles.cardStatusText}>Atendido</Text>
                        </View>
                        <View style={styles.cardStatus}>
                            <View style={styles.cardStatusCircleAtrasado}></View>
                            <Text style={styles.cardStatusText}>Atrasado</Text>
                        </View>
                        <View style={styles.cardStatus}>
                            <View style={styles.cardStatusCircleCancelado}></View>
                            <Text style={styles.cardStatusText}>Cancelado</Text>
                        </View>
                        <View style={styles.cardStatus}>
                            <View style={styles.cardStatusCircleEspera}></View>
                            <Text style={styles.cardStatusText}>Aguardando</Text>
                        </View>
                    </View>

                    <View style={styles.ladoAlado}>
                        {/* Botão com ícone à esquerda */}
                        <TouchableOpacity onPress={() => handleEsquerdaClick()}>
                            <Icon name="arrow-left" size={30} color="black" />
                        </TouchableOpacity>
                        {/* Botão no meio com ícone de calendário */}
                        <TouchableOpacity onPress={() => handleCalendarioClick()} style={{ marginLeft: 20, marginRight: 20 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Icon name="calendar" size={30} color="black" />
                                <Text style={{ marginLeft: 10, fontSize: 20 }}>Calendário</Text>
                            </View>
                        </TouchableOpacity>
                        {/* Botão com ícone à direita */}
                        <TouchableOpacity onPress={() => handleDireitaClick()}>
                            <Icon name="arrow-right" size={30} color="black" />
                        </TouchableOpacity>
                    </View>
                    <View>
                        {isDatePickerVisible && (
                            <DateTimePickerModal
                                isVisible={isDatePickerVisible}
                                mode="date"
                                onConfirm={handleDateConfirm}
                                onCancel={hideDatePicker}
                            />
                        )}
                    </View>
                    {hasAppointmentsForCurrentDate ? (
                        agendamentos.map((appointment, index) => {
                            const diaAtualAgendamento = appointment.Data;
                            const dateAgendamento = new Date(
                                parseInt(diaAtualAgendamento.split('/')[2], 10),
                                parseInt(diaAtualAgendamento.split('/')[1], 10) - 1,
                                parseInt(diaAtualAgendamento.split('/')[0], 10)
                            );
                            const formattedDiaAtualAgendamento = formatDate(dateAgendamento);

                            if (formattedDiaAtualAgendamento === currentDate) {
                                return (
                                    <View key={index} style={styles.card}>
                                        <TouchableOpacity
                                            onPress={() => handleEditarAgendamento(appointment, name, JSON.parse(appointment.ColaboradorNome)[0])}
                                            style={{ flexDirection: 'row' }}
                                        >
                                            <View style={{ flex: 1 }}>
                                                <View style={styles.cardHeader}>
                                                    <Text style={styles.cardHeader}>Nome: {appointment.Nome}</Text>
                                                </View>
                                                <Text style={styles.cardText}>Telefone: {appointment.Telefone}</Text>
                                                <Text style={styles.cardText}>Data: {appointment.Data}</Text>
                                                <Text style={styles.cardText}>Horário: {appointment.Horario}</Text>
                                                <Text style={styles.cardText}>Serviços: {appointment.Servicos}</Text>
                                                <Text style={styles.cardText}>Colaborador: {JSON.parse(appointment.ColaboradorNome)[0]}</Text>
                                                <View style={styles.buttonContainer}>
                                                    <TouchableOpacity
                                                        onPress={() => handleCopiar(appointment)}
                                                        style={styles.buttonCopiar}
                                                    >
                                                        <Text style={styles.buttonCopiarText}>Copiar</Text>
                                                    </TouchableOpacity>
                                                    <TouchableOpacity style={styles.buttonExcluir} onPress={() => handleExcluir(appointment.ID)}>
                                                        <Text style={styles.buttonCopiarText}>Excluir</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                            <View style={getStatusStyle(appointment.Status, appointment.Data, appointment.Horario)}></View>
                                        </TouchableOpacity>
                                    </View>
                                );
                            }

                            return null;
                        })
                    ) : (
                        <View style={styles.card}>
                            <Text style={styles.cardHeader}>Dados recuperados: {currentDate}</Text>
                            <Text style={styles.cardText}>Desculpe, não há dados para essa data.</Text>
                        </View>
                    )}

                    <View>
                        <Text style={styles.textCadastrado}>
                            <Text onPress={handleIr} style={styles.textCadastradoRed}>Voltar</Text>
                        </Text>
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
        marginTop: 50
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 30,
        marginTop: 10,
        alignItems: 'center', // Centraliza os elementos horizontalmente
    },
    mesesContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 10,
        marginBottom: 10,
    },
    mes: {
        fontWeight: 'bold'
    },
    diasContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
        marginBottom: 20,
    },
    linhaDiasContainer: {
        justifyContent: 'space-around',
        marginTop: 10,
        fontWeight: 'bold'
    },
    fecharCard: {
        color: 'red',
        fontWeight: 'bold'
    },
    ladoAlado: {
        alignSelf: 'center',
        flexDirection: 'row',
        marginTop: 10,
    },
    card: {
        backgroundColor: '#ffffff',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 10,
        marginHorizontal: 10,
        marginBottom: 10,
        marginTop: 50,
        elevation: 2
    },
    cardHeader: {
        fontSize: 17,
        fontWeight: 'bold',
    },
    cardText: {
        fontSize: 16,
        color: Style.color2
    },
    rightSideGreen: {
        backgroundColor: 'green',
        borderTopRightRadius: 10,
        borderBottomRightRadius: 10,
        borderTopLeftRadius: 10,
        borderBottomLeftRadius: 10,
        width: 20,  // Adjust the width as needed
    },
    rightSideYellow: {
        backgroundColor: 'yellow',
        borderTopRightRadius: 10,
        borderBottomRightRadius: 10,
        borderTopLeftRadius: 10,
        borderBottomLeftRadius: 10,
        width: 20,  // Adjust the width as needed
    },
    rightSideRed: {
        backgroundColor: 'red',
        borderTopRightRadius: 10,
        borderBottomRightRadius: 10,
        borderTopLeftRadius: 10,
        borderBottomLeftRadius: 10,
        width: 20,  // Adjust the width as needed
    },
    rightSideBlue: {
        backgroundColor: Style.color,
        borderTopRightRadius: 10,
        borderBottomRightRadius: 10,
        borderTopLeftRadius: 10,
        borderBottomLeftRadius: 10,
        width: 20,  // Adjust the width as needed
    },
    cardStatus: {
        flexDirection: 'row', // Add this line to make the children align horizontally
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 5,
        borderRadius: 10,
        paddingBottom: 5
    },
    cardStatusCircleAtendido: {
        backgroundColor: 'green',
        width: 15,
        height: 15,
        borderRadius: 15,
        marginRight: 5,
    },
    cardStatusCircleAtrasado: {
        backgroundColor: 'yellow',
        width: 15,
        height: 15,
        borderRadius: 15,
        marginRight: 5,
    },
    cardStatusCircleCancelado: {
        backgroundColor: 'red',
        width: 15,
        height: 15,
        borderRadius: 15,
        marginRight: 5,
    },
    cardStatusCircleEspera: {
        backgroundColor: Style.color,
        width: 15,
        height: 15,
        borderRadius: 15,
        marginRight: 5,
    },
    cardStatusText: {
        fontSize: 14,
        textAlign: 'center',
        color: 'black',
        fontWeight: 'bold'
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
        marginLeft: 55
    },
    button: {
        backgroundColor: Style.color,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 10,
        marginHorizontal: 10,
        marginBottom: 10,
        marginTop: 50
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
    buttonCopiar: {
        backgroundColor: 'green',
        paddingVertical: 3,
        borderRadius: 1,
        marginBottom: 1,
        marginTop: 5,
        width: '30%',
        alignSelf: 'left',
        borderRadius: 10
    },
    buttonExcluir: {
        backgroundColor: 'red',
        paddingVertical: 3,
        borderRadius: 1,
        marginBottom: 1,
        marginTop: 5,
        width: '30%',
        alignSelf: 'left',
        borderRadius: 10
    },
    buttonCopiarText: {
        textAlign: 'center',
        color: 'white',
        fontWeight: 'bold'
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    TextoAzul: {
        color: Style.color,
        fontSize: 22,
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 50,
        marginBottom: 10
    },
    textoMeses: {
        color: Style.color,
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10
    },
    textoDias: {
        color: Style.color,
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 5,
        marginBottom: 5
    },
});
export default MainMenu;

