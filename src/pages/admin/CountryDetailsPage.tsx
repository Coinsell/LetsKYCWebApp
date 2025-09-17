import React, { useEffect, useState } from "react";
import { Country, Province, PaginatedResponse, PaginationParams, FilterCondition, FilterOperator, SortCondition, SortOrder } from "../../contexts/KYCAdminContext";
import { useParams, useNavigate } from "react-router-dom";
import { countryApi } from "../../lib/countryapi";
import { provinceApi } from "../../lib/provinceapi";
import {
  ArrowLeft,
  GripVertical,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Trash2,
  X,
  MapPin,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Props {
  mode?: "create" | "edit";
}

const CountryDetailsPage: React.FC<Props> = ({ mode }) => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const isNewRoute = code === "new" || mode === "create";

  const [country, setCountry] = useState<Country | null>(null);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editingCountry, setEditingCountry] = useState<Country | null>(null);
  const [editingProvince, setEditingProvince] = useState<Partial<Province> | null>(null);

  // Pagination state for provinces
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);

  // Filter and search state for provinces
  const [searchTerm, setSearchTerm] = useState("");
  const [restrictionFilter, setRestrictionFilter] = useState<string>('all');
  const [sortField, setSortField] = useState('sequence');
  const [sortOrder, setSortOrder] = useState<SortOrder>(SortOrder.ASC);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        if (isNewRoute) {
          const emptyCountry: Country = {
            id: "",
            sequence: 0,
            code: "",
            name: "",
            isRegistrationRestricted: false,
          };
          setCountry(emptyCountry);
          setEditingCountry(emptyCountry);
          setProvinces([]);
          return;
        }
        if (!code) {
          setError("Missing country code");
          return;
        }
        const countryData = await countryApi.getByCode(code);
        setCountry(countryData);
        loadProvinces();
      } catch (err: any) {
        console.error(err);
        setError(err?.message || "Failed to load Country");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [code, isNewRoute]);

  const loadProvinces = async () => {
    if (!country) return;
    
    try {
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

      // Filter by country code
      paginationParams.filters = [
        {
          field: 'countryCode',
          operator: FilterOperator.EQUALS,
          value: country.code
        }
      ];

      // Add restriction filter if not 'all'
      if (restrictionFilter !== 'all') {
        paginationParams.filters.push({
          field: 'isRegistrationRestricted',
          operator: FilterOperator.EQUALS,
          value: restrictionFilter === 'restricted'
        });
      }

      const response: PaginatedResponse<Province> = await provinceApi.listEnhanced(paginationParams);
      
      setProvinces(response.items);
      setTotalPages(response.total_pages);
      setTotalCount(response.total_count);
      setHasNext(response.has_next);
      setHasPrevious(response.has_previous);
      
    } catch (error) {
      console.error('Error fetching provinces:', error);
      setError('Failed to fetch provinces');
    }
  };

  useEffect(() => {
    if (country && !isNewRoute) {
      loadProvinces();
    }
  }, [currentPage, pageSize, searchTerm, restrictionFilter, sortField, sortOrder, country]);

  // --- Country Save ---
  async function handleSaveCountry() {
    if (!editingCountry) return;
    try {
      if (!editingCountry.id) {
        const created = await countryApi.create(editingCountry);
        setCountry(created);
        setEditingCountry(null);
        navigate(`/admin/countries/${created.code}`);
      } else {
        const updated = await countryApi.updateByCode(editingCountry.code, editingCountry);
        setCountry(updated);
        setEditingCountry(null);
        loadProvinces();
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to save country");
    }
  }

  function handleEditCountry() {
    setEditingCountry(country);
  }

  async function handleDeleteCountry() {
    if (!country?.id) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this Country and all its provinces?"
    );
    if (!confirmed) return;

    try {
      await countryApi.deleteByCode(country.code);
      navigate("/admin/countries");
    } catch (err: any) {
      console.error("Failed to delete Country:", err);
      setError(err?.message || "Failed to delete country");
    }
  }

  // --- Province Functions ---
  function makeEmptyProvince(): Partial<Province> {
    const seq = provinces.length
      ? Math.max(...provinces.map((p) => p.sequence)) + 1
      : 1;
    return {
      sequence: seq,
      code: "",
      name: "",
      countryCode: country?.code || "",
      countryName: country?.name || "",
      subDivisionType: "Province",
      isRegistrationRestricted: false,
    };
  }

  function handleAddProvinceClick() {
    setEditingProvince(makeEmptyProvince());
  }

  function handleEditProvinceClick(province: Province) {
    setEditingProvince({ ...province });
  }

  function handleCancelProvinceEdit() {
    setEditingProvince(null);
    setError(null);
  }

  async function handleSaveProvince() {
    if (!editingProvince || !country) return;

    try {
      let savedProvince: Province;

      if (editingProvince.id) {
        // Update existing province
        const existing = provinces.find((p) => p.id === editingProvince.id);
        if (!existing) throw new Error("Province not found");

        const payload: Province = {
          ...existing,
          ...editingProvince,
          countryCode: country.code,
          countryName: country.name,
        };

        savedProvince = await provinceApi.updateByCode(payload.code, payload);

        setProvinces((prev) =>
          prev.map((p) => (p.id === savedProvince.id ? savedProvince : p))
        );
      } else {
        // Create new province
        const nextSequence =
          provinces.length > 0
            ? Math.max(...provinces.map((p) => p.sequence)) + 1
            : 1;

        const newId = Date.now().toString();

        const payload: Province = {
          id: newId,
          sequence: editingProvince.sequence ?? nextSequence,
          code: editingProvince.code ?? "",
          name: editingProvince.name ?? "",
          countryCode: country.code,
          countryName: country.name,
          subDivisionType: editingProvince.subDivisionType ?? "Province",
          isRegistrationRestricted: editingProvince.isRegistrationRestricted ?? false,
        };

        savedProvince = await provinceApi.create(payload);

        setProvinces((prev) => [...prev, savedProvince]);
      }

      setEditingProvince(null);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to save province");
    }
  }

  async function handleDeleteProvince(idToDelete: string, provinceCode: string) {
    if (!confirm("Delete this province?")) return;

    try {
      await provinceApi.deleteByCode(provinceCode);

      setProvinces((prev) => prev.filter((p) => p.id !== idToDelete));
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to delete province");
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

  const handleRestrictionFilterChange = (value: string) => {
    setRestrictionFilter(value);
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

  if (error || !country)
    return (
      <div className="p-6 text-red-500 font-medium">
        {error || "Country not found"}
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
            onClick={handleDeleteCountry}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
            Delete Country
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

      {/* --- Country Card / Form --- */}
      <div className="bg-white shadow rounded-2xl p-6 space-y-3">
        {editingCountry ? (
          <>
            <h2 className="text-2xl font-bold">
              {isNewRoute ? "Create Country" : "Edit Country"}
            </h2>
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div>
                <label className="block text-sm text-gray-600">Code</label>
                <input
                  type="text"
                  placeholder="Country Code (e.g., US, IN)"
                  className="border p-2 rounded w-full"
                  value={editingCountry.code}
                  onChange={(e) =>
                    setEditingCountry({ ...editingCountry, code: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600">Name</label>
                <input
                  type="text"
                  placeholder="Country Name"
                  className="border p-2 rounded w-full"
                  value={editingCountry.name}
                  onChange={(e) =>
                    setEditingCountry({
                      ...editingCountry,
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
                  value={editingCountry.sequence}
                  onChange={(e) =>
                    setEditingCountry({
                      ...editingCountry,
                      sequence: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div>
                <label className="inline-flex items-center gap-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300"
                    checked={editingCountry.isRegistrationRestricted}
                    onChange={(e) =>
                      setEditingCountry({
                        ...editingCountry,
                        isRegistrationRestricted: e.target.checked,
                      })
                    }
                  />
                  Registration Restricted
                </label>
              </div>
            </div>
            <div className="pt-4 flex gap-2">
              {!isNewRoute && (
                <button
                  onClick={() => setEditingCountry(null)}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              )}
              <button
                onClick={handleSaveCountry}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
              >
                <Save className="w-4 h-4" />
                Save Country
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold">
              Country: <span className="text-blue-600">{country.name}</span>
            </h2>
            <p className="text-gray-700">Code: {country.code}</p>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                country.isRegistrationRestricted 
                  ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' 
                  : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              }`}
            >
              {country.isRegistrationRestricted ? 'Restricted' : 'Unrestricted'}
            </span>
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div>
                <p className="text-gray-500 text-sm">Sequence</p>
                <p className="font-medium">{country.sequence}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Code</p>
                <p className="font-medium">{country.code}</p>
              </div>
            </div>
            <div className="pt-4">
              <button
                onClick={handleEditCountry}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-100"
              >
                <Pencil className="w-4 h-4" />
                Edit Country
              </button>
            </div>
          </>
        )}
      </div>

      {/* --- Provinces List --- */}
      {!isNewRoute && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">Provinces</h3>
            <div className="flex gap-2">
              <button
                className="flex items-center gap-2 bg-green-600 text-white px-3 py-2 rounded-lg shadow hover:bg-green-700 text-sm"
                onClick={handleAddProvinceClick}
              >
                <Plus className="h-4 w-4" />
                Add Province
              </button>
            </div>
          </div>

          {/* Search and Filter Controls */}
          <div className="flex flex-wrap gap-4 items-center">
            <div className="relative w-72">
              <Input
                placeholder="Search provinces..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={restrictionFilter} onValueChange={handleRestrictionFilterChange}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Registration Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Provinces</SelectItem>
                <SelectItem value="restricted">Restricted</SelectItem>
                <SelectItem value="unrestricted">Unrestricted</SelectItem>
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
                <SelectItem value="subDivisionType">Type</SelectItem>
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
            Showing {provinces.length} of {totalCount} provinces (Page {currentPage} of {totalPages})
          </div>

          {/* --- New Province Editor --- */}
          {editingProvince && !editingProvince.id && (
            <div className="bg-white rounded-xl p-4 shadow mb-4">
              <h4 className="font-semibold mb-2">New Province</h4>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600">Sequence</label>
                  <input
                    type="number"
                    className="border p-2 rounded w-full"
                    value={editingProvince.sequence ?? ""}
                    onChange={(e) =>
                      setEditingProvince({
                        ...editingProvince,
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
                    value={editingProvince.code ?? ""}
                    onChange={(e) =>
                      setEditingProvince({
                        ...editingProvince,
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
                    value={editingProvince.name ?? ""}
                    onChange={(e) =>
                      setEditingProvince({
                        ...editingProvince,
                        name: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600">Type</label>
                  <input
                    type="text"
                    className="border p-2 rounded w-full"
                    value={editingProvince.subDivisionType ?? "Province"}
                    onChange={(e) =>
                      setEditingProvince({
                        ...editingProvince,
                        subDivisionType: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="inline-flex items-center gap-2 text-sm text-gray-600">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300"
                      checked={editingProvince.isRegistrationRestricted ?? false}
                      onChange={(e) =>
                        setEditingProvince({
                          ...editingProvince,
                          isRegistrationRestricted: e.target.checked,
                        })
                      }
                    />
                    Registration Restricted
                  </label>
                </div>

                <div className="col-span-2 flex gap-2 justify-end mt-4">
                  <button
                    onClick={handleCancelProvinceEdit}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveProvince}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
                  >
                    <Save className="w-4 h-4" />
                    Save Province
                  </button>
                </div>
              </div>
            </div>
          )}

          {provinces.length === 0 ? (
            <p className="text-gray-500">No provinces found for this country.</p>
          ) : (
            <div className="space-y-2">
              {provinces.map((province) => (
                <div key={province.id} className="space-y-2">
                  {/* Province card */}
                  <div className="flex items-center justify-between border border-neutral-200 rounded-xl p-4 hover:shadow-md transition">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full border border-neutral-200">
                          Seq {province.sequence}
                        </span>
                        <h4 className="font-semibold">{province.name}</h4>
                        <Badge variant="outline" className="text-sm">
                          {province.code}
                        </Badge>
                        <Badge variant="secondary" className="text-sm">
                          {province.subDivisionType}
                        </Badge>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            province.isRegistrationRestricted 
                              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' 
                              : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          }`}
                        >
                          {province.isRegistrationRestricted ? 'Restricted' : 'Unrestricted'}
                        </span>
                      </div>
                      <div className="flex gap-6 text-sm text-gray-500">
                        <span>Code: {province.code}</span>
                        <span>Type: {province.subDivisionType}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100"
                        onClick={() => handleEditProvinceClick(province)}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100"
                        onClick={() =>
                          handleDeleteProvince(province.id!, province.code)
                        }
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </button>
                    </div>
                  </div>

                  {editingProvince?.id === province.id && (
                    <div className="bg-white rounded-xl p-4 shadow mb-4">
                      <h4 className="font-semibold mb-2">Edit Province</h4>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-gray-600">Sequence</label>
                          <input
                            type="number"
                            className="border p-2 rounded w-full"
                            value={editingProvince.sequence ?? ""}
                            onChange={(e) =>
                              setEditingProvince({
                                ...editingProvince,
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
                            value={editingProvince.code ?? ""}
                            onChange={(e) =>
                              setEditingProvince({
                                ...editingProvince,
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
                            value={editingProvince.name ?? ""}
                            onChange={(e) =>
                              setEditingProvince({
                                ...editingProvince,
                                name: e.target.value,
                              })
                            }
                          />
                        </div>

                        <div>
                          <label className="block text-sm text-gray-600">Type</label>
                          <input
                            type="text"
                            className="border p-2 rounded w-full"
                            value={editingProvince.subDivisionType ?? "Province"}
                            onChange={(e) =>
                              setEditingProvince({
                                ...editingProvince,
                                subDivisionType: e.target.value,
                              })
                            }
                          />
                        </div>

                        <div>
                          <label className="inline-flex items-center gap-2 text-sm text-gray-600">
                            <input
                              type="checkbox"
                              className="rounded border-gray-300"
                              checked={editingProvince.isRegistrationRestricted ?? false}
                              onChange={(e) =>
                                setEditingProvince({
                                  ...editingProvince,
                                  isRegistrationRestricted: e.target.checked,
                                })
                              }
                            />
                            Registration Restricted
                          </label>
                        </div>

                        <div className="col-span-2 flex gap-2 justify-end mt-4">
                          <button
                            onClick={handleCancelProvinceEdit}
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100"
                          >
                            <X className="w-4 h-4" />
                            Cancel
                          </button>
                          <button
                            onClick={handleSaveProvince}
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
                          >
                            <Save className="w-4 h-4" />
                            Save Province
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

export default CountryDetailsPage;
