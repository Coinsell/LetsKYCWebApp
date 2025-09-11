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
import { useKYCAdmin, KYCLevel } from "@/contexts/KYCAdminContext";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { countryApi } from "@/lib/countryapi";
import { countryKycAssignmentApi } from "@/lib/countrykycassignmentapi";
import { kycLevelsApi } from "@/lib/kyclevelsapi";

export function KYCCountryAssignmentsPage() {
  const { state: countryState, dispatch: countryDispatch } = useKYCAdmin();
  const { state: assignmentState, dispatch: assignmentDispatch } =
    useKYCAdmin();
  const { state: kycState } = useKYCAdmin();

  const [loading, setLoading] = useState(true);

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

      countryDispatch({ type: "SET_COUNTRIES", payload: countriesRes });
      assignmentDispatch({ type: "SET_ASSIGNMENTS", payload: assignmentsRes });
      // store KYC levels locally in state
      // you can also store them in KYCAdminContext if needed
    } catch (err) {
      console.error("Failed to load country or assignment data", err);
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

      const existingAssignment = assignmentState.assignments.find(
        (a) => a.countryCode === countryCode
      );

      if (existingAssignment) {
        assignmentDispatch({
          type: "UPDATE_ASSIGNMENT",
          payload: { ...existingAssignment, kycLevelId },
        });
      } else {
        assignmentDispatch({
          type: "ADD_ASSIGNMENT",
          payload: {
            id: crypto.randomUUID(),
            countryCode,
            kycLevelId,
            isActive: true,
          },
        });
      }
    } catch (err) {
      console.error("Failed to assign KYC level", err);
    }
  };

  if (loading) return <LoadingSpinner fullscreen />;

  // Merge countries with their active assignments
  const countriesWithAssignments = countryState.countries.map((c) => {
    const assignment = assignmentState.assignments.find(
      (a) => a.countryCode === c.code && a.isActive
    );
    return {
      ...c,
      assignedKycLevelId: assignment?.kycLevelId,
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            Country KYC Assignments
          </h1>
          <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
            Assign KYC levels to countries
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Assignments</CardTitle>
          <CardDescription>
            Choose which KYC level applies to each country
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {countriesWithAssignments.map((country) => (
              <div
                key={country.id}
                className="flex items-center justify-between p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg"
              >
                <div>
                  <p className="font-medium">{country.name}</p>
                  <p className="text-sm text-neutral-500">{country.code}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Select
                    value={country.assignedKycLevelId || ""}
                    onValueChange={(value) => handleAssign(country.code, value)}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Select KYC level" />
                    </SelectTrigger>
                    <SelectContent>
                      {kycState.kycLevels.map((level) => (
                        <SelectItem key={level.id} value={level.id}>
                          {level.code}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
            {countriesWithAssignments.length === 0 && (
              <div className="text-center py-8 text-neutral-500">
                No countries found
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
