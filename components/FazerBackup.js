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

const FazerBackup = () => {

    const navigation = useNavigation();

    const saveDataToFile = async (fileName, data) => {
        try {
            const backupJson = JSON.stringify(data, null, 2);
            const filePath = `${FileSystem.documentDirectory}${fileName}`;
            await FileSystem.writeAsStringAsync(filePath, backupJson, { encoding: FileSystem.EncodingType.UTF8 });

            console.log(`Dados salvos com sucesso em: ${filePath}`);
        } catch (error) {
            console.error(`Erro ao salvar dados em ${fileName}:`, error);
        }
    };

    const handleBackupAceito = async () => {
        try {
            const backupData = {};

            // Execute as consultas SQL para obter os dados das tabelas
            const estabelecimentoQuery = await new Promise((resolve) =>
                db.transaction((tx) => {
                    tx.executeSql('SELECT * FROM Estabelecimento', [], (_, { rows }) => resolve(rows._array));
                })
            );

            const servicoQuery = await new Promise((resolve) =>
                db.transaction((tx) => {
                    tx.executeSql('SELECT * FROM Servico', [], (_, { rows }) => resolve(rows._array));
                })
            );

            const agendamentoQuery = await new Promise((resolve) =>
                db.transaction((tx) => {
                    tx.executeSql('SELECT * FROM Agendamento', [], (_, { rows }) => resolve(rows._array));
                })
            );

            backupData.Estabelecimento = estabelecimentoQuery;
            backupData.Servico = servicoQuery;
            backupData.Agendamento = agendamentoQuery;

            // Adicione logs para verificar os dados antes de criar o backup
            console.log('Conteúdo dos dados antes do backup:', backupData);

            // Salve os dados no sistema de arquivos do dispositivo
            saveDataToFile('BancoLembraAiBackup.json', backupData);

            console.log('Backup criado com sucesso.');
            Alert.alert('Backup realizado com sucesso!')
        } catch (error) {
            console.error('Erro ao criar backup:', error);
        }
    };

    const handleBackup = () => {
        Alert.alert(
            'Confirmar Backup',
            'Ao confirmar essa ação, todos os seus dados cadastrados até hoje, incluindo sua empresa, logotipo, agendamentos, serão salvos no seu aparelho.',
            [
                {
                    text: 'Cancelar',
                    style: 'cancel',
                },
                {
                    text: 'Realizar backup',
                    onPress: () => {
                        handleBackupAceito();
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
                    <Text style={styles.TextoAzul}>Realizar Backup</Text>
                    <Text style={styles.cardText}>O backup, irá salvar todos os dados atuais do seu aplicativo em um arquivo e isso fará com que você possa recuperá-los em algum outro momento, podendo assim, ter a certeza que você não irá perder os seus dados caso exclua o aplicativo ou perca os seus dados por algum motivo, ou caso pretenda trocar de aparelho celular.</Text>
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={styles.buttonGreen}>
                            <Text onPress={handleBackup} style={styles.buttonText}>Fazer backup</Text>
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
export default FazerBackup