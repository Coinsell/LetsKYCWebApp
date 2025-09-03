// src/pages/KYCLevelDetailsPage.tsx
import React, { useEffect, useState } from "react";
import {
  KYCLevel,
  KYCDetail,
  KYCStatus,
  TimeUnit,
  KycDetailType,
} from "../contexts/KYCAdminContext";
import { useParams, useNavigate } from "react-router-dom";
import { kycLevelsApi } from "../lib/kyclevelsapi";
import { kycDetailsApi } from "@/lib/kycdetailsapi";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Enum-label maps
const kycStatusLabels: Record<KYCStatus, string> = {
  [KYCStatus.NotSubmitted]: "Not Submitted",
  [KYCStatus.InProgress]: "In Progress",
  [KYCStatus.Submitted]: "Submitted",
  [KYCStatus.UnderReview]: "Under Review",
  [KYCStatus.Approved]: "Approved",
  [KYCStatus.Rejected]: "Rejected",
};
const kycStatusColors: Record<KYCStatus, string> = {
  [KYCStatus.NotSubmitted]: "bg-gray-200 text-gray-700",
  [KYCStatus.InProgress]: "bg-blue-200 text-blue-700",
  [KYCStatus.Submitted]: "bg-yellow-200 text-yellow-800",
  [KYCStatus.UnderReview]: "bg-purple-200 text-purple-700",
  [KYCStatus.Approved]: "bg-green-200 text-green-800",
  [KYCStatus.Rejected]: "bg-red-200 text-red-800",
};
const kycDetailTypeLabels: Record<KycDetailType, string> = {
  general: "General",
  phoneNo: "Phone Number",
  address: "Address",
  addressProof: "Address Proof",
  selfie: "Selfie",
  identityProof: "Identity Proof",
  occupation: "Occupation",
  pepDeclaration: "PEP Declaration",
  [KycDetailType.userInfo]: "User Info",
  [KycDetailType.mobileOtp]: "Mobile OTP",
  [KycDetailType.aadhaar]: "Aadhaar",
  [KycDetailType.pan]: "PAN",
  [KycDetailType.liveliness]: "Liveliness Check",
};
const timeUnitLabels: Record<TimeUnit, string> = {
  [TimeUnit.Year]: "Year",
  [TimeUnit.Month]: "Month",
  [TimeUnit.Day]: "Day",
  [TimeUnit.Hour]: "Hour",
  [TimeUnit.Minute]: "Minute",
  [TimeUnit.Second]: "Second",
  [TimeUnit.MilliSecond]: "Millisecond",
};

// Helpers
function formatDuration(duration: number, unit: TimeUnit) {
  const label = timeUnitLabels[unit];
  return `${duration} ${label}${duration > 1 ? "s" : ""}`;
}
function formatCurrency(amount?: number | null) {
  if (amount == null) return "N/A";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}
function toEnum<E extends Record<string, string>>(
  enumObj: E,
  value: string
): E[keyof E] {
  const vals = Object.values(enumObj) as unknown as string[];
  if (vals.includes(value)) return value as unknown as E[keyof E];
  return vals[0] as unknown as E[keyof E];
}

interface Props {
  mode?: "create" | "edit";
}

const KYCLevelDetailsPage: React.FC<Props> = ({ mode }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNewRoute = id === "new" || mode === "create";

  const [level, setLevel] = useState<KYCLevel | null>(null);
  const [levelDetails, setLevelDetails] = useState<KYCDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editingLevel, setEditingLevel] = useState<KYCLevel | null>(null);
  const [editingDetail, setEditingDetail] = useState<Partial<KYCDetail> | null>(
    null
  );

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        if (isNewRoute) {
          const emptyLevel: KYCLevel = {
            id: "",
            kycLevelId: "",
            code: "",
            description: "",
            status: KYCStatus.NotSubmitted,
            maxDepositAmount: undefined,
            maxWithdrawalAmount: undefined,
            duration: 0,
            timeUnit: TimeUnit.Day,
          };
          setLevel(emptyLevel);
          setEditingLevel(emptyLevel);
          setLevelDetails([]);
          return;
        }
        if (!id) {
          setError("Missing id");
          return;
        }
        const levelData = await kycLevelsApi.get(id);
        const detailsData = await kycDetailsApi.getByLevel(id);
        setLevel(levelData);
        setLevelDetails(detailsData || []);
      } catch (err: any) {
        console.error(err);
        setError(err?.message || "Failed to load KYC Level");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, isNewRoute]);

  // --- Level Save ---
  async function handleSaveLevel() {
    if (!editingLevel) return;
    try {
      if (!editingLevel.id) {
        editingLevel.kycLevelId =
          editingLevel.kycLevelId || `kyc-${Date.now()}`;
        const created = await kycLevelsApi.create(editingLevel);
        setLevel(created);
        setEditingLevel(null); // ← Exit edit mode
        navigate(`/admin/kyc-levels/${created.id}`);
      } else {
        const updated = await kycLevelsApi.update(
          editingLevel.id,
          editingLevel
        );
        setLevel(updated);
        setEditingLevel(null); // ← Exit edit mode
        const detailsData = await kycDetailsApi.getByLevel(updated.id);
        setLevelDetails(detailsData || []);
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to save level");
    }
  }

  function handleEditLevel() {
    setEditingLevel(level);
  }

  // --- KYC Detail Functions (unchanged) ---
  function makeEmptyDetail(): Partial<KYCDetail> {
    const seq = levelDetails.length
      ? Math.max(...levelDetails.map((d) => d.sequence)) + 1
      : 1;
    return {
      kycLevelId: level?.id || "",
      sequence: seq,
      step: "",
      description: "",
      type: KycDetailType.general,
      status: KYCStatus.NotSubmitted,
      hasAttachments: false,
      attachments: [],
    };
  }
  function handleAddDetailClick() {
    setEditingDetail(makeEmptyDetail());
  }
  function handleEditDetailClick(detail: KYCDetail) {
    setEditingDetail({ ...detail });
  }
  function handleCancelDetailEdit() {
    setEditingDetail(null);
    setError(null);
  }

  async function handleSaveDetail() {
    if (!editingDetail || !level) return;

    try {
      let savedDetail: KYCDetail;

      if (editingDetail.id) {
        // --- Update existing detail ---
        const existing = levelDetails.find((d) => d.id === editingDetail.id);
        if (!existing) throw new Error("Detail not found");

        const payload: KYCDetail = {
          ...existing,
          ...editingDetail,
          kycLevelId: level.id,
        };

        savedDetail = await kycDetailsApi.update(payload.id, payload);

        setLevelDetails((prev) =>
          prev.map((d) => (d.id === savedDetail.id ? savedDetail : d))
        );
      } else {
        // --- Create new detail ---
        const nextSequence =
          levelDetails.length > 0
            ? Math.max(...levelDetails.map((d) => d.sequence)) + 1
            : 1;

        // Assign a temporary ID to satisfy typing
        const newId = Date.now().toString();

        const payload: KYCDetail = {
          id: newId,
          kycLevelId: level.id,
          sequence: editingDetail.sequence ?? nextSequence,
          step: editingDetail.step ?? "",
          description: editingDetail.description ?? "",
          type: editingDetail.type ?? KycDetailType.general,
          status: editingDetail.status ?? KYCStatus.NotSubmitted,
          hasAttachments: editingDetail.hasAttachments ?? false,
          attachments: editingDetail.attachments ?? [],
        };

        savedDetail = await kycDetailsApi.create(payload);

        setLevelDetails((prev) => [...prev, savedDetail]);
      }

      setEditingDetail(null);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to save detail");
    }
  }

  async function handleDeleteDetail(idToDelete: string) {
    if (!confirm("Delete this detail?")) return;
    try {
      await kycDetailsApi.delete(idToDelete);
      setLevelDetails((prev) => prev.filter((d) => d.id !== idToDelete));
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to delete detail");
    }
  }

  if (loading) return <div className="p-6 text-gray-500">Loading...</div>;
  if (error || !level)
    return (
      <div className="p-6 text-red-500 font-medium">
        {error || "KYC Level not found"}
      </div>
    );

  const timeUnitOptions = Object.values(TimeUnit).map((v) => ({
    value: v,
    label: timeUnitLabels[v] || v,
  }));
  const kycStatusOptions = Object.values(KYCStatus).map((v) => ({
    value: v,
    label: kycStatusLabels[v] || v,
  }));
  const kycTypeOptions = Object.values(KycDetailType).map((v) => ({
    value: v,
    label: kycDetailTypeLabels[v as KycDetailType] || v,
  }));

  // --- Render ---
  return (
    <div className="p-6 space-y-6">
      {/* --- Level Card / Form --- */}
      <div className="bg-white shadow rounded-2xl p-6 space-y-3">
        {editingLevel ? (
          <>
            <h2 className="text-2xl font-bold">
              {isNewRoute ? "Create Level" : "Edit Level"}
            </h2>
            <div className="grid grid-cols-2 gap-4 pt-4">
              <input
                type="text"
                placeholder="Code"
                className="border p-2 rounded"
                value={editingLevel.code}
                onChange={(e) =>
                  setEditingLevel({ ...editingLevel, code: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Description"
                className="border p-2 rounded"
                value={editingLevel.description}
                onChange={(e) =>
                  setEditingLevel({
                    ...editingLevel,
                    description: e.target.value,
                  })
                }
              />
              <input
                type="number"
                placeholder="Max Deposit"
                className="border p-2 rounded"
                value={editingLevel.maxDepositAmount ?? ""}
                onChange={(e) =>
                  setEditingLevel({
                    ...editingLevel,
                    maxDepositAmount:
                      e.target.value === ""
                        ? undefined
                        : Number(e.target.value),
                  })
                }
              />
              <input
                type="number"
                placeholder="Max Withdrawal"
                className="border p-2 rounded"
                value={editingLevel.maxWithdrawalAmount ?? ""}
                onChange={(e) =>
                  setEditingLevel({
                    ...editingLevel,
                    maxWithdrawalAmount:
                      e.target.value === ""
                        ? undefined
                        : Number(e.target.value),
                  })
                }
              />
              <div>
                <p className="text-sm text-gray-500">Duration</p>
                <input
                  type="number"
                  className="border p-2 rounded w-full"
                  value={editingLevel.duration}
                  onChange={(e) =>
                    setEditingLevel({
                      ...editingLevel,
                      duration: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div>
                <p className="text-sm text-gray-500">Time Unit</p>
                <select
                  className="border p-2 rounded w-full"
                  value={editingLevel.timeUnit}
                  onChange={(e) =>
                    setEditingLevel({
                      ...editingLevel,
                      timeUnit: toEnum(TimeUnit, e.target.value),
                    })
                  }
                >
                  {timeUnitOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <select
                  className="border p-2 rounded w-full"
                  value={editingLevel.status}
                  onChange={(e) =>
                    setEditingLevel({
                      ...editingLevel,
                      status: toEnum(KYCStatus, e.target.value),
                    })
                  }
                >
                  {kycStatusOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="pt-4 flex gap-2">
              {!isNewRoute && (
                <button
                  className="px-4 py-2 bg-gray-200 rounded"
                  onClick={() => setEditingLevel(null)}
                >
                  Cancel
                </button>
              )}
              <button
                className="px-4 py-2 bg-green-600 text-white rounded"
                onClick={handleSaveLevel}
              >
                Save Level
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold">
              KYC Level: <span className="text-blue-600">{level.code}</span>
            </h2>
            <p className="text-gray-700">{level.description}</p>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                kycStatusColors[level.status]
              }`}
            >
              {kycStatusLabels[level.status]}
            </span>
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div>
                <p className="text-gray-500 text-sm">Max Deposit</p>
                <p className="font-medium">
                  {formatCurrency(level.maxDepositAmount)}
                </p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Max Withdrawal</p>
                <p className="font-medium">
                  {formatCurrency(level.maxWithdrawalAmount)}
                </p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Duration</p>
                <p className="font-medium">
                  {formatDuration(level.duration, level.timeUnit)}
                </p>
              </div>
            </div>
            <div className="pt-4">
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded-xl shadow hover:bg-blue-700 transition"
                onClick={handleEditLevel}
              >
                Edit Level
              </button>
            </div>
          </>
        )}
      </div>

      {/* --- KYC Details List --- */}
      {!isNewRoute && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">Verification Steps</h3>
            <div className="flex gap-2">
              <button
                className="flex items-center gap-2 bg-green-600 text-white px-3 py-2 rounded-lg shadow hover:bg-green-700 text-sm"
                onClick={handleAddDetailClick}
              >
                <Plus className="h-4 w-4" />
                Add Step
              </button>
              <button
                className="bg-gray-200 px-3 py-2 rounded-lg text-sm"
                onClick={() => window.location.reload()}
              >
                Refresh
              </button>
            </div>
          </div>

          {/* --- New Step Editor --- */}
          {editingDetail && !editingDetail.id && (
            <div className="bg-white rounded-xl p-4 shadow mb-4">
              <h4 className="font-semibold mb-2">New Step</h4>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600">
                    Sequence
                  </label>
                  <input
                    type="number"
                    className="border p-2 rounded w-full"
                    value={editingDetail.sequence ?? ""}
                    onChange={(e) =>
                      setEditingDetail({
                        ...editingDetail,
                        sequence: Number(e.target.value),
                      })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600">Type</label>
                  <select
                    className="border p-2 rounded w-full"
                    value={editingDetail.type ?? KycDetailType.general}
                    onChange={(e) =>
                      setEditingDetail({
                        ...editingDetail,
                        type: toEnum(KycDetailType, e.target.value),
                      })
                    }
                  >
                    {kycTypeOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-600">
                    Step Title
                  </label>
                  <input
                    type="text"
                    className="border p-2 rounded w-full"
                    value={editingDetail.step ?? ""}
                    onChange={(e) =>
                      setEditingDetail({
                        ...editingDetail,
                        step: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm text-gray-600">
                    Description
                  </label>
                  <textarea
                    className="border p-2 rounded w-full"
                    rows={3}
                    value={editingDetail.description ?? ""}
                    onChange={(e) =>
                      setEditingDetail({
                        ...editingDetail,
                        description: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="col-span-2 flex gap-2 justify-end mt-2">
                  <button
                    onClick={handleCancelDetailEdit}
                    className="px-3 py-2 rounded bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveDetail}
                    className="px-3 py-2 rounded bg-green-600 text-white"
                  >
                    Save Step
                  </button>
                </div>
              </div>
            </div>
          )}

          {levelDetails.length === 0 ? (
            <p className="text-gray-500">No steps defined for this level.</p>
          ) : (
            <div className="space-y-3">
              {levelDetails
                .sort((a, b) => a.sequence - b.sequence)
                .map((detail) => (
                  <div key={detail.id} className="space-y-2">
                    {/* Step card */}
                    <div className="flex items-center justify-between border border-neutral-200 rounded-xl p-4 hover:shadow-md transition">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full border border-neutral-200">
                            Step {detail.sequence}
                          </span>
                          <h4 className="font-semibold">{detail.step}</h4>
                          <span
                            className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${
                              detail.status === KYCStatus.Approved
                                ? "bg-green-100 text-green-800"
                                : detail.status === KYCStatus.Rejected
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {kycStatusLabels[detail.status]}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-2">
                          {detail.description}
                        </p>
                        <div className="flex gap-6 text-sm text-gray-500">
                          <span>Type: {kycDetailTypeLabels[detail.type]}</span>
                          <span>
                            Attachments:{" "}
                            {detail.hasAttachments && detail.attachments?.length
                              ? `${detail.attachments.length} file(s)`
                              : "None"}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100"
                          onClick={() => handleEditDetailClick(detail)}
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100"
                          onClick={() => handleDeleteDetail(detail.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </button>
                      </div>
                    </div>

                    {/* Inline editor right below the step */}
                    {/* {editingDetail?.id === detail.id && ( */}
                    {/* {editingDetail &&
                      (!editingDetail.id || editingDetail.id === detail.id) && ( */}
                    {/* {editingDetail && !editingDetail.id && (
                      <div className="bg-white rounded-xl p-4 shadow">
                        <h4 className="font-semibold mb-2">
                          {editingDetail.id ? "Edit Step" : "New Step"}
                        </h4>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm text-gray-600">
                              Sequence
                            </label>
                            <input
                              type="number"
                              className="border p-2 rounded w-full"
                              value={editingDetail.sequence ?? ""}
                              onChange={(e) =>
                                setEditingDetail({
                                  ...editingDetail,
                                  sequence: Number(e.target.value),
                                })
                              }
                            />
                          </div>

                          <div>
                            <label className="block text-sm text-gray-600">
                              Type
                            </label>
                            <select
                              className="border p-2 rounded w-full"
                              value={
                                editingDetail.type ?? KycDetailType.general
                              }
                              onChange={(e) =>
                                setEditingDetail({
                                  ...editingDetail,
                                  type: toEnum(KycDetailType, e.target.value),
                                })
                              }
                            >
                              {kycTypeOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm text-gray-600">
                              Step Title
                            </label>
                            <input
                              type="text"
                              className="border p-2 rounded w-full"
                              value={editingDetail.step ?? ""}
                              onChange={(e) =>
                                setEditingDetail({
                                  ...editingDetail,
                                  step: e.target.value,
                                })
                              }
                            />
                          </div>

                          <div className="col-span-2">
                            <label className="block text-sm text-gray-600">
                              Description
                            </label>
                            <textarea
                              className="border p-2 rounded w-full"
                              rows={3}
                              value={editingDetail.description ?? ""}
                              onChange={(e) =>
                                setEditingDetail({
                                  ...editingDetail,
                                  description: e.target.value,
                                })
                              }
                            />
                          </div>

                          <div className="col-span-2 flex gap-2 justify-end mt-2">
                            <button
                              onClick={handleCancelDetailEdit}
                              className="px-3 py-2 rounded bg-gray-200"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={handleSaveDetail}
                              className="px-3 py-2 rounded bg-green-600 text-white"
                            >
                              Save Step
                            </button>
                          </div>
                        </div>
                      </div>
                    )} */}

                    {editingDetail?.id === detail.id && (
                      <div className="bg-white rounded-xl p-4 shadow mb-4">
                        <h4 className="font-semibold mb-2">Edit Step</h4>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm text-gray-600">
                              Sequence
                            </label>
                            <input
                              type="number"
                              className="border p-2 rounded w-full"
                              value={editingDetail.sequence ?? ""}
                              onChange={(e) =>
                                setEditingDetail({
                                  ...editingDetail,
                                  sequence: Number(e.target.value),
                                })
                              }
                            />
                          </div>

                          <div>
                            <label className="block text-sm text-gray-600">
                              Type
                            </label>
                            <select
                              className="border p-2 rounded w-full"
                              value={
                                editingDetail.type ?? KycDetailType.general
                              }
                              onChange={(e) =>
                                setEditingDetail({
                                  ...editingDetail,
                                  type: toEnum(KycDetailType, e.target.value),
                                })
                              }
                            >
                              {kycTypeOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm text-gray-600">
                              Step Title
                            </label>
                            <input
                              type="text"
                              className="border p-2 rounded w-full"
                              value={editingDetail.step ?? ""}
                              onChange={(e) =>
                                setEditingDetail({
                                  ...editingDetail,
                                  step: e.target.value,
                                })
                              }
                            />
                          </div>

                          <div className="col-span-2">
                            <label className="block text-sm text-gray-600">
                              Description
                            </label>
                            <textarea
                              className="border p-2 rounded w-full"
                              rows={3}
                              value={editingDetail.description ?? ""}
                              onChange={(e) =>
                                setEditingDetail({
                                  ...editingDetail,
                                  description: e.target.value,
                                })
                              }
                            />
                          </div>

                          <div className="col-span-2 flex gap-2 justify-end mt-2">
                            <button
                              onClick={handleCancelDetailEdit}
                              className="px-3 py-2 rounded bg-gray-200"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={handleSaveDetail}
                              className="px-3 py-2 rounded bg-green-600 text-white"
                            >
                              Save Step
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default KYCLevelDetailsPage;
