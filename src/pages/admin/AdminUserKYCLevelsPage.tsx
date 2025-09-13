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
  UserKYCLevel,
  KYCStatus,
  TimeUnit,
} from "../../contexts/KYCAdminContext";
import { userKycLevelsApi } from "../../lib/userkyclevelsapi";
import { LoadingSpinner } from "../../components/ui/loading-spinner";
import { getKycStatusDisplayText, getKycStatusColor } from "../../utils/kycStatusConverter";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Plus, Eye, Pencil, Trash2 } from "lucide-react";

export function AdminUserKYCLevelsPage() {
  const { state, dispatch } = useKYCAdmin();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [userKycLevels, setUserKycLevels] = useState<UserKYCLevel[]>([]);
  const [filteredLevels, setFilteredLevels] = useState<UserKYCLevel[]>([]);
  const userId = searchParams.get('userId');

  useEffect(() => {
    fetchUserKycLevels();
  }, []);

  useEffect(() => {
    // Filter levels based on userId and search term
    let filtered = userKycLevels;
    
    if (userId) {
      filtered = filtered.filter(level => level.userId === userId);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(level =>
        level.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        level.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        level.userId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredLevels(filtered);
  }, [userKycLevels, userId, searchTerm]);

  const fetchUserKycLevels = async () => {
    try {
      setLoading(true);
      console.log("Fetching user KYC levels...");
      
      if (userId) {
        // If filtering by specific user, get their KYC levels
        console.log(`Fetching KYC levels for user: ${userId}`);
        const levels = await userKycLevelsApi.listByUserId(userId);
        console.log("Fetched levels for user:", levels);
        setUserKycLevels(levels);
      } else {
        // If no specific user, get all user KYC levels
        console.log("Fetching all user KYC levels...");
        const levels = await userKycLevelsApi.getAll();
        console.log("Fetched all levels:", levels);
        setUserKycLevels(levels);
      }
    } catch (error) {
      console.error("Error fetching user KYC levels:", error);
      setUserKycLevels([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    // TODO: Implement create functionality
    console.log("Create new user KYC level");
  };

  const handleEdit = (level: UserKYCLevel) => {
    // TODO: Implement edit functionality
    console.log("Edit user KYC level:", level);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this user KYC level?")) {
      try {
        await userKycLevelsApi.delete(id, "user-id"); // You'd need the actual user ID
        setUserKycLevels(prev => prev.filter(level => level.id !== id));
      } catch (error) {
        console.error("Error deleting user KYC level:", error);
      }
    }
  };

  const handleViewDetails = (levelId: string) => {
    navigate(`/admin/user-kyc-levels/${levelId}`);
  };



  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            {userId ? `User KYC Levels (User: ${userId})` : "User KYC Levels"}
          </h1>
          <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
            {userId 
              ? `KYC level assignments for user ${userId}`
              : "Manage user KYC level assignments and their configurations"
            }
          </p>
        </div>
        <Button onClick={handleCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Assign KYC Level
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>User KYC Levels</CardTitle>
              <CardDescription>
                View and manage KYC level assignments for all users
              </CardDescription>
            </div>
            <div className="w-72">
              <Input
                placeholder="Search user KYC levels..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <LoadingSpinner fullscreen={false} />
          ) : (
            <div className="space-y-4">
              {filteredLevels.map((level) => (
                <div
                  key={level.id}
                  className="flex items-center justify-between p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{level.code}</h3>
                      <Badge variant="outline" className="text-xs">
                        User: {level.userId}
                      </Badge>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getKycStatusColor(level.status)}`}
                      >
                        {getKycStatusDisplayText(level.status)}
                      </span>
                    </div>
                    <p className="text-neutral-600 dark:text-neutral-400 mb-2">
                      {level.description}
                    </p>
                    <div className="flex gap-4 text-sm text-neutral-500">
                      <span>
                        Max Deposit: ${level.maxDepositAmount?.toLocaleString()}
                      </span>
                      <span>
                        Max Withdrawal: ${level.maxWithdrawalAmount?.toLocaleString()}
                      </span>
                      <span>
                        Duration: {level.duration} {level.timeUnit}
                      </span>
                    </div>
                    <div className="mt-2 text-xs text-neutral-400">
                      Last Updated: {new Date(level.lastUpdated).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(level.id)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(level)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(level.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {filteredLevels.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-neutral-500">No user KYC levels found</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}