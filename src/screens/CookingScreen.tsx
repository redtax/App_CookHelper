import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation';
import { useApp } from '../context';

type CookingRouteProp = RouteProp<RootStackParamList, 'Cooking'>;
type CookingNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Cooking'>;

const CookingScreen: React.FC = () => {
  const route = useRoute<CookingRouteProp>();
  const navigation = useNavigation<CookingNavigationProp>();
  const { recipe } = route.params;
  const { resetPreparationChecklist, setActiveCooking, activeCookingRecipeId, activeCookingStepIndex } = useApp();
  const [currentStepIndex, setCurrentStepIndex] = useState(
    activeCookingRecipeId === recipe.id ? activeCookingStepIndex : 0
  );
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const cookingSteps = recipe.cookingSteps || [];
  const totalSteps = cookingSteps.length;
  const isCompletionPage = currentStepIndex >= totalSteps;
  const isLastStep = currentStepIndex === totalSteps - 1;
  const { width: SCREEN_WIDTH } = Dimensions.get('window');

  useEffect(() => {
    setActiveCooking(recipe.id, currentStepIndex);
  }, [currentStepIndex]);

  const goToStep = (index: number) => {
    if (index >= 0 && index <= totalSteps) {
      setCurrentStepIndex(index);
      const delay = 50;
      if (scrollViewRef.current) {
        setTimeout(() => {
          scrollViewRef.current?.scrollTo({
            x: index * SCREEN_WIDTH,
            animated: true,
          });
        }, delay);
      }
    }
  };

  const handlePortraitScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(offsetX / SCREEN_WIDTH);
    if (newIndex >= 0 && newIndex <= totalSteps) {
      setCurrentStepIndex(newIndex);
    }
  };

  const handleFinish = () => {
    setShowCompletionModal(true);
  };

  const handleGoHome = () => {
    setShowCompletionModal(false);
    resetPreparationChecklist();
    setActiveCooking(null, 0);
    navigation.popToTop();
  };

  const handleGoBackToPreparation = () => {
    setShowCompletionModal(false);
    navigation.goBack();
  };

  const handleCloseModal = () => {
    setShowCompletionModal(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#f4511e" />

      {/* 间距区域 1：React Navigation 导航栏与自定义导航栏之间的区域 */}
      <View style={{ paddingTop: 10 }} />

      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{recipe.name}</Text>
          <Text style={styles.stepIndicator}>
            {isCompletionPage ? '🎉 完成' : `第 ${currentStepIndex + 1} / ${totalSteps} 步`}
          </Text>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.progressScroll}
        >
          <View style={styles.progressBar}>
            {cookingSteps.map((_, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.progressButton,
                  (index === currentStepIndex || (isCompletionPage && index === totalSteps - 1)) ? styles.progressButtonCurrent : undefined,
                  index < currentStepIndex ? styles.progressButtonActive : undefined,
                ]}
                onPress={() => goToStep(index)}
              >
                <Text style={[
                  styles.progressButtonText,
                  (index === currentStepIndex || (isCompletionPage && index === totalSteps - 1)) ? styles.progressButtonTextCurrent : undefined,
                ]}>
                  {index + 1}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handlePortraitScroll}
        onScrollEndDrag={handlePortraitScroll}
        style={styles.portraitContentScroll}
        contentContainerStyle={styles.portraitContentContainer}
        snapToInterval={SCREEN_WIDTH}
        decelerationRate="fast"
      >
        {cookingSteps.map((step, index) => (
          <View key={step.id} style={[styles.portraitStepCard, { width: SCREEN_WIDTH }]}>
            <View style={styles.portraitStepInner}>
              <View style={styles.portraitInstructionContainer}>
                <Text style={styles.portraitInstructionText}>{step.instruction}</Text>
              </View>

              {step.duration ? (
                <View style={styles.portraitDurationContainer}>
                  <Text style={styles.portraitDurationIcon}>⏱️</Text>
                  <Text style={styles.portraitDurationText}>{step.duration}</Text>
                </View>
              ) : null}

              {step.tips ? (
                <View style={styles.portraitTipsContainer}>
                  <Text style={styles.portraitTipsTitle}>💡 小贴士</Text>
                  <Text style={styles.portraitTipsText}>{step.tips}</Text>
                </View>
              ) : null}

              {step.ingredients && step.ingredients.length > 0 ? (
                <View style={styles.portraitIngredientsContainer}>
                  <Text style={styles.portraitIngredientsTitle}>🥘 涉及食材</Text>
                  <View style={styles.portraitIngredientsList}>
                    {step.ingredients.map((ingredient, i) => (
                      <View key={i} style={styles.portraitIngredientTag}>
                        <Text style={styles.portraitIngredientTagText}>{ingredient}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              ) : null}
            </View>
          </View>
        ))}
        <View style={[styles.portraitStepCard, { width: SCREEN_WIDTH }]}>
          <View style={styles.portraitCompletionContent}>
            <Text style={styles.portraitCompletionIcon}>🎉</Text>
            <Text style={styles.portraitCompletionTitle}>全部步骤已完成</Text>
            <Text style={styles.portraitCompletionSubtitle}>{recipe.name}</Text>
            <TouchableOpacity
              style={styles.portraitCompletionButton}
              onPress={handleFinish}
            >
              <Text style={styles.portraitCompletionButtonText}>🎉 完成烹饪</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <View style={styles.portraitNavigationContainer}>
        <TouchableOpacity
          style={[
            styles.portraitNavButton,
            (currentStepIndex === 0 && !isCompletionPage) ? styles.portraitNavButtonDisabled : undefined,
          ]}
          onPress={() => isCompletionPage ? navigation.popToTop() : currentStepIndex === 0 ? navigation.goBack() : goToStep(currentStepIndex - 1)}
        >
          <Text style={[
            styles.portraitNavButtonText,
            (currentStepIndex === 0 && !isCompletionPage) ? styles.portraitNavButtonTextDisabled : undefined,
          ]}>
            {isCompletionPage ? '← 返回首页' : '← 上一步'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.portraitNavButton,
            styles.portraitNavButtonPrimary,
          ]}
          onPress={() => {
            if (isCompletionPage) {
              goToStep(0);
            } else if (isLastStep) {
              goToStep(totalSteps);
            } else {
              goToStep(currentStepIndex + 1);
            }
          }}
        >
          <Text style={styles.portraitNavButtonText}>
            {isCompletionPage ? '制作步骤' : isLastStep ? '🎉 完成!' : '下一步 →'}
          </Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={showCompletionModal}
        animationType="fade"
        transparent={true}
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>🎉 恭喜完成！</Text>
            <Text style={styles.modalSubtitle}>
              {recipe.name} 已烹饪完成！
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={handleGoBackToPreparation}
              >
                <Text style={styles.modalButtonText}>🔄 返回备料</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={handleGoHome}
              >
                <Text style={styles.modalButtonText}>🏠 返回首页</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={handleCloseModal}
            >
              <Text style={styles.modalCloseText}>稍后再说</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  header: {
        paddingHorizontal: 16,
        paddingTop: 4,
        paddingBottom: 0,
        backgroundColor: '#f4511e',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 40,
    },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
    },
  stepIndicator: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.8)',
        marginTop: 2,
    },
  progressContainer: {
    backgroundColor: '#2a2a2a',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  progressScroll: {
    maxHeight: 40,
  },
  progressBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressButton: {
    width: 30,
    height: 30,
    borderRadius: 7,
    backgroundColor: '#444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressButtonCurrent: {
    backgroundColor: '#f4511e',
  },
  progressButtonActive: {
    backgroundColor: '#5a5a5a',
  },
  progressButtonText: {
    fontSize: 13,
    color: '#aaa',
    fontWeight: 'bold',
  },
  progressButtonTextCurrent: {
    color: '#fff',
  },

  portraitContentScroll: {
    flex: 1,
  },
  portraitContentContainer: {
    flexGrow: 1,
  },
  portraitStepCard: {
    flex: 1,
  },
  portraitStepInner: {
    flex: 1,
    padding: 14,
    justifyContent: 'flex-start',
  },
  portraitInstructionContainer: {
    backgroundColor: '#2a2a2a',
    borderRadius: 14,
    padding: 20,
    marginBottom: 14,
  },
  portraitInstructionText: {
    fontSize: 18,
    color: '#fff',
    lineHeight: 28,
    textAlign: 'left',
    fontWeight: '400',
  },
  portraitDurationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 6,
  },
  portraitDurationIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  portraitDurationText: {
    fontSize: 15,
    color: '#FF9800',
    fontWeight: '500',
  },
  portraitTipsContainer: {
    backgroundColor: '#e3f2fd',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  portraitTipsTitle: {
    fontSize: 15,
    color: '#1976d2',
    marginBottom: 6,
    fontWeight: 'bold',
  },
  portraitTipsText: {
    fontSize: 14,
    color: '#0d47a1',
    lineHeight: 20,
  },
  portraitIngredientsContainer: {
    marginTop: 6,
  },
  portraitIngredientsTitle: {
    fontSize: 15,
    color: '#999',
    marginBottom: 8,
    paddingHorizontal: 6,
  },
  portraitIngredientsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  portraitIngredientTag: {
    backgroundColor: '#3a3a3a',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  portraitIngredientTagText: {
    fontSize: 13,
    color: '#fff',
  },
  portraitNavigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 14,
    gap: 14,
    backgroundColor: '#1a1a1a',
  },
  portraitNavButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 22,
    backgroundColor: '#3a3a3a',
    alignItems: 'center',
  },
  portraitNavButtonPrimary: {
    backgroundColor: '#f4511e',
  },
  portraitNavButtonFinish: {
    backgroundColor: '#4CAF50',
  },
  portraitNavButtonDisabled: {
    backgroundColor: '#2a2a2a',
  },
  portraitNavButtonText: {
    fontSize: 15,
    color: '#fff',
    fontWeight: 'bold',
  },
  portraitNavButtonTextDisabled: {
    color: '#666',
  },

  portraitCompletionContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  portraitCompletionIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  portraitCompletionTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  portraitCompletionSubtitle: {
    fontSize: 17,
    color: '#aaa',
    marginBottom: 36,
  },
  portraitCompletionButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    paddingHorizontal: 50,
    borderRadius: 14,
  },
  portraitCompletionButtonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#2a2a2a',
    borderRadius: 18,
    padding: 28,
    width: '100%',
    maxWidth: 300,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 6,
  },
  modalSubtitle: {
    fontSize: 15,
    color: '#aaa',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
    marginBottom: 14,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#3a3a3a',
    alignItems: 'center',
  },
  modalButtonPrimary: {
    backgroundColor: '#f4511e',
  },
  modalButtonText: {
    fontSize: 15,
    color: '#fff',
    fontWeight: 'bold',
  },
  modalCloseButton: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 13,
    color: '#666',
  },
});

export default CookingScreen;
