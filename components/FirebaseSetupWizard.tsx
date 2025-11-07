import React, { useState } from 'react';
import { CheckCircle2, Circle, AlertCircle, ExternalLink, Copy, Check } from 'lucide-react';

interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  vapidKey: string;
}

interface FirebaseSetupWizardProps {
  onComplete: (config: FirebaseConfig) => void;
  onSkip: () => void;
}

const FirebaseSetupWizard: React.FC<FirebaseSetupWizardProps> = ({ onComplete, onSkip }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [config, setConfig] = useState<FirebaseConfig>({
    apiKey: '',
    authDomain: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: '',
    vapidKey: '',
  });
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const totalSteps = 4;

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleInputChange = (field: keyof FirebaseConfig, value: string) => {
    setConfig({ ...config, [field]: value });
  };

  const isStepComplete = (step: number): boolean => {
    switch (step) {
      case 1:
        return true; // Just instructions
      case 2:
        return config.projectId.length > 0;
      case 3:
        return config.apiKey.length > 0 && config.authDomain.length > 0 &&
               config.projectId.length > 0 && config.storageBucket.length > 0 &&
               config.messagingSenderId.length > 0 && config.appId.length > 0;
      case 4:
        return config.vapidKey.length > 0;
      default:
        return false;
    }
  };

  const canProceed = isStepComplete(currentStep);

  const StepIndicator = ({ step, label }: { step: number; label: string }) => (
    <div className="flex items-center">
      <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
        currentStep > step ? 'bg-green-500' : currentStep === step ? 'bg-indigo-600' : 'bg-slate-300'
      }`}>
        {currentStep > step ? (
          <CheckCircle2 size={20} className="text-white" />
        ) : (
          <span className="text-white text-sm font-bold">{step}</span>
        )}
      </div>
      <span className={`ml-2 text-sm hidden sm:inline ${
        currentStep >= step ? 'text-slate-800 font-semibold' : 'text-slate-400'
      }`}>{label}</span>
    </div>
  );

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-lg border-2 border-indigo-200">
              <h3 className="text-xl font-bold text-slate-800 mb-4">Welcome to Firebase Setup! 🚀</h3>
              <p className="text-slate-700 mb-4">
                Push notifications are essential for FocusFlow to keep you and your daughter updated on tasks,
                reminders, and progress. This wizard will walk you through setting up Firebase Cloud Messaging.
              </p>
              <div className="bg-white p-4 rounded-lg border border-indigo-200">
                <p className="text-sm font-semibold text-slate-800 mb-2">Why Firebase?</p>
                <ul className="text-sm text-slate-600 space-y-1 list-disc list-inside">
                  <li>Free tier includes 10GB storage and generous messaging limits</li>
                  <li>Reliable push notifications for web and mobile</li>
                  <li>Takes only 5-10 minutes to set up</li>
                </ul>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-slate-800">What you'll need:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-start p-3 bg-slate-50 rounded-lg">
                  <CheckCircle2 size={20} className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-slate-700">Google Account</p>
                    <p className="text-xs text-slate-500">Any Gmail account works</p>
                  </div>
                </div>
                <div className="flex items-start p-3 bg-slate-50 rounded-lg">
                  <CheckCircle2 size={20} className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-slate-700">5-10 minutes</p>
                    <p className="text-xs text-slate-500">To create and configure project</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-lg border-2 border-blue-200">
              <h3 className="text-xl font-bold text-slate-800 mb-4">Step 1: Create Firebase Project</h3>
              <p className="text-slate-700 mb-4">
                Let's create a new Firebase project for FocusFlow.
              </p>
            </div>

            <div className="space-y-4">
              <div className="bg-white p-5 rounded-lg border-2 border-blue-200 shadow-sm">
                <p className="font-semibold text-slate-800 mb-3 flex items-center">
                  <span className="bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm mr-2">1</span>
                  Go to Firebase Console
                </p>
                <a
                  href="https://console.firebase.google.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Open Firebase Console <ExternalLink size={16} className="ml-2" />
                </a>
              </div>

              <div className="bg-white p-5 rounded-lg border-2 border-blue-200 shadow-sm">
                <p className="font-semibold text-slate-800 mb-3 flex items-center">
                  <span className="bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm mr-2">2</span>
                  Create a New Project
                </p>
                <ol className="text-sm text-slate-600 space-y-2 list-decimal list-inside ml-4">
                  <li>Click "Add project" or "Create a project"</li>
                  <li>Enter project name (e.g., "focusflow-app")</li>
                  <li>Accept terms and click "Continue"</li>
                  <li>Disable Google Analytics (not needed) or enable if you want</li>
                  <li>Click "Create project"</li>
                </ol>
              </div>

              <div className="bg-white p-5 rounded-lg border-2 border-blue-200 shadow-sm">
                <p className="font-semibold text-slate-800 mb-3 flex items-center">
                  <span className="bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm mr-2">3</span>
                  Enter Your Project ID
                </p>
                <p className="text-sm text-slate-600 mb-3">
                  Once created, you'll see your Project ID. Enter it below to continue:
                </p>
                <input
                  type="text"
                  value={config.projectId}
                  onChange={(e) => handleInputChange('projectId', e.target.value)}
                  placeholder="e.g., focusflow-app-12345"
                  className="w-full p-3 border-2 border-slate-300 rounded-lg focus:border-blue-500 focus:outline-none text-slate-800"
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-lg border-2 border-purple-200">
              <h3 className="text-xl font-bold text-slate-800 mb-4">Step 2: Get Your Firebase Config</h3>
              <p className="text-slate-700 mb-4">
                Now we need to add a web app to your project and get the configuration values.
              </p>
            </div>

            <div className="space-y-4">
              <div className="bg-white p-5 rounded-lg border-2 border-purple-200 shadow-sm">
                <p className="font-semibold text-slate-800 mb-3 flex items-center">
                  <span className="bg-purple-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm mr-2">1</span>
                  Add Web App to Your Project
                </p>
                <ol className="text-sm text-slate-600 space-y-2 list-decimal list-inside ml-4">
                  <li>In your Firebase project, click the gear icon ⚙️ next to "Project Overview"</li>
                  <li>Click "Project settings"</li>
                  <li>Scroll down to "Your apps" section</li>
                  <li>Click the web icon (&lt;/&gt;) to add a web app</li>
                  <li>Enter app nickname: "FocusFlow Web"</li>
                  <li>Click "Register app"</li>
                </ol>
              </div>

              <div className="bg-white p-5 rounded-lg border-2 border-purple-200 shadow-sm">
                <p className="font-semibold text-slate-800 mb-3 flex items-center">
                  <span className="bg-purple-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm mr-2">2</span>
                  Copy Your Config Values
                </p>
                <p className="text-sm text-slate-600 mb-3">
                  You'll see a code snippet with your Firebase configuration. Copy each value below:
                </p>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">API Key</label>
                    <input
                      type="text"
                      value={config.apiKey}
                      onChange={(e) => handleInputChange('apiKey', e.target.value)}
                      placeholder="AIza..."
                      className="w-full p-2 text-sm border-2 border-slate-300 rounded-lg focus:border-purple-500 focus:outline-none text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Auth Domain</label>
                    <input
                      type="text"
                      value={config.authDomain}
                      onChange={(e) => handleInputChange('authDomain', e.target.value)}
                      placeholder="your-project.firebaseapp.com"
                      className="w-full p-2 text-sm border-2 border-slate-300 rounded-lg focus:border-purple-500 focus:outline-none text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Storage Bucket</label>
                    <input
                      type="text"
                      value={config.storageBucket}
                      onChange={(e) => handleInputChange('storageBucket', e.target.value)}
                      placeholder="your-project.appspot.com"
                      className="w-full p-2 text-sm border-2 border-slate-300 rounded-lg focus:border-purple-500 focus:outline-none text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Messaging Sender ID</label>
                    <input
                      type="text"
                      value={config.messagingSenderId}
                      onChange={(e) => handleInputChange('messagingSenderId', e.target.value)}
                      placeholder="123456789012"
                      className="w-full p-2 text-sm border-2 border-slate-300 rounded-lg focus:border-purple-500 focus:outline-none text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">App ID</label>
                    <input
                      type="text"
                      value={config.appId}
                      onChange={(e) => handleInputChange('appId', e.target.value)}
                      placeholder="1:123456789012:web:abc123..."
                      className="w-full p-2 text-sm border-2 border-slate-300 rounded-lg focus:border-purple-500 focus:outline-none text-slate-800"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-lg border-2 border-green-200">
              <h3 className="text-xl font-bold text-slate-800 mb-4">Step 3: Enable Cloud Messaging & Get VAPID Key</h3>
              <p className="text-slate-700 mb-4">
                The final step is to enable Cloud Messaging and get your VAPID key for push notifications.
              </p>
            </div>

            <div className="space-y-4">
              <div className="bg-white p-5 rounded-lg border-2 border-green-200 shadow-sm">
                <p className="font-semibold text-slate-800 mb-3 flex items-center">
                  <span className="bg-green-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm mr-2">1</span>
                  Enable Cloud Messaging
                </p>
                <ol className="text-sm text-slate-600 space-y-2 list-decimal list-inside ml-4">
                  <li>In Firebase Console, click "Build" in the left sidebar</li>
                  <li>Click "Cloud Messaging"</li>
                  <li>If prompted, enable the Cloud Messaging API</li>
                </ol>
              </div>

              <div className="bg-white p-5 rounded-lg border-2 border-green-200 shadow-sm">
                <p className="font-semibold text-slate-800 mb-3 flex items-center">
                  <span className="bg-green-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm mr-2">2</span>
                  Get Your VAPID Key
                </p>
                <ol className="text-sm text-slate-600 space-y-2 list-decimal list-inside ml-4 mb-4">
                  <li>Go back to Project Settings (gear icon ⚙️)</li>
                  <li>Click the "Cloud Messaging" tab at the top</li>
                  <li>Scroll to "Web configuration" section</li>
                  <li>Under "Web Push certificates", click "Generate key pair" if you don't have one</li>
                  <li>Copy the key that appears</li>
                </ol>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">VAPID Key (Web Push Certificate)</label>
                  <input
                    type="text"
                    value={config.vapidKey}
                    onChange={(e) => handleInputChange('vapidKey', e.target.value)}
                    placeholder="BNdD..."
                    className="w-full p-2 text-sm border-2 border-slate-300 rounded-lg focus:border-green-500 focus:outline-none text-slate-800"
                  />
                </div>
              </div>

              <div className="bg-amber-50 border-2 border-amber-200 p-4 rounded-lg">
                <div className="flex items-start">
                  <AlertCircle className="text-amber-600 mr-2 flex-shrink-0" size={20} />
                  <div>
                    <p className="text-sm font-semibold text-amber-800">Almost Done!</p>
                    <p className="text-sm text-amber-700 mt-1">
                      After clicking "Complete Setup", your configuration will be saved locally.
                      You'll need to keep this browser to maintain your settings, or you can set up
                      a backend to sync across devices in the future.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 overflow-y-auto">
      <div className="min-h-screen flex items-start sm:items-center justify-center p-4 py-8">
        <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 sm:p-6 rounded-t-2xl">
            <h2 className="text-xl sm:text-2xl font-bold mb-2">Firebase Push Notifications Setup</h2>
            <p className="text-indigo-100 text-xs sm:text-sm">Set up notifications so you never miss important updates</p>
          </div>

          {/* Progress Steps */}
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200 bg-slate-50">
            <div className="flex justify-between items-center max-w-2xl mx-auto">
              <StepIndicator step={1} label="Introduction" />
              <div className="flex-1 h-1 bg-slate-300 mx-1 sm:mx-2"></div>
              <StepIndicator step={2} label="Create Project" />
              <div className="flex-1 h-1 bg-slate-300 mx-1 sm:mx-2"></div>
              <StepIndicator step={3} label="Get Config" />
              <div className="flex-1 h-1 bg-slate-300 mx-1 sm:mx-2"></div>
              <StepIndicator step={4} label="Enable Messaging" />
            </div>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6">
            {renderStep()}
          </div>

          {/* Footer */}
          <div className="px-4 sm:px-6 py-3 sm:py-4 bg-slate-50 rounded-b-2xl border-t border-slate-200 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
            <button
              onClick={onSkip}
              className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium transition-colors order-2 sm:order-1"
            >
              Skip for now
            </button>
            <div className="flex space-x-3 order-1 sm:order-2">
              {currentStep > 1 && (
                <button
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="flex-1 sm:flex-none px-5 py-2 border-2 border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 font-medium transition-colors"
                >
                  Back
                </button>
              )}
              {currentStep < totalSteps ? (
                <button
                  onClick={() => setCurrentStep(currentStep + 1)}
                  disabled={!canProceed}
                  className={`flex-1 sm:flex-none px-5 py-2 rounded-lg font-medium transition-colors ${
                    canProceed
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                      : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  Continue
                </button>
              ) : (
                <button
                  onClick={() => onComplete(config)}
                  disabled={!canProceed}
                  className={`flex-1 sm:flex-none px-5 py-2 rounded-lg font-medium transition-colors ${
                    canProceed
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  Complete Setup
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FirebaseSetupWizard;
