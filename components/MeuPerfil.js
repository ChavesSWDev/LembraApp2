import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Image, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import * as SQLite from 'expo-sqlite';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

import * as Style from '../assets/styles';
import { selectLogo } from '../utils/pega-imagem';
import NavBar from './NavBar';
import db from './BancoLembraAi';
import { CheckBox } from 'react-native-elements';

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


const MeuPerfil = () => {
    const [dados, setDados] = useState({
        Nome: '',
        CNPJ: '',
        Servicos: '',
        Logotipo: '',
        ID: '',
    });
    const [cardAberto, setCardAberto] = useState(false);
    const [selectedService, setSelectedService] = useState('');
    const [isNameEditing, setNameEditing] = useState(false);
    const [name, setName] = useState(dados.Nome);
    const [isCnpjEditing, setCnpjEditing] = useState(false);
    const [cnpj, setCnpj] = useState(dados.CNPJ);
    const [isRamoEditing, setRamoEditing] = useState(false);
    const [ramo, setRamo] = useState(dados.Servicos);
    const [logoTipoPath, setLogoTipoPath] = useState('');
    const [originalName, setOriginalName] = useState(name);
    const [originalCnpj, setOriginalCnpj] = useState(cnpj);
    const [originalRamo, setOriginalRamo] = useState(ramo);
    const [agendamentos, setAgendamentos] = useState([]);
    const [idEstabelecimento, setIdEstabelecimento] = useState('');
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
        console.log('Executing SQL:', sql);
        console.log('Parameters:', params);

        return new Promise((resolve, reject) => {
            db.transaction((tx) => {
                tx.executeSql(sql, params, (_, result) => {
                    console.log('Query executed successfully:', result);
                    resolve(result);
                }, (_, error) => {
                    console.error('Error executing the query:', error);
                    reject(error);
                });
            });
        });
    };

    const handleSaveChanges = () => {
        db.transaction(async (tx) => {
            try {
                // Update the Estabelecimento table with the edited data
                await tx.executeSql(
                    'UPDATE Estabelecimento SET Nome=?, CNPJ=?, Ramo=? WHERE ID=?',
                    [name, cnpj, ramo, 1]
                );

                // Commit the transaction
                await tx.executeSql('COMMIT;');
            } catch (error) {
                // Handle errors
                console.error('Error saving changes:', error);
                await tx.executeSql('ROLLBACK;');
            }
        });
    };



    const insertServices = async () => {
        // Obtém os serviços relacionados ao ramo selecionado
        const relatedServices = getRelatedServices(ramo);

        // Cria a query SQL para inserir ou atualizar um serviço
        const insertSql = 'INSERT INTO Servico (Nome, Ramo, EstabelecimentoID) VALUES (?, ?, ?)';

        // Deleta os dados existentes na tabela Servico
        await executeSql('DELETE FROM Servico');

        // Insere os novos serviços na tabela Servico
        for (let i = 0; i < relatedServices.length; i++) {
            const serviceName = relatedServices[i];
            const params = [serviceName, ramo, 1];

            try {
                // Usa a função executeSql para inserir ou atualizar o serviço no banco de dados
                await executeSql(insertSql, params);
                console.log('Service inserted successfully:', serviceName);
            } catch (error) {
                // Handle errors
                console.error('Error inserting service:', error);
            }
        }
    };



    // const insertServices = async () => {
    //     // Obtém os serviços relacionados ao ramo selecionado
    //     const relatedServices = getRelatedServices(ramo);
    //     // Cria a query SQL para inserir ou atualizar um serviço
    //     const updateSql = `INSERT OR REPLACE INTO Servico (Nome, Ramo, EstabelecimentoID) VALUES (?, ?, ?)`;

    //     // Insere ou atualiza todos os serviços relacionados ao novo ramo no banco de dados
    //     for (let i = 0; i < relatedServices.length; i++) {
    //         const serviceName = relatedServices[i];
    //         const params = [serviceName, ramo, 1];

    //         try {
    //             // Usa a função executeSql para inserir ou atualizar o serviço no banco de dados
    //             await executeSql(updateSql, params);
    //         } catch (error) {
    //             // Handle errors
    //             console.error('Error updating/inserting service:', error);
    //         }
    //     }
    // };

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

    const handleEditName = () => {
        setNameEditing(true);
        setOriginalName(name);
    };

    const handleEditCnpj = () => {
        setCnpjEditing(true);
        setOriginalCnpj(cnpj);
    };

    const handleEditRamo = () => {
        setCardAberto(true);
        setRamoEditing(true);
        setOriginalRamo(ramo);
    };

    const handleCancelName = () => {
        setNameEditing(false);
        setName(originalName);
    };

    const handleCancelCnpj = () => {
        setCnpjEditing(false);
        setCnpj(originalCnpj);
    };

    const handleCancelRamo = () => {
        setRamoEditing(false);
        setRamo(originalRamo);
        setCardAberto(false)
    };

    const handleSaveName = () => {
        handleSaveChanges();
        setNameEditing(false);
    };

    const handleSaveCnpj = () => {
        handleSaveChanges();
        setCnpjEditing(false);
    };

    const handleSaveRamo = () => {
        handleSaveChanges();
        insertServices();
        setCardAberto(false);
        setRamoEditing(false)
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
                                setLogoTipoPath(registro["Logotipo"]);
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

    const handleEditarAgendamento = (appointment) => {
        navigation.navigate('EditarAgendamento', { appointmentData: appointment });
    }



    return (
        <>
            <NavBar />
            <ScrollView>
                <View style={styles.container}>

                    <Image
                        source={logoTipoPath ? { uri: logoTipoPath } : require('../assets/Imagens/Logos/LogoPadrao.png')}
                        style={{ width: 150, height: 150, alignSelf: 'center', marginBottom: 20 }}
                    />

                    <Text style={styles.label}>Estabelecimento</Text>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            value={name}
                            onChangeText={text => setName(text)}
                            editable={isNameEditing}
                        />
                        {isNameEditing ? (
                            <TouchableOpacity onPress={handleSaveName}>
                                <Text style={styles.editText}>Salvar</Text>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity onPress={handleEditName}>
                                <Text style={styles.editText}>Editar</Text>
                            </TouchableOpacity>
                        )}
                        {isNameEditing && (
                            <TouchableOpacity onPress={handleCancelName}>
                                <Text style={styles.removeText}>Cancelar</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    <Text style={styles.label}>CNPJ</Text>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            value={String(cnpj)}
                            onChangeText={text => setCnpj(text)}
                            editable={isCnpjEditing}
                        />
                        {isCnpjEditing ? (
                            <TouchableOpacity onPress={handleSaveCnpj}>
                                <Text style={styles.editText}>Salvar</Text>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity onPress={handleEditCnpj}>
                                <Text style={styles.editText}>Editar</Text>
                            </TouchableOpacity>
                        )}
                        {isCnpjEditing && (
                            <TouchableOpacity onPress={handleCancelCnpj}>
                                <Text style={styles.removeText}>Cancelar</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    <Text style={styles.label}>Ramo</Text>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            value={ramo}
                            onChangeText={text => setRamo(text)}
                            editable={isRamoEditing}
                        />
                        {isRamoEditing ? (
                            <TouchableOpacity onPress={handleSaveRamo}>
                                <Text style={styles.editText}>Salvar</Text>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity onPress={handleEditRamo}>
                                <Text style={styles.editText}>Editar</Text>
                            </TouchableOpacity>
                        )}
                        {isRamoEditing && (
                            <TouchableOpacity onPress={handleCancelRamo}>
                                <Text style={styles.removeText}>Cancelar</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Render the service selection card */}
                    {cardAberto && (
                        <View style={styles.card}>
                            <Text style={styles.cardHeader}>Selecionar ramos</Text>
                            <View style={styles.containerCheck}>
                                {serviceOptions.map((service, index) => (
                                    <View key={index} style={styles.checkboxContainer}>
                                        <CheckBox
                                            title={service}
                                            checked={ramo === service}
                                            onPress={() => setRamo(service)}
                                            containerStyle={styles.checkbox}
                                        />
                                    </View>
                                ))}
                            </View>
                        </View>
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
        marginTop: 50
    },
    checkbox: {
        marginLeft: 15,
        width: '90%'
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
    containerAgendamentos: {
        flex: 1,
        marginTop: 30,
        textAlign: 'center',
        justifyContent: 'center',
        alignSelf: 'center'
    },
    containerAgendamentosTexto: {
        fontWeight: 'bold',
        fontSize: 16
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
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 50
    }
});
export default MeuPerfil;