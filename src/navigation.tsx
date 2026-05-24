import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator, NativeStackNavigationProp } from '@react-navigation/native-stack';
import HomeScreen from './screens/HomeScreen';
import RecipeDetailScreen from './screens/RecipeDetailScreen';
import PreparationIngredientsScreen from './screens/PreparationIngredientsScreen';
import PreparationStepsScreen from './screens/PreparationStepsScreen';
import CookingScreen from './screens/CookingScreen';
import RecipeEditScreen from './screens/RecipeEditScreen';
import IngredientScreen from './screens/IngredientScreen';
import ProfileScreen from './screens/ProfileScreen';
import BottomNavigation from './BottomNavigation';
import { useApp } from './context';
import { Recipe } from './types';

export type RootStackParamList = {
  Home: undefined;
  RecipeDetail: { recipe: Recipe };
  PreparationIngredients: { recipe: Recipe };
  PreparationSteps: { recipe: Recipe };
  Cooking: { recipe: Recipe };
  RecipeEdit: { recipe: Recipe, isNew?: boolean };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

type HomeNavProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

const HomeNavigator: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');
  const navigation = useNavigation<HomeNavProp>();
  const { activeCookingRecipeId, recipes } = useApp();

  const handleTabChange = (tab: string) => {
    if (tab === 'cook') {
      if (activeCookingRecipeId) {
        const recipe = recipes.find(r => r.id === activeCookingRecipeId);
        if (recipe) {
          setActiveTab(tab);
          navigation.navigate('Cooking', { recipe });
          return;
        }
      }
      Alert.alert('提示', '当前没有正在进行的烹饪，请先从首页选择菜谱开始烹饪');
      return;
    }
    setActiveTab(tab);
  };

  return (
    <View style={styles.container}>
      {activeTab === 'home' ? <HomeScreen /> : null}
      {activeTab === 'prep' ? <IngredientScreen /> : null}
      {activeTab === 'profile' ? <ProfileScreen /> : null}
      <BottomNavigation activeTab={activeTab} onTabChange={handleTabChange} />
    </View>
  );
};

const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#f4511e',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeNavigator}
          options={{
            title: '味溯新东方',
            headerTitleAlign: 'center',
          }}
        />
        <Stack.Screen
            name="RecipeDetail"
            component={RecipeDetailScreen}
            options={({ route }) => ({ 
                title: route.params.recipe.name,
                headerStyle: {
                    backgroundColor: '#f4511e',
                    height: 40,
                },
                headerTitleStyle: {
                    fontSize: 16,
                    fontWeight: 'bold',
                },
            })}
        />
        <Stack.Screen
            name="PreparationIngredients"
            component={PreparationIngredientsScreen}
            options={{ 
                title: '备料食材',
                headerStyle: {
                    backgroundColor: '#f4511e',
                    height: 40,
                },
                headerTitleStyle: {
                    fontSize: 16,
                    fontWeight: 'bold',
                },
            }}
        />
        <Stack.Screen
            name="PreparationSteps"
            component={PreparationStepsScreen}
            options={{ 
                title: '备料步骤',
                headerStyle: {
                    backgroundColor: '#f4511e',
                    height: 40,
                },
                headerTitleStyle: {
                    fontSize: 16,
                    fontWeight: 'bold',
                },
            }}
        />
        <Stack.Screen
            name="Cooking"
            component={CookingScreen}
            options={{
                title: '开始炒菜',
                headerStyle: {
                    backgroundColor: '#f4511e',
                    paddingBottom: 4,
                },
                headerTitleStyle: {
                    fontSize: 16,
                    fontWeight: 'bold',
                },
            }}
        />
        <Stack.Screen
          name="RecipeEdit"
          component={RecipeEditScreen}
          options={{ title: '编辑菜谱' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default AppNavigator;