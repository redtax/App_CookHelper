import React, { useState, useEffect, useRef } from 'react';
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
import { Recipe, Ingredient, PreparationStep, CookingStep, generateRecipeId } from '../types';
import { useApp } from '../context';
import ImagePickerButton from '../components/ImagePickerButton';

type RecipeEditRouteProp = RouteProp<RootStackParamList, 'RecipeEdit'>;
type RecipeEditNavigationProp = NativeStackNavigationProp<RootStackParamList, 'RecipeEdit'>;

const RecipeEditScreen: React.FC = () => {
  const navigation = useNavigation<RecipeEditNavigationProp>();
  const route = useRoute<RecipeEditRouteProp>();
  const { recipe: initialRecipe, isNew } = route.params;
  const { updateRecipe, addRecipe, recipes, markRecipeAsModified } = useApp();

  const [name, setName] = useState(initialRecipe.name);
  const [description, setDescription] = useState(initialRecipe.description || '');
  const [overallFlow, setOverallFlow] = useState(initialRecipe.overallFlow || '');
  const [categories, setCategories] = useState<string[]>(initialRecipe.categories || []);
  const [tags, setTags] = useState<string[]>(initialRecipe.tags || []);
  const [servings, setServings] = useState(initialRecipe.servings.toString());
  const [prepTime, setPrepTime] = useState(initialRecipe.prepTime);
  const [cookTime, setCookTime] = useState(initialRecipe.cookTime);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>(initialRecipe.difficulty);
  const [technique, setTechnique] = useState(initialRecipe.technique || '');
  const [flavor, setFlavor] = useState(initialRecipe.flavor || '');
  const [mainIngredients, setMainIngredients] = useState<Ingredient[]>(initialRecipe.mainIngredients || []);
  const [auxiliaryIngredients, setAuxiliaryIngredients] = useState<Ingredient[]>(initialRecipe.auxiliaryIngredients || []);
  const [seasonings, setSeasonings] = useState<Ingredient[]>(initialRecipe.seasonings || []);
  const [uncategorizedIngredients, setUncategorizedIngredients] = useState<Ingredient[]>(
    initialRecipe.ingredients && initialRecipe.ingredients.length > 0
      && initialRecipe.mainIngredients?.length === 0
      && initialRecipe.auxiliaryIngredients?.length === 0
      && initialRecipe.seasonings?.length === 0
      ? initialRecipe.ingredients : []
  );
  const [preparationSteps, setPreparationSteps] = useState<PreparationStep[]>(initialRecipe.preparationSteps || []);
  const [cookingSteps, setCookingSteps] = useState<CookingStep[]>(initialRecipe.cookingSteps || []);
  const [imageUrl, setImageUrl] = useState<string | undefined>(initialRecipe.imageUrl);
  const [videoUrl, setVideoUrl] = useState<string | undefined>(initialRecipe.videoUrl);

  const [showNewTag, setShowNewTag] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  const [savedIndicator, setSavedIndicator] = useState(false);

  const scrollViewRef = useRef<ScrollView>(null);
  const sectionLayouts = useRef<Record<string, number>>({});

  const scrollToSection = (sectionKey: string, delay = 100) => {
    setTimeout(() => {
      const y = sectionLayouts.current[sectionKey];
      if (y !== undefined && scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ y: y - 80, animated: true });
      }
    }, delay);
  };

  const allCategories = Array.from(new Set(recipes.flatMap(r => r.categories || [])));
  const allTags = Array.from(new Set([
    ...recipes.flatMap(r => r.tags || []),
    ...tags,
  ]));

  const markChanged = () => { if (!hasChanges) setHasChanges(true); };

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e: any) => {
      if (!hasChanges) return;
      e.preventDefault();
      Alert.alert(
        '未保存的修改',
        '你有未保存的修改，确定要退出吗？',
        [
          { text: '继续编辑', style: 'cancel' },
          { text: '放弃修改', style: 'destructive', onPress: () => navigation.dispatch(e.data.action) },
        ]
      );
    });
    return unsubscribe;
  }, [navigation, hasChanges]);

  React.useEffect(() => {
    const focusUnsubscribe = navigation.addListener('focus', () => {
      const updatedRecipe = recipes.find((r: Recipe) => r.id === initialRecipe.id);
      if (updatedRecipe?.videoUrl !== videoUrl) {
        setVideoUrl(updatedRecipe?.videoUrl);
      }
    });
    return focusUnsubscribe;
  }, [navigation, recipes, initialRecipe.id, videoUrl]);

  const handleCancel = () => {
    if (hasChanges) {
      Alert.alert(
        '未保存的修改',
        '你有未保存的修改，确定要退出吗？',
        [
          { text: '继续编辑', style: 'cancel' },
          { text: '放弃修改', style: 'destructive', onPress: () => navigation.goBack() },
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  const hasUncategorized = uncategorizedIngredients.some(i => i.name.trim());

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('错误', '请输入菜谱名称');
      return;
    }

    if (hasUncategorized) {
      Alert.alert(
        '食材未分类',
        '还有食材在"暂未分类"区域，请为它们选择分类后再保存。',
        [{ text: '知道了' }]
      );
      return;
    }

    const trimmedName = name.trim();

    if (isNew) {
      const conflictRecipe = recipes.find(r => r.name === trimmedName);
      if (conflictRecipe) {
        Alert.alert(
          '菜谱名称已存在',
          `已存在名为「${trimmedName}」的菜谱，请修改名称后再保存。`,
          [{ text: '知道了' }]
        );
        return;
      }
      await performSave(trimmedName);
      return;
    }

    if (trimmedName !== initialRecipe.name) {
      const conflictRecipe = recipes.find(r => r.name === trimmedName && r.id !== initialRecipe.id);
      if (conflictRecipe) {
        Alert.alert(
          '菜谱名称已存在',
          `已存在名为「${trimmedName}」的菜谱，请修改名称后再保存。`,
          [{ text: '知道了' }]
        );
        return;
      }
    }

    const title = trimmedName !== initialRecipe.name
      ? `已将名称修改为「${trimmedName}」`
      : '保存修改';
    Alert.alert(
      title,
      '请选择保存方式：',
      [
        { text: '取消', style: 'cancel' },
        { text: '覆盖保存', onPress: () => performSave(trimmedName) },
        { text: '另存为新菜谱', onPress: () => saveAsNewRecipe(trimmedName) },
      ]
    );
  };

  const buildRecipe = (trimmedName: string): Recipe => ({
    ...initialRecipe,
    name: trimmedName,
    description: description.trim() || undefined,
    overallFlow: overallFlow.trim() || undefined,
    categories,
    tags,
    servings: parseInt(servings) || 1,
    prepTime: prepTime.trim(),
    cookTime: cookTime.trim(),
    difficulty,
    technique: technique.trim() || undefined,
    flavor: flavor.trim() || undefined,
    ingredients: [],
    mainIngredients,
    auxiliaryIngredients,
    seasonings,
    preparationSteps,
    cookingSteps,
    imageUrl,
    imageUrls: imageUrl ? [imageUrl] : [],
    videoUrl,
  });

  const performSave = async (trimmedName: string) => {
    const updatedRecipe = buildRecipe(trimmedName);
    if (isNew) {
      await addRecipe(updatedRecipe);
    } else {
      await updateRecipe(updatedRecipe);
    }
    markRecipeAsModified(updatedRecipe.id);
    setHasChanges(false);
    setSavedIndicator(true);
    setTimeout(() => setSavedIndicator(false), 2000);
  };

  const saveAsNewRecipe = async (trimmedName: string) => {
    const newRecipe: Recipe = {
      ...buildRecipe(trimmedName),
      id: generateRecipeId(),
      source: 'user' as const,
    };
    await addRecipe(newRecipe);
    markRecipeAsModified(newRecipe.id);
    setHasChanges(false);
    setSavedIndicator(true);
    setTimeout(() => setSavedIndicator(false), 2000);
    Alert.alert('保存成功', `已另存为新菜谱「${trimmedName}」`);
  };

  const addToCategory = (category: 'main' | 'auxiliary' | 'seasoning') => {
    const newIngredient: Ingredient = { name: '', amount: '', unit: '', notes: '' };
    if (category === 'main') setMainIngredients([...mainIngredients, newIngredient]);
    else if (category === 'auxiliary') setAuxiliaryIngredients([...auxiliaryIngredients, newIngredient]);
    else setSeasonings([...seasonings, newIngredient]);
    markChanged();
    scrollToSection('ingredients', 150);
  };

  const removeFromCategory = (category: 'main' | 'auxiliary' | 'seasoning', index: number) => {
    if (category === 'main') setMainIngredients(mainIngredients.filter((_, i) => i !== index));
    else if (category === 'auxiliary') setAuxiliaryIngredients(auxiliaryIngredients.filter((_, i) => i !== index));
    else setSeasonings(seasonings.filter((_, i) => i !== index));
    markChanged();
  };

  const updateInCategory = (category: 'main' | 'auxiliary' | 'seasoning', index: number, field: keyof Ingredient, value: string) => {
    const getter = category === 'main' ? mainIngredients : category === 'auxiliary' ? auxiliaryIngredients : seasonings;
    const setter = category === 'main' ? setMainIngredients : category === 'auxiliary' ? setAuxiliaryIngredients : setSeasonings;
    const newList = [...getter];
    newList[index] = { ...newList[index], [field]: value };
    setter(newList);
    markChanged();
  };

  const moveUncategorized = (index: number, target: 'main' | 'auxiliary' | 'seasoning') => {
    const item = { ...uncategorizedIngredients[index] };
    if (target === 'main') setMainIngredients([...mainIngredients, item]);
    else if (target === 'auxiliary') setAuxiliaryIngredients([...auxiliaryIngredients, item]);
    else setSeasonings([...seasonings, item]);
    setUncategorizedIngredients(uncategorizedIngredients.filter((_, i) => i !== index));
    markChanged();
  };

  const removeUncategorized = (index: number) => {
    setUncategorizedIngredients(uncategorizedIngredients.filter((_, i) => i !== index));
    markChanged();
  };

  const moveAcrossCategory = (from: 'main' | 'auxiliary' | 'seasoning', index: number, to: 'main' | 'auxiliary' | 'seasoning') => {
    const fromGetter = from === 'main' ? mainIngredients : from === 'auxiliary' ? auxiliaryIngredients : seasonings;
    const fromSetter = from === 'main' ? setMainIngredients : from === 'auxiliary' ? setAuxiliaryIngredients : setSeasonings;
    const toSetter = to === 'main' ? setMainIngredients : to === 'auxiliary' ? setAuxiliaryIngredients : setSeasonings;
    const item = { ...fromGetter[index] };
    fromSetter(fromGetter.filter((_, i) => i !== index));
    toSetter(prev => [...prev, item]);
    markChanged();
  };

  const addPreparationStep = () => {
    setPreparationSteps([...preparationSteps, { id: Date.now().toString(), description: '', tips: '' }]);
    markChanged();
    scrollToSection('prep-steps', 150);
  };

  const removePreparationStep = (index: number) => {
    setPreparationSteps(preparationSteps.filter((_, i) => i !== index));
    markChanged();
  };

  const updatePreparationStep = (index: number, field: keyof PreparationStep, value: string) => {
    const newSteps = [...preparationSteps];
    newSteps[index] = { ...newSteps[index], [field]: value };
    setPreparationSteps(newSteps);
    markChanged();
  };

  const movePreparationStep = (fromIndex: number, direction: 'up' | 'down') => {
    const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1;
    if (toIndex < 0 || toIndex >= preparationSteps.length) return;
    const newSteps = [...preparationSteps];
    const [moved] = newSteps.splice(fromIndex, 1);
    newSteps.splice(toIndex, 0, moved);
    setPreparationSteps(newSteps);
    markChanged();
  };

  const prepToCooking = (index: number) => {
    const step = preparationSteps[index];
    setCookingSteps([...cookingSteps, { id: step.id || Date.now().toString(), instruction: step.description, duration: '', tips: step.tips || '' }]);
    setPreparationSteps(preparationSteps.filter((_, i) => i !== index));
    markChanged();
    scrollToSection('cooking-steps', 150);
  };

  const addCookingStep = () => {
    setCookingSteps([...cookingSteps, { id: Date.now().toString(), instruction: '', duration: '', tips: '' }]);
    markChanged();
    scrollToSection('cooking-steps', 150);
  };

  const removeCookingStep = (index: number) => {
    setCookingSteps(cookingSteps.filter((_, i) => i !== index));
    markChanged();
  };

  const updateCookingStep = (index: number, field: keyof CookingStep, value: string) => {
    const newSteps = [...cookingSteps];
    newSteps[index] = { ...newSteps[index], [field]: value };
    setCookingSteps(newSteps);
    markChanged();
  };

  const moveCookingStep = (fromIndex: number, direction: 'up' | 'down') => {
    const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1;
    if (toIndex < 0 || toIndex >= cookingSteps.length) return;
    const newSteps = [...cookingSteps];
    const [moved] = newSteps.splice(fromIndex, 1);
    newSteps.splice(toIndex, 0, moved);
    setCookingSteps(newSteps);
    markChanged();
  };

  const cookingToPrep = (index: number) => {
    const step = cookingSteps[index];
    setPreparationSteps([...preparationSteps, { id: step.id || Date.now().toString(), description: step.instruction, tips: step.tips || '' }]);
    setCookingSteps(cookingSteps.filter((_, i) => i !== index));
    markChanged();
    scrollToSection('prep-steps', 150);
  };

  const measureLayout = (key: string) => (event: any) => {
    sectionLayouts.current[key] = event.nativeEvent.layout.y;
  };

  const toggleCategory = (cat: string) => {
    if (categories.includes(cat)) {
      setCategories(categories.filter(c => c !== cat));
    } else {
      setCategories([...categories, cat]);
    }
    markChanged();
  };

  const toggleTag = (tag: string) => {
    if (tags.includes(tag)) {
      setTags(tags.filter(t => t !== tag));
    } else {
      setTags([...tags, tag]);
    }
    markChanged();
  };

  const addCustomTag = () => {
    if (newTagName.trim() && !tags.includes(newTagName.trim())) {
      setTags([...tags, newTagName.trim()]);
      markChanged();
    }
    setShowNewTag(false);
    setNewTagName('');
  };

  const renderIngredientRow = (ingredient: Ingredient, category: 'main' | 'auxiliary' | 'seasoning', index: number) => (
    <View key={`${category}-${index}`} style={styles.ingredientEditItem}>
      <View style={styles.ingredientEditRow}>
        <TextInput
          style={[styles.input, styles.ingredientInput, { flex: 2 }]}
          value={ingredient.name}
          onChangeText={(value) => updateInCategory(category, index, 'name', value)}
          placeholder="食材名称"
        />
        <TextInput
          style={[styles.input, styles.ingredientInput, { flex: 1 }]}
          value={ingredient.amount}
          onChangeText={(value) => updateInCategory(category, index, 'amount', value)}
          placeholder="数量"
          keyboardType="decimal-pad"
        />
        <TextInput
          style={[styles.input, styles.ingredientInput, { flex: 1 }]}
          value={ingredient.unit || ''}
          onChangeText={(value) => updateInCategory(category, index, 'unit', value)}
          placeholder="单位"
        />
      </View>
      <View style={styles.ingredientEditRow}>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          value={ingredient.notes || ''}
          onChangeText={(value) => updateInCategory(category, index, 'notes', value)}
          placeholder="备注"
        />
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => removeFromCategory(category, index)}
        >
          <Text style={styles.removeButtonText}>删除</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.categorySwitchRow}>
        <Text style={styles.categorySwitchLabel}>归类：</Text>
        {category !== 'main' ? (
          <TouchableOpacity
            style={[styles.categorySwitchBtn, { backgroundColor: '#f4511e' }]}
            onPress={() => moveAcrossCategory(category, index, 'main')}
          >
            <Text style={styles.categorySwitchBtnText}>主料</Text>
          </TouchableOpacity>
        ) : null}
        {category !== 'auxiliary' ? (
          <TouchableOpacity
            style={[styles.categorySwitchBtn, { backgroundColor: '#FF9800' }]}
            onPress={() => moveAcrossCategory(category, index, 'auxiliary')}
          >
            <Text style={styles.categorySwitchBtnText}>辅料</Text>
          </TouchableOpacity>
        ) : null}
        {category !== 'seasoning' ? (
          <TouchableOpacity
            style={[styles.categorySwitchBtn, { backgroundColor: '#8BC34A' }]}
            onPress={() => moveAcrossCategory(category, index, 'seasoning')}
          >
            <Text style={styles.categorySwitchBtnText}>调料</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );

  const renderUncategorizedRow = (ingredient: Ingredient, index: number) => (
    <View key={`uncat-${index}`} style={styles.ingredientEditItem}>
      <View style={styles.ingredientEditRow}>
        <TextInput
          style={[styles.input, styles.ingredientInput, { flex: 2 }]}
          value={ingredient.name}
          onChangeText={(value) => {
            const newList = [...uncategorizedIngredients];
            newList[index] = { ...newList[index], name: value };
            setUncategorizedIngredients(newList);
            markChanged();
          }}
          placeholder="食材名称"
        />
        <TextInput
          style={[styles.input, styles.ingredientInput, { flex: 1 }]}
          value={ingredient.amount}
          onChangeText={(value) => {
            const newList = [...uncategorizedIngredients];
            newList[index] = { ...newList[index], amount: value };
            setUncategorizedIngredients(newList);
            markChanged();
          }}
          placeholder="数量"
          keyboardType="decimal-pad"
        />
        <TextInput
          style={[styles.input, styles.ingredientInput, { flex: 1 }]}
          value={ingredient.unit || ''}
          onChangeText={(value) => {
            const newList = [...uncategorizedIngredients];
            newList[index] = { ...newList[index], unit: value };
            setUncategorizedIngredients(newList);
            markChanged();
          }}
          placeholder="单位"
        />
      </View>
      <View style={styles.ingredientEditRow}>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          value={ingredient.notes || ''}
          onChangeText={(value) => {
            const newList = [...uncategorizedIngredients];
            newList[index] = { ...newList[index], notes: value };
            setUncategorizedIngredients(newList);
            markChanged();
          }}
          placeholder="备注"
        />
        <View style={styles.categoryPickerRow}>
          <TouchableOpacity
            style={[styles.categoryPickerBtn, { backgroundColor: '#f4511e' }]}
            onPress={() => moveUncategorized(index, 'main')}
          >
            <Text style={styles.categoryPickerBtnText}>主料</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.categoryPickerBtn, { backgroundColor: '#FF9800' }]}
            onPress={() => moveUncategorized(index, 'auxiliary')}
          >
            <Text style={styles.categoryPickerBtnText}>辅料</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.categoryPickerBtn, { backgroundColor: '#8BC34A' }]}
            onPress={() => moveUncategorized(index, 'seasoning')}
          >
            <Text style={styles.categoryPickerBtnText}>调料</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.removeButtonSmall}
            onPress={() => removeUncategorized(index)}
          >
            <Text style={styles.removeButtonText}>删除</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 基本信息</Text>
          <ImagePickerButton imageUri={imageUrl} onImagePicked={setImageUrl} />
          <TouchableOpacity
            style={styles.videoButton}
            onPress={() => navigation.navigate('VideoPlayer', { recipe: buildRecipe(name.trim() || '未命名菜谱') })}
          >
            <Text style={styles.videoButtonIcon}>{'\u25B6'}</Text>
            <Text style={styles.videoButtonText}>实操视频展示</Text>
            {videoUrl && <Text style={styles.videoButtonBadge}>已设置</Text>}
          </TouchableOpacity>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>菜谱名称</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={(v) => { setName(v); markChanged(); }}
              placeholder="请输入菜谱名称"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>菜谱描述</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={(v) => { setDescription(v); markChanged(); }}
              placeholder="请输入菜谱描述"
              multiline
              numberOfLines={3}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>总体流程</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={overallFlow}
              onChangeText={(v) => { setOverallFlow(v); markChanged(); }}
              placeholder="例如：备料→炒蛋→炒番茄→混合"
              multiline
              numberOfLines={4}
            />
          </View>
          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.inputLabel}>准备时间</Text>
              <TextInput
                style={styles.input}
                value={prepTime}
                onChangeText={(v) => { setPrepTime(v); markChanged(); }}
                placeholder="10分钟"
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.inputLabel}>烹饪时间</Text>
              <TextInput
                style={styles.input}
                value={cookTime}
                onChangeText={(v) => { setCookTime(v); markChanged(); }}
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
                onChangeText={(v) => { setServings(v); markChanged(); }}
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
                      difficulty === d ? styles.difficultyOptionSelected : undefined,
                    ]}
                    onPress={() => { setDifficulty(d); markChanged(); }}
                  >
                    <Text
                      style={[
                        styles.difficultyOptionText,
                        difficulty === d ? styles.difficultyOptionTextSelected : undefined,
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
            <Text style={styles.inputLabel}>分类（可多选）</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipContainer}>
              {allCategories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.chipOption,
                    categories.includes(cat) ? styles.chipOptionSelected : undefined,
                  ]}
                  onPress={() => toggleCategory(cat)}
                >
                  <Text
                    style={[
                      styles.chipOptionText,
                      categories.includes(cat) ? styles.chipOptionTextSelected : undefined,
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
          <Text style={styles.sectionTitle}>⚙️ 烹饪信息</Text>
          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.inputLabel}>烹饪技法</Text>
              <TextInput
                style={styles.input}
                value={technique}
                onChangeText={(v) => { setTechnique(v); markChanged(); }}
                placeholder="例如：煎、炒、炖"
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.inputLabel}>菜肴味型</Text>
              <TextInput
                style={styles.input}
                value={flavor}
                onChangeText={(v) => { setFlavor(v); markChanged(); }}
                placeholder="例如：酸甜、香辣"
              />
            </View>
          </View>
        </View>

        <View style={styles.section} onLayout={measureLayout('ingredients')}>
          <Text style={styles.sectionTitle}>🥗 食材清单</Text>

          <View style={styles.subSection}>
            <View
              style={styles.sectionHeader}
            >
              <Text style={styles.subSectionTitle}>🥗 主料 ({mainIngredients.length}项)</Text>
              <TouchableOpacity style={styles.addButton} onPress={() => addToCategory('main')}>
                <Text style={styles.addButtonText}>+ 添加</Text>
              </TouchableOpacity>
            </View>
            {mainIngredients.map((ing, i) => renderIngredientRow(ing, 'main', i))}
          </View>

          <View style={styles.subSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.subSectionTitle}>🥕 辅料 ({auxiliaryIngredients.length}项)</Text>
              <TouchableOpacity style={styles.addButton} onPress={() => addToCategory('auxiliary')}>
                <Text style={styles.addButtonText}>+ 添加</Text>
              </TouchableOpacity>
            </View>
            {auxiliaryIngredients.map((ing, i) => renderIngredientRow(ing, 'auxiliary', i))}
          </View>

          <View style={styles.subSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.subSectionTitle}>🧂 调料 ({seasonings.length}项)</Text>
              <TouchableOpacity style={styles.addButton} onPress={() => addToCategory('seasoning')}>
                <Text style={styles.addButtonText}>+ 添加</Text>
              </TouchableOpacity>
            </View>
            {seasonings.map((ing, i) => renderIngredientRow(ing, 'seasoning', i))}
          </View>

          {uncategorizedIngredients.length > 0 ? (
            <View style={styles.subSection}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.subSectionTitle, styles.warningTitle]}>
                  📦 暂未分类 ({uncategorizedIngredients.length}项)
                </Text>
              </View>
              <Text style={styles.warningHint}>请为以下食材选择分类后保存</Text>
              {uncategorizedIngredients.map((ing, i) => renderUncategorizedRow(ing, i))}
            </View>
          ) : null}
        </View>

        <View
          style={styles.section}
          onLayout={measureLayout('prep-steps')}
        >
          <View
            style={styles.sectionHeader}
          >
            <Text style={styles.sectionTitle}>📝 备料步骤</Text>
            <TouchableOpacity style={styles.addButton} onPress={addPreparationStep}>
              <Text style={styles.addButtonText}>+ 添加</Text>
            </TouchableOpacity>
          </View>
          {preparationSteps.map((step, index) => (
            <View key={step.id || `prep-${index}`} style={styles.stepEditItem}>
              <View style={styles.stepDragArea}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{index + 1}</Text>
                </View>
                <View style={styles.moveButtons}>
                  <TouchableOpacity
                    style={[styles.moveBtn, index === 0 ? styles.moveBtnDisabled : undefined]}
                    onPress={() => movePreparationStep(index, 'up')}
                    disabled={index === 0}
                  >
                    <Text style={[styles.moveBtnText, index === 0 ? styles.moveBtnTextDisabled : undefined]}>▲</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.moveBtn, index === preparationSteps.length - 1 ? styles.moveBtnDisabled : undefined]}
                    onPress={() => movePreparationStep(index, 'down')}
                    disabled={index === preparationSteps.length - 1}
                  >
                    <Text style={[styles.moveBtnText, index === preparationSteps.length - 1 ? styles.moveBtnTextDisabled : undefined]}>▼</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.moveCrossBtn}
                    onPress={() => prepToCooking(index)}
                  >
                    <Text style={styles.moveCrossBtnText}>⇄ 炒</Text>
                  </TouchableOpacity>
                </View>
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

        <View
          style={styles.section}
          onLayout={measureLayout('cooking-steps')}
        >
          <View
            style={styles.sectionHeader}
          >
            <Text style={styles.sectionTitle}>🍳 炒制步骤</Text>
            <TouchableOpacity style={styles.addButton} onPress={addCookingStep}>
              <Text style={styles.addButtonText}>+ 添加</Text>
            </TouchableOpacity>
          </View>
          {cookingSteps.map((step, index) => (
            <View key={step.id || `cook-${index}`} style={styles.stepEditItem}>
              <View style={styles.stepDragArea}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{index + 1}</Text>
                </View>
                <View style={styles.moveButtons}>
                  <TouchableOpacity
                    style={[styles.moveBtn, index === 0 ? styles.moveBtnDisabled : undefined]}
                    onPress={() => moveCookingStep(index, 'up')}
                    disabled={index === 0}
                  >
                    <Text style={[styles.moveBtnText, index === 0 ? styles.moveBtnTextDisabled : undefined]}>▲</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.moveBtn, index === cookingSteps.length - 1 ? styles.moveBtnDisabled : undefined]}
                    onPress={() => moveCookingStep(index, 'down')}
                    disabled={index === cookingSteps.length - 1}
                  >
                    <Text style={[styles.moveBtnText, index === cookingSteps.length - 1 ? styles.moveBtnTextDisabled : undefined]}>▼</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.moveCrossBtn}
                    onPress={() => cookingToPrep(index)}
                  >
                    <Text style={styles.moveCrossBtnText}>⇄ 备</Text>
                  </TouchableOpacity>
                </View>
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
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipContainer}>
            {allTags.map((tag) => (
              <TouchableOpacity
                key={tag}
                style={[
                  styles.chipOption,
                  tags.includes(tag) ? styles.chipOptionSelected : undefined,
                ]}
                onPress={() => toggleTag(tag)}
              >
                <Text
                  style={[
                    styles.chipOptionText,
                    tags.includes(tag) ? styles.chipOptionTextSelected : undefined,
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
            onPress={handleCancel}
          >
            <Text style={styles.cancelButtonText}>取消</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, savedIndicator ? styles.savedButton : styles.saveButton]}
            onPress={handleSave}
          >
            <Text style={styles.saveButtonText}>{savedIndicator ? '✓ 已保存' : '保存'}</Text>
          </TouchableOpacity>
        </View>
        {savedIndicator ? (
          <Text style={styles.savedHint}>菜谱已保存，可继续编辑或返回</Text>
        ) : null}
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
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subSection: {
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  subSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  warningTitle: {
    color: '#f4511e',
  },
  warningHint: {
    fontSize: 12,
    color: '#f4511e',
    marginBottom: 8,
    paddingLeft: 4,
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
  chipContainer: {
    flexDirection: 'row',
  },
  chipOption: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginRight: 8,
    backgroundColor: '#fafafa',
  },
  chipOptionSelected: {
    borderColor: '#f4511e',
    backgroundColor: '#fff3e0',
  },
  chipOptionText: {
    fontSize: 14,
    color: '#666',
  },
  chipOptionTextSelected: {
    color: '#f4511e',
    fontWeight: '500',
  },
  addButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#f4511e',
    backgroundColor: '#fff5f0',
    minWidth: 64,
    alignItems: 'center',
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
  categoryPickerRow: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  categoryPickerBtn: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
  },
  categoryPickerBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
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
    marginTop: 4,
  },
  stepDragArea: {
    alignItems: 'center',
    marginRight: 10,
    width: 44,
  },
  moveButtons: {
    alignItems: 'center',
    marginTop: 4,
    gap: 2,
  },
  moveBtn: {
    width: 28,
    height: 22,
    borderRadius: 4,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moveBtnDisabled: {
    backgroundColor: '#fafafa',
    opacity: 0.4,
  },
  moveBtnText: {
    fontSize: 11,
    color: '#666',
  },
  moveBtnTextDisabled: {
    color: '#ccc',
  },
  moveCrossBtn: {
    marginTop: 2,
    paddingHorizontal: 5,
    paddingVertical: 3,
    borderRadius: 4,
    backgroundColor: '#fff3e0',
    borderWidth: 1,
    borderColor: '#f4511e',
  },
  moveCrossBtnText: {
    fontSize: 10,
    color: '#f4511e',
    fontWeight: 'bold',
  },
  categorySwitchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  categorySwitchLabel: {
    fontSize: 11,
    color: '#999',
    marginRight: 2,
  },
  categorySwitchBtn: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  categorySwitchBtnText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
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
  savedButton: {
    backgroundColor: '#4CAF50',
  },
  savedHint: {
    textAlign: 'center',
    color: '#4CAF50',
    fontSize: 13,
    marginTop: 8,
    marginBottom: 4,
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
  videoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2a2a2a',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f4511e',
  },
  videoButtonIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  videoButtonText: {
    color: '#f4511e',
    fontSize: 15,
    fontWeight: '600',
  },
  videoButtonBadge: {
    backgroundColor: '#4caf50',
    color: '#fff',
    fontSize: 11,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 10,
    overflow: 'hidden',
  },
});

export default RecipeEditScreen;