import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Image, StyleSheet, TouchableOpacity, ScrollView, Touchable, Alert } from 'react-native';
import ConnectBanco from './BancoLembraAi';
import * as SQLite from 'expo-sqlite';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
const db = SQLite.openDatabase('BancoLembraAi.db');
import * as Style from '../assets/styles';
import { selectLogo } from '../utils/pega-imagem';
import { format, parseISO } from 'date-fns';
import { Picker } from '@react-native-picker/picker';
import * as FileSystem from 'expo-file-system';
import NavBar from './NavBar';


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


const Opcoes = () => {
    const navigation = useNavigation();
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
    const [agendamentosFiltrados, setAgendamentosFiltrados] = useState([]);
    const [pesquisaRealizada, setPesquisaRealizada] = useState(false);
    const today = new Date();
    const todayString = format(today, 'dd/MM/yyyy');

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

    const handleOpcoes = () => {
        navigation.navigate('MainMenu')
    }

    const handleEditarAgendamento = (appointment) => {
        navigation.navigate('EditarAgendamento', { appointmentData: appointment });
    }

    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // +1 para representar os meses de 1 a 12
    // Para o array de anos (years)
    const years = ['Todos', ...Array.from({ length: 51 }, (_, i) => 2000 + i)];
    // Para o array de meses (months)
    const months = ['Todos', ...Array.from({ length: 12 }, (_, i) => i + 1)];

    // Nome dos meses
    const monthNames = [
        'Todos', 'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    const filteredAppointments = agendamentos
        .filter(appointment => {
            const selectedDate = `${selectedMonth}/${selectedYear}`;
            return appointment.Data.startsWith(selectedDate);
        })
        .filter(appointment => appointment.Status === 'Atendido')
        .sort((a, b) => a.Nome.localeCompare(b.Nome));

    const handlePesquisar = (ano, mes) => {
        setPesquisaRealizada(true);
        // Lógica para buscar os agendamentos com base no ano e mês selecionados
        console.log('Ano selecionado:', ano);
        console.log('Mês selecionado:', mes);

        let filteredAppointments;

        if (ano === 'Todos' && mes === 'Todos') {
            // Se ambos ano e mês forem 'Todos', recuperar todos os agendamentos atendidos
            filteredAppointments = agendamentos
                .filter(appointment => appointment.Status === 'Atendido')
                .sort((a, b) => a.Nome.localeCompare(b.Nome));
        } else {
            // Caso contrário, aplicar a lógica de filtro por ano e mês
            filteredAppointments = agendamentos
                .filter(appointment => {
                    const [appointmentDay, appointmentMonth, appointmentYear] = appointment.Data.split('/').map(Number);
                    console.log('Data do agendamento:', appointment.Data);
                    console.log('Dia do agendamento:', appointmentDay);
                    console.log('Mês do agendamento:', appointmentMonth);
                    console.log('Ano do agendamento:', appointmentYear);

                    return (
                        appointmentMonth === mes &&
                        appointmentYear === ano &&
                        appointment.Status === 'Atendido'
                    );
                })
                .sort((a, b) => a.Nome.localeCompare(b.Nome));
        }

        // Atualize o estado dos agendamentos filtrados
        console.log('Agendamentos filtrados:', filteredAppointments);
        setAgendamentosFiltrados(filteredAppointments);
    };

    return (
        <>
            <NavBar />
            <ScrollView>
                <View style={styles.container}>
                    <ConnectBanco />
                    <Image source={selectLogo('default')} style={{ width: 150, height: 150, alignSelf: 'center' }} />
                    <TouchableOpacity style={styles.buttonGray}>
                        <Text onPress={handleOpcoes} style={styles.buttonText}>Voltar</Text>
                    </TouchableOpacity>

                    <Text style={styles.TextoAzul}>Agendamentos concluídos</Text>

                    <View style={styles.filtroContainer}>
                        <View style={styles.filtroItem}>
                            <Text style={styles.TextoAzul}>Ano</Text>
                            {/* Picker para o Ano */}
                            <Picker
                                selectedValue={selectedYear}
                                style={styles.picker}
                                onValueChange={(itemValue) => setSelectedYear(itemValue)}
                            >
                                {years.map(year => (
                                    <Picker.Item style={styles.pickerText} key={year} label={year.toString()} value={year} />
                                ))}
                            </Picker>
                        </View>

                        <View style={styles.filtroItem}>
                            {/* Texto para o Mês */}
                            <Text style={styles.TextoAzul}>Mês</Text>
                            {/* Picker para o Mês */}
                            <Picker
                                selectedValue={selectedMonth}
                                style={styles.picker}
                                onValueChange={(itemValue) => setSelectedMonth(itemValue)}
                            >
                                {months.map((month, index) => (
                                    <Picker.Item style={styles.pickerText} key={month} label={monthNames[index]} value={month} />
                                ))}
                            </Picker>
                        </View>

                        <View style={styles.filtroItem}>
                            {/* Botão de Pesquisa */}
                            <TouchableOpacity
                                style={styles.button}
                                title="Pesquisar"
                                onPress={() => handlePesquisar(selectedYear, selectedMonth)}
                            >
                                <Text style={styles.buttonText}>Pesquisar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {pesquisaRealizada && agendamentosFiltrados.length === 0 ? (
                        <View style={styles.card}>
                            <Text style={styles.cardHeader}>Dados de: {selectedMonth}/{selectedYear}</Text>
                            <Text style={styles.cardText}>Desculpe, não há dados para essa data.</Text>
                        </View>
                    ) : (
                        agendamentosFiltrados.map((appointment, index) => (
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
                        ))
                    )}
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
        marginTop: 50,
        marginBottom: 50
    },
    picker: {
        backgroundColor: Style.color,
        marginHorizontal: 10,
        marginBottom: 10,
        marginTop: 10,
        width: 200,
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
    filtroContainer: {
        flexDirection: 'column',
        alignItems: 'center',
        marginTop: 20,
    },
    filtroItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 1,
    },
    botaoPesquisar: {
        backgroundColor: 'blue',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
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
    buttonRed: {
        backgroundColor: 'red',
        paddingVertical: 10,
        borderRadius: 10,
        marginBottom: 10,
        marginTop: 50,
        width: '30%',
        alignSelf: 'center',
    },
    buttonGreen: {
        backgroundColor: 'green',
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
        marginTop: 10,
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
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 30,
        marginTop: 10,
        alignItems: 'center', // Centraliza os elementos horizontalmente
    },
});
export default Opcoes;

