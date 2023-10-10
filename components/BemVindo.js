import React, { useState } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { styles } from "./Notas";
import Svg, { Image as SvgImage } from "react-native-svg";
import * as Style from '../assets/styles';
import Icon from "react-native-vector-icons/FontAwesome"
import { useNavigation } from "@react-navigation/native";
import { ScrollView } from "react-native";

const BemVindo = () => {
    const navigation = useNavigation();

    const [currentIndex, setCurrentIndex] = useState(0);
    const [showConfirmation, setShowConfirmation] = useState(false); // Estado para controlar a exibição da confirmação
    const images = [
        require("../assets/Imagens/BoasVindas/BemVindo1.png"),
        require("../assets/Imagens/BoasVindas/BemVindo2.png"),
        require("../assets/Imagens/BoasVindas/BemVindo3.png"),
        require("../assets/Imagens/BoasVindas/BemVindo4.png"),
    ];
    const texts = [
        "Bem-vindo ao Lembra AI!",
        "O seu mais novo App favorito para anotações",
        "Desbrave todas as funcionalidades disponíveis agora mesmo!",
        "Você gostaria de fazer o Tutorial?"
    ];

    const nextImage = () => {
        if (currentIndex < images.length - 1) {
            setCurrentIndex(currentIndex + 1);
            if (currentIndex === 2) {
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
            navigation.navigate('Tutorial');
        } else {
            // Navegar para a tela 'Notas' quando escolher "NÃO"
            navigation.navigate('CadastroInicial');
        }
    };

    return (
        <ScrollView style={{ flex: 1 }}>
            <View style={styles.notasContainer}>
                <View style={{ alignItems: 'center' }}>
                    <Svg width="500" height="500">
                        <SvgImage
                            href={images[currentIndex]}
                            width="100%"
                            height="100%"
                        />
                    </Svg>
                </View>
                <Text style={styles.headingSmall}>{texts[currentIndex]}</Text>

                {showConfirmation ? ( // Renderizar os botões de confirmação quando showConfirmation for true
                    <View style={customStyles.buttonContainer}>
                        <TouchableOpacity
                            style={customStyles.button}
                            onPress={() => handleConfirmation("SIM")}
                        >
                            <Text style={customStyles.buttonText}>SIM</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={customStyles.button}
                            onPress={() => handleConfirmation("NÃO")}
                        >
                            <Text style={customStyles.buttonText}>NÃO</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={customStyles.buttonContainer}>
                        <TouchableOpacity
                            style={customStyles.button}
                            onPress={nextImage}
                        >
                            <Text style={customStyles.buttonText}>
                                {currentIndex === 2 ? "CONTINUAR" : "CONTINUAR"}{" "}
                                {currentIndex === 2 ? (
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
        </ScrollView>
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

export default BemVindo;
