import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import Avatar from './Avatar';
import { useThemeColor } from '../hooks/useThemeColor';

const AvatarExample: React.FC = () => {
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');

  const handleAvatarPress = (avatarType: string) => {
    Alert.alert(
      'Avatar Selecionado',
      `Você selecionou o avatar: ${avatarType}`,
      [{ text: 'OK' }]
    );
    setSelectedAvatar(avatarType);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor,
      padding: 20,
    },
    section: {
      marginBottom: 30,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: textColor,
      marginBottom: 15,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 20,
      gap: 15,
    },
    label: {
      fontSize: 14,
      color: textColor,
      marginLeft: 10,
      flex: 1,
    },
    description: {
      fontSize: 12,
      color: useThemeColor({}, 'secondaryText'),
      marginTop: 5,
    },
  });

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.sectionTitle}>Componente Avatar - Exemplos de Uso</Text>

      {/* Tamanhos diferentes */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>1. Diferentes Tamanhos</Text>
        
        <View style={styles.row}>
          <Avatar
            size="small"
            userName="João Silva"
            onPress={() => handleAvatarPress('small')}
          />
          <Text style={styles.label}>Small (32px)</Text>
        </View>

        <View style={styles.row}>
          <Avatar
            size="medium"
            userName="João Silva"
            onPress={() => handleAvatarPress('medium')}
          />
          <Text style={styles.label}>Medium (48px)</Text>
        </View>

        <View style={styles.row}>
          <Avatar
            size="large"
            userName="João Silva"
            onPress={() => handleAvatarPress('large')}
          />
          <Text style={styles.label}>Large (80px)</Text>
        </View>

        <View style={styles.row}>
          <Avatar
            size="custom"
            customSize={100}
            userName="João Silva"
            onPress={() => handleAvatarPress('custom')}
          />
          <Text style={styles.label}>Custom (100px)</Text>
        </View>
      </View>

      {/* Com foto */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>2. Com Foto de Perfil</Text>
        
        <View style={styles.row}>
          <Avatar
            size="medium"
            imageUri="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
            userName="João Silva"
            onPress={() => handleAvatarPress('com foto')}
          />
          <Text style={styles.label}>Com foto real</Text>
        </View>

        <View style={styles.row}>
          <Avatar
            size="medium"
            imageUri="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face"
            userName="Maria Santos"
            showEditIcon={true}
            onPress={() => handleAvatarPress('com ícone de edição')}
          />
          <Text style={styles.label}>Com ícone de edição</Text>
        </View>
      </View>

      {/* Fallback para iniciais */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>3. Fallback para Iniciais</Text>
        
        <View style={styles.row}>
          <Avatar
            size="medium"
            userName="João Silva"
            onPress={() => handleAvatarPress('iniciais JS')}
          />
          <Text style={styles.label}>João Silva → "JS"</Text>
        </View>

        <View style={styles.row}>
          <Avatar
            size="medium"
            userName="Maria"
            onPress={() => handleAvatarPress('inicial M')}
          />
          <Text style={styles.label}>Maria → "M"</Text>
        </View>

        <View style={styles.row}>
          <Avatar
            size="medium"
            userName=""
            onPress={() => handleAvatarPress('sem nome')}
          />
          <Text style={styles.label}>Sem nome → "?"</Text>
        </View>
      </View>

      {/* Badges de status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>4. Badges de Status</Text>
        
        <View style={styles.row}>
          <Avatar
            size="medium"
            userName="João Silva"
            showBadge={true}
            badgeStatus="online"
            onPress={() => handleAvatarPress('online')}
          />
          <Text style={styles.label}>Online (verde)</Text>
        </View>

        <View style={styles.row}>
          <Avatar
            size="medium"
            userName="Maria Santos"
            showBadge={true}
            badgeStatus="away"
            onPress={() => handleAvatarPress('away')}
          />
          <Text style={styles.label}>Away (laranja)</Text>
        </View>

        <View style={styles.row}>
          <Avatar
            size="medium"
            userName="Pedro Costa"
            showBadge={true}
            badgeStatus="busy"
            onPress={() => handleAvatarPress('busy')}
          />
          <Text style={styles.label}>Busy (vermelho)</Text>
        </View>

        <View style={styles.row}>
          <Avatar
            size="medium"
            userName="Ana Lima"
            showBadge={true}
            badgeStatus="offline"
            onPress={() => handleAvatarPress('offline')}
          />
          <Text style={styles.label}>Offline (cinza)</Text>
        </View>
      </View>

      {/* Estados de loading */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>5. Estados de Loading</Text>
        
        <View style={styles.row}>
          <Avatar
            size="medium"
            userName="João Silva"
            loading={true}
          />
          <Text style={styles.label}>Loading ativo</Text>
        </View>

        <View style={styles.row}>
          <Avatar
            size="medium"
            imageUri="https://invalid-url.com/image.jpg"
            userName="João Silva"
            onPress={() => handleAvatarPress('erro de imagem')}
          />
          <Text style={styles.label}>Erro de carregamento → fallback</Text>
        </View>
      </View>

      {/* Cores customizadas */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>6. Cores Customizadas</Text>
        
        <View style={styles.row}>
          <Avatar
            size="medium"
            userName="João Silva"
            backgroundColor="#FF6B6B"
            textColor="white"
            onPress={() => handleAvatarPress('cores customizadas')}
          />
          <Text style={styles.label}>Fundo vermelho, texto branco</Text>
        </View>

        <View style={styles.row}>
          <Avatar
            size="medium"
            userName="Maria Santos"
            backgroundColor="#4ECDC4"
            textColor="white"
            badgeColor="#FFE66D"
            showBadge={true}
            onPress={() => handleAvatarPress('badge customizado')}
          />
          <Text style={styles.label}>Badge amarelo customizado</Text>
        </View>
      </View>

      {/* Sem interação */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>7. Sem Interação</Text>
        
        <View style={styles.row}>
          <Avatar
            size="medium"
            userName="João Silva"
          />
          <Text style={styles.label}>Apenas visualização</Text>
        </View>
      </View>

      {/* Informações de uso */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Como Usar</Text>
        
        <Text style={styles.description}>
          • Importe: import Avatar from './components/Avatar'
        </Text>
        <Text style={styles.description}>
          • Props principais: size, imageUri, userName, onPress
        </Text>
        <Text style={styles.description}>
          • Tamanhos: 'small' (32px), 'medium' (48px), 'large' (80px), 'custom'
        </Text>
        <Text style={styles.description}>
          • Badges: showBadge, badgeStatus ('online', 'offline', 'away', 'busy')
        </Text>
        <Text style={styles.description}>
          • Edição: showEditIcon, onPress para ações
        </Text>
        <Text style={styles.description}>
          • Acessibilidade: Suporte completo a screen readers
        </Text>
      </View>
    </ScrollView>
  );
};

export default AvatarExample; 