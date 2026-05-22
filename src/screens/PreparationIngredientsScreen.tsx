import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation';
import { useApp } from '../context';
import { Recipe } from '../types';

type PreparationIngredientsRouteProp = RouteProp<RootStackParamList, 'PreparationIngredients'>;
type PreparationIngredientsNavigationProp = NativeStackNavigationProp<RootStackParamList, 'PreparationIngredients'>;

const PreparationIngredientsScreen: React.FC = () => {
  const navigation = useNavigation<PreparationIngredientsNavigationProp>();
  const route = useRoute<PreparationIngredientsRouteProp>();
  const { recipe } = route.params;
  const { preparationCheckedItems, togglePreparationItem, resetPreparationChecklist, resetPreparationSteps, setActiveCooking, addShoppingItem } = useApp();

  const mainIngredients = recipe.mainIngredients || [];
  const auxiliaryIngredients = recipe.auxiliaryIngredients || [];
  const seasonings = recipe.seasonings || [];
  const ingredients = recipe.ingredients || [];
  const hasCategories = mainIngredients.length > 0 || auxiliaryIngredients.length > 0 || seasonings.length > 0;
  const displayIngredients = hasCategories 
    ? [...mainIngredients, ...auxiliaryIngredients, ...seasonings]
    : ingredients;
  
  const allIngredients = displayIngredients.map(i => i.name);
  const checkedCount = preparationCheckedItems.filter(item => allIngredients.includes(item)).length;
  const totalIngredients = displayIngredients.length;
  const progress = totalIngredients > 0 ? (checkedCount / totalIngredients) * 100 : 0;

  const [toastMessage, setToastMessage] = useState('');
  const toastOpacity = useRef(new Animated.Value(0)).current;
  const toastTimer = useRef<NodeJS.Timeout | null>(null);

  const showToast = (msg: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToastMessage(msg);
    Animated.timing(toastOpacity, {
      toValue: 1,
      duration: 150,
      useNativeDriver: true,
    }).start();
    toastTimer.current = setTimeout(() => {
      Animated.timing(toastOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => setToastMessage(''));
    }, 300);
  };

  const handleAddToShoppingList = (ingredient: { name: string; amount: string; unit?: string }) => {
    addShoppingItem({
      id: Date.now().toString(),
      name: ingredient.name,
      quantity: ingredient.amount || '1',
      unit: ingredient.unit || '个',
      checked: false,
    });
    showToast('已加入采购清单');
  };

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  const handleNext = () => {
    const hasPreparationSteps = (recipe.preparationSteps || []).length > 0;

    const proceed = () => {
      if (hasPreparationSteps) {
        navigation.navigate('PreparationSteps', { recipe });
      } else {
        resetPreparationChecklist();
        resetPreparationSteps();
        setActiveCooking(recipe.id, 0);
        navigation.navigate('Cooking', { recipe });
      }
    };

    if (checkedCount < totalIngredients) {
      Alert.alert(
        '提示',
        '还有 ' + (totalIngredients - checkedCount) + ' 项食材未勾选，是否继续？',
        [
          { text: '继续', style: 'default', onPress: proceed },
          { text: '取消', style: 'cancel' }
        ]
      );
    } else {
      proceed();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>
          进度：{checkedCount}/{totalIngredients}
        </Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: progress + '%' }]} />
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {hasCategories ? (
          <>
            {mainIngredients.length > 0 ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>🥦 主料</Text>
                {mainIngredients.map((ingredient, index) => {
                  const isChecked = preparationCheckedItems.includes(ingredient.name);
                  return (
                    <View key={`main-${index}`} style={styles.ingredientItem}>
                      <TouchableOpacity
                        style={styles.ingredientTouchArea}
                        onPress={() => togglePreparationItem(ingredient.name)}
                      >
                        <View style={[styles.checkbox, isChecked ? styles.checkboxChecked : undefined]}>
                          {isChecked ? <Text style={styles.checkmark}>✓</Text> : null}
                        </View>
                        <View style={styles.ingredientInfo}>
                          <Text style={[styles.ingredientName, isChecked ? styles.ingredientNameChecked : undefined]}>
                            {ingredient.name}
                          </Text>
                          {(ingredient.amount || ingredient.unit || ingredient.notes) ? (
                            <View style={styles.ingredientAmountRow}>
                              <Text style={styles.ingredientAmount}>
                                {ingredient.amount}{ingredient.unit || ''}
                              </Text>
                              {ingredient.notes ? (
                                <Text style={styles.ingredientNotes}> · {ingredient.notes}</Text>
                              ) : null}
                            </View>
                          ) : null}
                        </View>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.cartButton}
                        onPress={() => handleAddToShoppingList(ingredient)}
                      >
                        <Text style={styles.cartIcon}>🛒</Text>
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            ) : null}
            {auxiliaryIngredients.length > 0 ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>🥕 辅料</Text>
                {auxiliaryIngredients.map((ingredient, index) => {
                  const isChecked = preparationCheckedItems.includes(ingredient.name);
                  return (
                    <View key={`aux-${index}`} style={styles.ingredientItem}>
                      <TouchableOpacity
                        style={styles.ingredientTouchArea}
                        onPress={() => togglePreparationItem(ingredient.name)}
                      >
                        <View style={[styles.checkbox, isChecked ? styles.checkboxChecked : undefined]}>
                          {isChecked ? <Text style={styles.checkmark}>✓</Text> : null}
                        </View>
                        <View style={styles.ingredientInfo}>
                          <Text style={[styles.ingredientName, isChecked ? styles.ingredientNameChecked : undefined]}>
                            {ingredient.name}
                          </Text>
                          {(ingredient.amount || ingredient.unit || ingredient.notes) ? (
                            <View style={styles.ingredientAmountRow}>
                              <Text style={styles.ingredientAmount}>
                                {ingredient.amount}{ingredient.unit || ''}
                              </Text>
                              {ingredient.notes ? (
                                <Text style={styles.ingredientNotes}> · {ingredient.notes}</Text>
                              ) : null}
                            </View>
                          ) : null}
                        </View>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.cartButton}
                        onPress={() => handleAddToShoppingList(ingredient)}
                      >
                        <Text style={styles.cartIcon}>🛒</Text>
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            ) : null}
            {seasonings.length > 0 ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>🧂 调料</Text>
                {seasonings.map((ingredient, index) => {
                  const isChecked = preparationCheckedItems.includes(ingredient.name);
                  return (
                    <View key={`seasoning-${index}`} style={styles.ingredientItem}>
                      <TouchableOpacity
                        style={styles.ingredientTouchArea}
                        onPress={() => togglePreparationItem(ingredient.name)}
                      >
                        <View style={[styles.checkbox, isChecked ? styles.checkboxChecked : undefined]}>
                          {isChecked ? <Text style={styles.checkmark}>✓</Text> : null}
                        </View>
                        <View style={styles.ingredientInfo}>
                          <Text style={[styles.ingredientName, isChecked ? styles.ingredientNameChecked : undefined]}>
                            {ingredient.name}
                          </Text>
                          {(ingredient.amount || ingredient.unit || ingredient.notes) ? (
                            <View style={styles.ingredientAmountRow}>
                              <Text style={styles.ingredientAmount}>
                                {ingredient.amount}{ingredient.unit || ''}
                              </Text>
                              {ingredient.notes ? (
                                <Text style={styles.ingredientNotes}> · {ingredient.notes}</Text>
                              ) : null}
                            </View>
                          ) : null}
                        </View>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.cartButton}
                        onPress={() => handleAddToShoppingList(ingredient)}
                      >
                        <Text style={styles.cartIcon}>🛒</Text>
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            ) : null}
          </>
        ) : (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🥦 食材清单</Text>
            {ingredients.map((ingredient, index) => {
              const isChecked = preparationCheckedItems.includes(ingredient.name);
              return (
                <View key={index} style={styles.ingredientItem}>
                  <TouchableOpacity
                    style={styles.ingredientTouchArea}
                    onPress={() => togglePreparationItem(ingredient.name)}
                  >
                    <View style={[styles.checkbox, isChecked ? styles.checkboxChecked : undefined]}>
                      {isChecked ? <Text style={styles.checkmark}>✓</Text> : null}
                    </View>
                    <View style={styles.ingredientInfo}>
                      <Text style={[styles.ingredientName, isChecked ? styles.ingredientNameChecked : undefined]}>
                        {ingredient.name}
                      </Text>
                      {(ingredient.amount || ingredient.unit || ingredient.notes) ? (
                        <View style={styles.ingredientAmountRow}>
                          <Text style={styles.ingredientAmount}>
                            {ingredient.amount}{ingredient.unit || ''}
                          </Text>
                          {ingredient.notes ? (
                            <Text style={styles.ingredientNotes}> · {ingredient.notes}</Text>
                          ) : null}
                        </View>
                      ) : null}
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.cartButton}
                    onPress={() => handleAddToShoppingList(ingredient)}
                  >
                    <Text style={styles.cartIcon}>🛒</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.button,
            styles.primaryButton
          ]}
          onPress={handleNext}
        >
          <Text style={styles.buttonText}>下一步 →</Text>
        </TouchableOpacity>
      </View>

      {toastMessage ? (
        <Animated.View style={[styles.toast, { opacity: toastOpacity }]}>
          <Text style={styles.toastText}>{toastMessage}</Text>
        </Animated.View>
      ) : null}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  progressContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#eee',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  ingredientTouchArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#ccc',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  checkmark: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  ingredientInfo: {
    flex: 1,
  },
  ingredientName: {
    fontSize: 16,
    color: '#333',
    marginBottom: 2,
  },
  ingredientNameChecked: {
    color: '#999',
    textDecorationLine: 'line-through',
  },
  ingredientAmountRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  ingredientAmount: {
    fontSize: 14,
    color: '#f4511e',
  },
  ingredientNotes: {
    fontSize: 13,
    color: '#999',
  },
  cartButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#f4511e',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  cartIcon: {
    fontSize: 16,
  },
  toast: {
    position: 'absolute',
    bottom: 80,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  toastText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  buttonContainer: {
    padding: 16,
    paddingBottom: 32,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  button: {
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  primaryButton: {
    backgroundColor: '#f4511e',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default PreparationIngredientsScreen;
