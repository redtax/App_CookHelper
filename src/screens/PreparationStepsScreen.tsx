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

type PreparationStepsRouteProp = RouteProp<RootStackParamList, 'PreparationSteps'>;
type PreparationStepsNavigationProp = NativeStackNavigationProp<RootStackParamList, 'PreparationSteps'>;

const PreparationStepsScreen: React.FC = () => {
  const navigation = useNavigation<PreparationStepsNavigationProp>();
  const route = useRoute<PreparationStepsRouteProp>();
  const { recipe } = route.params;
  const { preparationCheckedSteps, togglePreparationStep, resetPreparationChecklist, resetPreparationSteps } = useApp();

  const totalSteps = recipe.preparationSteps.length;
  const checkedCount = preparationCheckedSteps.filter(id => 
    recipe.preparationSteps.some(step => step.id === id)
  ).length;
  const progress = totalSteps > 0 ? (checkedCount / totalSteps) * 100 : 0;

  const handleStartCooking = () => {
    const proceed = () => {
      resetPreparationChecklist();
      resetPreparationSteps();
      navigation.navigate('Cooking', { recipe });
    };

    if (checkedCount < totalSteps) {
      Alert.alert(
        '提示',
        `还有 ${totalSteps - checkedCount} 项备料步骤未完成，是否开始炒菜？',
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
          进度：{checkedCount}/{totalSteps}
        </Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: progress + '%' }]} />
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📝 备料步骤</Text>
          {recipe.preparationSteps.map((step, index) => {
            const isChecked = preparationCheckedSteps.includes(step.id);
            return (
              <View key={step.id} style={styles.stepItem}>
                <TouchableOpacity
                  style={styles.stepHeader}
                  onPress={() => togglePreparationStep(step.id)}
                >
                  <View style={[styles.stepNumber, isChecked && styles.stepNumberChecked]}>
                    <Text style={styles.stepNumberText}>
                      {isChecked ? '✓' : index + 1}
                    </Text>
                  </View>
                </TouchableOpacity>
                <View style={styles.stepContent}>
                  <Text style={[styles.stepDescription, isChecked && styles.stepDescriptionChecked]}>
                    {step.description}
                  </Text>
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
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.button,
            styles.primaryButton
          ]}
          onPress={handleStartCooking}
        >
          <Text style={styles.buttonText}>开始炒菜 →</Text>
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
  stepContent: {
    flex: 1,
  },
  stepDescription: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  stepDescriptionChecked: {
    color: '#999',
    textDecorationLine: 'line-through',
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

export default PreparationStepsScreen;
