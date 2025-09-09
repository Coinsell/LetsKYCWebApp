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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  useKYCAdmin,
  KYCDetail,
  KYCStatus,
  KycDetailType,
} from "../contexts/KYCAdminContext";
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown, Layers } from "lucide-react";
import { kycDetailsApi } from "../lib/kycdetailsapi";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useParams, useNavigate } from "react-router-dom";

export function KYCDetailsPage() {
  const { state, dispatch } = useKYCAdmin();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedKycLevel, setSelectedKycLevel] = useState<string>("all");

  useEffect(() => {
    fetchKYCDetails();
  }, []);

  const fetchKYCDetails = async () => {
    setLoading(true);
    try {
      const details = await kycDetailsApi.getAll();
      dispatch({ type: "SET_KYC_DETAILS", payload: details });
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: "Failed to fetch KYC details" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, kycLevelId: string) => {
    if (confirm("Are you sure you want to delete this KYC detail?")) {
      try {
        await kycDetailsApi.delete(id, kycLevelId);
        dispatch({ type: "DELETE_KYC_DETAIL", payload: id });
      } catch (error) {
        dispatch({ type: "SET_ERROR", payload: "Failed to delete KYC detail" });
      }
    }
  };

  const moveSequence = (id: string, direction: "up" | "down") => {
    const detail = state.kycDetails.find((d) => d.id === id);
    if (!detail) return;

    const sameLevelDetails = state.kycDetails
      .filter((d) => d.kycLevelId === detail.kycLevelId)
      .sort((a, b) => a.sequence - b.sequence);

    const currentIndex = sameLevelDetails.findIndex((d) => d.id === id);
    const targetIndex =
      direction === "up" ? currentIndex - 1 : currentIndex + 1;

    if (targetIndex < 0 || targetIndex >= sameLevelDetails.length) return;

    // Swap sequences
    const updatedDetail = {
      ...detail,
      sequence: sameLevelDetails[targetIndex].sequence,
    };
    const updatedTarget = {
      ...sameLevelDetails[targetIndex],
      sequence: detail.sequence,
    };

    // NOTE: You may want to persist these swaps with an API update
    dispatch({ type: "UPDATE_KYC_DETAIL", payload: updatedDetail });
    dispatch({ type: "UPDATE_KYC_DETAIL", payload: updatedTarget });
  };

  const filteredDetails = state.kycDetails
    .filter((detail) => {
      const matchesSearch =
        detail.step.toLowerCase().includes(searchTerm.toLowerCase()) ||
        detail.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesLevel =
        selectedKycLevel === "all" || detail.kycLevelId === selectedKycLevel;
      return matchesSearch && matchesLevel;
    })
    .sort((a, b) => {
      if (a.kycLevelId !== b.kycLevelId) {
        return a.kycLevelId.localeCompare(b.kycLevelId);
      }
      return a.sequence - b.sequence;
    });

  const getKycLevelName = (kycLevelId: string) => {
    const level = state.kycLevels.find((l) => l.kycLevelId === kycLevelId);
    return level ? level.code : kycLevelId;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">KYC Details</h1>
          <p className="mt-2 text-sm text-neutral-600">
            Manage KYC steps and requirements for each level
          </p>
        </div>

        <Button className="gap-2" onClick={() => navigate("/admin/kyc-levels")}>
          <Layers className="h-4 w-4" />
          Manage KYC Levels
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>KYC Details</CardTitle>
              <CardDescription>
                Configure steps for each KYC level
              </CardDescription>
            </div>
            <div className="flex gap-4">
              <Select
                value={selectedKycLevel}
                onValueChange={setSelectedKycLevel}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by KYC Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  {state.kycLevels.map((level) => (
                    <SelectItem key={level.kycLevelId} value={level.kycLevelId}>
                      {level.code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                placeholder="Search details..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-72"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <LoadingSpinner fullscreen={false} />
          ) : (
            <div className="space-y-4">
              {filteredDetails.map((detail) => (
                <div
                  key={detail.id}
                  className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge variant="outline" className="text-xs">
                        {getKycLevelName(detail.kycLevelId)}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        Step {detail.sequence}
                      </Badge>
                      <h3 className="font-semibold text-lg">{detail.step}</h3>
                      <Badge
                        variant={
                          detail.status === KYCStatus.Approved
                            ? "success"
                            : detail.status === KYCStatus.Rejected
                            ? "destructive"
                            : "warning"
                        }
                      >
                        {detail.status}
                      </Badge>
                    </div>
                    <p className="text-neutral-600 mb-2">
                      {detail.description}
                    </p>
                    <div className="flex gap-4 text-sm text-neutral-500">
                      <span>Type: {detail.type}</span>
                      <span>
                        Attachments:{" "}
                        {detail.hasAttachments ? "Required" : "Not Required"}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => moveSequence(detail.id, "up")}
                      disabled={detail.sequence === 1}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => moveSequence(detail.id, "down")}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(detail.id, detail.kycLevelId)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {filteredDetails.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-neutral-500">No KYC details found</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
