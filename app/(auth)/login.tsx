import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Mail, Lock } from 'lucide-react-native';
import Typography from '@/components/ui/Typography';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Divider from '@/components/ui/Divider';
import AuthHeader from '@/components/auth/AuthHeader';
import SocialButtons from '@/components/auth/SocialButtons';
import SafeAreaWrapper from '@/components/ui/SafeAreaWrapper';
import Colors from '@/constants/colors';
import { Spacing } from '@/constants/theme';
import useAuthStore from '@/store/auth-store';

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const validateForm = () => {
    let isValid = true;
    
    // Reset errors
    setEmailError('');
    setPasswordError('');
    
    // Validate email
    if (!email) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Email is invalid');
      isValid = false;
    }
    
    // Validate password
    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      isValid = false;
    }
    
    return isValid;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;
    
    try {
      await login(email, password);
      // If successful, the auth store will update isAuthenticated
      // and the root layout will redirect to the app
    } catch (err) {
      Alert.alert('Login Failed', 'Please check your credentials and try again.');
    }
  };

  const handleSocialLogin = (provider: string) => {
    Alert.alert(`${provider} Login`, `${provider} login is not implemented yet.`);
  };

  return (
    <SafeAreaWrapper>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          <AuthHeader
            title="Welcome Back"
            subtitle="Sign in to your account to continue"
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
            
            <Input
              label="Password"
              placeholder="Enter your password"
              secureTextEntry
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setPasswordError('');
                clearError();
              }}
              error={passwordError}
              leftIcon={<Lock size={20} color={Colors.text.muted} />}
            />
            
            <TouchableOpacity
              onPress={() => router.push('/(auth)/forgot-password')}
              style={styles.forgotPassword}
            >
              <Typography variant="body2" color={Colors.primary.gold}>
                Forgot Password?
              </Typography>
            </TouchableOpacity>
            
            {error && (
              <Typography variant="body2" color={Colors.status.error} style={styles.errorText}>
                {error}
              </Typography>
            )}
            
            <Button
              title="Sign In"
              onPress={handleLogin}
              variant="primary"
              size="lg"
              fullWidth
              loading={isLoading}
              style={styles.button}
            />
          </View>
          
          <View style={styles.dividerContainer}>
            <Divider style={styles.divider} />
            <Typography variant="body2" color={Colors.text.muted} style={styles.dividerText}>
              Or continue with
            </Typography>
            <Divider style={styles.divider} />
          </View>
          
          <SocialButtons
            onGooglePress={() => handleSocialLogin('Google')}
            onApplePress={() => handleSocialLogin('Apple')}
            onFacebookPress={() => handleSocialLogin('Facebook')}
          />
          
          <View style={styles.footer}>
            <Typography variant="body2" color={Colors.text.muted}>
              Don't have an account?
            </Typography>
            <TouchableOpacity
              onPress={() => router.push('/(auth)/register')}
              style={styles.signUpButton}
            >
              <Typography variant="body2" color={Colors.primary.gold} weight="600">
                Sign Up
              </Typography>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: Spacing.xl,
  },
  form: {
    marginBottom: Spacing.xl,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: Spacing.xs,
    marginBottom: Spacing.md,
  },
  errorText: {
    marginBottom: Spacing.md,
  },
  button: {
    marginTop: Spacing.md,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  divider: {
    flex: 1,
    marginVertical: 0,
  },
  dividerText: {
    marginHorizontal: Spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.xl,
  },
  signUpButton: {
    marginLeft: Spacing.xs,
  },
});