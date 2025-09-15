import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Progress } from "../../components/ui/progress";
import { LoadingSpinner } from "../../components/ui/loading-spinner";
import { CheckCircle, Clock, AlertCircle } from "lucide-react";
import { getKycStatusDisplayText } from "../../utils/kycStatusConverter";

// Contexts
import { useAuth } from "../../contexts/AuthContext";
import {
  useKYCAdmin,
  KYCDetail,
  KYCStatus,
  KycDetailType,
  UserKYCLevel,
  UserKYCDetail,
  FilterOperator,
} from "../../contexts/KYCAdminContext";

// APIs
import { userKycLevelsApi } from "../../lib/userkyclevelsapi";
import { userKycDetailsApi } from "../../lib/userkycdetailsapi";
import { userApi } from "../../lib/userapi";

// Step Components
import { AadhaarStep } from "../../components/steps/AadhaarStep";
import { AddressStep } from "../../components/steps/AddressStep";
import { LivenessStep } from "../../components/steps/LivenessStep";
import { MobileOTPStep } from "../../components/steps/MobileOTPStep";
import { PANVerificationStep } from "../../components/steps/PANVerificationStep";
import { UserInfoStep } from "../../components/steps/UserInfoStep";

// ✅ Import the provider
import { KYCProvider } from "../../contexts/KYCContext";

export function DynamicKYCJourneyPage() {
  const { user } = useAuth();
  const { state } = useKYCAdmin();
  const { userId: urlUserId } = useParams<{ userId: string }>();
  const [searchParams] = useSearchParams();
  const levelId = searchParams.get('level');
  
  // Debug URL parameters
  console.log('URL Debug Info:', {
    urlUserId,
    levelId,
    searchParams: Object.fromEntries(searchParams.entries()),
    currentPath: window.location.pathname,
    currentSearch: window.location.search
  });
  
  // Determine if this is a public access (no authentication required)
  const isPublicAccess = !!urlUserId && !!levelId;
  const currentUserId = isPublicAccess ? urlUserId : user?.id;
  
  console.log('Access Debug Info:', {
    isPublicAccess,
    currentUserId,
    user: user?.id
  });
  
  const [userKycLevel, setUserKycLevel] = useState<UserKYCLevel | null>(null);
  const [kycSteps, setKycSteps] = useState<(KYCDetail | UserKYCDetail)[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [kycSubmitted, setKycSubmitted] = useState(false);

  useEffect(() => {
    if (isPublicAccess || user) {
    fetchUserKYCData();
    }
  }, [user, urlUserId, levelId]);

  const fetchUserKYCData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('fetchUserKYCData called with:', {
        currentUserId,
        levelId,
        isPublicAccess,
        urlUserId
      });
      
      if (!currentUserId) {
        console.error('No currentUserId available');
        setError("User ID not available");
        return;
      }

      console.log('Fetching KYC data for user:', currentUserId, 'level:', levelId);
      
      // For public access, fetch real data from API
      if (isPublicAccess && levelId) {
        // First, fetch user information
        try {
          const userData = await userApi.get(currentUserId);
          setUserInfo(userData);
          console.log('User data fetched:', userData);
        } catch (userError) {
          console.error('Error fetching user data:', userError);
          // Continue without user info
        }

        // Get the user's KYC level record
        let userKycLevelRecord: UserKYCLevel | null = null;
        try {
          const userKycLevels = await userKycLevelsApi.listByUserId(currentUserId);
          console.log('All user KYC levels:', userKycLevels);
          
          // Find the record where userKycLevelId matches the levelId from URL
          userKycLevelRecord = userKycLevels.find(level => level.userKycLevelId === levelId) || null;
          console.log('User KYC level found in list:', userKycLevelRecord);
          
          if (!userKycLevelRecord) {
            // If not found by userKycLevelId, try the old field name for backward compatibility
            userKycLevelRecord = userKycLevels.find(level => (level as any).kycLevelId === levelId) || null;
            console.log('User KYC level found with old field name:', userKycLevelRecord);
          }
        } catch (listError) {
          console.error('Error fetching user KYC levels:', listError);
          throw new Error("Failed to fetch user KYC level");
        }

        if (!userKycLevelRecord) {
          setError("User KYC level not found for this user and level combination");
          return;
        }

        setUserKycLevel(userKycLevelRecord);

        // Now fetch the user's KYC details for this specific level
        try {
          console.log('Fetching KYC details for user:', currentUserId, 'and level:', levelId);
          
          // Use POST method with proper filtering to get only the records we need
          const kycDetailsResponse = await userKycDetailsApi.listEnhanced({
            page: 1,
            page_size: 100,
            fetch_all: true,
            filters: [
              {
                field: "userId",
                operator: FilterOperator.EQUALS,
                value: currentUserId
              },
              {
                field: "userKycLevelId", 
                operator: FilterOperator.EQUALS,
                value: levelId
              }
            ]
          });
          
          console.log('KYC details response:', kycDetailsResponse);
          console.log('Response items:', kycDetailsResponse.items);
          console.log('Response items length:', kycDetailsResponse.items?.length);
          
          const userKycDetails = kycDetailsResponse.items || [];
          console.log('User KYC details loaded:', userKycDetails);
          console.log('Number of steps found:', userKycDetails.length);
          
          if (userKycDetails.length === 0) {
            console.log('No KYC details found for this user and level');
            setError("No KYC steps found for this journey");
            return;
          }
          
          // Sort steps by sequence to ensure correct order
          const sortedSteps = userKycDetails.sort((a, b) => a.sequence - b.sequence);
          console.log('Sorted steps by sequence:', sortedSteps);
          setKycSteps(sortedSteps);
          
          // Initialize completed steps - only mark as completed if status is 1 in database
          // For now, we'll start with no completed steps so user can go through the journey
          const completedStepIds = sortedSteps
            .filter(detail => (detail as any).status === 1) // 1 means completed
            .map(detail => detail.userKycDetailId); // Use userKycDetailId as the step identifier
          console.log('Completed step IDs from database:', completedStepIds);
          
          // For demo purposes, let's start with no completed steps so user can go through the journey
          setCompletedSteps([]);
          
        } catch (detailsError) {
          console.error('Error fetching user KYC details:', detailsError);
          setError("Failed to load KYC journey steps");
        }
      } else {
        // For authenticated access, use mock data (existing behavior)
        const mockUserKycLevel: UserKYCLevel = {
        id: "1",
          userId: user?.id || "",
          userKycLevelId: "kyc-level-1",
        code: "BASIC",
        description: "Basic KYC Level",
        status: KYCStatus.InProgress,
          maxDepositAmount: 0,
          maxWithdrawalAmount: 0,
          duration: 0,
          timeUnit: 0 as any,
          docType: "UserKycLevel",
          lastUpdated: new Date().toISOString(),
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
      }
    } catch (error) {
      console.error("Failed to fetch KYC data:", error);
      setError("Failed to load KYC journey");
    } finally {
      setLoading(false);
    }
  };

  const handleStepComplete = (stepId: string) => {
    console.log("Step Completed:", stepId);
    setCompletedSteps((prev) => [...prev, stepId]);
    
    // Find the next step index - handle both KYCDetail and UserKYCDetail formats
    const nextStepIndex = kycSteps.findIndex((step: KYCDetail | UserKYCDetail) => {
      if ('userKycDetailId' in step) {
        return step.userKycDetailId === stepId;
      } else {
        return step.id === stepId;
      }
    }) + 1;
    
    if (nextStepIndex < kycSteps.length) {
      setCurrentStep(nextStepIndex);
    } else {
      // This was the last step - mark as submitted and move to completion state
      console.log('Last step completed - KYC journey submitted!');
      setKycSubmitted(true);
      setCurrentStep(kycSteps.length);
    }
  };

  const getStepStatus = (step: KYCDetail | UserKYCDetail) => {
    const stepId = 'userKycDetailId' in step ? step.userKycDetailId : step.id;
    // If KYC is submitted, all steps are completed
    if (kycSubmitted) return "completed";
    if (completedSteps.includes(stepId)) return "completed";
    if (kycSteps.findIndex((s) => {
      const sId = 'userKycDetailId' in s ? s.userKycDetailId : s.id;
      return sId === stepId;
    }) === currentStep) return "current";
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

  const renderStepComponent = (step: KYCDetail | UserKYCDetail, stepIndex: number) => {
    const stepId = 'userKycDetailId' in step ? step.userKycDetailId : step.id;
    const stepType = (step as any).type;
    
    // Map UserKYCDetail type to KycDetailType if needed
    let mappedType = stepType;
    if (typeof stepType === 'number') {
      console.log('Mapping step type:', { stepType, stepId });
      switch (stepType) {
        case 0:
          mappedType = KycDetailType.general;
          break;
        case 1:
          mappedType = KycDetailType.phoneNo;
          break;
        case 2:
          mappedType = KycDetailType.address;
          break;
        case 3:
          mappedType = KycDetailType.addressProof;
          break;
        case 4:
          mappedType = KycDetailType.selfie;
          break;
        case 5:
          mappedType = KycDetailType.identityProof;
          break;
        case 6:
          mappedType = KycDetailType.occupation;
          break;
        case 7:
          mappedType = KycDetailType.pepDeclaration;
          break;
        case 8:
          mappedType = KycDetailType.userInfo;
          break;
        case 9:
          mappedType = KycDetailType.aadhaar;
          break;
        case 10:
          mappedType = KycDetailType.pan;
          break;
        case 11:
          mappedType = KycDetailType.liveliness;
          break;
        default:
          mappedType = KycDetailType.general;
      }
      console.log('Mapped type result:', { stepType, mappedType });
    }
    
    const props = { onComplete: () => handleStepComplete(stepId) };
    const isFirstStep = stepIndex === 0;
    const isLastStep = stepIndex === kycSteps.length - 1;
    
    // Debug logging
    console.log('Step rendering debug:', {
      stepIndex,
      totalSteps: kycSteps.length,
      isLastStep,
      stepType: mappedType,
      stepId,
      buttonText: isLastStep ? "Complete" : "Continue",
      stepSequence: (step as any).sequence,
      stepName: step.step
    });
    
    switch (mappedType) {
      case KycDetailType.userInfo:
        return (
          <UserInfoStep
            onNext={() => {
              handleStepComplete(stepId);
            }}
            buttonText={isLastStep ? "Complete" : "Save & Continue"}
            {...props}
          />
        );
      case KycDetailType.phoneNo:
        return (
          <MobileOTPStep
            onNext={() => {
              handleStepComplete(stepId);
            }}
            onBack={isFirstStep ? undefined : () => setCurrentStep(prev => Math.max(prev - 1, 0))}
            buttonText={isLastStep ? "Complete" : "Continue"}
            {...props}
          />
        );
      case KycDetailType.address:
        return (
          <AddressStep
            onNext={() => {
              handleStepComplete(stepId);
            }}
            onBack={isFirstStep ? undefined : () => setCurrentStep(prev => Math.max(prev - 1, 0))}
            buttonText={isLastStep ? "Complete" : "Continue"}
            {...props}
          />
        );
      case KycDetailType.aadhaar:
        return (
          <AadhaarStep
            onNext={() => {
              handleStepComplete(stepId);
            }}
            onBack={isFirstStep ? undefined : () => setCurrentStep(prev => Math.max(prev - 1, 0))}
            buttonText={isLastStep ? "Complete" : "Continue"}
            {...props}
          />
        );
      case KycDetailType.pan:
        return (
          <PANVerificationStep
            onNext={() => {
              handleStepComplete(stepId);
            }}
            onBack={isFirstStep ? undefined : () => setCurrentStep(prev => Math.max(prev - 1, 0))}
            buttonText={isLastStep ? "Complete" : "Continue"}
            {...props}
          />
        );
      case KycDetailType.liveliness:
        return (
          <LivenessStep
            onNext={() => {
              handleStepComplete(stepId);
            }}
            onBack={isFirstStep ? undefined : () => setCurrentStep(prev => Math.max(prev - 1, 0))}
            buttonText={isLastStep ? "Complete" : "Continue to Review"}
            {...props}
          />
        );
      default:
        return (
          <Card>
            <CardContent className="p-6">
              <p>Unknown step type: {stepType}</p>
              <p>Step: {step.step || step.description}</p>
              <p>Mapped Type: {mappedType}</p>
              <Button onClick={() => handleStepComplete(stepId)}>
                Mark as Complete
              </Button>
            </CardContent>
          </Card>
        );
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

  const progressPercentage = kycSubmitted ? 100 : (kycSteps.length > 0 ? (completedSteps.length / kycSteps.length) * 100 : 0);
  
  // Debug logging
  console.log('Current state:', {
    kycStepsLength: kycSteps.length,
    completedStepsLength: completedSteps.length,
    progressPercentage,
    currentStep,
    isPublicAccess,
    levelId,
    urlUserId,
    stepSequences: kycSteps.map(step => ({ sequence: step.sequence, step: step.step, type: (step as any).type }))
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="text-center">
              <LoadingSpinner fullscreen={false} />
              <p className="mt-4">Loading KYC journey...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="text-center">
              <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
              <p className="text-red-600">{error}</p>
              {isPublicAccess && (
                <p className="text-sm text-neutral-500 mt-2">
                  User ID: {urlUserId}, Level ID: {levelId}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          {/* Header with User Info */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
              KYC Verification Journey
            </h1>
            <p className="mt-2 text-lg text-neutral-600 dark:text-neutral-400">
              Complete your KYC verification process step by step
            </p>
            {isPublicAccess && userInfo && (
              <div className="mt-4 p-4 bg-primary-1/5 dark:bg-primary-1/10 rounded-lg border border-primary-1/20">
                <div className="flex items-center justify-center gap-4">
                  <div className="text-center">
                    <p className="text-sm font-medium text-primary-1">
                      Welcome, {userInfo.firstName} {userInfo.lastName}
                    </p>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400">
                      {userInfo.login}
                    </p>
                  </div>
                </div>
              </div>
            )}
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
                    {kycSubmitted ? `${kycSteps.length} of ${kycSteps.length} completed` : `${completedSteps.length} of ${kycSteps.length} completed`}
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
                  const stepId = 'userKycDetailId' in step ? step.userKycDetailId : step.id;
                  return (
                    <div key={stepId} className="space-y-2">
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

                      {/* ✅ Render component right after the active step - hide when KYC is submitted */}
                      {!kycSubmitted && (index === currentStep || (currentStep >= kycSteps.length && index === kycSteps.length - 1 && completedSteps.length < kycSteps.length)) && (
                        <KYCProvider>
                          <div className="p-4 border rounded-lg bg-neutral-50 dark:bg-neutral-800">
                            {(() => {
                              console.log('Rendering step component:', {
                                index,
                                currentStep,
                                isLastStep: index === kycSteps.length - 1,
                                stepType: (step as any).type,
                                stepId,
                                allStepsCompleted: completedSteps.length === kycSteps.length
                              });
                              return renderStepComponent(step, index);
                            })()}
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

              {/* Final Completion Message - Show when KYC is submitted */}
              {kycSubmitted && (
                <div className="text-center p-6 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-green-700 dark:text-green-400 mb-2">
                    KYC Submitted Successfully!
                  </h3>
                  <p className="text-lg text-green-600 dark:text-green-500 mb-4">
                    Your KYC verification has been submitted and is now under review.
                  </p>
                  <div className="bg-white dark:bg-neutral-800 p-4 rounded-lg border border-green-200 dark:border-green-700">
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      <strong>What happens next?</strong>
                    </p>
                    <ul className="text-sm text-neutral-600 dark:text-neutral-400 mt-2 space-y-1">
                      <li>• Our compliance team will review your documents</li>
                      <li>• You'll receive an email notification once approved</li>
                      <li>• The process typically takes 1-2 business days</li>
                    </ul>
                  </div>
                  {isPublicAccess && (
                    <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                      <p className="text-sm text-blue-600 dark:text-blue-400">
                        <strong>Note:</strong> This is a public KYC journey. You can close this page now.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
        </div>
      </div>
    </div>
  );
}
