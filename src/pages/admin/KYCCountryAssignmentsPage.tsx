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
import { CountryKycAssignment, useKYCAdmin } from "@/contexts/KYCAdminContext";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { countryApi } from "@/lib/countryapi";
import { countryKycAssignmentApi } from "@/lib/countrykycassignmentapi";
import { kycLevelsApi } from "@/lib/kyclevelsapi";
import { Pencil, Trash2, Plus } from "lucide-react";

// --- View model for rows ---
export interface CountryKycAssignmentView extends CountryKycAssignment {
  countryName: string;
  kycLevelCode?: string;
}

// --- Row components ---
function AssignmentRowView({
  assignment,
  onEdit,
  onDelete,
}: {
  assignment: CountryKycAssignmentView;
  onEdit: () => void;
  onDelete?: () => void;
}) {
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="flex flex-col">
        <p className="font-medium">{assignment.countryName}</p>
        <p className="text-sm text-neutral-500">{assignment.countryCode}</p>
        <p className="text-sm text-neutral-700 dark:text-neutral-300 mt-1">
          KYC Level: {assignment.kycLevelCode || "—"}
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
  assignment,
  kycLevels,
  onSave,
  onCancel,
}: {
  assignment: CountryKycAssignmentView;
  kycLevels: any[];
  onSave: (value: string) => void;
  onCancel: () => void;
}) {
  const [selected, setSelected] = useState(assignment.kycLevelId || "");

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="flex flex-col">
        <p className="font-medium">{assignment.countryName}</p>
        <p className="text-sm text-neutral-500">{assignment.countryCode}</p>

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

function AssignmentRowNew({
  countries,
  kycLevels,
  onSave,
  onCancel,
}: {
  countries: { code: string; name: string }[];
  kycLevels: any[];
  onSave: (countryCode: string, kycLevelId: string) => void;
  onCancel: () => void;
}) {
  const [newCountry, setNewCountry] = useState<string | null>(null);
  const [newLevel, setNewLevel] = useState<string | null>(null);

  return (
    <div className="flex items-center justify-between p-4 border border-dashed rounded-lg">
      <div className="flex items-center gap-4">
        <Select onValueChange={setNewCountry} value={newCountry || ""}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select Country" />
          </SelectTrigger>
          <SelectContent>
            {countries.map((c) => (
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
            {kycLevels.map((l) => (
              <SelectItem key={l.id} value={l.id}>
                {l.code} – {l.description}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-2">
        <Button
          onClick={() => newCountry && newLevel && onSave(newCountry, newLevel)}
          disabled={!newCountry || !newLevel}
        >
          Save
        </Button>
        <Button variant="outline" onClick={onCancel}>
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
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);

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
      console.log("Loaded data:", countriesRes, assignmentsRes, kycLevelsRes);
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
    } catch (err) {
      console.error("Failed to assign KYC level", err);
    }
  };

  const handleDelete = async (assignment: CountryKycAssignment) => {
    const confirmed = window.confirm(
      `Are you sure you want to remove the KYC assignment for ${assignment.countryCode}?`
    );
    if (!confirmed) return;

    setDeletingId(assignment.id);
    try {
      await countryKycAssignmentApi.delete(
        assignment.id,
        assignment.countryCode
      );
      dispatch({ type: "DELETE_ASSIGNMENT", payload: assignment.id });
    } catch (err) {
      console.error("Failed to delete KYC assignment", err);
    } finally {
      setDeletingId(null);
    }
  };

  // build enriched view
  // const countriesWithAssignments: CountryKycAssignmentView[] =
  //   state.countries.map((c) => {
  //     const assignment = state.assignments.find(
  //       (a) => a.countryCode === c.code && a.isActive
  //     );
  //     const kycLevel = assignment
  //       ? state.kycLevels.find((l) => l.id === assignment.kycLevelId)
  //       : undefined;

  //     return {
  //       id: assignment?.id || "",
  //       countryCode: c.code,
  //       kycLevelId: assignment?.kycLevelId,
  //       isActive: assignment?.isActive ?? true,
  //       countryName: c.name,
  //       kycLevelCode: kycLevel?.code,
  //     };
  //   });

  // build enriched view directly from assignments
  const countriesWithAssignments: CountryKycAssignmentView[] = state.assignments
    // .filter((a) => a.isActive) // only show active ones
    .map((assignment) => {
      const country = state.countries.find(
        (c) => c.code === assignment.countryCode
      );
      const kycLevel = state.kycLevels.find(
        (l) => l.id === assignment.kycLevelId
      );

      return {
        ...assignment,
        countryName: country?.name || assignment.countryCode,
        kycLevelCode: kycLevel?.code,
      };
    });

  const unassignedCountries = state.countries.filter(
    (c) =>
      !state.assignments.some((a) => a.countryCode === c.code && a.isActive)
  );

  function InlineSpinner() {
    return (
      <svg
        className="animate-spin h-4 w-4 text-neutral-500"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
        />
      </svg>
    );
  }

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
              {editing === "new" && (
                <AssignmentRowNew
                  countries={unassignedCountries}
                  kycLevels={state.kycLevels}
                  onSave={handleAssign}
                  onCancel={() => setEditing(null)}
                />
              )}

              {countriesWithAssignments.map((assignment) =>
                editing === assignment.countryCode ? (
                  <AssignmentRowEdit
                    key={assignment.countryCode}
                    assignment={assignment}
                    kycLevels={state.kycLevels}
                    onSave={(value) =>
                      handleAssign(assignment.countryCode, value)
                    }
                    onCancel={() => setEditing(null)}
                  />
                ) : (
                  <div className="relative" key={assignment.countryCode}>
                    <AssignmentRowView
                      assignment={assignment}
                      onEdit={() => setEditing(assignment.countryCode)}
                      onDelete={
                        assignment.kycLevelId
                          ? () => handleDelete(assignment)
                          : undefined
                      }
                    />
                    {/* {deletingId === assignment.id && (
                      <span className="text-sm text-neutral-500 ml-2 absolute top-4 right-4">
                        Deleting...
                      </span>
                    )} */}

                    {/* Overlay */}
                    {deletingId === assignment.id && (
                      <div className="absolute inset-0 bg-white/70 dark:bg-black/50 flex items-center justify-center rounded-lg">
                        <InlineSpinner />
                      </div>
                    )}
                  </div>
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
