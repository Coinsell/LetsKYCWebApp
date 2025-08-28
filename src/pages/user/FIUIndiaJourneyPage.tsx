import { useState } from 'react'
import { KYCProvider } from '../../contexts/KYCContext'
import { WelcomeScreen } from '../../components/WelcomeScreen'
import { UserInfoStep } from '../../components/steps/UserInfoStep'
import { MobileOTPStep } from '../../components/steps/MobileOTPStep'
import { PANVerificationStep } from '../../components/steps/PANVerificationStep'
import { AadhaarStep } from '../../components/steps/AadhaarStep'
import { LivenessStep } from '../../components/steps/LivenessStep'
import { ReviewStep } from '../../components/steps/ReviewStep'
import { StepperNavigation } from '../../components/StepperNavigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'

export function FIUIndiaJourneyPage() {
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            FIU India KYC Journey
          </h1>
          <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
            Sample KYC journey for Financial Intelligence Unit (India) compliance
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          Sample Journey
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>FIU India Compliance Journey</CardTitle>
          <CardDescription>
            This is a sample KYC journey designed for FIU India compliance requirements.
            It includes PAN verification, Aadhaar e-KYC, and liveness detection.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <KYCProvider>
            <div className="max-w-4xl mx-auto">
              {kycStarted && currentStep > 0 && (
                <StepperNavigation currentStep={currentStep} totalSteps={6} />
              )}
              {renderCurrentStep()}
            </div>
          </KYCProvider>
        </CardContent>
      </Card>
    </div>
  )
}