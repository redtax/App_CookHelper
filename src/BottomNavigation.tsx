import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const tabs = [
  { key: 'home', label: '首页' },
  { key: 'prep', label: '备料' },
  { key: 'cook', label: '下厨' },
  { key: 'profile', label: '我的' },
];

type BottomNavigationProps = {
  activeTab: string;
  onTabChange: (tab: string) => void;
};

const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab,
  onTabChange,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.navBar}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tabItem, activeTab === tab.key ? styles.activeTab : undefined]}
            onPress={() => onTabChange(tab.key)}
          >
            <Text style={[styles.tabLabel, activeTab === tab.key ? styles.activeTabLabel : undefined]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingBottom: 4,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: -1 },
    shadowRadius: 3,
    elevation: 5,
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 6,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 4,
    borderRadius: 6,
    marginHorizontal: 6,
  },
  activeTab: {
    backgroundColor: '#f4511e',
  },
  tabLabel: {
    fontSize: 14,
    color: '#666',
  },
  activeTabLabel: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default BottomNavigation;