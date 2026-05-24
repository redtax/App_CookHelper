import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import OptimizedImage from '../OptimizedImage';

interface ImagePickerButtonProps {
  imageUri: string | undefined;
  onImagePicked: (uri: string | undefined) => void;
}

const ImagePickerButton: React.FC<ImagePickerButtonProps> = ({ imageUri, onImagePicked }) => {
  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('权限提示', '需要访问相册权限才能选择图片');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets.length > 0) {
      try {
        const pickedUri = result.assets[0].uri;
        const fileName = `recipe_img_${Date.now()}.jpg`;
        const destUri = FileSystem.documentDirectory + fileName;

        // Copy the image to app's document directory
        await FileSystem.copyAsync({
          from: pickedUri,
          to: destUri,
        });

        onImagePicked(destUri);
      } catch (error) {
        console.error('Failed to save image:', error);
        Alert.alert('错误', '图片保存失败，请重试');
      }
    }
  };

  const handleRemoveImage = () => {
    Alert.alert('移除图片', '确定要移除当前成品图吗？', [
      { text: '取消', style: 'cancel' },
      { text: '移除', style: 'destructive', onPress: () => onImagePicked(undefined) },
    ]);
  };

  if (imageUri) {
    return (
      <View style={styles.container}>
        <OptimizedImage source={{ uri: imageUri }} style={styles.preview} resizeMode="cover" />
        <View style={styles.imageActions}>
          <TouchableOpacity style={styles.changeButton} onPress={handlePickImage}>
            <Text style={styles.changeButtonText}>更换图片</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.removeButton} onPress={handleRemoveImage}>
            <Text style={styles.removeButtonText}>移除</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <TouchableOpacity style={styles.pickButton} onPress={handlePickImage}>
      <Text style={styles.pickIcon}>📷</Text>
      <Text style={styles.pickText}>上传成品图</Text>
      <Text style={styles.pickHint}>从相册选择（可选）</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  preview: {
    width: '100%',
    height: 200,
    borderRadius: 10,
  },
  imageActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginTop: 10,
  },
  changeButton: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f4511e',
  },
  changeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  removeButton: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#ffebee',
  },
  removeButtonText: {
    color: '#d32f2f',
    fontSize: 14,
    fontWeight: '500',
  },
  pickButton: {
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    borderRadius: 10,
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fafafa',
    marginBottom: 16,
  },
  pickIcon: {
    fontSize: 32,
    marginBottom: 6,
  },
  pickText: {
    fontSize: 15,
    color: '#666',
    fontWeight: '500',
    marginBottom: 2,
  },
  pickHint: {
    fontSize: 12,
    color: '#aaa',
  },
});

export default ImagePickerButton;
