import React from 'react';
import { View, TouchableOpacity, Image, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const NavBar = () => {
    const navigation = useNavigation();

    return (
        <View style={styles.container}>
            <View style={styles.navBar}>
                <TouchableOpacity style={styles.navButton}>
                    <Ionicons name="menu" size={24} color="black" />
                </TouchableOpacity>
                <View style={styles.navCenter}>
                    <Text style={styles.navText}>Farm Fast</Text>
                </View>
                <TouchableOpacity onPress={() => navigation.navigate('Pesquisar')} style={styles.navButton}>
                    <Ionicons name="search" size={24} color="black" />
                </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.contentContainer}>
                {/* Seu conteúdo rolável aqui */}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    navBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#a7ddb8',
        paddingVertical: 35,
        paddingHorizontal: 20,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 2,
    },
    navButton: {
        padding: 10,
    },
    navCenter: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    navImage: {
        width: 30,
        height: 30,
        marginRight: 5,
    },
    navText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    contentContainer: {
        paddingTop: 130, // Ajuste conforme necessário para evitar a sobreposição do NavBar
    },
});

export default NavBar;
