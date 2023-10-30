import DefaultLogo from '../assets/Imagens/Logos/LogoPadrao.png'


export function selectLogo(name) {
    const images = {
        default: DefaultLogo,
    }

    return images[name]

}