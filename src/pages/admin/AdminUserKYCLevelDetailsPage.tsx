import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import {
  UserKYCLevel,
  UserKYCDetail,
  KYCStatus,
  KycDetailType,
  TimeUnit,
} from "../../contexts/KYCAdminContext";
import { userKycLevelsApi } from "../../lib/userkyclevelsapi";
import { userKycDetailsApi } from "../../lib/userkycdetailsapi";
import { LoadingSpinner } from "../../components/ui/loading-spinner";
import { getKycStatusDisplayText, getKycStatusColor } from "../../utils/kycStatusConverter";
import { ArrowLeft, CheckCircle, Clock, XCircle, Paperclip, Pencil, Trash2 } from "lucide-react";

export function AdminUserKYCLevelDetailsPage() {
  const { levelId } = useParams<{ levelId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userKycLevel, setUserKycLevel] = useState<UserKYCLevel | null>(null);
  const [userKycDetails, setUserKycDetails] = useState<UserKYCDetail[]>([]);

  useEffect(() => {
    if (levelId) {
      fetchData();
    }
  }, [levelId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      if (!levelId) {
        console.error("No level ID provided");
        return;
      }

      // Fetch user KYC level data
      // Note: We need to get the userId from the levelId or pass it as a parameter
      // For now, we'll try to fetch by levelId and handle the API response
      try {
        // First, let's get all user KYC levels to find the one with matching levelId
        const allLevels = await userKycLevelsApi.getAll();
        const foundLevel = allLevels.find(level => level.id === levelId || level.userKycLevelId === levelId);
        
        if (foundLevel) {
          setUserKycLevel(foundLevel);
          
          // Now fetch the KYC details for this user
          const details = await userKycDetailsApi.getAll();
          const userDetails = details.filter(detail => 
            detail.userId === foundLevel.userId && 
            detail.userKycLevelId === foundLevel.userKycLevelId
          );
          setUserKycDetails(userDetails);
        } else {
          console.error("User KYC level not found");
        }
      } catch (apiError) {
        console.error("API error:", apiError);
        // Fallback to empty state
        setUserKycLevel(null);
        setUserKycDetails([]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (level: UserKYCLevel) => {
    // TODO: Implement edit functionality
    console.log("Edit user KYC level:", level);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this user KYC level?")) {
      try {
        await userKycLevelsApi.delete(id, userKycLevel?.userId || "");
        navigate("/admin/user-kyc-levels");
      } catch (error) {
        console.error("Error deleting user KYC level:", error);
      }
    }
  };

  const handleEditDetail = (detail: UserKYCDetail) => {
    // TODO: Implement edit detail functionality
    console.log("Edit user KYC detail:", detail);
  };

  const handleDeleteDetail = async (detailId: string) => {
    if (confirm("Are you sure you want to delete this verification step?")) {
      try {
        await userKycDetailsApi.delete(detailId);
        setUserKycDetails(prev => prev.filter(detail => detail.id !== detailId));
      } catch (error) {
        console.error("Error deleting user KYC detail:", error);
      }
    }
  };

  const getKycDetailTypeLabel = (type: KycDetailType) => {
    const typeLabels: Record<KycDetailType, string> = {
      [KycDetailType.general]: "General",
      [KycDetailType.phoneNo]: "Phone Number",
      [KycDetailType.address]: "Address",
      [KycDetailType.addressProof]: "Address Proof",
      [KycDetailType.selfie]: "Selfie",
      [KycDetailType.identityProof]: "Identity Proof",
      [KycDetailType.occupation]: "Occupation",
      [KycDetailType.pepDeclaration]: "PEP Declaration",
      [KycDetailType.userInfo]: "User Info",
      [KycDetailType.aadhaar]: "Aadhaar",
      [KycDetailType.pan]: "PAN",
      [KycDetailType.liveliness]: "Liveliness Check",
    };
    return typeLabels[type] || type;
  };

  const getStatusIcon = (status: KYCStatus) => {
    switch (status) {
      case KYCStatus.Approved:
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case KYCStatus.InProgress:
        return <Clock className="h-4 w-4 text-blue-600" />;
      case KYCStatus.UnderReview:
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case KYCStatus.Rejected:
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  if (loading) {
    return <LoadingSpinner fullscreen={false} />;
  }

  if (!userKycLevel) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <p className="text-neutral-500">User KYC Level not found.</p>
          <Button onClick={() => navigate("/admin/user-kyc-levels")} className="mt-4">
            Back to User KYC Levels
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => navigate("/admin/user-kyc-levels")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to User KYC Levels
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              {userKycLevel.code} - User KYC Level Details
            </h1>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
              {userKycLevel.description}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => handleEdit(userKycLevel)}
          >
            <Pencil className="h-4 w-4 mr-2" />
            Edit Level
          </Button>
          <Button
            variant="outline"
            onClick={() => handleDelete(userKycLevel.id)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Level
          </Button>
        </div>
      </div>

      {/* KYC Level Overview */}
      <Card>
        <CardHeader>
          <CardTitle>KYC Level Overview</CardTitle>
          <CardDescription>
            Details and requirements for this user's KYC level
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <h3 className="font-semibold text-lg mb-2">Level Code</h3>
              <Badge variant="outline" className="text-lg px-3 py-1">
                {userKycLevel.code}
              </Badge>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Status</h3>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${getKycStatusColor(userKycLevel.status)}`}
              >
                {getKycStatusDisplayText(userKycLevel.status)}
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Max Deposit</h3>
              <p className="text-2xl font-bold text-green-600">
                ${userKycLevel.maxDepositAmount?.toLocaleString()}
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Max Withdrawal</h3>
              <p className="text-2xl font-bold text-blue-600">
                ${userKycLevel.maxWithdrawalAmount?.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold text-lg mb-2">User ID</h3>
              <p className="text-lg font-mono">{userKycLevel.userId}</p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Duration</h3>
              <p className="text-lg">
                {userKycLevel.duration} {userKycLevel.timeUnit}
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Last Updated</h3>
              <p className="text-lg">
                {new Date(userKycLevel.lastUpdated).toLocaleDateString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Verification Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Verification Steps</CardTitle>
          <CardDescription>
            Complete these steps to maintain this KYC level
          </CardDescription>
        </CardHeader>
        <CardContent>
          {userKycDetails.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-neutral-500">No verification steps found for this level.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {userKycDetails
                .sort((a, b) => a.sequence - b.sequence)
                .map((detail) => (
                <div
                  key={detail.id}
                  className="flex items-center justify-between p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge variant="outline" className="text-xs">
                        Step {detail.sequence}
                      </Badge>
                      <h3 className="font-semibold text-lg">{detail.step}</h3>
                      <Badge variant="outline" className="text-xs">
                        {getKycDetailTypeLabel(detail.type)}
                      </Badge>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(detail.status)}
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${getKycStatusColor(detail.status)}`}
                        >
                          {getKycStatusDisplayText(detail.status)}
                        </span>
                      </div>
                    </div>
                    <p className="text-neutral-600 dark:text-neutral-400 mb-2">
                      {detail.description}
                    </p>
                    <div className="flex gap-4 text-sm text-neutral-500">
                      <span>
                        <strong>Type:</strong> {getKycDetailTypeLabel(detail.type)}
                      </span>
                      {detail.hasAttachments && (
                        <span className="flex items-center gap-1">
                          <Paperclip className="h-4 w-4 text-blue-600" />
                          {detail.attachments.length} attachment(s)
                        </span>
                      )}
                      <span>
                        <strong>Last Updated:</strong> {new Date(detail.lastUpdated).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditDetail(detail)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteDetail(detail.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
