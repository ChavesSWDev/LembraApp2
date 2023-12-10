import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Style from '../assets/styles';
import { useNavigation } from '@react-navigation/native';
import { StyleSheet } from 'react-native';

const NavBar = () => {
    const navigation = useNavigation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuAnimation = useRef(new Animated.Value(0)).current;
    const [zIndex, setZIndex] = useState(2);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
        setZIndex(isMenuOpen ? 2 : 3);

        Animated.timing(menuAnimation, {
            toValue: isMenuOpen ? 0 : 1,
            duration: 300,
            easing: Easing.ease,
            useNativeDriver: true,
        }).start(() => {
            console.log('Animation completed. isMenuOpen:', isMenuOpen);
        });
    };

    const translateX = menuAnimation.interpolate({
        inputRange: [0, 0],
        outputRange: [0, 0],
    });

    const goToMainMenu = () => {
        navigation.navigate('MainMenu');
        if(isMenuOpen) {
            setIsMenuOpen(!isMenuOpen)
        }
    };
    const goToMeuPerfil = () => {
        navigation.navigate('MeuPerfil');
        setIsMenuOpen(!isMenuOpen)
    }
    const goToOpcoes = () => {
        navigation.navigate('Opcoes');
        setIsMenuOpen(!isMenuOpen)
    }
    const goToRestaurarSistema = () => {
        navigation.navigate('RestaurarSistema');
        setIsMenuOpen(!isMenuOpen)
    }
    const goToFazerBackup = () => {
        navigation.navigate('FazerBackup');
        setIsMenuOpen(!isMenuOpen)
    }
    const goToRestaurarBackup = () => {
        navigation.navigate('RestaurarBackup');
        setIsMenuOpen(!isMenuOpen)
    }
    const goToColaboradores = () => {
        navigation.navigate('Colaboradores');
        setIsMenuOpen(!isMenuOpen)
    }

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.navBar, { transform: [{ translateX }], zIndex }]}>
                <TouchableOpacity style={styles.navButton} onPress={toggleMenu}>
                    <Ionicons name="menu" size={24} color="black" />
                </TouchableOpacity>
                <View style={styles.navCenter}>
                    <TouchableOpacity onPress={goToMainMenu}>
                        <Text style={styles.navText}>LembrAi</Text>
                    </TouchableOpacity>
                </View>
            </Animated.View>
            {isMenuOpen && (
                <Animated.View style={[styles.menu, { transform: [{ translateX }] }]}>
                    <TouchableOpacity style={styles.menuOption} onPress={goToMainMenu}>
                        <Text>Home</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.menuOption} onPress={goToMeuPerfil}>
                        <Text>Meu Perfil</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.menuOption} onPress={() => console.log('Temas')}>
                        <Text>Temas</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.menuOption} onPress={goToColaboradores}>
                        <Text>Colaboradores</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.menuOption} onPress={goToOpcoes}>
                        <Text>Pesquisar agendamentos</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.menuOption} onPress={goToFazerBackup}>
                        <Text>Fazer backup</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.menuOption} onPress={goToRestaurarBackup}>
                        <Text>Restaurar backup</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.menuOption} onPress={goToRestaurarSistema}>
                        <Text>Restaurar sistema</Text>
                    </TouchableOpacity>
                </Animated.View>
            )}
            <ScrollView contentContainerStyle={styles.contentContainer}>
                {/* Seu conteúdo rolável aqui */}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginBottom: 110,
        zIndex: 1
    },
    navBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: Style.color,
        paddingVertical: 35,
        paddingHorizontal: 20,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        borderBottomWidth: 4,
        borderBlockColor: 'black'
    },
    navButton: {
        padding: 10,
    },
    navCenter: {
        flex: 1,
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
        marginTop: 80,
        paddingHorizontal: 20,
    },
    menu: {
        position: 'absolute',
        top: 80,
        left: 0,
        right: 0,
        backgroundColor: '#fff', // Cor de fundo do menu
        paddingTop: 40, // Altura do navBar
        zIndex: 1,
    },
    menuOption: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        paddingTop: 20,
        paddingBottom: 20,
        alignContent: 'center',
        textAlign: 'left',
        alignItems: 'center',
        borderBottomWidth: 3,
        borderBottomColor: 'black',
        borderLeftWidth: 3,
        borderLeftColor: 'black',
        borderRightWidth: 3,
        borderRightColor: 'black',
    },
});

export default NavBar;
