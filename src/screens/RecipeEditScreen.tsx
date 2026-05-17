import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation';
import { Recipe, Ingredient, PreparationStep, CookingStep } from '../types';
import { useApp } from '../context';

type RecipeEditRouteProp = RouteProp<RootStackParamList, 'RecipeEdit'>;
type RecipeEditNavigationProp = NativeStackNavigationProp<RootStackParamList, 'RecipeEdit'>;

const RecipeEditScreen: React.FC = () => {
  const navigation = useNavigation<RecipeEditNavigationProp>();
  const route = useRoute<RecipeEditRouteProp>();
  const { recipe: initialRecipe, isNew } = route.params;
  const { updateRecipe, recipes } = useApp();

  const [name, setName] = useState(initialRecipe.name);
  const [description, setDescription] = useState(initialRecipe.description || '');
  const [category, setCategory] = useState(initialRecipe.category);
  const [tags, setTags] = useState<string[]>(initialRecipe.tags);
  const [servings, setServings] = useState(initialRecipe.servings.toString());
  const [prepTime, setPrepTime] = useState(initialRecipe.prepTime);
  const [cookTime, setCookTime] = useState(initialRecipe.cookTime);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>(initialRecipe.difficulty);
  const [ingredients, setIngredients] = useState<Ingredient[]>(initialRecipe.ingredients);
  const [preparationSteps, setPreparationSteps] = useState<PreparationStep[]>(initialRecipe.preparationSteps);
  const [cookingSteps, setCookingSteps] = useState<CookingStep[]>(initialRecipe.cookingSteps);

  const [showNewTag, setShowNewTag] = useState(false);
  const [newTagName, setNewTagName] = useState('');

  const allCategories = Array.from(new Set(recipes.map(r => r.category)));
  const allTags = Array.from(new Set(recipes.flatMap(r => r.tags)));

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('错误', '请输入菜谱名称');
      return;
    }

    const updatedRecipe: Recipe = {
      ...initialRecipe,
      name: name.trim(),
      description: description.trim(),
      category: category.trim(),
      tags,
      servings: parseInt(servings) || 1,
      prepTime: prepTime.trim(),
      cookTime: cookTime.trim(),
      difficulty,
      ingredients,
      preparationSteps,
      cookingSteps,
    };

    await updateRecipe(updatedRecipe);
    navigation.goBack();
  };

  const addIngredient = () => {
    setIngredients([...ingredients, { name: '', amount: '', unit: '', notes: '' }]);
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const updateIngredient = (index: number, field: keyof Ingredient, value: string) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = { ...newIngredients[index], [field]: value };
    setIngredients(newIngredients);
  };

  const addPreparationStep = () => {
    setPreparationSteps([...preparationSteps, { id: Date.now().toString(), description: '', tips: '' }]);
  };

  const removePreparationStep = (index: number) => {
    setPreparationSteps(preparationSteps.filter((_, i) => i !== index));
  };

  const updatePreparationStep = (index: number, field: keyof PreparationStep, value: string) => {
    const newSteps = [...preparationSteps];
    newSteps[index] = { ...newSteps[index], [field]: value };
    setPreparationSteps(newSteps);
  };

  const addCookingStep = () => {
    setCookingSteps([...cookingSteps, { id: Date.now().toString(), instruction: '', duration: '', tips: '' }]);
  };

  const removeCookingStep = (index: number) => {
    setCookingSteps(cookingSteps.filter((_, i) => i !== index));
  };

  const updateCookingStep = (index: number, field: keyof CookingStep, value: string) => {
    const newSteps = [...cookingSteps];
    newSteps[index] = { ...newSteps[index], [field]: value };
    setCookingSteps(newSteps);
  };

  const toggleTag = (tag: string) => {
    if (tags.includes(tag)) {
      setTags(tags.filter(t => t !== tag));
    } else {
      setTags([...tags, tag]);
    }
  };

  const addCustomTag = () => {
    if (newTagName.trim() && !tags.includes(newTagName.trim())) {
      setTags([...tags, newTagName.trim()]);
    }
    setShowNewTag(false);
    setNewTagName('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 基本信息</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>菜谱名称</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="请输入菜谱名称"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>菜谱描述</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="请输入菜谱描述"
              multiline
              numberOfLines={3}
            />
          </View>
          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.inputLabel}>准备时间</Text>
              <TextInput
                style={styles.input}
                value={prepTime}
                onChangeText={setPrepTime}
                placeholder="10分钟"
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.inputLabel}>烹饪时间</Text>
              <TextInput
                style={styles.input}
                value={cookTime}
                onChangeText={setCookTime}
                placeholder="15分钟"
              />
            </View>
          </View>
          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.inputLabel}>份量</Text>
              <TextInput
                style={styles.input}
                value={servings}
                onChangeText={setServings}
                placeholder="2"
                keyboardType="numeric"
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.inputLabel}>难度</Text>
              <View style={styles.difficultyContainer}>
                {(['easy', 'medium', 'hard'] as const).map((d) => (
                  <TouchableOpacity
                    key={d}
                    style={[
                    styles.difficultyOption,
                    difficulty === d && styles.difficultyOptionSelected,
                  ]}
                    onPress={() => setDifficulty(d)}
                  >
                    <Text
                      style={[
                        styles.difficultyOptionText,
                        difficulty === d && styles.difficultyOptionTextSelected,
                      ]}
                    >
                      {d === 'easy' ? '简单' : d === 'medium' ? '中等' : '困难'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>分类</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagContainer}>
              {allCategories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryOption,
                    category === cat && styles.categoryOptionSelected,
                  ]}
                  onPress={() => setCategory(cat)}
                >
                  <Text
                    style={[
                      styles.categoryOptionText,
                      category === cat && styles.categoryOptionTextSelected,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🥗 食材清单</Text>
            <TouchableOpacity style={styles.addButton} onPress={addIngredient}>
              <Text style={styles.addButtonText}>+ 添加</Text>
            </TouchableOpacity>
          </View>
          {ingredients.map((ingredient, index) => (
            <View key={index} style={styles.ingredientEditItem}>
              <View style={styles.ingredientEditRow}>
                <TextInput
                  style={[styles.input, styles.ingredientInput, { flex: 2 }]}
                  value={ingredient.name}
                  onChangeText={(value) => updateIngredient(index, 'name', value)}
                  placeholder="食材名称"
                />
                <TextInput
                  style={[styles.input, styles.ingredientInput, { flex: 1 }]}
                  value={ingredient.amount}
                  onChangeText={(value) => updateIngredient(index, 'amount', value)}
                  placeholder="数量"
                  keyboardType="decimal-pad"
                />
                <TextInput
                  style={[styles.input, styles.ingredientInput, { flex: 1 }]}
                  value={ingredient.unit || ''}
                  onChangeText={(value) => updateIngredient(index, 'unit', value)}
                  placeholder="单位"
                />
              </View>
              <View style={styles.ingredientEditRow}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  value={ingredient.notes || ''}
                  onChangeText={(value) => updateIngredient(index, 'notes', value)}
                  placeholder="备注"
                />
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeIngredient(index)}
                >
                  <Text style={styles.removeButtonText}>删除</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📝 备料步骤</Text>
            <TouchableOpacity style={styles.addButton} onPress={addPreparationStep}>
              <Text style={styles.addButtonText}>+ 添加</Text>
            </TouchableOpacity>
          </View>
          {preparationSteps.map((step, index) => (
            <View key={index} style={styles.stepEditItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{index + 1}</Text>
              </View>
              <View style={styles.stepContent}>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={step.description}
                  onChangeText={(value) => updatePreparationStep(index, 'description', value)}
                  placeholder="备料步骤描述"
                  multiline
                  numberOfLines={2}
                />
                <TextInput
                  style={styles.input}
                  value={step.tips || ''}
                  onChangeText={(value) => updatePreparationStep(index, 'tips', value)}
                  placeholder="小贴士"
                />
                <TouchableOpacity
                  style={styles.removeButtonSmall}
                  onPress={() => removePreparationStep(index)}
                >
                  <Text style={styles.removeButtonText}>删除</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🍳 炒制步骤</Text>
            <TouchableOpacity style={styles.addButton} onPress={addCookingStep}>
              <Text style={styles.addButtonText}>+ 添加</Text>
            </TouchableOpacity>
          </View>
          {cookingSteps.map((step, index) => (
            <View key={index} style={styles.stepEditItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{index + 1}</Text>
              </View>
              <View style={styles.stepContent}>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={step.instruction}
                  onChangeText={(value) => updateCookingStep(index, 'instruction', value)}
                  placeholder="炒制步骤描述"
                  multiline
                  numberOfLines={2}
                />
                <View style={styles.row}>
                  <TextInput
                    style={[styles.input, { flex: 1, marginRight: 8 }]}
                    value={step.duration || ''}
                    onChangeText={(value) => updateCookingStep(index, 'duration', value)}
                    placeholder="时长"
                  />
                  <TextInput
                    style={[styles.input, { flex: 1, marginLeft: 8 }]}
                    value={step.tips || ''}
                    onChangeText={(value) => updateCookingStep(index, 'tips', value)}
                    placeholder="小贴士"
                  />
                </View>
                <TouchableOpacity
                  style={styles.removeButtonSmall}
                  onPress={() => removeCookingStep(index)}
                >
                  <Text style={styles.removeButtonText}>删除</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🏷️ 标签</Text>
            <TouchableOpacity style={styles.addButton} onPress={() => setShowNewTag(true)}>
              <Text style={styles.addButtonText}>+ 新建标签</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagContainer}>
            {allTags.map((tag) => (
              <TouchableOpacity
                key={tag}
                style={[
                styles.tagOption,
                tags.includes(tag) && styles.tagOptionSelected,
              ]}
                onPress={() => toggleTag(tag)}
              >
                <Text
                  style={[
                    styles.tagOptionText,
                    tags.includes(tag) && styles.tagOptionTextSelected,
                  ]}
                >
                  {tag}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelButtonText}>取消</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.saveButton]}
            onPress={handleSave}
          >
            <Text style={styles.saveButtonText}>保存</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        visible={showNewTag}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowNewTag(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>新建标签</Text>
            <TextInput
              style={styles.input}
              value={newTagName}
              onChangeText={setNewTagName}
              placeholder="输入标签名称"
              autoFocus
            />
            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => setShowNewTag(false)}
              >
                <Text style={styles.modalCancelButtonText}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalSaveButton]}
                onPress={addCustomTag}
              >
                <Text style={styles.modalSaveButtonText}>添加</Text>
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
  section: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#333',
    backgroundColor: '#fafafa',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
  },
  difficultyContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  difficultyOption: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#fafafa',
  },
  difficultyOptionSelected: {
    borderColor: '#f4511e',
    backgroundColor: '#fff3e0',
  },
  difficultyOptionText: {
    fontSize: 14,
    color: '#666',
  },
  difficultyOptionTextSelected: {
    color: '#f4511e',
    fontWeight: '500',
  },
  categoryOption: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginRight: 8,
    backgroundColor: '#fafafa',
  },
  categoryOptionSelected: {
    borderColor: '#f4511e',
    backgroundColor: '#fff3e0',
  },
  categoryOptionText: {
    fontSize: 14,
    color: '#666',
  },
  categoryOptionTextSelected: {
    color: '#f4511e',
    fontWeight: '500',
  },
  tagContainer: {
    flexDirection: 'row',
  },
  tagOption: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginRight: 8,
    backgroundColor: '#fafafa',
  },
  tagOptionSelected: {
    borderColor: '#f4511e',
    backgroundColor: '#fff3e0',
  },
  tagOptionText: {
    fontSize: 14,
    color: '#666',
  },
  tagOptionTextSelected: {
    color: '#f4511e',
    fontWeight: '500',
  },
  addButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  addButtonText: {
    color: '#f4511e',
    fontSize: 14,
    fontWeight: '500',
  },
  ingredientEditItem: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  ingredientEditRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  ingredientInput: {
    flex: 1,
  },
  stepEditItem: {
    flexDirection: 'row',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f4511e',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 4,
  },
  stepNumberText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  stepContent: {
    flex: 1,
  },
  removeButton: {
    backgroundColor: '#ffebee',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 8,
  },
  removeButtonSmall: {
    backgroundColor: '#ffebee',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  removeButtonText: {
    color: '#d32f2f',
    fontSize: 14,
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 16,
    paddingBottom: 32,
    gap: 12,
  },
  button: {
    flex: 1,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  saveButton: {
    backgroundColor: '#f4511e',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  saveButtonText: {
    color: '#fff',
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalButtonRow: {
    flexDirection: 'row',
    marginTop: 16,
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

export default RecipeEditScreen;
