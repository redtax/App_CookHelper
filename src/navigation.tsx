import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './screens/HomeScreen';
import RecipeDetailScreen from './screens/RecipeDetailScreen';
import PreparationScreen from './screens/PreparationScreen';
import CookingScreen from './screens/CookingScreen';
import RecipeEditScreen from './screens/RecipeEditScreen';
import { Recipe } from './types';

export type RootStackParamList = {
  Home: undefined;
  RecipeDetail: { recipe: Recipe };
  Preparation: { recipe: Recipe };
  Cooking: { recipe: Recipe };
  RecipeEdit: { recipe: Recipe, isNew?: boolean };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

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
          component={HomeScreen}
          options={{ 
            title: '炒菜助手',
            headerTitleAlign: 'center'
          }}
        />
        <Stack.Screen 
          name="RecipeDetail" 
          component={RecipeDetailScreen}
          options={({ route }) => ({ title: route.params.recipe.name })}
        />
        <Stack.Screen 
          name="Preparation" 
          component={PreparationScreen}
          options={{ title: '备料检查' }}
        />
        <Stack.Screen 
          name="Cooking" 
          component={CookingScreen}
          options={{ 
            title: '开始炒菜',
            headerStyle: {
              backgroundColor: '#f4511e',
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

export default AppNavigator;
