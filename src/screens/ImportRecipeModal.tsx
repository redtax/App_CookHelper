import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import parseRecipeText from '../parseRecipe';
import ImagePickerButton from '../components/ImagePickerButton';

const FORMAT_TEMPLATE = `番茄炒蛋

📝 简介
家常菜经典款，酸甜可口

🗺️ 总体流程
备料→炒蛋→炒番茄→混合调味

⏱️ 基本信息
准备时间	10分钟
烹饪时间	5分钟
份量	2人份
难度	 简单
烹饪技法	炒
菜肴味型	酸甜

食材清单：

主料
鸡蛋	3个
番茄	2个

辅料
葱花	适量

调料
盐	适量
糖	1	小勺
胡椒粉	1	勺尖
料酒	几滴
番茄酱	2大勺
生抽		1小勺

📋 备料步骤
第 1 步：番茄处理 番茄洗净，在顶部划十字刀；放入开水中烫 30 秒后捞出，轻松剥去外皮，切滚刀块或月牙形备用。 耗时：2 分钟 💡 小贴士：烫过更容易去皮，口感也更细腻
第 2 步：鸡蛋处理 鸡蛋 3 枚打入碗中，加少许盐、胡椒粉、几滴料酒，搅匀至起泡备用。 耗时：1 分钟 💡 小贴士：蛋液里加半勺淀粉，炒出来更嫩滑
第 3 步：配料准备 葱切葱花，姜切末，番茄酱、盐、白糖、生抽备好放旁边。 耗时：1 分钟 💡 小贴士：调料提前备好，炒菜时不慌乱

🍳 制作步骤
第 1 步：炒鸡蛋：热锅凉油，油温升至七成热，倒入蛋液；待底部凝固后轻推翻炒，炒至八分熟、金黄蓬松即可盛出备用。 耗时：1 分钟 💡 小贴士：油温七成热（约 180°C）下锅，不要全熟，留待余温即可凝固，避免蛋炒老
第 2 步：煸炒番茄：锅中留底油，下葱姜爆香，倒入番茄翻炒；加少许盐逼出汤汁，大火翻炒至番茄变软出沙。 耗时：2 分钟 💡 小贴士：番茄要炒出红汤，味道才浓郁；偏爱酸可加1~2勺番茄酱提味
第 3 步：合炒调味：鸡蛋回锅，加盐 1 小勺、白糖半小勺、少许生抽，大火翻炒均匀，让蛋充分吸收番茄汁。 耗时：1 分钟 💡 小贴士：糖的用量依口味调整，北方口味可省略
第 4 步：爱吃无汤汁，转大火稍收汁，撒葱花点缀，出锅装盘即可上桌。 耗时：30 秒 💡 小贴士：喜欢汤汁多的不收干，直接盛出更下饭

🏷️ 标签
家常菜、快手菜、下饭菜`;

interface ImportRecipeModalProps {
  visible: boolean;
  onClose: () => void;
  onImport: (recipe: any) => void;
}

const ImportRecipeModal: React.FC<ImportRecipeModalProps> = ({ visible, onClose, onImport }) => {
  const [recipeText, setRecipeText] = useState('');
  const [importError, setImportError] = useState('');
  const [imageUri, setImageUri] = useState<string | undefined>(undefined);

  const autoPasteFromClipboard = useCallback(async () => {
    try {
      const hasClipboard = await Clipboard.hasStringAsync();
      if (hasClipboard) {
        const content = await Clipboard.getStringAsync();
        if (content && content.trim().length > 0) {
          setRecipeText(content);
        }
      }
    } catch (e) {
      // Clipboard access may fail silently
    }
  }, []);

  useEffect(() => {
    if (visible) {
      autoPasteFromClipboard();
    } else {
      setRecipeText('');
      setImportError('');
      setImageUri(undefined);
    }
  }, [visible, autoPasteFromClipboard]);

  const handleImport = () => {
    if (!recipeText.trim()) {
      setImportError('请输入菜谱内容');
      return;
    }

    try {
      const recipe = parseRecipeText(recipeText.trim());
      if (!recipe.name || recipe.name === '未命名菜谱') {
        setImportError('无法识别菜谱名称，请确保第一行是菜谱名称');
        return;
      }
      if (imageUri) {
        recipe.imageUrl = imageUri;
      }
      onImport(recipe);
      onClose();
    } catch (error) {
      setImportError('解析失败，请检查菜谱格式');
    }
  };

  const handleCopyFormat = async () => {
    await Clipboard.setStringAsync(FORMAT_TEMPLATE);
    Alert.alert('已复制', '格式模板已复制到剪贴板');
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.headerCancelText}>取消</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>导入菜谱</Text>
          <TouchableOpacity onPress={handleImport}>
            <Text style={styles.headerImportText}>导入</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.body} keyboardShouldPersistTaps="handled">
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📷 成品图（可选）</Text>
            <ImagePickerButton imageUri={imageUri} onImagePicked={setImageUri} />
          </View>

                      <View style={styles.section}>
              <Text style={styles.sectionTitle}>📝 菜谱内容</Text>
              <TextInput
                style={styles.recipeTextInput}
                placeholder="粘贴或输入菜谱内容..."
                placeholderTextColor="#999"
                value={recipeText}
                onChangeText={(text) => {
                  setRecipeText(text);
                  setImportError('');
                }}
                multiline
                textAlignVertical="top"
              />
            </View>

          <TouchableOpacity
            style={styles.importButton}
            onPress={handleImport}
          >
            <Text style={styles.importButtonText}>一键导入</Text>
          </TouchableOpacity>

          {importError ? (
            <Text style={styles.errorText}>{importError}</Text>
          ) : null}

          <View style={styles.formatGuide}>
            <View style={styles.formatGuideHeader}>
              <Text style={styles.formatGuideTitle}>📋 菜谱格式参考</Text>
              <TouchableOpacity style={styles.copyButton} onPress={handleCopyFormat}>
                <Text style={styles.copyButtonText}>📋 一键复制</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.formatGuideText}>
              {FORMAT_TEMPLATE}
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#f4511e',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerCancelText: {
    fontSize: 16,
    color: '#fff',
  },
  headerImportText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  body: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  recipeTextInput: {
    backgroundColor: '#fafafa',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: '#333',
    minHeight: 300,
    lineHeight: 24,
    textAlignVertical: 'top',
  },
  importButton: {
    backgroundColor: '#f4511e',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#f4511e',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  importButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#f44336',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
  },
  formatGuide: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  formatGuideHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  formatGuideTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  copyButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: '#f4511e',
  },
  copyButtonText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
  },
  formatScrollView: {
    maxHeight: 250,
  },
  formatGuideText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 22,
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
  },
});

export default ImportRecipeModal;
export { FORMAT_TEMPLATE };