import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import {
  useKYCAdmin,
  KYCLevel,
  KYCStatus,
  TimeUnit,
} from "../contexts/KYCAdminContext";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { kycLevelsApi } from "../lib/kyclevelsapi";
import { LoadingSpinner } from "../components/ui/loading-spinner";

export function KYCLevelsPage() {
  const { state, dispatch } = useKYCAdmin();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLevel, setEditingLevel] = useState<KYCLevel | null>(null);

  useEffect(() => {
    loadLevels();
    //fetchKYCLevels();
  }, []);

  // const loadLevels = async () => {
  //   dispatch({ type: "SET_LOADING", payload: true });
  //   try {
  //     const levels = await kycLevelsApi.list();
  //     dispatch({ type: "SET_KYC_LEVELS", payload: levels });
  //   } catch (error) {
  //     dispatch({ type: "SET_ERROR", payload: "Failed to fetch KYC levels" });
  //   } finally {
  //     dispatch({ type: "SET_LOADING", payload: false });
  //   }
  // };

  const loadLevels = async () => {
    try {
      setLoading(true);
      const levels = await kycLevelsApi.list();
      dispatch({ type: "SET_KYC_LEVELS", payload: levels });
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Failed to fetch KYC levels" });
    } finally {
      setLoading(false);
    }
  };

  const fetchKYCLevels = async () => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      // Mock API call - replace with actual API
      const mockLevels: KYCLevel[] = [
        {
          id: "1",
          kycLevelId: "kyc-level-1",
          code: "BASIC",
          description: "Basic KYC Level for new users",
          status: KYCStatus.Approved,
          maxDepositAmount: 10000,
          maxWithdrawalAmount: 5000,
          duration: 30,
          timeUnit: TimeUnit.Day,
        },
        {
          id: "2",
          kycLevelId: "kyc-level-2",
          code: "INTERMEDIATE",
          description: "Intermediate KYC Level with higher limits",
          status: KYCStatus.Approved,
          maxDepositAmount: 50000,
          maxWithdrawalAmount: 25000,
          duration: 6,
          timeUnit: TimeUnit.Month,
        },
      ];
      dispatch({ type: "SET_KYC_LEVELS", payload: mockLevels });
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Failed to fetch KYC levels" });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const handleCreate = () => {
    setEditingLevel(null);
    navigate("/admin/kyc-levels/new");
  };

  const handleEdit = (level: KYCLevel) => {
    setEditingLevel(level);
    console.log("Inside Handle Edit");
    navigate(`/admin/kyc-levels/${level.id}`, { state: { level } });
  };

  const handleSave = async (level: Partial<KYCLevel>) => {
    try {
      if (editingLevel) {
        const updated = await kycLevelsApi.update(editingLevel.id, {
          ...editingLevel,
          ...level,
        });
        dispatch({ type: "UPDATE_KYC_LEVEL", payload: updated });
      } else {
        const created = await kycLevelsApi.create(level);
        dispatch({ type: "ADD_KYC_LEVEL", payload: created });
      }
      setIsModalOpen(false);
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Failed to save KYC level" });
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this KYC level?")) {
      try {
        setLoading(true);
        await kycLevelsApi.deleteWithDetails(id);
        dispatch({ type: "DELETE_KYC_LEVEL", payload: id });
        loadLevels();
      } catch (error) {
        dispatch({ type: "SET_ERROR", payload: "Failed to delete KYC level" });
      } finally {
        setLoading(false);
      }
    }
  };

  // const handleDelete = async (id: string) => {
  //   if (confirm("Are you sure you want to delete this KYC level?")) {
  //     try {
  //       // Mock API call - replace with actual API
  //       dispatch({ type: "DELETE_KYC_LEVEL", payload: id });
  //     } catch (error) {
  //       dispatch({ type: "SET_ERROR", payload: "Failed to delete KYC level" });
  //     }
  //   }
  // };

  // const handleSave = async (level: Partial<KYCLevel>) => {
  //   try {
  //     if (editingLevel) {
  //       // Update existing level
  //       const updatedLevel = { ...editingLevel, ...level };
  //       dispatch({ type: "UPDATE_KYC_LEVEL", payload: updatedLevel });
  //     } else {
  //       // Create new level
  //       const newLevel: KYCLevel = {
  //         id: Date.now().toString(),
  //         kycLevelId: `kyc-level-${Date.now()}`,
  //         ...level,
  //       } as KYCLevel;
  //       dispatch({ type: "ADD_KYC_LEVEL", payload: newLevel });
  //     }
  //     setIsModalOpen(false);
  //   } catch (error) {
  //     dispatch({ type: "SET_ERROR", payload: "Failed to save KYC level" });
  //   }
  // };

  const filteredLevels = state.kycLevels.filter(
    (level) =>
      level.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      level.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // show spinner when loading
  if (loading) return <LoadingSpinner fullscreen={false} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">KYC Levels</h1>
          <p className="mt-2 text-sm text-neutral-600">
            Manage KYC levels and their configurations
          </p>
        </div>
        <Button onClick={handleCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Add KYC Level
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>KYC Levels</CardTitle>
              <CardDescription>
                Configure different KYC levels for users
              </CardDescription>
            </div>
            <div className="w-72">
              <Input
                placeholder="Search levels..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredLevels.map((level) => (
              <div
                key={level.id}
                className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg">{level.code}</h3>
                    <Badge
                      variant={
                        level.status === KYCStatus.Approved
                          ? "success"
                          : level.status === KYCStatus.Rejected
                          ? "destructive"
                          : "warning"
                      }
                    >
                      {level.status}
                    </Badge>
                  </div>
                  <p className="text-neutral-600 mb-2">{level.description}</p>
                  <div className="flex gap-4 text-sm text-neutral-500">
                    <span>
                      Max Deposit: ${level.maxDepositAmount?.toLocaleString()}
                    </span>
                    <span>
                      Max Withdrawal: $
                      {level.maxWithdrawalAmount?.toLocaleString()}
                    </span>
                    <span>
                      Duration: {level.duration} {level.timeUnit}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
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
                <p className="text-neutral-500">No KYC levels found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* <KYCLevelModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        level={editingLevel}
      /> */}
    </div>
  );
}
