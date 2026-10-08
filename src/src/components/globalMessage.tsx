import { View, StyleSheet, Text, Modal } from 'react-native';
import { colors } from '@/stores/stylesStore'; 
import { useMessageStore } from '@/stores/useMessageStore';
import Button from './button';

export default function GlobalError() {
  const { isShowingMessage, isShowingError, message, title, hideError, hideMessage } = useMessageStore();
  const hide = () => {
    hideError()
    hideMessage()
  }
  return (
    <Modal
      transparent
      visible={isShowingMessage || isShowingError}
      onRequestClose={hide}
    >
      <View style={styles.overlay}>
        <View style={styles.box} accessibilityRole="alert">
          <View style={[styles.iconContainer, { backgroundColor : isShowingMessage ? 'rgba(48, 255, 148, 0.1)' : 'rgba(255, 59, 48, 0.1)' }]}>
            <Text style={[styles.iconText, {color: isShowingMessage ? 'rgb(61, 213, 135)' : colors.error}]}>!</Text>
          </View>

          <View style={styles.textContainer}>
            <Text style={[styles.title, {color: isShowingMessage ? 'rgb(61, 213, 135)' : colors.error}]}>{title}</Text>
            {message ? <Text style={styles.message}>{message}</Text> : null}
          </View>

          <View style={styles.buttonWrapper}>
            <Button label="I understand" fun={hide} />
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
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconText: {
    color: colors.error,
    fontSize: 28,
    fontWeight: '800',
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 20,
    color: colors.onBg,
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
  }
});
