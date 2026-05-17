import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
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

  const allIngredients = recipe.ingredients.map(i => i.name);
  const checkedCount = preparationCheckedItems.filter(item => allIngredients.includes(item)).length;
  const totalIngredients = recipe.ingredients.length;
  const progress = totalIngredients > 0 ? (checkedCount / totalIngredients) * 100 : 0;

  const handleNext = () => {
    navigation.navigate('PreparationSteps', { recipe });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>备料：食材</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>
          进度：{checkedCount}/{totalIngredients}
        </Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
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
                  <View style={styles.ingredientAmountRow}>
                    <Text style={styles.ingredientAmount}>
                      {ingredient.amount}{ingredient.unit || ''}
                    </Text>
                    {ingredient.notes && (
                      <Text style={styles.ingredientNotes}> · {ingredient.notes}</Text>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    fontSize: 24,
    color: '#f4511e',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSpacer: {
    width: 40,
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
