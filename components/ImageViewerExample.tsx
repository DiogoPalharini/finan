import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../src/styles/colors';
import { LAYOUT } from '../src/styles/layout';
import { TYPO } from '../src/styles/typography';
import ImageViewerModal from './ImageViewerModal';

const ImageViewerExample: React.FC = () => {
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  
  // Exemplo de URI de imagem (substitua por uma URI real)
  const exampleImageUri = 'https://via.placeholder.com/400x600/007AFF/FFFFFF?text=Exemplo+de+Recibo';

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Visualizador de Imagem</Text>
      <Text style={styles.subtitle}>
        Toque no botão abaixo para abrir o visualizador de imagem em tela cheia
      </Text>
      
      <TouchableOpacity
        style={styles.openButton}
        onPress={() => setImageViewerVisible(true)}
        activeOpacity={0.7}
      >
        <Ionicons name="image-outline" size={24} color={COLORS.white} />
        <Text style={styles.buttonText}>Abrir Visualizador</Text>
      </TouchableOpacity>

      <ImageViewerModal
        visible={imageViewerVisible}
        imageUri={exampleImageUri}
        onClose={() => setImageViewerVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: LAYOUT.spacing.lg,
    backgroundColor: COLORS.background,
  },
  title: {
    fontSize: TYPO.size.xl,
    fontFamily: TYPO.family.bold,
    color: COLORS.text,
    marginBottom: LAYOUT.spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: TYPO.size.md,
    fontFamily: TYPO.family.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: LAYOUT.spacing.xl,
    lineHeight: 24,
  },
  openButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: LAYOUT.spacing.lg,
    paddingVertical: LAYOUT.spacing.md,
    borderRadius: LAYOUT.radius.medium,
    elevation: 2,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: TYPO.size.md,
    fontFamily: TYPO.family.medium,
    marginLeft: LAYOUT.spacing.sm,
  },
});

export default ImageViewerExample; 