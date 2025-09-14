import { useEffect, useState, useCallback } from "react";
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
import { Input } from "@/components/ui/input";
import { CountryKycAssignment, useKYCAdmin, PaginatedResponse, PaginationParams, FilterCondition, FilterOperator, SortCondition, SortOrder } from "@/contexts/KYCAdminContext";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { countryApi } from "@/lib/countryapi";
import { countryKycAssignmentApi } from "@/lib/countrykycassignmentapi";
import { kycLevelsApi } from "@/lib/kyclevelsapi";
import { Pencil, Trash2, Plus, ChevronLeft, ChevronRight, Search } from "lucide-react";

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
    <div className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
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
    <div className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
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
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  
  // Filter and search state
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [sortField, setSortField] = useState('countryCode');
  const [sortOrder, setSortOrder] = useState<SortOrder>(SortOrder.ASC);
  
  // Loading state
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  
  // Assignments data
  const [assignments, setAssignments] = useState<CountryKycAssignment[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadAssignments();
  }, [currentPage, pageSize, searchTerm, activeFilter, sortField, sortOrder]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [countriesRes, kycLevelsRes] = await Promise.all([
        countryApi.list(),
        kycLevelsApi.list(),
      ]);
      console.log("Loaded data:", countriesRes, kycLevelsRes);
      dispatch({ type: "SET_COUNTRIES", payload: countriesRes });
      dispatch({ type: "SET_KYC_LEVELS", payload: kycLevelsRes });
    } catch (err) {
      console.error("Failed to load data", err);
    } finally {
      setLoading(false);
    }
  };

  const loadAssignments = useCallback(async () => {
    setLoading(true);
    try {
      // Build pagination parameters
      const paginationParams: PaginationParams = {
        page: currentPage,
        page_size: pageSize,
        fetch_all: false,
        search: searchTerm || undefined,
        sort_by: [
          {
            field: sortField,
            order: sortOrder
          }
        ]
      }

      // Add active filter if not 'all'
      if (activeFilter !== 'all') {
        paginationParams.filters = [
          {
            field: 'isActive',
            operator: FilterOperator.EQUALS,
            value: activeFilter === 'active'
          }
        ]
      }

      const response: PaginatedResponse<CountryKycAssignment> = await countryKycAssignmentApi.listEnhanced(paginationParams);
      
      setAssignments(response.items);
      setTotalPages(response.total_pages);
      setTotalCount(response.total_count);
      setHasNext(response.has_next);
      setHasPrevious(response.has_previous);
      
    } catch (error) {
      console.error('Error fetching assignments:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to fetch assignments' });
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchTerm, activeFilter, sortField, sortOrder, dispatch]);

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (newPageSize: string) => {
    setPageSize(Number(newPageSize));
    setCurrentPage(1); // Reset to first page when changing page size
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleActiveFilterChange = (value: string) => {
    setActiveFilter(value);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleSortChange = (field: string) => {
    if (field === sortField) {
      // Toggle sort order if same field
      setSortOrder(sortOrder === SortOrder.ASC ? SortOrder.DESC : SortOrder.ASC);
    } else {
      // Set new field with default sort order
      setSortField(field);
      setSortOrder(SortOrder.ASC);
    }
    setCurrentPage(1); // Reset to first page when sorting
  };

  const handleAssign = async (countryCode: string, kycLevelId: string) => {
    setLoading(true);
    try {
      await countryKycAssignmentApi.assign({
        countryCode,
        kycLevelId,
        id: "",
        isActive: true,
      });

      // Refresh the current page after assignment
      loadAssignments();
      setEditing(null);
    } catch (err) {
      console.error("Failed to assign KYC level", err);
    } finally {
      setLoading(false);
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
      // Refresh the current page after deletion
      loadAssignments();
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
  const countriesWithAssignments: CountryKycAssignmentView[] = assignments
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
      !assignments.some((a) => a.countryCode === c.code && a.isActive)
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
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Assignments</CardTitle>
              <CardDescription>
                By default you can view assignments. Click edit to change them.
              </CardDescription>
            </div>
            <div className="flex gap-4">
              <Select value={activeFilter} onValueChange={handleActiveFilterChange}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Assignments</SelectItem>
                  <SelectItem value="active">Active Only</SelectItem>
                  <SelectItem value="inactive">Inactive Only</SelectItem>
                </SelectContent>
              </Select>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search assignments..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-72 pl-10"
                />
              </div>
              <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <LoadingSpinner fullscreen={false} />
          ) : (
            <div className="space-y-4">
              {/* Results summary */}
              <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400 mb-4">
                <span>
                  Showing {countriesWithAssignments.length} of {totalCount} assignments
                  {searchTerm && ` for "${searchTerm}"`}
                  {activeFilter !== 'all' && ` with status "${activeFilter}"`}
                </span>
                <div className="flex items-center gap-2">
                  <span>Sort by:</span>
                  <Select value={sortField} onValueChange={handleSortChange}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="countryCode">Country Code</SelectItem>
                      <SelectItem value="kycLevelId">KYC Level</SelectItem>
                      <SelectItem value="isActive">Status</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSortChange(sortField)}
                    className="px-2"
                  >
                    {sortOrder === SortOrder.ASC ? '↑' : '↓'}
                  </Button>
                </div>
              </div>

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
                <div className="text-center py-8 text-neutral-500 dark:text-neutral-400">
                  No assignments found
                </div>
              )}
              
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t border-neutral-200 dark:border-neutral-700">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(1)}
                      disabled={!hasPrevious}
                    >
                      First
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={!hasPrevious}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={!hasNext}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(totalPages)}
                      disabled={!hasNext}
                    >
                      Last
                    </Button>
                  </div>
                  
                  {/* Page size selector */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Show:</span>
                    <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                      </SelectContent>
                    </Select>
                    <span className="text-sm text-gray-600 dark:text-gray-400">per page</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
