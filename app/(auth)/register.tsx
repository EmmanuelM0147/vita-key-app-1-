import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, ScrollView, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Mail, Lock, User, Home, Building2, Shield, ChevronRight, Info } from 'lucide-react-native';
import Typography from '@/components/ui/Typography';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Divider from '@/components/ui/Divider';
import AuthHeader from '@/components/auth/AuthHeader';
import SocialButtons from '@/components/auth/SocialButtons';
import SafeAreaWrapper from '@/components/ui/SafeAreaWrapper';
import Colors from '@/constants/colors';
import { Spacing, BorderRadius } from '@/constants/theme';
import useAuthStore from '@/store/auth-store';

export default function RegisterScreen() {
  const router = useRouter();
  const { register, isLoading, error, clearError } = useAuthStore();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'user' | 'realtor'>('user');
  
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  
  // Password strength indicator
  const [passwordStrength, setPasswordStrength] = useState(0);

  const validateForm = () => {
    let isValid = true;
    
    // Reset errors
    setNameError('');
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');
    
    // Validate name
    if (!name) {
      setNameError('Name is required');
      isValid = false;
    }
    
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
    
    // Validate confirm password
    if (!confirmPassword) {
      setConfirmPasswordError('Please confirm your password');
      isValid = false;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      isValid = false;
    }
    
    return isValid;
  };

  const checkPasswordStrength = (text: string) => {
    let strength = 0;
    
    if (text.length >= 6) strength += 1;
    if (text.length >= 8) strength += 1;
    if (/[A-Z]/.test(text)) strength += 1;
    if (/[0-9]/.test(text)) strength += 1;
    if (/[^A-Za-z0-9]/.test(text)) strength += 1;
    
    setPasswordStrength(strength);
    return strength;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;
    
    try {
      // Pass a single object with all registration details
      await register({
        email,
        password,
        name,
        role
      });
      // If successful, the auth store will update isAuthenticated
      // and the root layout will redirect to the app
    } catch (err) {
      Alert.alert('Registration Failed', 'Please try again later.');
    }
  };

  const handleSocialRegister = (provider: string) => {
    Alert.alert(`${provider} Registration`, `${provider} registration is not implemented yet.`);
  };

  const toggleRole = () => {
    setRole(role === 'user' ? 'realtor' : 'user');
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 1) return Colors.error.main;
    if (passwordStrength <= 3) return Colors.warning.main;
    return Colors.success.main;
  };

  return (
    <SafeAreaWrapper>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          <AuthHeader
            title="Create Account"
            subtitle="Sign up to get started with Vita Key"
          />
          
          <View style={styles.form}>
            <View style={styles.securityBadge}>
              <Shield size={16} color={Colors.accent.main} />
              <Typography variant="caption" color={Colors.accent.main} style={styles.securityText}>
                Secure Sign-Up
              </Typography>
            </View>
            
            <Input
              label="Full Name"
              placeholder="Enter your full name"
              value={name}
              onChangeText={(text) => {
                setName(text);
                setNameError('');
                clearError();
              }}
              error={nameError}
              leftIcon={<User size={20} color={Colors.gray[500]} />}
              containerStyle={styles.inputContainer}
            />
            
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
              leftIcon={<Mail size={20} color={Colors.gray[500]} />}
              containerStyle={styles.inputContainer}
            />
            
            <Input
              label="Password"
              placeholder="Create a password"
              secureTextEntry
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setPasswordError('');
                clearError();
                checkPasswordStrength(text);
              }}
              error={passwordError}
              leftIcon={<Lock size={20} color={Colors.gray[500]} />}
              containerStyle={styles.inputContainer}
            />
            
            {password.length > 0 && (
              <View style={styles.passwordStrengthContainer}>
                <View style={styles.strengthBars}>
                  {[1, 2, 3, 4, 5].map((level) => (
                    <View 
                      key={level}
                      style={[
                        styles.strengthBar,
                        { 
                          backgroundColor: passwordStrength >= level 
                            ? getPasswordStrengthColor() 
                            : Colors.gray[200] 
                        }
                      ]}
                    />
                  ))}
                </View>
                <Typography variant="caption" color={Colors.gray[500]}>
                  {passwordStrength <= 1 && "Weak password"}
                  {passwordStrength > 1 && passwordStrength <= 3 && "Medium password"}
                  {passwordStrength > 3 && "Strong password"}
                </Typography>
              </View>
            )}
            
            <Input
              label="Confirm Password"
              placeholder="Confirm your password"
              secureTextEntry
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                setConfirmPasswordError('');
                clearError();
              }}
              error={confirmPasswordError}
              leftIcon={<Lock size={20} color={Colors.gray[500]} />}
              containerStyle={styles.inputContainer}
            />
            
            <View style={styles.roleContainer}>
              <Typography variant="body2" color={Colors.gray[800]} style={styles.roleLabel}>
                I am a:
              </Typography>
              
              <View style={styles.roleButtonsContainer}>
                <TouchableOpacity
                  style={[
                    styles.roleButton,
                    role === 'user' && styles.roleButtonActive,
                  ]}
                  onPress={() => setRole('user')}
                  activeOpacity={0.7}
                >
                  <Home 
                    size={18} 
                    color={role === 'user' ? Colors.common.white : Colors.gray[800]} 
                    style={styles.roleIcon}
                  />
                  <View style={styles.roleTextContainer}>
                    <Typography
                      variant="body2"
                      weight="600"
                      color={role === 'user' ? Colors.common.white : Colors.gray[800]}
                    >
                      Home Seeker
                    </Typography>
                    <Typography
                      variant="caption"
                      color={role === 'user' ? Colors.common.white : Colors.gray[500]}
                    >
                      Looking for a property
                    </Typography>
                  </View>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.roleButton,
                    role === 'realtor' && styles.roleButtonActive,
                  ]}
                  onPress={() => setRole('realtor')}
                  activeOpacity={0.7}
                >
                  <Building2 
                    size={18} 
                    color={role === 'realtor' ? Colors.common.white : Colors.gray[800]} 
                    style={styles.roleIcon}
                  />
                  <View style={styles.roleTextContainer}>
                    <Typography
                      variant="body2"
                      weight="600"
                      color={role === 'realtor' ? Colors.common.white : Colors.gray[800]}
                    >
                      Realtor
                    </Typography>
                    <Typography
                      variant="caption"
                      color={role === 'realtor' ? Colors.common.white : Colors.gray[500]}
                    >
                      Selling properties
                    </Typography>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
            
            {error && (
              <Typography variant="body2" color={Colors.error.main} style={styles.errorText}>
                {error}
              </Typography>
            )}
            
            <View style={styles.aiFeatureContainer}>
              <Info size={16} color={Colors.secondary[500]} />
              <Typography variant="caption" color={Colors.secondary[500]} style={styles.aiFeatureText}>
                {role === 'user' 
                  ? "Our AI will help match you with your perfect home" 
                  : "Our AI will help connect you with potential buyers"}
              </Typography>
            </View>
            
            <Button
              title="Create Account"
              onPress={handleRegister}
              variant="primary"
              size="lg"
              fullWidth
              loading={isLoading}
              style={styles.button}
              rightIcon={<ChevronRight size={20} color={Colors.common.white} />}
            />
            
            <TouchableOpacity onPress={() => {}} style={styles.termsContainer}>
              <Typography variant="caption" color={Colors.gray[500]} style={styles.termsText}>
                By signing up, you agree to our Terms of Service and Privacy Policy
              </Typography>
            </TouchableOpacity>
          </View>
          
          <View style={styles.dividerContainer}>
            <Divider style={styles.divider} />
            <Typography variant="body2" color={Colors.gray[500]} style={styles.dividerText}>
              Or continue with
            </Typography>
            <Divider style={styles.divider} />
          </View>
          
          <SocialButtons
            onGooglePress={() => handleSocialRegister('Google')}
            onApplePress={() => handleSocialRegister('Apple')}
            onFacebookPress={() => handleSocialRegister('Facebook')}
          />
          
          <View style={styles.footer}>
            <Typography variant="body2" color={Colors.gray[500]}>
              Already have an account?
            </Typography>
            <TouchableOpacity
              onPress={() => router.push('/(auth)/login')}
              style={styles.signInButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Typography variant="body2" color={Colors.primary[500]} weight="600">
                Sign In
              </Typography>
            </TouchableOpacity>
          </View>
          
          <View style={styles.nextStepsContainer}>
            <Typography variant="caption" color={Colors.gray[500]} style={styles.nextStepsText}>
              After signing up, you'll be able to set your preferences and start your property journey
            </Typography>
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
    marginBottom: Spacing.md,
  },
  inputContainer: {
    marginBottom: Spacing.md,
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary[100],
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    alignSelf: 'flex-start',
  },
  securityText: {
    marginLeft: 6,
  },
  passwordStrengthContainer: {
    marginTop: -Spacing.sm,
    marginBottom: Spacing.md,
  },
  strengthBars: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    marginRight: 4,
    borderRadius: 2,
  },
  roleContainer: {
    marginBottom: Spacing.lg,
  },
  roleLabel: {
    marginBottom: Spacing.xs,
  },
  roleButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  roleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginRight: Spacing.sm,
    backgroundColor: Colors.common.white,
    borderWidth: 1,
    borderColor: Colors.gray[200],
    ...Platform.select({
      ios: {
        shadowColor: Colors.common.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  roleButtonActive: {
    backgroundColor: Colors.primary[500],
    borderColor: Colors.primary[500],
  },
  roleIcon: {
    marginRight: 8,
  },
  roleTextContainer: {
    flex: 1,
  },
  errorText: {
    marginBottom: Spacing.md,
  },
  aiFeatureContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(10, 36, 99, 0.1)',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
  },
  aiFeatureText: {
    marginLeft: 8,
    flex: 1,
  },
  button: {
    marginBottom: Spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: Colors.common.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  termsContainer: {
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  termsText: {
    textAlign: 'center',
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
    marginTop: Spacing.md,
    marginBottom: Spacing.md,
  },
  signInButton: {
    marginLeft: Spacing.xs,
  },
  nextStepsContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.gray[100],
    borderRadius: BorderRadius.md,
    borderLeftWidth: 3,
    borderLeftColor: Colors.accent.main,
  },
  nextStepsText: {
    textAlign: 'center',
  },
});