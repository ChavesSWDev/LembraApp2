import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Image, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import ConnectBanco from './BancoLembraAi';
import * as SQLite from 'expo-sqlite';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
const db = SQLite.openDatabase('BancoLembraAi.db');
import * as Style from '../assets/styles';
import { selectLogo } from '../utils/pega-imagem';

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
                'SELECT Nome, Telefone, Data, Horario, Servicos FROM Agendamento',
                [],
                (_, { rows }) => {
                    const appointments = rows._array;
                    setAgendamentos(appointments);
                },
                (_, error) => {
                    console.error('Error fetching appointments:', error);
                }
            );
        });
    };



    useFocusEffect(
        React.useCallback(() => {
            fetchAgendamentos();
        }, [])
    );

    const handleAgendar = () => {
        navigation.navigate('Agendar', {
            // estabelecimentoId: 
        });
    }

    const handleEditarAgendamento = (event, appointment) => {
        event.preventDefault();
        navigation.navigate('EditarAgendamento', { appointmentData: appointment });
    }

    return (
        <ScrollView>
            <View style={styles.container}>
                <ConnectBanco />

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
                        <Text style={styles.cardStatusText}>Aberto</Text>
                    </View>
                </View>
                {agendamentos.map((appointment, index) => {
                    return (
                        <View>
                            <View style={styles.card} key={index}>
                                <TouchableOpacity key={index} onPress={handleEditarAgendamento} style={{ flexDirection: 'row' }}>
                                    <View style={{ flex: 1 }}>
                                        <View style={styles.cardHeader}>
                                            <Text style={styles.cardHeaderText}>Nome: {appointment.Nome}</Text>
                                        </View>
                                        <Text style={styles.cardText}>Telefone: {appointment.Telefone}</Text>
                                        <Text style={styles.cardText}>Data: {appointment.Data}</Text>
                                        <Text style={styles.cardText}>Horário: {appointment.Horario}</Text>
                                        <Text style={styles.cardText}>Serviços: {appointment.Servicos}</Text>
                                    </View>
                                    <View style={styles.rightSideGreen}></View>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.card} key={index}>
                                <TouchableOpacity key={index} onPress={handleEditarAgendamento} style={{ flexDirection: 'row' }}>
                                    <View style={{ flex: 1 }}>
                                        <View style={styles.cardHeader}>
                                            <Text style={styles.cardHeaderText}>Nome: {appointment.Nome}</Text>
                                        </View>
                                        <Text style={styles.cardText}>Telefone: {appointment.Telefone}</Text>
                                        <Text style={styles.cardText}>Data: {appointment.Data}</Text>
                                        <Text style={styles.cardText}>Horário: {appointment.Horario}</Text>
                                        <Text style={styles.cardText}>Serviços: {appointment.Servicos}</Text>
                                    </View>
                                    <View style={styles.rightSideyellow}></View>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.card} key={index}>
                                <TouchableOpacity key={index} onPress={handleEditarAgendamento} style={{ flexDirection: 'row' }}>
                                    <View style={{ flex: 1 }}>
                                        <View style={styles.cardHeader}>
                                            <Text style={styles.cardHeaderText}>Nome: {appointment.Nome}</Text>
                                        </View>
                                        <Text style={styles.cardText}>Telefone: {appointment.Telefone}</Text>
                                        <Text style={styles.cardText}>Data: {appointment.Data}</Text>
                                        <Text style={styles.cardText}>Horário: {appointment.Horario}</Text>
                                        <Text style={styles.cardText}>Serviços: {appointment.Servicos}</Text>
                                    </View>
                                    <View style={styles.rightSidered}></View>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.card} key={index}>
                                <TouchableOpacity key={index} onPress={handleEditarAgendamento} style={{ flexDirection: 'row' }}>
                                    <View style={{ flex: 1 }}>
                                        <View style={styles.cardHeader}>
                                            <Text style={styles.cardHeaderText}>Nome: {appointment.Nome}</Text>
                                        </View>
                                        <Text style={styles.cardText}>Telefone: {appointment.Telefone}</Text>
                                        <Text style={styles.cardText}>Data: {appointment.Data}</Text>
                                        <Text style={styles.cardText}>Horário: {appointment.Horario}</Text>
                                        <Text style={styles.cardText}>Serviços: {appointment.Servicos}</Text>
                                    </View>
                                    <View style={styles.rightSideBlue}></View>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )
                })}
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
    rightSideyellow: {
        backgroundColor: 'yellow',
        borderTopRightRadius: 10,
        borderBottomRightRadius: 10,
        borderTopLeftRadius: 10,
        borderBottomLeftRadius: 10,
        width: 20,  // Adjust the width as needed
    },
    rightSidered: {
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
        fontSize: 16,
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
    }
});
export default MainMenu;

