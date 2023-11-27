import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Image, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import ConnectBanco from './BancoLembraAi';
import * as SQLite from 'expo-sqlite';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
const db = SQLite.openDatabase('BancoLembraAi.db');
import * as Style from '../assets/styles';
import { selectLogo } from '../utils/pega-imagem';
import { format, parseISO } from 'date-fns';
import Icon from "react-native-vector-icons/FontAwesome"
import { Picker } from '@react-native-picker/picker';

async function getEstabelecimentoLogo(id) {
    const db = SQLite.openDatabase('BancoLembraAi.db');

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

    const fetchAgendamentos = () => {
        db.transaction((tx) => {
            tx.executeSql(
                'SELECT ID, Nome, Telefone, Data, Horario, Servicos, Status FROM Agendamento',
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

    const getStatusStyle = (status, horario) => {
        const [appointmentHour, appointmentMinute] = horario.split(':').map(Number);

        // Configurando a hora do agendamento com a data atual
        const appointmentTime = new Date(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate(), appointmentHour, appointmentMinute);

        // Se o horário do agendamento for anterior ao horário atual, marque como "Atrasado"
        if (appointmentTime > currentTime && status === 'Aguardando') {
            return styles.rightSideYellow; // Mantenha o estilo "Aguardando" se estiver no passado, mas o status ainda for "Aguardando"
        }

        if (appointmentTime < currentTime && status !== 'Atrasado' && status !== 'Cancelado' && status !== 'Atendido') {
            return styles.rightSideYellow; // Altere para "Atrasado" se estiver no passado e o status não for "Atrasado", "Cancelado" ou "Atendido"
        }

        if (appointmentTime >= currentTime && status === 'Atrasado') {
            return styles.rightSideBlue; // Se a data do agendamento for após a data atual, defina como "Aguardando" para evitar que seja marcado como "Atrasado"
        }

        if (appointmentTime < currentTime && status === 'Aguardando') {
            return styles.rightSideBlue; // Mantenha o estilo "Aguardando" se estiver no passado, mas o status ainda for "Aguardando"
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

    const handleEditarAgendamento = (appointment) => {
        navigation.navigate('EditarAgendamento', { appointmentData: appointment });
    }



    const [cardAberto, setCardAberto] = useState(false);
    const [mesSelecionado, setMesSelecionado] = useState(null);
    const [anoSelecionado, setAnoSelecionado] = useState(2000);
    const handleCalendarioClick = async () => {
        setCardAberto(true);
    }

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

    return (
        <ScrollView>
            <View style={styles.container}>
                <ConnectBanco />
                <Image source={selectLogo('default')} style={{ width: 150, height: 150, alignSelf: 'center' }} />
                <View>
                    <TouchableOpacity
                        style={styles.button}
                    >
                        <Text onPress={handleAgendar} style={styles.buttonText}>Realizar agendamento</Text>
                    </TouchableOpacity>
                </View>
                <TouchableOpacity style={styles.buttonGray}>
                    <Text onPress={handleOpcoes} style={styles.buttonText}>Opções</Text>
                </TouchableOpacity>

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
                    {cardAberto && (
                        <View style={styles.card}>
                            <TouchableOpacity onPress={fecharCard}>
                                <Text style={styles.fecharCard}>X</Text>
                            </TouchableOpacity>

                            <Text style={styles.cardHeader}>Selecionar data</Text>

                            {/* Picker para seleção de ano */}
                            <Picker
                                selectedValue={anoSelecionado}
                                style={styles.pickerAno}
                                onValueChange={(valor) => handleAnoChange(valor)}
                            >
                                {Array.from({ length: 101 }, (_, index) => 2000 + index).map((ano) => (
                                    <Picker.Item key={ano} label={ano.toString()} value={ano} />
                                ))}
                            </Picker>

                            {/* Renderizar meses */}
                            <View style={styles.mesesContainer}>
                                {['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'].map((mes) => (
                                    <TouchableOpacity
                                        key={mes}
                                        style={styles.mes}
                                        onPress={() => selecionarMes(mes)}
                                    >
                                        <Text style={styles.textoMeses}>{mes}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {/* Renderizar dias do mês selecionado */}
                            {mesSelecionado && (
                                <View style={styles.diasContainer}>
                                    {renderizarDiasDoMes()}
                                </View>
                            )}
                        </View>
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
                                        onPress={() => handleEditarAgendamento(appointment)}
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
                                        </View>
                                        <View style={getStatusStyle(appointment.Status, appointment.Horario)}></View>
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
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: '#f0f0f0',
        marginTop: 50
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

