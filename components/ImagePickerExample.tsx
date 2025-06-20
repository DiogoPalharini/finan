import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text } from 'react-native-paper';
import ImagePicker from './ImagePicker';
import { COLORS } from '../src/styles/colors';
import { LAYOUT } from '../src/styles/layout';
import { TYPO } from '../src/styles/typography';

const ImagePickerExample: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | undefined>();

  const handleImageSelected = (imageUri: string) => {
    console.log('Imagem selecionada:', imageUri);
    setSelectedImage(imageUri);
    Alert.alert('Sucesso', 'Imagem selecionada com sucesso!');
  };

  const handleImageRemoved = () => {
    console.log('Imagem removida');
    setSelectedImage(undefined);
    Alert.alert('Removido', 'Imagem removida com sucesso!');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Exemplo do ImagePicker</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Componente Básico</Text>
        <ImagePicker
          onImageSelected={handleImageSelected}
          onImageRemoved={handleImageRemoved}
          currentImage={selectedImage}
          label="Selecione uma imagem"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Componente Desabilitado</Text>
        <ImagePicker
          onImageSelected={handleImageSelected}
          onImageRemoved={handleImageRemoved}
          currentImage={selectedImage}
          disabled={true}
          label="Componente desabilitado"
        />
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>Funcionalidades:</Text>
        <Text style={styles.infoText}>• Botão para adicionar foto quando não há imagem</Text>
        <Text style={styles.infoText}>• Miniatura da imagem quando há foto anexada</Text>
        <Text style={styles.infoText}>• Botão de remover foto com confirmação</Text>
        <Text style={styles.infoText}>• Modal de opções (câmera ou galeria)</Text>
        <Text style={styles.infoText}>• Loading states durante seleção</Text>
        <Text style={styles.infoText}>• Design consistente com a aplicação</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: LAYOUT.spacing.lg,
  },
  title: {
    fontSize: TYPO.size.xl,
    fontFamily: TYPO.family.bold,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: LAYOUT.spacing.xl,
  },
  section: {
    marginBottom: LAYOUT.spacing.xl,
  },
  sectionTitle: {
    fontSize: TYPO.size.lg,
    fontFamily: TYPO.family.semibold,
    color: COLORS.text,
    marginBottom: LAYOUT.spacing.md,
  },
  infoSection: {
    backgroundColor: COLORS.white,
    padding: LAYOUT.spacing.lg,
    borderRadius: 12,
    marginTop: LAYOUT.spacing.lg,
  },
  infoTitle: {
    fontSize: TYPO.size.md,
    fontFamily: TYPO.family.bold,
    color: COLORS.text,
    marginBottom: LAYOUT.spacing.sm,
  },
  infoText: {
    fontSize: TYPO.size.sm,
    fontFamily: TYPO.family.regular,
    color: COLORS.textSecondary,
    marginBottom: LAYOUT.spacing.xs,
  },
});

export default ImagePickerExample; 