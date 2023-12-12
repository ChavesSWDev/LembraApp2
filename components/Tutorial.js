import React, { useState } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { styles } from "./Notas";
import Svg, { Image as SvgImage } from "react-native-svg";
import * as Style from '../assets/styles';
import Icon from "react-native-vector-icons/FontAwesome"
import { useNavigation } from "@react-navigation/native";

const Tutorial = () => {
    const navigation = useNavigation();

    const [currentIndex, setCurrentIndex] = useState(0);
    const [showConfirmation, setShowConfirmation] = useState(false); // Estado para controlar a exibição da confirmação
    const images = [
        require("../assets/Imagens/Tutorial/tuto1.jpg"),
        require("../assets/Imagens/Tutorial/tuto2real.jpg"), 
        require("../assets/Imagens/Tutorial/tuto6.jpg"),
        require("../assets/Imagens/Tutorial/tuto7.jpg"),
        require("../assets/Imagens/Tutorial/tuto8.jpg"),
        require("../assets/Imagens/Tutorial/tuto2.jpg"), 
        require("../assets/Imagens/Tutorial/tuto3.jpg"),
        require("../assets/Imagens/Tutorial/tuto4.jpg"),
        require("../assets/Imagens/Tutorial/tuto5.jpg"),
        require("../assets/Imagens/Tutorial/tuto9.jpg"),
        require("../assets/Imagens/Tutorial/tuto13.jpg"),
        require("../assets/Imagens/Tutorial/tuto14.jpg"),
        require("../assets/Imagens/Tutorial/tuto10.jpg"),
        require("../assets/Imagens/Tutorial/tuto11.jpg"),
        require("../assets/Imagens/Tutorial/tuto12.jpg"),
        
        require("../assets/Imagens/BoasVindas/BemVindo4.png"),
    ];

    const nextImage = () => {
        if (currentIndex < images.length - 1) {
            setCurrentIndex(currentIndex + 1);
            if (currentIndex === 14) {
                setShowConfirmation(true); // Mostrar confirmação quando o usuário apertar "CONTINUAR" na terceira imagem
            }
        } else {
            setShowConfirmation(true); // Mostrar confirmação na quarta imagem também
        }
    };

    const prevImage = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
            setShowConfirmation(false); // Esconder a confirmação ao voltar para imagens anteriores
        }
    };

    const handleConfirmation = (choice) => {
        if (choice === "SIM") {
            // Navegar para a próxima tela de tutorial ou fazer ação correspondente
            navigation.navigate('CadastroInicial');
        } else {
            // Navegar para a tela 'Notas' quando escolher "NÃO"
            navigation.navigate('CadastroInicial'); 
        }
    };

    return (
        <View style={styles.notasContainer}>
            <View style={{ alignItems: 'center' }}>
                <Svg width="100%" height="500">
                    <SvgImage
                        href={images[currentIndex]}
                        width="100%"
                        height="100%"
                    />
                </Svg>
            </View>

            {showConfirmation ? ( // Renderizar os botões de confirmação quando showConfirmation for true
                <View style={customStyles.buttonContainer}>
                    <TouchableOpacity
                        style={customStyles.button}
                        onPress={() => handleConfirmation("SIM")}
                    >
                        <Text style={customStyles.buttonText}>Tutorial finalizado !</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <View style={customStyles.buttonContainer}>
                    <TouchableOpacity
                        style={customStyles.button}
                        onPress={nextImage}
                    >
                        <Text style={customStyles.buttonText}>
                            {currentIndex === 8 ? "CONTINUAR" : "CONTINUAR"}{" "}
                            {currentIndex === 8 ? (
                                <Icon name="arrow-right" size={16} color="white" />
                            ) : (
                                <Icon name="arrow-right" size={16} color={styles.color} />
                            )}
                        </Text>
                    </TouchableOpacity>

                    {currentIndex > 0 && (
                        <TouchableOpacity
                            onPress={prevImage}
                        >
                            <Text style={customStyles.buttonContainer}>
                                VOLTAR 
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            )}
        </View>
    );
};

const customStyles = StyleSheet.create({
    buttonContainer: {
        alignItems: 'center',
        marginTop: 30
    },
    button: {
        backgroundColor: Style.color,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 10,
        marginHorizontal: 10,
        marginBottom: 10
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default Tutorial;
