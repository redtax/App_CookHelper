import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
  Alert,
  Clipboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation';
import { exportRecipeToText, parseRecipeText } from '../parseRecipe';
import { useApp } from '../context';

type RecipeDetailRouteProp = RouteProp<RootStackParamList, 'RecipeDetail'>;
type RecipeDetailNavigationProp = NativeStackNavigationProp<RootStackParamList, 'RecipeDetail'>;

const RecipeDetailScreen: React.FC = () => {
  const navigation = useNavigation<RecipeDetailNavigationProp>();
  const route = useRoute<RecipeDetailRouteProp>();
  const { recipe } = route.params;
  const { updateRecipe } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [exportText, setExportText] = useState('');
  const [importText, setImportText] = useState('');

  const totalSteps = recipe.preparationSteps.length + recipe.cookingSteps.length;

  const handleEdit = () => {
    setShowModal(false);
    navigation.navigate('RecipeEdit', { recipe });
  };

  const handleExport = () => {
    setShowModal(false);
    const text = exportRecipeToText(recipe);
    setExportText(text);
    setShowExportModal(true);
  };

  const copyExportText = async () => {
    await Clipboard.setString(exportText);
    Alert.alert('成功', '已复制到剪贴板！');
  };

  const handleImport = () => {
    setShowModal(false);
    setImportText('');
    setShowImportModal(true);
  };

  const confirmImport = () => {
    if (!importText.trim()) {
      Alert.alert('错误', '请粘贴菜谱文本！');
      return;
    }

    try {
      const parsedRecipe = parseRecipeText(importText);
      const updatedRecipe = {
        ...parsedRecipe,
        id: recipe.id, // 保持原有的 id
        imageUrl: recipe.imageUrl, // 保持原有的图片
      };
      updateRecipe(updatedRecipe);
      setShowImportModal(false);
      Alert.alert('成功', '菜谱已更新！', [
        { text: '确定', onPress: () => navigation.navigate('RecipeDetail', { recipe: updatedRecipe }) }
      ]);
    } catch (error) {
      Alert.alert('错误', '解析菜谱失败，请检查格式！');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {recipe.imageUrl && (
          <Image source={{ uri: recipe.imageUrl }} style={styles.recipeImage} resizeMode="cover" />
        )}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 简介</Text>
          <Text style={styles.description}>{recipe.description || '暂无简介'}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⏱️ 基本信息</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>准备时间</Text>
              <Text style={styles.infoValue}>{recipe.prepTime}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>烹饪时间</Text>
              <Text style={styles.infoValue}>{recipe.cookTime}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>份量</Text>
              <Text style={styles.infoValue}>{recipe.servings}人份</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>难度</Text>
              <Text style={styles.infoValue}>
                {recipe.difficulty === 'easy' ? '⭐ 简单' : recipe.difficulty === 'medium' ? '⭐⭐ 中等' : '⭐⭐⭐ 困难'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🥗 食材清单 ({recipe.ingredients.length}项)</Text>
          {recipe.ingredients.map((ingredient, index) => (
            <View key={index} style={styles.ingredientItem}>
              <Text style={styles.ingredientName}>{ingredient.name}</Text>
              <Text style={styles.ingredientAmount}>
                {ingredient.amount}{ingredient.unit || ''}
                {ingredient.notes && <Text style={styles.ingredientNotes}> ({ingredient.notes})</Text>}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📝 流程概览</Text>
          <View style={styles.overviewContainer}>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewNumber}>{recipe.preparationSteps.length}</Text>
              <Text style={styles.overviewLabel}>备料步骤</Text>
            </View>
            <View style={styles.overviewDivider} />
            <View style={styles.overviewItem}>
              <Text style={styles.overviewNumber}>{recipe.cookingSteps.length}</Text>
              <Text style={styles.overviewLabel}>炒制步骤</Text>
            </View>
            <View style={styles.overviewDivider} />
            <View style={styles.overviewItem}>
              <Text style={styles.overviewNumber}>{totalSteps}</Text>
              <Text style={styles.overviewLabel}>总步骤</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏷️ 标签</Text>
          <View style={styles.tagContainer}>
            <View style={styles.categoryTag}>
              <Text style={styles.categoryTagText}>{recipe.category}</Text>
            </View>
            {recipe.tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={() => setShowModal(true)}
          >
            <Text style={styles.secondaryButtonText}>✏️ 完善菜谱</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={() => navigation.navigate('PreparationIngredients', { recipe })}
          >
            <Text style={styles.buttonText}>开始备料 →</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        visible={showModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>完善菜谱</Text>
            <TouchableOpacity style={styles.modalOption} onPress={handleEdit}>
              <Text style={styles.modalOptionText}>📝 在线编辑</Text>
              <Text style={styles.modalOptionDesc}>直接在手机上编辑修改</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalOption} onPress={handleExport}>
              <Text style={styles.modalOptionText}>📤 一键导出</Text>
              <Text style={styles.modalOptionDesc}>导出为纯文本文件编辑</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalOption} onPress={handleImport}>
              <Text style={styles.modalOptionText}>📥 一键导入</Text>
              <Text style={styles.modalOptionDesc}>导入编辑好的纯文本文件</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowModal(false)}
            >
              <Text style={styles.modalCloseText}>取消</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 导出模态框 */}
      <Modal
        visible={showExportModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowExportModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, styles.largeModalContent]}>
            <Text style={styles.modalTitle}>导出菜谱</Text>
            <ScrollView style={styles.exportTextContainer}>
              <Text style={styles.exportText} selectable={true}>{exportText}</Text>
            </ScrollView>
            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => setShowExportModal(false)}
              >
                <Text style={styles.modalCancelButtonText}>关闭</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalSaveButton]}
                onPress={copyExportText}
              >
                <Text style={styles.modalSaveButtonText}>复制文本</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 导入模态框 */}
      <Modal
        visible={showImportModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowImportModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, styles.largeModalContent]}>
            <Text style={styles.modalTitle}>导入菜谱</Text>
            <TextInput
              style={styles.importTextInput}
              value={importText}
              onChangeText={setImportText}
              placeholder="请粘贴菜谱文本..."
              multiline
              numberOfLines={10}
              autoFocus
            />
            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => setShowImportModal(false)}
              >
                <Text style={styles.modalCancelButtonText}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalSaveButton]}
                onPress={confirmImport}
              >
                <Text style={styles.modalSaveButtonText}>导入</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  recipeImage: {
    width: '100%',
    height: 220,
    resizeMode: 'cover',
  },
  section: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  infoItem: {
    width: '50%',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 13,
    color: '#999',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  ingredientItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  ingredientName: {
    fontSize: 15,
    color: '#333',
  },
  ingredientAmount: {
    fontSize: 15,
    color: '#f4511e',
    fontWeight: '500',
  },
  ingredientNotes: {
    fontSize: 13,
    color: '#999',
    fontWeight: 'normal',
  },
  overviewContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 16,
  },
  overviewItem: {
    alignItems: 'center',
  },
  overviewNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#f4511e',
  },
  overviewLabel: {
    fontSize: 13,
    color: '#999',
    marginTop: 4,
  },
  overviewDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#eee',
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  categoryTag: {
    backgroundColor: '#f4511e',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  categoryTagText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  tag: {
    backgroundColor: '#fff3e0',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    color: '#f4511e',
    fontSize: 14,
  },
  buttonContainer: {
    padding: 16,
    paddingBottom: 32,
    gap: 12,
  },
  button: {
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#f4511e',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#f4511e',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  secondaryButtonText: {
    color: '#f4511e',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalOption: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalOptionText: {
    fontSize: 17,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  modalOptionDesc: {
    fontSize: 13,
    color: '#999',
  },
  modalCloseButton: {
    marginTop: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 15,
    color: '#999',
  },
  largeModalContent: {
    maxHeight: '80%',
  },
  exportTextContainer: {
    maxHeight: 300,
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  exportText: {
    fontSize: 13,
    lineHeight: 20,
    color: '#333',
  },
  importTextInput: {
    minHeight: 200,
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    fontSize: 15,
    color: '#333',
    textAlignVertical: 'top',
  },
  modalButtonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCancelButton: {
    backgroundColor: '#f5f5f5',
  },
  modalSaveButton: {
    backgroundColor: '#f4511e',
  },
  modalCancelButtonText: {
    color: '#666',
    fontSize: 15,
    fontWeight: '500',
  },
  modalSaveButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
});

export default RecipeDetailScreen;
