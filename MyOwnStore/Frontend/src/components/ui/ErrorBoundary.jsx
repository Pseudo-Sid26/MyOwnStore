import React from 'react';
import { Button } from './Button';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Update state with error details
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Log error to console or error reporting service
    console.error('Error Boundary caught an error:', error, errorInfo);
    
    // You can also log the error to an error reporting service here
    // logErrorToService(error, errorInfo);
  }

  handleRefresh = () => {
    // Reset error state and refresh
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    });
    window.location.reload();
  }

  handleGoHome = () => {
    // Reset error state and go to homepage
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    });
    window.location.href = '/';
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8 text-center">
            <div>
              <div className="text-6xl mb-6">😵</div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Oops! Something went wrong
              </h2>
              <p className="text-gray-600 mb-6">
                We're sorry, but something unexpected happened. Please try refreshing the page or contact support if the problem persists.
              </p>
              
              {/* Only show error details in development and if errorInfo exists */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="text-left bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <summary className="cursor-pointer font-medium text-red-800 mb-2">
                    Error Details (Development Only)
                  </summary>
                  <div className="text-sm text-red-700 space-y-2">
                    <div>
                      <strong>Error:</strong> {this.state.error.toString()}
                    </div>
                    {this.state.errorInfo && this.state.errorInfo.componentStack && (
                      <div>
                        <strong>Component Stack:</strong>
                        <pre className="whitespace-pre-wrap text-xs mt-1 bg-red-100 p-2 rounded overflow-x-auto">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                    {this.state.error.stack && (
                      <div>
                        <strong>Stack Trace:</strong>
                        <pre className="whitespace-pre-wrap text-xs mt-1 bg-red-100 p-2 rounded overflow-x-auto">
                          {this.state.error.stack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}
              
              <div className="space-y-4">
                <Button
                  onClick={this.handleRefresh}
                  className="w-full"
                >
                  Refresh Page
                </Button>
                <Button
                  variant="outline"
                  onClick={this.handleGoHome}
                  className="w-full"
                >
                  Go to Homepage
                </Button>
                {/* Add a button to try again without refresh */}
                <Button
                  variant="ghost"
                  onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
                  className="w-full"
                >
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;