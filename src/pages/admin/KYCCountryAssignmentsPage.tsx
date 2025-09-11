import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useKYCAdmin } from "@/contexts/KYCAdminContext";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { countryApi } from "@/lib/countryapi";
import { countryKycAssignmentApi } from "@/lib/countrykycassignmentapi";
import { kycLevelsApi } from "@/lib/kyclevelsapi";
import { Pencil, Trash2, Plus } from "lucide-react";

// --- Row components ---
function AssignmentRowView({
  country,
  kycLevelCode,
  onEdit,
  onDelete,
}: {
  country: any;
  kycLevelCode?: string;
  onEdit: () => void;
  onDelete?: () => void;
}) {
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="flex flex-col">
        <p className="font-medium">{country.name}</p>
        <p className="text-sm text-neutral-500">{country.code}</p>
        <p className="text-sm text-neutral-700 dark:text-neutral-300 mt-1">
          KYC Level: {kycLevelCode || "—"}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onEdit}>
          <Pencil className="w-4 h-4" />
        </Button>
        {onDelete && (
          <Button variant="outline" size="sm" onClick={onDelete}>
            <Trash2 className="w-4 h-4 text-red-500" />
          </Button>
        )}
      </div>
    </div>
  );
}

function AssignmentRowEdit({
  country,
  assignedKycLevelId,
  kycLevels,
  onSave,
  onCancel,
}: {
  country: any;
  assignedKycLevelId?: string;
  kycLevels: any[];
  onSave: (value: string) => void;
  onCancel: () => void;
}) {
  const [selected, setSelected] = useState(assignedKycLevelId || "");

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="flex flex-col">
        <p className="font-medium">{country.name}</p>
        <p className="text-sm text-neutral-500">{country.code}</p>

        <div className="mt-2">
          <Select value={selected} onValueChange={setSelected}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select KYC level" />
            </SelectTrigger>
            <SelectContent>
              {kycLevels.map((level) => (
                <SelectItem key={level.id} value={level.id}>
                  {level.code} – {level.description}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button size="sm" onClick={() => onSave(selected)} disabled={!selected}>
          Save
        </Button>
        <Button variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

// --- Main page ---
export function KYCCountryAssignmentsPage() {
  const { state, dispatch } = useKYCAdmin();
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null); // countryCode or "new"
  const [newCountry, setNewCountry] = useState<string | null>(null);
  const [newLevel, setNewLevel] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [countriesRes, assignmentsRes, kycLevelsRes] = await Promise.all([
        countryApi.list(),
        countryKycAssignmentApi.listAll(),
        kycLevelsApi.list(),
      ]);
      dispatch({ type: "SET_COUNTRIES", payload: countriesRes });
      dispatch({ type: "SET_ASSIGNMENTS", payload: assignmentsRes });
      dispatch({ type: "SET_KYC_LEVELS", payload: kycLevelsRes });
    } catch (err) {
      console.error("Failed to load data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (countryCode: string, kycLevelId: string) => {
    try {
      await countryKycAssignmentApi.assign({
        countryCode,
        kycLevelId,
        id: "",
        isActive: true,
      });

      const existingAssignment = state.assignments.find(
        (a) => a.countryCode === countryCode
      );

      if (existingAssignment) {
        dispatch({
          type: "UPDATE_ASSIGNMENT",
          payload: { ...existingAssignment, kycLevelId },
        });
      } else {
        dispatch({
          type: "ADD_ASSIGNMENT",
          payload: {
            id: crypto.randomUUID(),
            countryCode,
            kycLevelId,
            isActive: true,
          },
        });
      }

      setEditing(null);
      setNewCountry(null);
      setNewLevel(null);
    } catch (err) {
      console.error("Failed to assign KYC level", err);
    }
  };

  const handleDelete = async (
    countryCode: string,
    assignedKycLevelId: string
  ) => {
    try {
      await countryKycAssignmentApi.delete(countryCode, assignedKycLevelId);
      dispatch({ type: "DELETE_ASSIGNMENT", payload: countryCode });
    } catch (err) {
      console.error("Failed to delete KYC assignment", err);
    }
  };

  const countriesWithAssignments = state.countries.map((c) => {
    const assignment = state.assignments.find(
      (a) => a.countryCode === c.code && a.isActive
    );
    return {
      ...c,
      assignedKycLevelId: assignment?.kycLevelId,
    };
  });

  const unassignedCountries = countriesWithAssignments.filter(
    (c) => !c.assignedKycLevelId
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Country KYC Assignments</h1>
          <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
            View and manage KYC level assignments for each country
          </p>
        </div>
        <Button
          onClick={() => setEditing("new")}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Assignment
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Assignments</CardTitle>
          <CardDescription>
            By default you can view assignments. Click edit to change them.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <LoadingSpinner fullscreen={false} />
          ) : (
            <div className="space-y-4">
              {/* Add Assignment form */}
              {editing === "new" && (
                <div className="flex items-center justify-between p-4 border border-dashed rounded-lg">
                  <div className="flex items-center gap-4">
                    <Select
                      onValueChange={setNewCountry}
                      value={newCountry || ""}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Select Country" />
                      </SelectTrigger>
                      <SelectContent>
                        {unassignedCountries.map((c) => (
                          <SelectItem key={c.code} value={c.code}>
                            {c.name} ({c.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select onValueChange={setNewLevel} value={newLevel || ""}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Select KYC Level" />
                      </SelectTrigger>
                      <SelectContent>
                        {state.kycLevels.map((l) => (
                          <SelectItem key={l.id} value={l.id}>
                            {l.code} – {l.description}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() =>
                        newCountry &&
                        newLevel &&
                        handleAssign(newCountry, newLevel)
                      }
                      disabled={!newCountry || !newLevel}
                    >
                      Save
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setEditing(null);
                        setNewCountry(null);
                        setNewLevel(null);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* Assignment rows */}
              {countriesWithAssignments.map((country) =>
                editing === country.code ? (
                  <AssignmentRowEdit
                    key={country.id}
                    country={country}
                    assignedKycLevelId={country.assignedKycLevelId}
                    kycLevels={state.kycLevels}
                    onSave={(value) => handleAssign(country.code, value)}
                    onCancel={() => setEditing(null)}
                  />
                ) : (
                  <AssignmentRowView
                    key={country.id}
                    country={country}
                    kycLevelCode={
                      country.assignedKycLevelId
                        ? state.kycLevels.find(
                            (l) => l.id === country.assignedKycLevelId
                          )?.code
                        : undefined
                    }
                    onEdit={() => setEditing(country.code)}
                    onDelete={
                      country.assignedKycLevelId
                        ? () =>
                            handleDelete(
                              country.code,
                              country.assignedKycLevelId!
                            )
                        : undefined
                    }
                  />
                )
              )}

              {countriesWithAssignments.length === 0 && (
                <div className="text-center py-8 text-neutral-500">
                  No countries found
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
