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

type PreparationRouteProp = RouteProp<RootStackParamList, 'Preparation'>;
type PreparationNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Preparation'>;

const PreparationScreen: React.FC = () => {
  const navigation = useNavigation<PreparationNavigationProp>();
  const route = useRoute<PreparationRouteProp>();
  const { recipe } = route.params;
  const { preparationCheckedItems, togglePreparationItem, clearPreparationChecklist } = useApp();

  const allIngredients = recipe.ingredients.map(i => i.name);
  const checkedCount = preparationCheckedItems.filter(item => allIngredients.includes(item)).length;
  const totalIngredients = recipe.ingredients.length;
  const progress = (checkedCount / totalIngredients) * 100;

  const handleStartCooking = () => {
    navigation.navigate('Cooking', { recipe });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>
          备料进度: {checkedCount}/{totalIngredients}
        </Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🥗 食材备料</Text>
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
                  <Text style={styles.ingredientAmount}>
                    {ingredient.amount}{ingredient.unit || ''}
                    {ingredient.notes && <Text style={styles.ingredientNotes}> · {ingredient.notes}</Text>}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📝 备料步骤</Text>
          {recipe.preparationSteps.map((step, index) => {
            const allStepIngredients = step.ingredients || [];
            const stepChecked = allStepIngredients.every(ing => 
              preparationCheckedItems.includes(ing)
            );
            return (
              <View key={step.id} style={styles.stepItem}>
                <View style={styles.stepHeader}>
                  <View style={[styles.stepNumber, stepChecked && styles.stepNumberChecked]}>
                    <Text style={styles.stepNumberText}>{index + 1}</Text>
                  </View>
                  {stepChecked && <Text style={styles.stepComplete}>✓</Text>}
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepDescription}>{step.description}</Text>
                  {step.tips && (
                    <View style={styles.stepTipsContainer}>
                      <Text style={styles.stepTipsTitle}>💡 小贴士</Text>
                      <Text style={styles.stepTipsText}>{step.tips}</Text>
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.button, 
              styles.primaryButton,
              checkedCount < totalIngredients && styles.buttonDisabled
            ]}
            onPress={handleStartCooking}
          >
            <Text style={styles.buttonText}>
              开始炒菜 →
            </Text>
          </TouchableOpacity>
          {checkedCount < totalIngredients && (
            <Text style={styles.warningText}>
              还有 {totalIngredients - checkedCount} 项食材未确认
            </Text>
          )}
        </View>
      </ScrollView>
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
    borderColor: '#ddd',
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
  ingredientAmount: {
    fontSize: 14,
    color: '#f4511e',
  },
  ingredientNotes: {
    fontSize: 13,
    color: '#999',
  },
  stepItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  stepHeader: {
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f4511e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberChecked: {
    backgroundColor: '#4CAF50',
  },
  stepNumberText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  stepComplete: {
    fontSize: 16,
    color: '#4CAF50',
    marginTop: 4,
  },
  stepContent: {
    flex: 1,
  },
  stepDescription: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  stepTipsContainer: {
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
    padding: 10,
    marginTop: 8,
  },
  stepTipsTitle: {
    fontSize: 14,
    color: '#1976d2',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  stepTipsText: {
    fontSize: 13,
    color: '#0d47a1',
    lineHeight: 18,
  },
  buttonContainer: {
    padding: 16,
    paddingBottom: 32,
    alignItems: 'center',
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
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  warningText: {
    fontSize: 13,
    color: '#ff9800',
    marginTop: 8,
  },
});

export default PreparationScreen;
