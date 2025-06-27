import React, { useEffect, useState } from 'react';
import { Platform, Text, TouchableOpacity, View, StyleSheet } from 'react-native';

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }

  interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
  }
}

const InstallPWAButton: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [debugInfo, setDebugInfo] = useState('');
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {

    deferredPrompt?.prompt()
    
    if (Platform.OS === 'web') {
      
      setDebugInfo('Checking PWA install status...');
      
      // Check if already installed
      const checkInstallStatus = () => {
        if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
          console.log('App is already installed (standalone mode)');
          setIsInstalled(true);
          setDebugInfo('App already installed');
          return true;
        }
        
        // Check for iOS Safari "Add to Home Screen"
        if ((window.navigator as any).standalone === true) {
          console.log('App is already installed (iOS standalone)');
          setIsInstalled(true);
          setDebugInfo('App already installed (iOS)');
          return true;
        }
        
        return false;
      };

      if (!checkInstallStatus()) {
        const handler = (e: BeforeInstallPromptEvent) => {
          console.log('beforeinstallprompt event fired!');
          e.preventDefault();
          setDeferredPrompt(e);
          setIsInstallable(true);
          setDebugInfo('Install prompt available!');
        };

        window.addEventListener('beforeinstallprompt', handler);
        
        // Set initial debug info with device detection
        setTimeout(() => {
          if (!isInstallable && !isInstalled) {
            const isMobileEmulation = /Mobile|Android|iPhone/i.test(navigator.userAgent) && 
            !window.matchMedia('(max-width: 768px)').matches;
            console.log(isMobileEmulation)
            const isDevTools = window.outerHeight - window.innerHeight > 100;
            
            let debugMsg = 'Waiting for install prompt...';
            if (isMobileEmulation) {
              debugMsg += ' (Disable mobile emulation)';
            } else if (isDevTools) {
              debugMsg += ' (Close dev tools)';
            } else {
              debugMsg += ' (Check PWA requirements)';
            }
            setDebugInfo(debugMsg);
          }
        }, 2000);

        return () => {
          window.removeEventListener('beforeinstallprompt', handler);
        };
      }
    } else {
      setDebugInfo('Not on web platform');
    }
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response to the install prompt: ${outcome}`);
        
        if (outcome === 'accepted') {
          setIsInstalled(true);
          setDebugInfo('App installed successfully!');
        } else {
          setDebugInfo('Install cancelled by user');
        }
        
        setDeferredPrompt(null);
        setIsInstallable(false);
      } catch (error) {
        console.error('Error during install:', error);
        setDebugInfo('Install failed');
      }
    } else {
      // For debugging - show current state
      console.log('Debug info:', {
        deferredPrompt: !!deferredPrompt,
        isInstallable,
        isInstalled,
        userAgent: navigator.userAgent,
        displayMode: window.matchMedia('(display-mode: standalone)').matches ? 'standalone' : 'browser'
      });
    }
  };

  // Don't show anything if already installed
  if (isInstalled) {
    return null;
  }

  // Always show something for debugging
  return (
    <View style={styles.container}>
      {isInstallable ? (
        <TouchableOpacity onPress={handleInstall} style={styles.button}>
          <Text style={styles.buttonText}>📱 Install App</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity onPress={handleInstall} style={styles.debugButton}>
          <Text style={styles.debugText}>{debugInfo}</Text>
          <Text style={styles.debugSubtext}>Tap for debug info</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    zIndex: 1000,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  debugButton: {
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding: 12,
    borderRadius: 6,
    maxWidth: 250,
  },
  debugText: {
    color: '#fff',
    fontSize: 12,
    marginBottom: 4,
  },
  debugSubtext: {
    color: '#ccc',
    fontSize: 10,
    fontStyle: 'italic',
  },
});

export default InstallPWAButton;