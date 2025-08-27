import { Progress } from './ui/progress'
import { Badge } from './ui/badge'

interface StepperNavigationProps {
  currentStep: number
  totalSteps: number
}

export function StepperNavigation({ currentStep, totalSteps }: StepperNavigationProps) {
  const progress = (currentStep / totalSteps) * 100

  const stepNames = [
    'Personal Info',
    'Mobile OTP',
    'PAN Verification',
    'Aadhaar e-KYC',
    'Liveness Check',
    'Review & Submit'
  ]

  return (
    <div className="mb-8 bg-white rounded-lg p-6 shadow-sm border border-neutral-300">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-neutral-800">KYC Verification Progress</h2>
        <Badge variant="outline">
          Step {currentStep} of {totalSteps}
        </Badge>
      </div>
      
      <div className="mb-4">
        <Progress value={progress} className="h-2" />
      </div>
      
      <div className="flex justify-between text-sm">
        {stepNames.map((name, index) => (
          <div
            key={index}
            className={`text-center ${
              index + 1 === currentStep
                ? 'text-primary-1 font-semibold'
                : index + 1 < currentStep
                ? 'text-green-600'
                : 'text-neutral-500'
            }`}
          >
            <div className="hidden sm:block">{name}</div>
            <div className="sm:hidden">{index + 1}</div>
          </div>
        ))}
      </div>
    </div>
  )
}