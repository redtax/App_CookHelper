import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
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
  const { preparationCheckedItems, togglePreparationItem } = useApp();

  const hasCategories = recipe.mainIngredients.length > 0 || recipe.auxiliaryIngredients.length > 0 || recipe.seasonings.length > 0;
  const displayIngredients = hasCategories 
    ? [...recipe.mainIngredients, ...recipe.auxiliaryIngredients, ...recipe.seasonings]
    : recipe.ingredients;
  
  const allIngredients = displayIngredients.map(i => i.name);
  const checkedCount = preparationCheckedItems.filter(item => allIngredients.includes(item)).length;
  const totalIngredients = displayIngredients.length;
  const progress = totalIngredients > 0 ? (checkedCount / totalIngredients) * 100 : 0;

  const handleNext = () => {
    if (checkedCount < totalIngredients) {
      Alert.alert(
        '提示',
        `还有 ${totalIngredients - checkedCount} 项食材未勾选，是否继续？`,
        [
          { text: '继续', style: 'default', onPress: () => navigation.navigate('PreparationSteps', { recipe }) },
          { text: '取消', style: 'cancel' }
        ]
      );
    } else {
      navigation.navigate('PreparationSteps', { recipe });
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
            {recipe.mainIngredients.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>🥦 主料</Text>
                {recipe.mainIngredients.map((ingredient, index) => {
                  const isChecked = preparationCheckedItems.includes(ingredient.name);
                  return (
                    <TouchableOpacity
                      key={`main-${index}`}
                      style={styles.ingredientItem}
                      onPress={() => togglePreparationItem(ingredient.name)}
                    >
                      <View style={[styles.checkbox, isChecked && styles.checkboxChecked]}>
                        {isChecked && <Text style={styles.checkmark}>✓</Text>}
                      </View>
                      <View style={styles.ingredientInfo}>
                        <Text style={[styles.ingredientName, isChecked && styles.ingredientNameChecked]}>
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
                  );
                })}
              </View>
            )}
            {recipe.auxiliaryIngredients.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>🥕 辅料</Text>
                {recipe.auxiliaryIngredients.map((ingredient, index) => {
                  const isChecked = preparationCheckedItems.includes(ingredient.name);
                  return (
                    <TouchableOpacity
                      key={`aux-${index}`}
                      style={styles.ingredientItem}
                      onPress={() => togglePreparationItem(ingredient.name)}
                    >
                      <View style={[styles.checkbox, isChecked && styles.checkboxChecked]}>
                        {isChecked && <Text style={styles.checkmark}>✓</Text>}
                      </View>
                      <View style={styles.ingredientInfo}>
                        <Text style={[styles.ingredientName, isChecked && styles.ingredientNameChecked]}>
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
                  );
                })}
              </View>
            )}
            {recipe.seasonings.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>🧂 调料</Text>
                {recipe.seasonings.map((ingredient, index) => {
                  const isChecked = preparationCheckedItems.includes(ingredient.name);
                  return (
                    <TouchableOpacity
                      key={`seasoning-${index}`}
                      style={styles.ingredientItem}
                      onPress={() => togglePreparationItem(ingredient.name)}
                    >
                      <View style={[styles.checkbox, isChecked && styles.checkboxChecked]}>
                        {isChecked && <Text style={styles.checkmark}>✓</Text>}
                      </View>
                      <View style={styles.ingredientInfo}>
                        <Text style={[styles.ingredientName, isChecked && styles.ingredientNameChecked]}>
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
                  );
                })}
              </View>
            )}
          </>
        ) : (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🥦 食材清单</Text>
            {recipe.ingredients.map((ingredient, index) => {
              const isChecked = preparationCheckedItems.includes(ingredient.name);
              return (
                <TouchableOpacity
                  key={index}
                  style={styles.ingredientItem}
                  onPress={() => togglePreparationItem(ingredient.name)}
                >
                  <View style={[styles.checkbox, isChecked && styles.checkboxChecked]}>
                    {isChecked && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <View style={styles.ingredientInfo}>
                    <Text style={[styles.ingredientName, isChecked && styles.ingredientNameChecked]}>
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
