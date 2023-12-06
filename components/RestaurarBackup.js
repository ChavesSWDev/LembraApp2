import React from 'react'
import NavBar from './NavBar'
import { ScrollView } from 'react-native'
import { StyleSheet } from 'react-native'
import { View } from 'react-native'
import { Text } from 'react-native'
import { TouchableOpacity } from 'react-native'
const db = SQLite.openDatabase('BancoLembraAi.db');
import * as Style from '../assets/styles';
import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system';
import { useNavigation } from '@react-navigation/native'
import { Alert } from 'react-native'

const RestaurarBackup = () => {

    const navigation = useNavigation();

    const insertData = async (tableName, data) => {
        try {
            return await new Promise(async (resolve, reject) => {
                await db.transaction(
                    async (tx) => {
                        // Verifique os dados antes da inserção
                        console.log(`Dados a serem inseridos na tabela ${tableName}:`, data);

                        if (tableName === "Agendamento") {
                            tx.executeSql(`DELETE FROM ${tableName}`, [], (_, deleteResult) => {
                                console.log(`Exclusão bem-sucedida na tabela ${tableName}: ${deleteResult.rowsAffected} linhas afetadas`);
                            })
                        }

                        // Itera sobre os novos dados
                        await Promise.all(
                            data.map(async (row) =>
                                new Promise((resolve) => {
                                    // Verifica se já existe um registro com o mesmo ID
                                    tx.executeSql(
                                        `SELECT * FROM ${tableName} WHERE ID = ?`,
                                        [row.ID],
                                        (_, result) => {
                                            if (result.rows.length > 0) {
                                                // Se existir, atualiza os dados
                                                tx.executeSql(
                                                    `UPDATE ${tableName} SET ${Object.keys(row)
                                                        .map((key) => `${key} = ?`)
                                                        .join(', ')} WHERE ID = ?`,
                                                    [...Object.values(row), row.ID],
                                                    (_, updateResult) => {
                                                        console.log(`Atualização bem-sucedida na tabela ${tableName}: ${updateResult.rowsAffected} linhas afetadas`);
                                                        resolve(updateResult);
                                                    }
                                                );
                                            } else {
                                                // Se não existir, insere um novo registro
                                                tx.executeSql(
                                                    `INSERT INTO ${tableName} (${Object.keys(row).join(', ')}) VALUES (${Object.values(row)
                                                        .map(() => '?')
                                                        .join(', ')})`,
                                                    Object.values(row),
                                                    (_, insertResult) => {
                                                        console.log(`Inserção bem-sucedida na tabela ${tableName}: ${insertResult.rowsAffected} linhas afetadas`);
                                                        resolve(insertResult);
                                                    }
                                                );
                                            }
                                        }
                                    );
                                })
                            )
                        );

                        resolve('Inserção bem-sucedida');
                    },
                    (error) => {
                        console.error(`Erro na transação: ${error}`);
                        reject(`Erro na transação: ${error}`);
                    }
                );
            });
        } catch (error) {
            console.error(`Erro durante a inserção em ${tableName}:`, error);
            throw error;
        }
    };

    const restoreBackup = () => {
        return new Promise(async (resolve, reject) => {
            try {
                const fileName = 'BancoLembraAiBackup.json';
                const filePath = `${FileSystem.documentDirectory}${fileName}`;

                // Lê os dados do arquivo de backup usando o Expo FileSystem
                const backupJson = await FileSystem.readAsStringAsync(filePath, { encoding: FileSystem.EncodingType.UTF8 });

                // Adicione um log para verificar o conteúdo do backup durante a restauração
                console.log('Conteúdo do backup durante a restauração:', backupJson);

                // Converte o JSON de backup de volta para objetos
                const backupData = JSON.parse(backupJson);

                // Verifica se os dados de Estabelecimento não são nulos antes de inseri-los no banco de dados
                if (backupData.Estabelecimento !== null) {
                    console.log('Substituindo Estabelecimento:', backupData.Estabelecimento);
                    await insertData('Estabelecimento', backupData.Estabelecimento);
                }

                // Verifica se os dados de Servico não são nulos antes de inseri-los no banco de dados
                if (backupData.Servico !== null) {
                    console.log('Substituindo Servico:', backupData.Servico);
                    await insertData('Servico', backupData.Servico);
                }

                // Verifica se os dados de Agendamento não são nulos antes de inseri-los no banco de dados
                if (backupData.Agendamento !== null) {
                    console.log('Substituindo Agendamento:', backupData.Agendamento);
                    await insertData('Agendamento', backupData.Agendamento);
                }
                Alert.alert('Backup restaurado com sucesso!')
                console.log('Restauração concluída com sucesso.');
                resolve();
            } catch (error) {
                console.error('Erro ao restaurar backup:', error);
                reject(error);
            }
        });
    };

    const handleBackup = () => {
        Alert.alert(
            'Confirmar Backup',
            'Ao confirmar essa ação, todos os seus dados cadastrados até hoje, incluindo sua empresa, logotipo, agendamentos, serão substituídos pelos dados do backup.',
            [
                {
                    text: 'Cancelar',
                    style: 'cancel',
                },
                {
                    text: 'Realizar backup',
                    onPress: () => {
                        restoreBackup();
                    },
                    style: 'destructive',
                },
            ],
            { cancelable: false }
        );
    }

    const goToMenu = () => {
        navigation.navigate('MainMenu');
    }

    return (
        <>
            <NavBar />
            <ScrollView>
                <View style={styles.container}>
                    <Text style={styles.TextoAzul}>Restaurar Backup</Text>
                    <Text style={styles.cardText}>Essa ação irá fazer com que todos os dados cadastrados no seu aparelho neste momento, sejam substituídos pelos dados que estão no backup.</Text>
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={styles.buttonGreen}>
                            <Text onPress={handleBackup} style={styles.buttonText}>Restaurar backup</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.buttonGray}>
                            <Text style={styles.buttonText} onPress={goToMenu}>Voltar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </>
    )
}
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
    buttonGray: {
        backgroundColor: 'gray',
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
        width: '50%',
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
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 30,
        marginTop: 10,
        alignItems: 'center', // Centraliza os elementos horizontalmente
    },
    cardText: {
        fontSize: 16,
        color: Style.color2,
        textAlign: 'center'
    },
});
export default RestaurarBackup