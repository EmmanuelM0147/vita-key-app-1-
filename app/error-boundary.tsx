import React, { Component } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';

interface Props {
  children: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

const IFRAME_ID = 'rork-web-preview';

const webTargetOrigins = [
  "http://localhost:3000",
  "https://rorkai.com",
  "https://rork.app",
];

function sendErrorToIframeParent(error: any, errorInfo?: any) {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    console.debug('Sending error to parent:', {
      error,
      errorInfo,
      referrer: document.referrer,
    });

    const errorMessage = {
      type: 'ERROR',
      error: {
        message: error?.message || error?.toString() || 'Unknown error',
        stack: error?.stack,
        componentStack: errorInfo?.componentStack,
        timestamp: new Date().toISOString(),
      },
      iframeId: IFRAME_ID,
    };

    try {
      window.parent.postMessage(
        errorMessage,
        webTargetOrigins.includes(document.referrer) ? document.referrer : '*'
      );
    } catch (postMessageError) {
      console.error('Failed to send error to parent:', postMessageError);
    }
  }
}

export class ErrorBoundary extends React.Component<Props, State> {
  private originalConsoleError: (...args: any[]) => void;

  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
    this.originalConsoleError = console.error; // Store the original console.error
    this.handleError = this.handleError.bind(this);
    this.handleUnhandledRejection = this.handleUnhandledRejection.bind(this);
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidMount() {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      // Set up event listeners
      window.addEventListener('error', this.handleError, true);
      window.addEventListener('unhandledrejection', this.handleUnhandledRejection, true);

      // Override console.error
      console.error = (...args) => {
        sendErrorToIframeParent(args.join(' '));
        this.originalConsoleError.apply(console, args);
      };
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    sendErrorToIframeParent(error, errorInfo);
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  componentWillUnmount() {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      // Clean up event listeners
      window.removeEventListener('error', this.handleError, true);
      window.removeEventListener('unhandledrejection', this.handleUnhandledRejection, true);

      // Restore original console.error
      console.error = this.originalConsoleError;
    }
  }

  handleError(event: ErrorEvent) {
    event.preventDefault();
    const errorDetails = event.error ?? {
      message: event.message ?? 'Unknown error',
      filename: event.filename ?? 'Unknown file',
      lineno: event.lineno ?? 'Unknown line',
      colno: event.colno ?? 'Unknown column',
    };
    sendErrorToIframeParent(errorDetails);
  }

  handleUnhandledRejection(event: PromiseRejectionEvent) {
    event.preventDefault();
    sendErrorToIframeParent(event.reason);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <View style={styles.content}>
            <Text style={styles.title}>Something went wrong</Text>
            <Text style={styles.subtitle}>{this.state.error?.message}</Text>
            {Platform.OS !== 'web' && (
              <Text style={styles.description}>
                Please check your device logs for more details.
              </Text>
            )}
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 36,
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
});

export default ErrorBoundary;