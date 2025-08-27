import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { CheckCircle, Circle, Shield, FileText, Smartphone, Camera, UserCheck, ClipboardCheck } from 'lucide-react'

interface WelcomeScreenProps {
  onStartKYC: () => void
}

export function WelcomeScreen({ onStartKYC }: WelcomeScreenProps) {
  const steps = [
    { id: 1, title: 'Personal Information', icon: UserCheck, status: 'pending' },
    { id: 2, title: 'Mobile Verification', icon: Smartphone, status: 'pending' },
    { id: 3, title: 'PAN Verification', icon: FileText, status: 'pending' },
    { id: 4, title: 'Aadhaar e-KYC', icon: Shield, status: 'pending' },
    { id: 5, title: 'Liveness Check', icon: Camera, status: 'pending' },
    { id: 6, title: 'Review & Submit', icon: ClipboardCheck, status: 'pending' },
  ]

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-neutral-800">
            Complete Your KYC Verification
          </CardTitle>
          <CardDescription className="text-lg mt-2">
            As per FIU/PMLA regulations, we need to verify your identity, PAN and contactability
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-secondary-2 p-4 rounded-lg border border-neutral-300">
            <h3 className="font-semibold text-neutral-800 mb-3">Verification Steps</h3>
            <div className="space-y-3">
              {steps.map((step) => {
                const Icon = step.icon
                return (
                  <div key={step.id} className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      {step.status === 'completed' ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <Circle className="w-5 h-5 text-neutral-400" />
                      )}
                    </div>
                    <Icon className="w-5 h-5 text-neutral-600" />
                    <span className="text-neutral-700 flex-1">{step.title}</span>
                    <Badge variant={step.status === 'completed' ? 'success' : 'pending'}>
                      {step.status === 'completed' ? 'Completed' : 'Pending'}
                    </Badge>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-2">What You'll Need</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Valid PAN card details</li>
              <li>• Mobile number for OTP verification</li>
              <li>• Aadhaar offline e-KYC file (XML/ZIP from UIDAI)</li>
              <li>• Camera access for liveness verification</li>
            </ul>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <h4 className="font-semibold text-yellow-800 mb-2">Important Notes</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• This process is secure and compliant with FIU regulations</li>
              <li>• Your data is encrypted and stored securely</li>
              <li>• The entire process takes approximately 10-15 minutes</li>
            </ul>
          </div>

          <div className="flex justify-center pt-4">
            <Button onClick={onStartKYC} size="lg" className="px-8">
              Start KYC Verification
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}