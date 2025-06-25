import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import LoginScreen from '../screens/auth/LoginScreen';
import SignUpScreen from '../screens/auth/SignUpScreen';
import OnboardingScreen from '../screens/auth/OnboardingScreen';

describe('Authentication Flow', () => {
  test('LoginScreen renders correctly and allows login', async () => {
    const { getByPlaceholderText, getByText } = render(<LoginScreen />);
    const emailInput = getByPlaceholderText('Email');
    const passwordInput = getByPlaceholderText('Password');
    const loginButton = getByText('Login');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');
    fireEvent.press(loginButton);

    // Add assertions for expected behavior, e.g., navigation or error messages
  });

  test('SignUpScreen renders correctly and allows sign up', async () => {
    const { getByPlaceholderText, getByText } = render(<SignUpScreen />);
    const emailInput = getByPlaceholderText('Email');
    const passwordInput = getByPlaceholderText('Password');
    const confirmPasswordInput = getByPlaceholderText('Confirm Password');
    const signUpButton = getByText('Sign Up');

    fireEvent.changeText(emailInput, 'newuser@example.com');
    fireEvent.changeText(passwordInput, 'password123');
    fireEvent.changeText(confirmPasswordInput, 'password123');
    fireEvent.press(signUpButton);

    // Add assertions for expected behavior
  });

  test('OnboardingScreen renders correctly and navigates', () => {
    const { getByText } = render(<OnboardingScreen />);
    const nextButton = getByText('Next');

    fireEvent.press(nextButton);

    // Add assertions for navigation or state changes
  });
});
