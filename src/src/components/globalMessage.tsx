import { View, StyleSheet, Text, Modal } from 'react-native';
import { colors } from '@/stores/stylesStore'; 
import { useMessageStore } from '@/stores/useMessageStore';
import Ionicons from '@expo/vector-icons/Ionicons';
import Button from './button';

export default function GlobalError() {
  const { 
    isShowingMessage, 
    isShowingError, 
    isShowingConfirmation, 
    message, 
    title, 
    onConfirm,
    hideError, 
    hideMessage,
    hideConfirmation 
  } = useMessageStore();
  
  const hide = () => {
    if (isShowingError) hideError();
    if (isShowingMessage) hideMessage();
    if (isShowingConfirmation) hideConfirmation();
  };

  const handleConfirm = () => {
    if (onConfirm) onConfirm();
    hideConfirmation();
  };

  const isVisible = isShowingMessage || isShowingError || isShowingConfirmation;

  let themeColor = colors.main;
  let themeBg = 'rgba(150, 150, 150, 0.1)'; 
  let iconName: keyof typeof Ionicons.glyphMap = 'help-outline'; 

  if (isShowingError) {
    themeColor = colors.error;
    themeBg = 'rgba(255, 59, 48, 0.1)';
    iconName = 'alert-outline';
  } else if (isShowingMessage) {
    themeColor = 'rgb(61, 213, 135)'; 
    themeBg = 'rgba(48, 255, 148, 0.1)';
    iconName = 'checkmark-outline';
  }

  return (
    <Modal
      transparent
      visible={isVisible}
      onRequestClose={hide}
    >
      <View style={styles.overlay}>
        <View style={styles.box} accessibilityRole="alert">

          <View style={[styles.iconContainer, { backgroundColor: themeBg }]}>
            <Ionicons name={iconName} size={32} color={themeColor} />
          </View>

          <View style={styles.textContainer}>
            <Text style={[styles.title, { color: themeColor }]}>{title}</Text>
            {message ? <Text style={styles.message}>{message}</Text> : null}
          </View>

          <View style={styles.buttonWrapper}>
            {isShowingConfirmation ? (
              <View style={styles.buttonRow}>
                <View style={styles.buttonHalf}>
                  <Button label="Cancel" fun={hide} alt={true} />
                </View>
                <View style={styles.buttonHalf}>
                  <Button label="Confirm" fun={handleConfirm} danger={true} />
                </View>
              </View>
            ) : (
              <Button label="I understand" fun={hide} />
            )}
          </View>
          
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  box: {
    backgroundColor: colors.bg2,
    paddingTop: 32,
    paddingBottom: 24,
    paddingHorizontal: 24,
    marginHorizontal: 32,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    width: '85%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    color: colors.onBg,
    fontSize: 15,
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 22,
    opacity: 0.7,
  },
  buttonWrapper: {
    width: '100%',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  buttonHalf: {
    flex: 1, 
  }
});
