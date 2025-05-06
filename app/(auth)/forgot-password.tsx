import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Mail } from 'lucide-react-native';
import Typography from '@/components/ui/Typography';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import AuthHeader from '@/components/auth/AuthHeader';
import SafeAreaWrapper from '@/components/ui/SafeAreaWrapper';
import Colors from '@/constants/colors';
import { Spacing } from '@/constants/theme';
import useAuthStore from '@/store/auth-store';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { resetPassword, isLoading, error, clearError } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validateForm = () => {
    let isValid = true;
    
    // Reset errors
    setEmailError('');
    
    // Validate email
    if (!email) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Email is invalid');
      isValid = false;
    }
    
    return isValid;
  };

  const handleResetPassword = async () => {
    if (!validateForm()) return;
    
    try {
      await resetPassword(email);
      setIsSubmitted(true);
    } catch (err) {
      Alert.alert('Reset Failed', 'Please try again later.');
    }
  };

  if (isSubmitted) {
    return (
      <SafeAreaWrapper>
        <View style={styles.container}>
          <AuthHeader
            title="Check Your Email"
            subtitle="We've sent a password reset link to your email address."
          />
          
          <View style={styles.successContainer}>
            <Typography variant="body1" color={Colors.text.dark} style={styles.successText}>
              Please check your inbox and follow the instructions to reset your password.
            </Typography>
            
            <Button
              title="Back to Login"
              onPress={() => router.push('/(auth)/login')}
              variant="primary"
              size="lg"
              fullWidth
              style={styles.button}
            />
            
            <TouchableOpacity
              onPress={() => {
                setIsSubmitted(false);
                clearError();
              }}
              style={styles.resendButton}
            >
              <Typography variant="body2" color={Colors.primary.gold}>
                Didn't receive the email? Try again
              </Typography>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaWrapper>
    );
  }

  return (
    <SafeAreaWrapper>
      <View style={styles.container}>
        <AuthHeader
          title="Forgot Password"
          subtitle="Enter your email address to receive a password reset link"
        />
        
        <View style={styles.form}>
          <Input
            label="Email"
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setEmailError('');
              clearError();
            }}
            error={emailError}
            leftIcon={<Mail size={20} color={Colors.text.muted} />}
          />
          
          {error && (
            <Typography variant="body2" color={Colors.status.error} style={styles.errorText}>
              {error}
            </Typography>
          )}
          
          <Button
            title="Reset Password"
            onPress={handleResetPassword}
            variant="primary"
            size="lg"
            fullWidth
            loading={isLoading}
            style={styles.button}
          />
          
          <TouchableOpacity
            onPress={() => router.push('/(auth)/login')}
            style={styles.backButton}
          >
            <Typography variant="body2" color={Colors.primary.gold}>
              Back to Login
            </Typography>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.xl,
  },
  form: {
    marginBottom: Spacing.xl,
  },
  errorText: {
    marginBottom: Spacing.md,
  },
  button: {
    marginTop: Spacing.lg,
  },
  backButton: {
    alignSelf: 'center',
    marginTop: Spacing.xl,
    padding: Spacing.sm,
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  successText: {
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  resendButton: {
    marginTop: Spacing.xl,
    padding: Spacing.sm,
  },
});