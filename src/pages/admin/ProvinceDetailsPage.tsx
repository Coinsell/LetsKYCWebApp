import React, { useEffect, useState } from "react";
import { Province, City, PaginatedResponse, PaginationParams, FilterCondition, FilterOperator, SortCondition, SortOrder } from "../../contexts/KYCAdminContext";
import { useParams, useNavigate } from "react-router-dom";
import { provinceApi } from "../../lib/provinceapi";
import { cityApi } from "../../lib/cityapi";
import {
  ArrowLeft,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Trash2,
  X,
  Building2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Props {
  mode?: "create" | "edit";
}

const ProvinceDetailsPage: React.FC<Props> = ({ mode }) => {
  const { code, countryCode } = useParams<{ code: string; countryCode: string }>();
  const navigate = useNavigate();
  const isNewRoute = code === "new" || mode === "create";

  const [province, setProvince] = useState<Province | null>(null);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editingProvince, setEditingProvince] = useState<Province | null>(null);
  const [editingCity, setEditingCity] = useState<Partial<City> | null>(null);

  // Pagination state for cities
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);

  // Filter and search state for cities
  const [searchTerm, setSearchTerm] = useState("");
  const [restrictionFilter, setRestrictionFilter] = useState<string>('all');
  const [sortField, setSortField] = useState('sequence');
  const [sortOrder, setSortOrder] = useState<SortOrder>(SortOrder.ASC);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        if (isNewRoute) {
          const emptyProvince: Province = {
            id: "",
            sequence: 0,
            code: "",
            name: "",
            countryCode: "",
            countryName: "",
            subDivisionType: "Province",
            isRegistrationRestricted: false,
          };
          setProvince(emptyProvince);
          setEditingProvince(emptyProvince);
          setCities([]);
          return;
        }
        if (!code) {
          setError("Missing province code");
          return;
        }
        if (!countryCode) {
          setError("Missing country code");
          return;
        }
        const provinceData = await provinceApi.getByCode(code, countryCode);
        setProvince(provinceData);
        loadCities();
      } catch (err: any) {
        console.error(err);
        setError(err?.message || "Failed to load Province");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [code, isNewRoute]);

  const loadCities = async () => {
    if (!province) return;
    
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

      // Filter by province code
      paginationParams.filters = [
        {
          field: 'provinceCode',
          operator: FilterOperator.EQUALS,
          value: province.code
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

      const response: PaginatedResponse<City> = await cityApi.listEnhanced(paginationParams);
      
      setCities(response.items);
      setTotalPages(response.total_pages);
      setTotalCount(response.total_count);
      setHasNext(response.has_next);
      setHasPrevious(response.has_previous);
      
    } catch (error) {
      console.error('Error fetching cities:', error);
      setError('Failed to fetch cities');
    }
  };

  useEffect(() => {
    if (province && !isNewRoute) {
      loadCities();
    }
  }, [currentPage, pageSize, searchTerm, restrictionFilter, sortField, sortOrder, province]);

  // --- Province Save ---
  async function handleSaveProvince() {
    if (!editingProvince) return;
    try {
      if (!editingProvince.id) {
        const created = await provinceApi.create(editingProvince);
        setProvince(created);
        setEditingProvince(null);
        navigate(`/admin/provinces/${created.countryCode}/${created.code}`);
      } else {
        const updated = await provinceApi.updateByCode(editingProvince.code, editingProvince, countryCode);
        setProvince(updated);
        setEditingProvince(null);
        loadCities();
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to save province");
    }
  }

  function handleEditProvince() {
    setEditingProvince(province);
  }

  async function handleDeleteProvince() {
    if (!province?.id) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this Province and all its cities?"
    );
    if (!confirmed) return;

    try {
      await provinceApi.deleteByCode(province.code, countryCode);
      navigate("/admin/provinces");
    } catch (err: any) {
      console.error("Failed to delete Province:", err);
      setError(err?.message || "Failed to delete province");
    }
  }

  // --- City Functions ---
  function makeEmptyCity(): Partial<City> {
    const seq = cities.length
      ? Math.max(...cities.map((c) => c.sequence)) + 1
      : 1;
    return {
      sequence: seq,
      code: "",
      name: "",
      countryCode: province?.countryCode || "",
      countryName: province?.countryName || "",
      provinceCode: province?.code || "",
      provinceName: province?.name || "",
      cityType: "City",
      isRegistrationRestricted: false,
    };
  }

  function handleAddCityClick() {
    setEditingCity(makeEmptyCity());
  }

  function handleEditCityClick(city: City) {
    setEditingCity({ ...city });
  }

  function handleCancelCityEdit() {
    setEditingCity(null);
    setError(null);
  }

  async function handleSaveCity() {
    if (!editingCity || !province) return;

    try {
      let savedCity: City;

      if (editingCity.id) {
        // Update existing city
        const existing = cities.find((c) => c.id === editingCity.id);
        if (!existing) throw new Error("City not found");

        const payload: City = {
          ...existing,
          ...editingCity,
          countryCode: province.countryCode,
          countryName: province.countryName,
          provinceCode: province.code,
          provinceName: province.name,
        };

        savedCity = await cityApi.updateByCode(payload.code, payload, countryCode);

        setCities((prev) =>
          prev.map((c) => (c.id === savedCity.id ? savedCity : c))
        );
      } else {
        // Create new city
        const nextSequence =
          cities.length > 0
            ? Math.max(...cities.map((c) => c.sequence)) + 1
            : 1;

        const newId = Date.now().toString();

        const payload: City = {
          id: newId,
          sequence: editingCity.sequence ?? nextSequence,
          code: editingCity.code ?? "",
          name: editingCity.name ?? "",
          countryCode: province.countryCode,
          countryName: province.countryName,
          provinceCode: province.code,
          provinceName: province.name,
          cityType: editingCity.cityType ?? "City",
          isRegistrationRestricted: editingCity.isRegistrationRestricted ?? false,
        };

        savedCity = await cityApi.create(payload);

        setCities((prev) => [...prev, savedCity]);
      }

      setEditingCity(null);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to save city");
    }
  }

  async function handleDeleteCity(idToDelete: string, cityCode: string) {
    if (!confirm("Delete this city?")) return;

    try {
      await cityApi.deleteByCode(cityCode, countryCode);

      setCities((prev) => prev.filter((c) => c.id !== idToDelete));
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to delete city");
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

  if (error || !province)
    return (
      <div className="p-6 text-red-500 font-medium">
        {error || "Province not found"}
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
            onClick={handleDeleteProvince}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
            Delete Province
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

      {/* --- Province Card / Form --- */}
      <div className="bg-white shadow rounded-2xl p-6 space-y-3">
        {editingProvince ? (
          <>
            <h2 className="text-2xl font-bold">
              {isNewRoute ? "Create Province" : "Edit Province"}
            </h2>
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div>
                <label className="block text-sm text-gray-600">Code</label>
                <input
                  type="text"
                  placeholder="Province Code"
                  className="border p-2 rounded w-full"
                  value={editingProvince.code}
                  onChange={(e) =>
                    setEditingProvince({ ...editingProvince, code: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600">Name</label>
                <input
                  type="text"
                  placeholder="Province Name"
                  className="border p-2 rounded w-full"
                  value={editingProvince.name}
                  onChange={(e) =>
                    setEditingProvince({
                      ...editingProvince,
                      name: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600">Country Code</label>
                <input
                  type="text"
                  placeholder="Country Code"
                  className="border p-2 rounded w-full"
                  value={editingProvince.countryCode}
                  onChange={(e) =>
                    setEditingProvince({
                      ...editingProvince,
                      countryCode: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600">Country Name</label>
                <input
                  type="text"
                  placeholder="Country Name"
                  className="border p-2 rounded w-full"
                  value={editingProvince.countryName}
                  onChange={(e) =>
                    setEditingProvince({
                      ...editingProvince,
                      countryName: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600">Sequence</label>
                <input
                  type="number"
                  className="border p-2 rounded w-full"
                  value={editingProvince.sequence}
                  onChange={(e) =>
                    setEditingProvince({
                      ...editingProvince,
                      sequence: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600">Type</label>
                <input
                  type="text"
                  className="border p-2 rounded w-full"
                  value={editingProvince.subDivisionType}
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
                    checked={editingProvince.isRegistrationRestricted}
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
            </div>
            <div className="pt-4 flex gap-2">
              {!isNewRoute && (
                <button
                  onClick={() => setEditingProvince(null)}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              )}
              <button
                onClick={handleSaveProvince}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
              >
                <Save className="w-4 h-4" />
                Save Province
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold">
              Province: <span className="text-blue-600">{province.name}</span>
            </h2>
            <p className="text-gray-700">Code: {province.code} | Country: {province.countryName} ({province.countryCode})</p>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                province.isRegistrationRestricted 
                  ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' 
                  : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              }`}
            >
              {province.isRegistrationRestricted ? 'Restricted' : 'Unrestricted'}
            </span>
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div>
                <p className="text-gray-500 text-sm">Sequence</p>
                <p className="font-medium">{province.sequence}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Type</p>
                <p className="font-medium">{province.subDivisionType}</p>
              </div>
            </div>
            <div className="pt-4">
              <button
                onClick={handleEditProvince}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-100"
              >
                <Pencil className="w-4 h-4" />
                Edit Province
              </button>
            </div>
          </>
        )}
      </div>

      {/* --- Cities List --- */}
      {!isNewRoute && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">Cities</h3>
            <div className="flex gap-2">
              <button
                className="flex items-center gap-2 bg-green-600 text-white px-3 py-2 rounded-lg shadow hover:bg-green-700 text-sm"
                onClick={handleAddCityClick}
              >
                <Plus className="h-4 w-4" />
                Add City
              </button>
            </div>
          </div>

          {/* Search and Filter Controls */}
          <div className="flex flex-wrap gap-4 items-center">
            <div className="relative w-72">
              <Input
                placeholder="Search cities..."
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
                <SelectItem value="all">All Cities</SelectItem>
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
                <SelectItem value="cityType">Type</SelectItem>
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
            Showing {cities.length} of {totalCount} cities (Page {currentPage} of {totalPages})
          </div>

          {/* --- New City Editor --- */}
          {editingCity && !editingCity.id && (
            <div className="bg-white rounded-xl p-4 shadow mb-4">
              <h4 className="font-semibold mb-2">New City</h4>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600">Sequence</label>
                  <input
                    type="number"
                    className="border p-2 rounded w-full"
                    value={editingCity.sequence ?? ""}
                    onChange={(e) =>
                      setEditingCity({
                        ...editingCity,
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
                    value={editingCity.code ?? ""}
                    onChange={(e) =>
                      setEditingCity({
                        ...editingCity,
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
                    value={editingCity.name ?? ""}
                    onChange={(e) =>
                      setEditingCity({
                        ...editingCity,
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
                    value={editingCity.cityType ?? "City"}
                    onChange={(e) =>
                      setEditingCity({
                        ...editingCity,
                        cityType: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="inline-flex items-center gap-2 text-sm text-gray-600">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300"
                      checked={editingCity.isRegistrationRestricted ?? false}
                      onChange={(e) =>
                        setEditingCity({
                          ...editingCity,
                          isRegistrationRestricted: e.target.checked,
                        })
                      }
                    />
                    Registration Restricted
                  </label>
                </div>

                <div className="col-span-2 flex gap-2 justify-end mt-4">
                  <button
                    onClick={handleCancelCityEdit}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveCity}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
                  >
                    <Save className="w-4 h-4" />
                    Save City
                  </button>
                </div>
              </div>
            </div>
          )}

          {cities.length === 0 ? (
            <p className="text-gray-500">No cities found for this province.</p>
          ) : (
            <div className="space-y-2">
              {cities.map((city) => (
                <div key={city.id} className="space-y-2">
                  {/* City card */}
                  <div className="flex items-center justify-between border border-neutral-200 rounded-xl p-4 hover:shadow-md transition">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full border border-neutral-200">
                          Seq {city.sequence}
                        </span>
                        <h4 className="font-semibold">{city.name}</h4>
                        <Badge variant="outline" className="text-sm">
                          {city.code}
                        </Badge>
                        <Badge variant="secondary" className="text-sm">
                          {city.cityType}
                        </Badge>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            city.isRegistrationRestricted 
                              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' 
                              : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          }`}
                        >
                          {city.isRegistrationRestricted ? 'Restricted' : 'Unrestricted'}
                        </span>
                      </div>
                      <div className="flex gap-6 text-sm text-gray-500">
                        <span>Code: {city.code}</span>
                        <span>Type: {city.cityType}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100"
                        onClick={() => handleEditCityClick(city)}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100"
                        onClick={() =>
                          handleDeleteCity(city.id!, city.code)
                        }
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </button>
                    </div>
                  </div>

                  {editingCity?.id === city.id && (
                    <div className="bg-white rounded-xl p-4 shadow mb-4">
                      <h4 className="font-semibold mb-2">Edit City</h4>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-gray-600">Sequence</label>
                          <input
                            type="number"
                            className="border p-2 rounded w-full"
                            value={editingCity.sequence ?? ""}
                            onChange={(e) =>
                              setEditingCity({
                                ...editingCity,
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
                            value={editingCity.code ?? ""}
                            onChange={(e) =>
                              setEditingCity({
                                ...editingCity,
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
                            value={editingCity.name ?? ""}
                            onChange={(e) =>
                              setEditingCity({
                                ...editingCity,
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
                            value={editingCity.cityType ?? "City"}
                            onChange={(e) =>
                              setEditingCity({
                                ...editingCity,
                                cityType: e.target.value,
                              })
                            }
                          />
                        </div>

                        <div>
                          <label className="inline-flex items-center gap-2 text-sm text-gray-600">
                            <input
                              type="checkbox"
                              className="rounded border-gray-300"
                              checked={editingCity.isRegistrationRestricted ?? false}
                              onChange={(e) =>
                                setEditingCity({
                                  ...editingCity,
                                  isRegistrationRestricted: e.target.checked,
                                })
                              }
                            />
                            Registration Restricted
                          </label>
                        </div>

                        <div className="col-span-2 flex gap-2 justify-end mt-4">
                          <button
                            onClick={handleCancelCityEdit}
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100"
                          >
                            <X className="w-4 h-4" />
                            Cancel
                          </button>
                          <button
                            onClick={handleSaveCity}
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
                          >
                            <Save className="w-4 h-4" />
                            Save City
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

export default ProvinceDetailsPage;
