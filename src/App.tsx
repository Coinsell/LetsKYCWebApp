import { useState } from 'react'
import { KYCProvider } from './contexts/KYCContext'
import { WelcomeScreen } from './components/WelcomeScreen'
import { UserInfoStep } from './components/steps/UserInfoStep'
import { MobileOTPStep } from './components/steps/MobileOTPStep'
import { PANVerificationStep } from './components/steps/PANVerificationStep'
import { AadhaarStep } from './components/steps/AadhaarStep'
import { LivenessStep } from './components/steps/LivenessStep'
import { ReviewStep } from './components/steps/ReviewStep'
import { StepperNavigation } from './components/StepperNavigation'

function App() {
  const [currentStep, setCurrentStep] = useState(0)
  const [kycStarted, setKycStarted] = useState(false)

  const handleStartKYC = () => {
    setKycStarted(true)
    setCurrentStep(1)
  }

  const handleStepChange = (step: number) => {
    setCurrentStep(step)
  }

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return <UserInfoStep onNext={() => handleStepChange(2)} />
      case 2:
        return <MobileOTPStep onNext={() => handleStepChange(3)} onBack={() => handleStepChange(1)} />
      case 3:
        return <PANVerificationStep onNext={() => handleStepChange(4)} onBack={() => handleStepChange(2)} />
      case 4:
        return <AadhaarStep onNext={() => handleStepChange(5)} onBack={() => handleStepChange(3)} />
      case 5:
        return <LivenessStep onNext={() => handleStepChange(6)} onBack={() => handleStepChange(4)} />
      case 6:
        return <ReviewStep onBack={() => handleStepChange(5)} />
      default:
        return <WelcomeScreen onStartKYC={handleStartKYC} />
    }
  }

  return (
    <KYCProvider>
      <div className="min-h-screen bg-neutral-200 dark:bg-neutral-800">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {kycStarted && currentStep > 0 && (
            <StepperNavigation currentStep={currentStep} totalSteps={6} />
          )}
          {renderCurrentStep()}
        </div>
      </div>
    </KYCProvider>
  )
}

export default App