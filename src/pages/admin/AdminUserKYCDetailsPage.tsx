import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import {
  useKYCAdmin,
  UserKYCDetail,
  User,
  KYCStatus,
  KycDetailType,
} from "../../contexts/KYCAdminContext";
import { Plus, Pencil, Trash2, Eye, Search, Paperclip } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { userKycDetailsApi } from "../../lib/userkycdetailsapi";
import { userApi } from "../../lib/userapi";
import { LoadingSpinner } from "../../components/ui/loading-spinner";
import { getKycStatusDisplayText, getKycStatusColor } from "../../utils/kycStatusConverter";

export function AdminUserKYCDetailsPage() {
  const { state, dispatch } = useKYCAdmin();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [userKycDetails, setUserKycDetails] = useState<UserKYCDetail[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch real data from APIs
      const [usersData, userKycDetailsData] = await Promise.all([
        userApi.list(),
        userKycDetailsApi.getAll(),
      ]);
      
      setUsers(usersData);
      setUserKycDetails(userKycDetailsData);
    } catch (error) {
      console.error("Error fetching data:", error);
      setUsers([]);
      setUserKycDetails([]);
    } finally {
      setLoading(false);
    }
  };

  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user ? `${user.firstName} ${user.lastName}` : "Unknown User";
  };

  const getUserEmail = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user?.login || "Unknown Email";
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

  const handleCreate = () => {
    navigate("/admin/user-kyc-details/new");
  };

  const handleEdit = (id: string) => {
    navigate(`/admin/user-kyc-details/${id}/edit`);
  };

  const handleView = (id: string) => {
    navigate(`/admin/user-kyc-details/${id}`);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this user KYC detail?")) {
      try {
        await userKycDetailsApi.delete(id);
        setUserKycDetails(prev => prev.filter(detail => detail.id !== id));
      } catch (error) {
        console.error("Error deleting user KYC detail:", error);
      }
    }
  };

  const filteredUserKycDetails = userKycDetails.filter(detail =>
    getUserName(detail.userId).toLowerCase().includes(searchTerm.toLowerCase()) ||
    getUserEmail(detail.userId).toLowerCase().includes(searchTerm.toLowerCase()) ||
    detail.step.toLowerCase().includes(searchTerm.toLowerCase()) ||
    detail.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            User KYC Details
          </h1>
          <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
            Monitor and manage individual user KYC progress and details
          </p>
        </div>
        <Button onClick={handleCreate} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add KYC Detail
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>User KYC Progress Details</CardTitle>
              <CardDescription>
                View and manage KYC progress details for all users
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-4 w-4" />
                <Input
                  placeholder="Search users or details..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <LoadingSpinner fullscreen={false} />
          ) : filteredUserKycDetails.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-neutral-500">No user KYC details found.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredUserKycDetails.map((detail) => (
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
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getKycStatusColor(detail.status)}`}
                      >
                        {getKycStatusDisplayText(detail.status)}
                      </span>
                    </div>
                    <p className="text-neutral-600 dark:text-neutral-400 mb-2">
                      <strong>User:</strong> {getUserName(detail.userId)} ({getUserEmail(detail.userId)})
                    </p>
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
                      onClick={() => handleView(detail.id)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(detail.id)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(detail.id)}
                      className="text-red-600 hover:text-red-700"
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
