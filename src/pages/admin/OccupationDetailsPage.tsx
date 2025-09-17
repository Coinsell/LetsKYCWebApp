import React, { useEffect, useState } from "react";
import { OccupationProfession, PaginatedResponse, PaginationParams, FilterCondition, FilterOperator, SortCondition, SortOrder } from "../../contexts/KYCAdminContext";
import { useParams, useNavigate } from "react-router-dom";
import { occupationProfessionApi } from "../../lib/occupationprofessionapi";
import {
  ArrowLeft,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Trash2,
  X,
  Users,
  Briefcase,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Props {
  mode?: "create" | "edit";
}

const OccupationDetailsPage: React.FC<Props> = ({ mode }) => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const isNewRoute = code === "new" || mode === "create";

  const [occupation, setOccupation] = useState<OccupationProfession | null>(null);
  const [professions, setProfessions] = useState<OccupationProfession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editingOccupation, setEditingOccupation] = useState<OccupationProfession | null>(null);
  const [editingProfession, setEditingProfession] = useState<Partial<OccupationProfession> | null>(null);

  // Pagination state for professions
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);

  // Filter and search state for professions
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortField, setSortField] = useState('sequence');
  const [sortOrder, setSortOrder] = useState<SortOrder>(SortOrder.ASC);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        if (isNewRoute) {
          const emptyOccupation: OccupationProfession = {
            id: "",
            docType: "Occupation",
            code: "",
            name: "",
            sequence: 0,
            isActive: true,
            description: "",
            category: "",
          };
          setOccupation(emptyOccupation);
          setEditingOccupation(emptyOccupation);
          setProfessions([]);
          return;
        }
        if (!code) {
          setError("Missing occupation code");
          return;
        }
        const occupationData = await occupationProfessionApi.getOccupation(code);
        setOccupation(occupationData);
        loadProfessions();
      } catch (err: any) {
        console.error(err);
        setError(err?.message || "Failed to load Occupation");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [code, isNewRoute]);

  const loadProfessions = async () => {
    if (!occupation) return;
    
    try {
      const professionsData = await occupationProfessionApi.getProfessionsByOccupation(occupation.code);
      
      // Apply client-side pagination and filtering
      let filteredProfessions = professionsData;
      
      // Apply search filter
      if (searchTerm) {
        filteredProfessions = filteredProfessions.filter(p => 
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.jobTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.code.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      // Apply status filter
      if (statusFilter !== 'all') {
        filteredProfessions = filteredProfessions.filter(p => 
          statusFilter === 'active' ? p.isActive : !p.isActive
        );
      }
      
      // Apply sorting
      filteredProfessions.sort((a, b) => {
        const aValue = a[sortField as keyof OccupationProfession];
        const bValue = b[sortField as keyof OccupationProfession];
        
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortOrder === SortOrder.ASC 
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }
        
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortOrder === SortOrder.ASC 
            ? aValue - bValue
            : bValue - aValue;
        }
        
        return 0;
      });
      
      // Apply pagination
      const startIndex = (currentPage - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedProfessions = filteredProfessions.slice(startIndex, endIndex);
      
      setProfessions(paginatedProfessions);
      setTotalCount(filteredProfessions.length);
      setTotalPages(Math.ceil(filteredProfessions.length / pageSize));
      setHasNext(currentPage < Math.ceil(filteredProfessions.length / pageSize));
      setHasPrevious(currentPage > 1);
      
    } catch (error) {
      console.error('Error fetching professions:', error);
      setError('Failed to fetch professions');
    }
  };

  useEffect(() => {
    if (occupation && !isNewRoute) {
      loadProfessions();
    }
  }, [currentPage, pageSize, searchTerm, statusFilter, sortField, sortOrder, occupation]);

  // --- Occupation Save ---
  async function handleSaveOccupation() {
    if (!editingOccupation) return;
    try {
      if (!editingOccupation.id) {
        // Create new occupation
        const created = await occupationProfessionApi.createOccupation({
          docType: "Occupation",
          code: editingOccupation.code,
          name: editingOccupation.name,
          sequence: editingOccupation.sequence,
          isActive: editingOccupation.isActive,
          description: editingOccupation.description,
          category: editingOccupation.category,
        });
        setOccupation(created);
        setEditingOccupation(null);
        navigate(`/admin/occupations/${created.code}`);
      } else {
        // Update existing occupation
        const updated = await occupationProfessionApi.updateOccupation(editingOccupation.code, {
          name: editingOccupation.name,
          sequence: editingOccupation.sequence,
          isActive: editingOccupation.isActive,
          description: editingOccupation.description,
          category: editingOccupation.category,
        });
        setOccupation(updated);
        setEditingOccupation(null);
        loadProfessions();
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to save occupation");
    }
  }

  function handleEditOccupation() {
    setEditingOccupation(occupation);
  }

  async function handleDeleteOccupation() {
    if (!occupation?.id) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this Occupation and all its professions?"
    );
    if (!confirmed) return;

    try {
      await occupationProfessionApi.deleteOccupation(occupation.code);
      navigate("/admin/occupations");
    } catch (err: any) {
      console.error("Failed to delete Occupation:", err);
      setError(err?.message || "Failed to delete occupation");
    }
  }

  // --- Profession Functions ---
  function makeEmptyProfession(): Partial<OccupationProfession> {
    const seq = professions.length
      ? Math.max(...professions.map((p) => p.sequence)) + 1
      : 1;
    return {
      docType: "Profession",
      sequence: seq,
      code: "",
      name: "",
      isActive: true,
      occupationCode: occupation?.code || "",
      occupationName: occupation?.name || "",
      jobTitle: "",
      jobLevel: "",
      requiredEducation: "",
    };
  }

  function handleAddProfessionClick() {
    setEditingProfession(makeEmptyProfession());
  }

  function handleEditProfessionClick(profession: OccupationProfession) {
    setEditingProfession({ ...profession });
  }

  function handleCancelProfessionEdit() {
    setEditingProfession(null);
    setError(null);
  }

  async function handleSaveProfession() {
    if (!editingProfession || !occupation) return;

    try {
      let savedProfession: OccupationProfession;

      if (editingProfession.id) {
        // Update existing profession
        const existing = professions.find((p) => p.id === editingProfession.id);
        if (!existing) throw new Error("Profession not found");

        const payload = {
          name: editingProfession.name,
          sequence: editingProfession.sequence,
          isActive: editingProfession.isActive,
          jobTitle: editingProfession.jobTitle,
          jobLevel: editingProfession.jobLevel,
          requiredEducation: editingProfession.requiredEducation,
          salaryRange: editingProfession.salaryRange,
        };

        savedProfession = await occupationProfessionApi.updateProfession(editingProfession.code, payload);

        setProfessions((prev) =>
          prev.map((p) => (p.id === savedProfession.id ? savedProfession : p))
        );
      } else {
        // Create new profession
        const nextSequence =
          professions.length > 0
            ? Math.max(...professions.map((p) => p.sequence)) + 1
            : 1;

        const newId = Date.now().toString();

        const payload = {
          docType: "Profession" as const,
          code: editingProfession.code ?? "",
          name: editingProfession.name ?? "",
          sequence: editingProfession.sequence ?? nextSequence,
          isActive: editingProfession.isActive ?? true,
          occupationCode: occupation.code,
          occupationName: occupation.name,
          jobTitle: editingProfession.jobTitle ?? "",
          jobLevel: editingProfession.jobLevel ?? "",
          requiredEducation: editingProfession.requiredEducation ?? "",
          salaryRange: editingProfession.salaryRange,
        };

        savedProfession = await occupationProfessionApi.createProfession(payload);

        setProfessions((prev) => [...prev, savedProfession]);
      }

      setEditingProfession(null);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to save profession");
    }
  }

  async function handleDeleteProfession(idToDelete: string, professionCode: string) {
    if (!confirm("Delete this profession?")) return;

    try {
      await occupationProfessionApi.deleteProfession(professionCode);

      setProfessions((prev) => prev.filter((p) => p.id !== idToDelete));
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to delete profession");
    }
  }

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (newPageSize: string) => {
    setPageSize(Number(newPageSize));
    setCurrentPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handleSortChange = (field: string) => {
    setSortField(field);
    setCurrentPage(1);
  };

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === SortOrder.ASC ? SortOrder.DESC : SortOrder.ASC);
    setCurrentPage(1);
  };

  if (loading) return <LoadingSpinner />;

  if (error || !occupation)
    return (
      <div className="p-6 text-red-500 font-medium">
        {error || "Occupation not found"}
      </div>
    );

  function handleBack() {
    navigate(-1);
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between mb-6">
        {/* Left side: Back button */}
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {/* Right side: Actions */}
        <div className="flex gap-2">
          <button
            onClick={handleDeleteOccupation}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
            Delete Occupation
          </button>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-100"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* --- Occupation Card / Form --- */}
      <div className="bg-white shadow rounded-2xl p-6 space-y-3">
        {editingOccupation ? (
          <>
            <h2 className="text-2xl font-bold">
              {isNewRoute ? "Create Occupation" : "Edit Occupation"}
            </h2>
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div>
                <label className="block text-sm text-gray-600">Code</label>
                <input
                  type="text"
                  placeholder="Occupation Code (e.g., OC00001)"
                  className="border p-2 rounded w-full"
                  value={editingOccupation.code}
                  onChange={(e) =>
                    setEditingOccupation({ ...editingOccupation, code: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600">Name</label>
                <input
                  type="text"
                  placeholder="Occupation Name"
                  className="border p-2 rounded w-full"
                  value={editingOccupation.name}
                  onChange={(e) =>
                    setEditingOccupation({
                      ...editingOccupation,
                      name: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600">Sequence</label>
                <input
                  type="number"
                  className="border p-2 rounded w-full"
                  value={editingOccupation.sequence}
                  onChange={(e) =>
                    setEditingOccupation({
                      ...editingOccupation,
                      sequence: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600">Category</label>
                <input
                  type="text"
                  className="border p-2 rounded w-full"
                  value={editingOccupation.category || ""}
                  onChange={(e) =>
                    setEditingOccupation({
                      ...editingOccupation,
                      category: e.target.value,
                    })
                  }
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm text-gray-600">Description</label>
                <textarea
                  className="border p-2 rounded w-full"
                  rows={3}
                  value={editingOccupation.description || ""}
                  onChange={(e) =>
                    setEditingOccupation({
                      ...editingOccupation,
                      description: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="inline-flex items-center gap-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300"
                    checked={editingOccupation.isActive}
                    onChange={(e) =>
                      setEditingOccupation({
                        ...editingOccupation,
                        isActive: e.target.checked,
                      })
                    }
                  />
                  Active
                </label>
              </div>
            </div>
            <div className="pt-4 flex gap-2">
              {!isNewRoute && (
                <button
                  onClick={() => setEditingOccupation(null)}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              )}
              <button
                onClick={handleSaveOccupation}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
              >
                <Save className="w-4 h-4" />
                Save Occupation
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold">
              Occupation: <span className="text-blue-600">{occupation.name}</span>
            </h2>
            <p className="text-gray-700">Code: {occupation.code}</p>
            {occupation.description && (
              <p className="text-gray-600">{occupation.description}</p>
            )}
            <div className="flex items-center gap-3">
              {occupation.category && (
                <Badge variant="secondary" className="text-sm">
                  {occupation.category}
                </Badge>
              )}
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  occupation.isActive 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }`}
              >
                {occupation.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div>
                <p className="text-gray-500 text-sm">Sequence</p>
                <p className="font-medium">{occupation.sequence}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Code</p>
                <p className="font-medium">{occupation.code}</p>
              </div>
            </div>
            <div className="pt-4">
              <button
                onClick={handleEditOccupation}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-100"
              >
                <Pencil className="w-4 h-4" />
                Edit Occupation
              </button>
            </div>
          </>
        )}
      </div>

      {/* --- Professions List --- */}
      {!isNewRoute && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">Professions</h3>
            <div className="flex gap-2">
              <button
                className="flex items-center gap-2 bg-green-600 text-white px-3 py-2 rounded-lg shadow hover:bg-green-700 text-sm"
                onClick={handleAddProfessionClick}
              >
                <Plus className="h-4 w-4" />
                Add Profession
              </button>
            </div>
          </div>

          {/* Search and Filter Controls */}
          <div className="flex flex-wrap gap-4 items-center">
            <div className="relative w-72">
              <Input
                placeholder="Search professions..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Professions</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>

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

            <Select value={sortField} onValueChange={handleSortChange}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sequence">Sequence</SelectItem>
                <SelectItem value="code">Code</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="jobLevel">Job Level</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              onClick={toggleSortOrder}
              className="flex items-center gap-2"
            >
              {sortOrder === SortOrder.ASC ? '↑' : '↓'} {sortOrder}
            </Button>
          </div>

          {/* Results Summary */}
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing {professions.length} of {totalCount} professions (Page {currentPage} of {totalPages})
          </div>

          {/* --- New Profession Editor --- */}
          {editingProfession && !editingProfession.id && (
            <div className="bg-white rounded-xl p-4 shadow mb-4">
              <h4 className="font-semibold mb-2">New Profession</h4>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600">Sequence</label>
                  <input
                    type="number"
                    className="border p-2 rounded w-full"
                    value={editingProfession.sequence ?? ""}
                    onChange={(e) =>
                      setEditingProfession({
                        ...editingProfession,
                        sequence: Number(e.target.value),
                      })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600">Code</label>
                  <input
                    type="text"
                    className="border p-2 rounded w-full"
                    value={editingProfession.code ?? ""}
                    onChange={(e) =>
                      setEditingProfession({
                        ...editingProfession,
                        code: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600">Name</label>
                  <input
                    type="text"
                    className="border p-2 rounded w-full"
                    value={editingProfession.name ?? ""}
                    onChange={(e) =>
                      setEditingProfession({
                        ...editingProfession,
                        name: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600">Job Title</label>
                  <input
                    type="text"
                    className="border p-2 rounded w-full"
                    value={editingProfession.jobTitle ?? ""}
                    onChange={(e) =>
                      setEditingProfession({
                        ...editingProfession,
                        jobTitle: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600">Job Level</label>
                  <input
                    type="text"
                    className="border p-2 rounded w-full"
                    value={editingProfession.jobLevel ?? ""}
                    onChange={(e) =>
                      setEditingProfession({
                        ...editingProfession,
                        jobLevel: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600">Required Education</label>
                  <input
                    type="text"
                    className="border p-2 rounded w-full"
                    value={editingProfession.requiredEducation ?? ""}
                    onChange={(e) =>
                      setEditingProfession({
                        ...editingProfession,
                        requiredEducation: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="inline-flex items-center gap-2 text-sm text-gray-600">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300"
                      checked={editingProfession.isActive ?? true}
                      onChange={(e) =>
                        setEditingProfession({
                          ...editingProfession,
                          isActive: e.target.checked,
                        })
                      }
                    />
                    Active
                  </label>
                </div>

                <div className="col-span-2 flex gap-2 justify-end mt-4">
                  <button
                    onClick={handleCancelProfessionEdit}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveProfession}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
                  >
                    <Save className="w-4 h-4" />
                    Save Profession
                  </button>
                </div>
              </div>
            </div>
          )}

          {professions.length === 0 ? (
            <p className="text-gray-500">No professions found for this occupation.</p>
          ) : (
            <div className="space-y-2">
              {professions.map((profession) => (
                <div key={profession.id} className="space-y-2">
                  {/* Profession card */}
                  <div className="flex items-center justify-between border border-neutral-200 rounded-xl p-4 hover:shadow-md transition">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full border border-neutral-200">
                          Seq {profession.sequence}
                        </span>
                        <h4 className="font-semibold">{profession.name}</h4>
                        <Badge variant="outline" className="text-sm">
                          {profession.code}
                        </Badge>
                        {profession.jobLevel && (
                          <Badge variant="secondary" className="text-sm">
                            {profession.jobLevel}
                          </Badge>
                        )}
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            profession.isActive 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}
                        >
                          {profession.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      {profession.jobTitle && (
                        <p className="text-gray-600 mb-2">{profession.jobTitle}</p>
                      )}
                      <div className="flex gap-6 text-sm text-gray-500">
                        <span>Code: {profession.code}</span>
                        {profession.requiredEducation && (
                          <span>Education: {profession.requiredEducation}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100"
                        onClick={() => handleEditProfessionClick(profession)}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100"
                        onClick={() =>
                          handleDeleteProfession(profession.id!, profession.code)
                        }
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </button>
                    </div>
                  </div>

                  {editingProfession?.id === profession.id && (
                    <div className="bg-white rounded-xl p-4 shadow mb-4">
                      <h4 className="font-semibold mb-2">Edit Profession</h4>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-gray-600">Sequence</label>
                          <input
                            type="number"
                            className="border p-2 rounded w-full"
                            value={editingProfession.sequence ?? ""}
                            onChange={(e) =>
                              setEditingProfession({
                                ...editingProfession,
                                sequence: Number(e.target.value),
                              })
                            }
                          />
                        </div>

                        <div>
                          <label className="block text-sm text-gray-600">Code</label>
                          <input
                            type="text"
                            className="border p-2 rounded w-full"
                            value={editingProfession.code ?? ""}
                            onChange={(e) =>
                              setEditingProfession({
                                ...editingProfession,
                                code: e.target.value,
                              })
                            }
                          />
                        </div>

                        <div>
                          <label className="block text-sm text-gray-600">Name</label>
                          <input
                            type="text"
                            className="border p-2 rounded w-full"
                            value={editingProfession.name ?? ""}
                            onChange={(e) =>
                              setEditingProfession({
                                ...editingProfession,
                                name: e.target.value,
                              })
                            }
                          />
                        </div>

                        <div>
                          <label className="block text-sm text-gray-600">Job Title</label>
                          <input
                            type="text"
                            className="border p-2 rounded w-full"
                            value={editingProfession.jobTitle ?? ""}
                            onChange={(e) =>
                              setEditingProfession({
                                ...editingProfession,
                                jobTitle: e.target.value,
                              })
                            }
                          />
                        </div>

                        <div>
                          <label className="block text-sm text-gray-600">Job Level</label>
                          <input
                            type="text"
                            className="border p-2 rounded w-full"
                            value={editingProfession.jobLevel ?? ""}
                            onChange={(e) =>
                              setEditingProfession({
                                ...editingProfession,
                                jobLevel: e.target.value,
                              })
                            }
                          />
                        </div>

                        <div>
                          <label className="block text-sm text-gray-600">Required Education</label>
                          <input
                            type="text"
                            className="border p-2 rounded w-full"
                            value={editingProfession.requiredEducation ?? ""}
                            onChange={(e) =>
                              setEditingProfession({
                                ...editingProfession,
                                requiredEducation: e.target.value,
                              })
                            }
                          />
                        </div>

                        <div>
                          <label className="inline-flex items-center gap-2 text-sm text-gray-600">
                            <input
                              type="checkbox"
                              className="rounded border-gray-300"
                              checked={editingProfession.isActive ?? true}
                              onChange={(e) =>
                                setEditingProfession({
                                  ...editingProfession,
                                  isActive: e.target.checked,
                                })
                              }
                            />
                            Active
                          </label>
                        </div>

                        <div className="col-span-2 flex gap-2 justify-end mt-4">
                          <button
                            onClick={handleCancelProfessionEdit}
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100"
                          >
                            <X className="w-4 h-4" />
                            Cancel
                          </button>
                          <button
                            onClick={handleSaveProfession}
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
                          >
                            <Save className="w-4 h-4" />
                            Save Profession
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-700">
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
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!hasNext}
                >
                  Next
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
              
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Page {currentPage} of {totalPages}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OccupationDetailsPage;
