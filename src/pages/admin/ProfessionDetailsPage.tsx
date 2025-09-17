import React, { useEffect, useState } from "react";
import { OccupationProfession, DocumentType } from "../../contexts/KYCAdminContext";
import { useParams, useNavigate } from "react-router-dom";
import { occupationProfessionApi } from "../../lib/occupationprofessionapi";
import {
  ArrowLeft,
  Pencil,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Props {
  mode?: "create" | "edit";
}

const ProfessionDetailsPage: React.FC<Props> = ({ mode }) => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const isNewRoute = code === "new" || mode === "create";

  const [profession, setProfession] = useState<OccupationProfession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingProfession, setEditingProfession] = useState<OccupationProfession | null>(null);
  const [occupations, setOccupations] = useState<OccupationProfession[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        if (isNewRoute) {
          const emptyProfession: OccupationProfession = {
            id: "",
            docType: DocumentType.PROFESSION,
            code: "",
            name: "",
            sequence: 0,
            isActive: true,
            occupationCode: "",
            occupationName: "",
            jobTitle: "",
            jobLevel: "",
            requiredEducation: "",
          };
          setProfession(emptyProfession);
          setEditingProfession(emptyProfession);
          loadOccupations();
          return;
        }
        if (!code) {
          setError("Missing profession code");
          return;
        }
        const professionData = await occupationProfessionApi.getProfession(code);
        setProfession(professionData);
        loadOccupations();
      } catch (err: any) {
        console.error(err);
        setError(err?.message || "Failed to load Profession");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [code, isNewRoute]);

  const loadOccupations = async () => {
    try {
      const occupationsData = await occupationProfessionApi.listOccupations();
      setOccupations(occupationsData);
    } catch (error) {
      console.error('Error fetching occupations:', error);
    }
  };

  // --- Profession Save ---
  async function handleSaveProfession() {
    if (!editingProfession) return;
    try {
      if (!editingProfession.id) {
        const created = await occupationProfessionApi.createProfession(editingProfession);
        setProfession(created);
        setEditingProfession(null);
        navigate(`/admin/professions/${created.code}`);
      } else {
        const updated = await occupationProfessionApi.updateProfession(editingProfession.code, editingProfession);
        setProfession(updated);
        setEditingProfession(null);
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to save profession");
    }
  }

  function handleEditProfession() {
    setEditingProfession(profession);
  }

  async function handleDeleteProfession() {
    if (!profession?.id) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this Profession?"
    );
    if (!confirmed) return;

    try {
      await occupationProfessionApi.deleteProfession(profession.code);
      navigate("/admin/professions");
    } catch (err: any) {
      console.error("Failed to delete Profession:", err);
      setError(err?.message || "Failed to delete profession");
    }
  }

  if (loading) return <LoadingSpinner />;

  if (error || !profession)
    return (
      <div className="p-6 text-red-500 font-medium">
        {error || "Profession not found"}
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
            onClick={handleDeleteProfession}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
            Delete Profession
          </button>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-100"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* --- Profession Card / Form --- */}
      <div className="bg-white shadow rounded-2xl p-6 space-y-3">
        {editingProfession ? (
          <>
            <h2 className="text-2xl font-bold">
              {isNewRoute ? "Create Profession" : "Edit Profession"}
            </h2>
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div>
                <label className="block text-sm text-gray-600">Code</label>
                <input
                  type="text"
                  placeholder="Profession Code"
                  className="border p-2 rounded w-full"
                  value={editingProfession.code}
                  onChange={(e) =>
                    setEditingProfession({ ...editingProfession, code: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600">Name</label>
                <input
                  type="text"
                  placeholder="Profession Name"
                  className="border p-2 rounded w-full"
                  value={editingProfession.name}
                  onChange={(e) =>
                    setEditingProfession({
                      ...editingProfession,
                      name: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600">Occupation</label>
                <Select
                  value={editingProfession.occupationCode || ""}
                  onValueChange={(value) => {
                    const selectedOccupation = occupations.find(occ => occ.code === value);
                    setEditingProfession({
                      ...editingProfession,
                      occupationCode: value,
                      occupationName: selectedOccupation?.name || "",
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Occupation" />
                  </SelectTrigger>
                  <SelectContent>
                    {occupations.map((occupation) => (
                      <SelectItem key={occupation.code} value={occupation.code}>
                        {occupation.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm text-gray-600">Job Title</label>
                <input
                  type="text"
                  placeholder="Job Title"
                  className="border p-2 rounded w-full"
                  value={editingProfession.jobTitle || ""}
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
                  placeholder="Job Level"
                  className="border p-2 rounded w-full"
                  value={editingProfession.jobLevel || ""}
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
                  placeholder="Required Education"
                  className="border p-2 rounded w-full"
                  value={editingProfession.requiredEducation || ""}
                  onChange={(e) =>
                    setEditingProfession({
                      ...editingProfession,
                      requiredEducation: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600">Sequence</label>
                <input
                  type="number"
                  className="border p-2 rounded w-full"
                  value={editingProfession.sequence}
                  onChange={(e) =>
                    setEditingProfession({
                      ...editingProfession,
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
                    checked={editingProfession.isActive}
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
            </div>
            <div className="pt-4 flex gap-2">
              {!isNewRoute && (
                <button
                  onClick={() => setEditingProfession(null)}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              )}
              <button
                onClick={handleSaveProfession}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
              >
                <Save className="w-4 h-4" />
                Save Profession
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold">
              Profession: <span className="text-blue-600">{profession.name}</span>
            </h2>
            <p className="text-gray-700">Code: {profession.code} | Occupation: {profession.occupationName}</p>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                profession.isActive 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              }`}
            >
              {profession.isActive ? 'Active' : 'Inactive'}
            </span>
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div>
                <p className="text-gray-500 text-sm">Job Title</p>
                <p className="font-medium">{profession.jobTitle || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Job Level</p>
                <p className="font-medium">{profession.jobLevel || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Required Education</p>
                <p className="font-medium">{profession.requiredEducation || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Sequence</p>
                <p className="font-medium">{profession.sequence}</p>
              </div>
            </div>
            <div className="pt-4">
              <button
                onClick={handleEditProfession}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-100"
              >
                <Pencil className="w-4 h-4" />
                Edit Profession
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProfessionDetailsPage;
