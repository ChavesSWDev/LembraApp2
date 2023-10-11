import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Image, StyleSheet, TouchableOpacity } from 'react-native';
import ConnectBanco from './BancoLembraAi';
import * as SQLite from 'expo-sqlite';
import { useNavigation } from '@react-navigation/native';
const db = SQLite.openDatabase('BancoLembraAi.db');

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
    // const [estabelecimento, setEstabelecimento] = useState(null);

    // const idEstabelecimento = 5; // Substitua pelo ID do estabelecimento que você deseja pegar a imagem

    // useEffect(() => {
    //     async function fetchEstabelecimento() {
    //         const logotipoBase64 = await getEstabelecimentoLogo(idEstabelecimento);

    //         setEstabelecimento({
    //             ...estabelecimento,
    //             logotipoBase64,
    //         });
    //     }

    //     fetchEstabelecimento();
    // }, [idEstabelecimento]);

    // if (!estabelecimento) {
    //     return <Text>Carregando...</Text>;
    // }

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
        // Função para buscar os dados do banco de dados
        const buscarDados = async () => {
            await db.transaction((tx) => {
                tx.executeSql(
                    'SELECT * FROM Estabelecimento',
                    [],
                    (_, resultado) => {
                        if (resultado.rows.length > 0) {
                            // Supondo que você deseja apenas o primeiro registro encontrado
                            for (let i = 0; i < resultado.rows.length; i++) {
                                const registro = resultado.rows.item(i);
                                // setDados({
                                //     Nome: registro["Nome"],
                                //     CNPJ: registro["CNPJ"],
                                //     Servicos: registro["Servicos"],
                                //     Logotipo: registro["Logotipo"],
                                // });

                                setName(registro["Nome"]);
                                setCnpj(registro["CNPJ"]);
                                setRamo(registro["Servicos"]);
                                console.log(registro);
                            }
                        }
                    },
                    (_, erro) => {
                        console.error('Erro ao buscar dados:', erro);
                    }
                );
            });
        };

        // Chame a função para buscar os dados quando o componente for montado
        buscarDados();

        // console.log('dados');
        // console.log(dados);

        // Popula variáveis
    }, []);

    return (
        <View style={styles.container}>
            <ConnectBanco />
            {/* <Image
                source={{ uri: `data:image/png;base64,${logotipoBase64}` }}
                style={styles.logo}
            /> */}

            <Text style={styles.label}>Estabelecimento</Text>
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={text => setName(text)}
                    editable={isNameEditing}
                />
                {isNameEditing ? (
                    <TouchableOpacity onPress={() => setNameEditing(false)}>
                        <Text style={styles.editText}>Salvar</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity onPress={handleEditName}>
                        <Text style={styles.editText}>Editar</Text>
                    </TouchableOpacity>
                )}
                {isNameEditing && (
                    <TouchableOpacity onPress={() => handleCancelName(false)}>
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
                    <TouchableOpacity onPress={() => handleEditCnpj(false)}>
                        <Text style={styles.editText}>Salvar</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity onPress={handleEditCnpj}>
                        <Text style={styles.editText}>Editar</Text>
                    </TouchableOpacity>
                )}
                {isCnpjEditing && (
                    <TouchableOpacity onPress={() => handleCancelCnpj(false)}>
                        <Text style={styles.removeText}>Cancelar</Text>
                    </TouchableOpacity>
                )}
            </View>

            <Text style={styles.label}>Atividade</Text>
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    value={ramo}
                    onChangeText={text => setRamo(text)}
                    editable={isRamoEditing}
                />
                {isRamoEditing ? (
                    <TouchableOpacity onPress={() => setRamoEditing(false)}>
                        <Text style={styles.editText}>Salvar</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity onPress={handleEditRamo}>
                        <Text style={styles.editText}>Editar</Text>
                    </TouchableOpacity>
                )}
                {isRamoEditing && (
                    <TouchableOpacity onPress={() => handleCancelRamo(false)}>
                        <Text style={styles.removeText}>Cancelar</Text>
                    </TouchableOpacity>
                )}
            </View>

            <View>
                <Text style={styles.textCadastrado}>
                    <Text onPress={handleIr} style={styles.textCadastradoRed}>Voltar</Text>
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: '#f0f0f0',
    },
    logo: {
        width: 250,
        height: 250,
        marginBottom: 20,
        alignSelf: 'center'
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
});
export default MainMenu;