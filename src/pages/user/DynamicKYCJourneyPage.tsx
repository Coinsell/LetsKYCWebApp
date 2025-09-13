import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Progress } from "../../components/ui/progress";
import { CheckCircle, Clock, AlertCircle } from "lucide-react";
import { getKycStatusDisplayText } from "../../utils/kycStatusConverter";

// Contexts
import { useAuth } from "../../contexts/AuthContext";
import {
  useKYCAdmin,
  KYCDetail,
  KYCStatus,
  KycDetailType,
} from "../../contexts/KYCAdminContext";

// Step Components
import { AadhaarStep } from "../../components/steps/AadhaarStep";
import { LivenessStep } from "../../components/steps/LivenessStep";
import { MobileOTPStep } from "../../components/steps/MobileOTPStep";
import { PANVerificationStep } from "../../components/steps/PANVerificationStep";
import { UserInfoStep } from "../../components/steps/UserInfoStep";

// ✅ Import the provider
import { KYCProvider } from "../../contexts/KYCContext";

export function DynamicKYCJourneyPage() {
  const { user } = useAuth();
  const { state } = useKYCAdmin();
  const [userKycLevel, setUserKycLevel] = useState<any>(null);
  const [kycSteps, setKycSteps] = useState<KYCDetail[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  useEffect(() => {
    fetchUserKYCData();
  }, [user]);

  const fetchUserKYCData = async () => {
    try {
      const mockUserKycLevel = {
        id: "1",
        userId: user?.id,
        kycLevelId: "kyc-level-1",
        code: "BASIC",
        description: "Basic KYC Level",
        status: KYCStatus.InProgress,
      };

      const mockKycSteps: KYCDetail[] = [
        {
          id: "1",
          kycLevelId: "kyc-level-1",
          sequence: 1,
          step: "User Information",
          description: "Provide your basic personal details",
          type: KycDetailType.userInfo,
          status: KYCStatus.NotSubmitted,
          hasAttachments: false,
        },
        {
          id: "2",
          kycLevelId: "kyc-level-1",
          sequence: 2,
          step: "Mobile Verification",
          description: "Verify your phone number with OTP",
          type: KycDetailType.phoneNo,
          status: KYCStatus.NotSubmitted,
          hasAttachments: false,
        },
        {
          id: "3",
          kycLevelId: "kyc-level-1",
          sequence: 3,
          step: "Aadhaar Verification",
          description: "Verify Aadhaar number and details",
          type: KycDetailType.aadhaar,
          status: KYCStatus.NotSubmitted,
          hasAttachments: false,
        },
        {
          id: "4",
          kycLevelId: "kyc-level-1",
          sequence: 4,
          step: "PAN Verification",
          description: "Verify PAN details",
          type: KycDetailType.pan,
          status: KYCStatus.NotSubmitted,
          hasAttachments: false,
        },
        {
          id: "5",
          kycLevelId: "kyc-level-1",
          sequence: 5,
          step: "Liveness Check",
          description: "Complete your liveness verification",
          type: KycDetailType.liveliness,
          status: KYCStatus.NotSubmitted,
          hasAttachments: true,
        },
      ];

      setUserKycLevel(mockUserKycLevel);
      setKycSteps(mockKycSteps.sort((a, b) => a.sequence - b.sequence));
    } catch (error) {
      console.error("Failed to fetch KYC data:", error);
    }
  };

  const handleStepComplete = (stepId: string) => {
    console.log("User Info Step Completed");
    setCompletedSteps((prev) => [...prev, stepId]);
    const nextStepIndex = kycSteps.findIndex((step) => step.id === stepId) + 1;
    if (nextStepIndex < kycSteps.length) {
      setCurrentStep(nextStepIndex);
    }
  };

  const getStepStatus = (step: KYCDetail) => {
    if (completedSteps.includes(step.id)) return "completed";
    if (kycSteps.findIndex((s) => s.id === step.id) === currentStep)
      return "current";
    return "pending";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "current":
        return <Clock className="h-5 w-5 text-blue-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-neutral-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="success">Completed</Badge>;
      case "current":
        return <Badge variant="default">In Progress</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  const renderStepComponent = (step: KYCDetail) => {
    const props = { onComplete: () => handleStepComplete(step.id) };
    switch (step.type) {
      case KycDetailType.userInfo:
        return (
          <UserInfoStep
            onNext={() => {
              handleStepComplete(step.id);
            }}
            {...props}
          />
        );
      case KycDetailType.phoneNo:
        return (
          <MobileOTPStep
            onNext={() => {
              handleStepComplete(step.id);
            }}
            onBack={() => {}}
            {...props}
          />
        );
      case KycDetailType.aadhaar:
        return (
          <AadhaarStep
            onNext={() => {
              handleStepComplete(step.id);
            }}
            onBack={() => {}}
            {...props}
          />
        );
      case KycDetailType.pan:
        return (
          <PANVerificationStep
            onNext={() => {
              handleStepComplete(step.id);
            }}
            onBack={() => {}}
            {...props}
          />
        );
      case KycDetailType.liveliness:
        return (
          <LivenessStep
            onNext={() => {
              handleStepComplete(step.id);
            }}
            onBack={() => {}}
            {...props}
          />
        );
      default:
        return null;
    }
  };

  // const renderStepComponent = (step: KYCDetail) => {
  //   const props = { onComplete: () => handleStepComplete(step.id) };

  //   const handleNext = () => {
  //     handleStepComplete(step.id); // mark this step complete
  //     setCurrentStep((prev) => prev + 1); // move to the next step
  //   };

  //   const handleBack = () => {
  //     setCurrentStep((prev) => Math.max(prev - 1, 0)); // go back, but not below 0
  //   };

  //   switch (step.type) {
  //     case KycDetailType.userInfo:
  //       return <UserInfoStep onNext={handleNext} {...props} />;
  //     case KycDetailType.phoneNo:
  //       return (
  //         <MobileOTPStep onNext={handleNext} onBack={handleBack} {...props} />
  //       );
  //     case KycDetailType.aadhaar:
  //       return (
  //         <AadhaarStep onNext={handleNext} onBack={handleBack} {...props} />
  //       );
  //     case KycDetailType.pan:
  //       return (
  //         <PANVerificationStep
  //           onNext={handleNext}
  //           onBack={handleBack}
  //           {...props}
  //         />
  //       );
  //     case KycDetailType.liveliness:
  //       return (
  //         <LivenessStep onNext={handleNext} onBack={handleBack} {...props} />
  //       );
  //     default:
  //       return null;
  //   }
  // };

  const progressPercentage = (completedSteps.length / kycSteps.length) * 100;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
          Your KYC Journey
        </h1>
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
          Complete your KYC verification process step by step
        </p>
      </div>

      {userKycLevel && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>KYC Level: {userKycLevel.code}</CardTitle>
                <CardDescription>{userKycLevel.description}</CardDescription>
              </div>
              <Badge
                variant={
                  userKycLevel.status === KYCStatus.Approved
                    ? "success"
                    : userKycLevel.status === KYCStatus.InProgress
                    ? "default"
                    : "secondary"
                }
              >
                {getKycStatusDisplayText(userKycLevel.status)}
              </Badge>
            </div>
          </CardHeader>

          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Progress</span>
                  <span className="text-sm text-neutral-600">
                    {completedSteps.length} of {kycSteps.length} completed
                  </span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
              </div>

              {/* Step List */}
              {/* <div className="space-y-3">
                {kycSteps.map((step) => {
                  const status = getStepStatus(step);
                  return (
                    <div
                      key={step.id}
                      className={`flex items-center justify-between p-4 rounded-lg border ${
                        status === "current"
                          ? "border-primary-1 bg-primary-1/5"
                          : "border-neutral-200 dark:border-neutral-700"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        {getStatusIcon(status)}
                        <div>
                          <h3 className="font-medium">{step.step}</h3>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400">
                            {step.description}
                          </p>
                          {step.hasAttachments && (
                            <p className="text-xs text-neutral-500 mt-1">
                              📎 Attachments required
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {getStatusBadge(status)}
                      </div>
                    </div>
                  );
                })}
              </div> */}

              {/* Step List */}
              <div className="space-y-3">
                {kycSteps.map((step, index) => {
                  const status = getStepStatus(step);
                  return (
                    <div key={step.id} className="space-y-2">
                      {/* Step Header */}
                      <div
                        className={`flex items-center justify-between p-4 rounded-lg border ${
                          status === "current"
                            ? "border-primary-1 bg-primary-1/5"
                            : "border-neutral-200 dark:border-neutral-700"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          {getStatusIcon(status)}
                          <div>
                            <h3 className="font-medium">{step.step}</h3>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400">
                              {step.description}
                            </p>
                            {step.hasAttachments && (
                              <p className="text-xs text-neutral-500 mt-1">
                                📎 Attachments required
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {getStatusBadge(status)}
                        </div>
                      </div>

                      {/* ✅ Render component right after the active step */}
                      {index === currentStep && (
                        <KYCProvider>
                          <div className="p-4 border rounded-lg bg-neutral-50 dark:bg-neutral-800">
                            {renderStepComponent(step)}
                          </div>
                        </KYCProvider>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* {kycSteps[currentStep] && (
                <KYCProvider>
                  <div className="mt-6 p-4 border rounded-lg bg-neutral-50 dark:bg-neutral-800">
                    {renderStepComponent(kycSteps[currentStep])}
                  </div>
                </KYCProvider>
              )} */}

              {/* Final Completion Message */}
              {completedSteps.length === kycSteps.length && (
                <div className="text-center p-6 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-green-700 dark:text-green-400">
                    KYC Journey Complete!
                  </h3>
                  <p className="text-sm text-green-600 dark:text-green-500 mt-2">
                    Your KYC verification is now under review. You'll be
                    notified once approved.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
