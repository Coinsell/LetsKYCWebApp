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

// Utility: map enums to friendly labels
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

/**
 * toEnum - safe cast helper for string enums
 * enumObj: the enum (object)
 * value: the incoming string value (from event.target.value)
 */
function toEnum<E extends Record<string, string>>(
  enumObj: E,
  value: string
): E[keyof E] {
  const vals = Object.values(enumObj) as unknown as string[];
  if (vals.includes(value)) return value as unknown as E[keyof E];
  // fallback: return first enum value
  return vals[0] as unknown as E[keyof E];
}

interface Props {
  mode?: "create" | "edit";
}

const KYCLevelDetailsPage: React.FC<Props> = ({ mode }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // if parent passes mode="create" we'll treat as new, otherwise route /admin/kyc-levels/new should be used
  const isNewRoute = id === "new" || mode === "create";

  const [level, setLevel] = useState<KYCLevel | null>(null);
  const [levelDetails, setLevelDetails] = useState<KYCDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // editingDetail is Partial because while editing we may not have all fields filled yet
  const [editingDetail, setEditingDetail] = useState<Partial<KYCDetail> | null>(
    null
  );

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        if (isNewRoute) {
          // create empty level template
          setLevel({
            id: "",
            kycLevelId: "",
            code: "",
            description: "",
            status: KYCStatus.NotSubmitted,
            maxDepositAmount: undefined,
            maxWithdrawalAmount: undefined,
            duration: 0,
            timeUnit: TimeUnit.Day,
          });
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

  // Save KYC Level
  async function handleSaveLevel() {
    if (!level) return;
    console.log("Saving KYC Level", level);
    try {
      const payload: Partial<KYCLevel> = { ...level };

      if (!payload.id) {
        // New → create
        payload.kycLevelId = payload.kycLevelId || `kyc-${Date.now()}`;
        const created = await kycLevelsApi.create(payload);
        console.log("Created KYC Level", created);

        // Stay on this page, switch to edit mode
        navigate(`/admin/kyc-levels/${created.id}`);
      } else {
        // Existing → update
        const updated = await kycLevelsApi.update(
          payload.id as string,
          payload
        );
        console.log("Updated KYC Level", updated);

        // Reload data (stay on same page)
        setLevel(updated);
        const detailsData = await kycDetailsApi.getByLevel(updated.id);
        setLevelDetails(detailsData || []);
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to save level");
    }
  }

  // Helpers for KYC Details editing
  function makeEmptyDetail(): Partial<KYCDetail> {
    const seq = levelDetails.length
      ? Math.max(...levelDetails.map((d) => d.sequence)) + 1
      : 1;
    return {
      // id left undefined for create
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

  // Save (create or update) detail
  async function handleSaveDetail() {
    if (!editingDetail || !level) return;
    try {
      let savedDetail: KYCDetail;

      if (editingDetail.id) {
        // Update path - construct full payload merging with existing
        const existing = levelDetails.find((d) => d.id === editingDetail.id);
        if (!existing) throw new Error("Existing detail not found for update");

        const payload: KYCDetail = {
          ...existing,
          ...editingDetail,
          // ensure enums and required fields are present
          type: (editingDetail.type ?? existing.type) as KycDetailType,
          status: (editingDetail.status ?? existing.status) as KYCStatus,
          sequence: editingDetail.sequence ?? existing.sequence,
          step: editingDetail.step ?? existing.step,
          description: editingDetail.description ?? existing.description,
          hasAttachments:
            editingDetail.hasAttachments ?? existing.hasAttachments,
          attachments: editingDetail.attachments ?? existing.attachments ?? [],
        };

        savedDetail = await kycDetailsApi.update(payload.id, payload);
        setLevelDetails((prev) =>
          prev.map((d) => (d.id === savedDetail.id ? savedDetail : d))
        );
      } else {
        // Create path - ensure full object
        const payload: KYCDetail = {
          id: Date.now().toString() + Math.floor(Math.random() * 1000), // simple id gen
          kycLevelId: level.id,
          sequence: editingDetail.sequence ?? levelDetails.length + 1,
          step: editingDetail.step ?? "",
          description: editingDetail.description ?? "",
          type: (editingDetail.type ?? KycDetailType.general) as KycDetailType,
          status: (editingDetail.status ?? KYCStatus.NotSubmitted) as KYCStatus,
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

  // Delete detail
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

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (error || !level) {
    return (
      <div className="p-6">
        <p className="text-red-500 font-medium">
          {error || "KYC Level not found."}
        </p>
      </div>
    );
  }

  // Option arrays from enums (string enums)
  const timeUnitOptions = Object.values(TimeUnit).map((v) => ({
    value: v,
    label: timeUnitLabels[v as TimeUnit] || v,
  }));
  const kycStatusOptions = Object.values(KYCStatus).map((v) => ({
    value: v,
    label: kycStatusLabels[v as KYCStatus] || v,
  }));
  const kycTypeOptions = Object.values(KycDetailType).map((v) => ({
    value: v,
    label: kycDetailTypeLabels[v as KycDetailType] || v,
  }));

  return (
    <div className="p-6 space-y-6">
      {/* KYC Level Card or Form */}
      <div className="bg-white shadow rounded-2xl p-6 space-y-3">
        {isNewRoute ? (
          <>
            <h2 className="text-2xl font-bold">Create New KYC Level</h2>
            <div className="grid grid-cols-2 gap-4 pt-4">
              <input
                type="text"
                placeholder="Code"
                className="border p-2 rounded"
                value={level.code}
                onChange={(e) => setLevel({ ...level, code: e.target.value })}
              />
              <input
                type="text"
                placeholder="Description"
                className="border p-2 rounded"
                value={level.description}
                onChange={(e) =>
                  setLevel({ ...level, description: e.target.value })
                }
              />
              <input
                type="number"
                placeholder="Max Deposit"
                className="border p-2 rounded"
                value={level.maxDepositAmount ?? ""}
                onChange={(e) =>
                  setLevel({
                    ...level,
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
                value={level.maxWithdrawalAmount ?? ""}
                onChange={(e) =>
                  setLevel({
                    ...level,
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
                  value={level.duration}
                  onChange={(e) =>
                    setLevel({ ...level, duration: Number(e.target.value) })
                  }
                />
              </div>

              <div>
                <p className="text-sm text-gray-500">Time Unit</p>
                <select
                  className="border p-2 rounded w-full"
                  value={level.timeUnit}
                  onChange={(e) =>
                    setLevel({
                      ...level,
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
                <p className="text-sm text-gray-500">Status (optional)</p>
                <select
                  className="border p-2 rounded w-full"
                  value={level.status}
                  onChange={(e) =>
                    setLevel({
                      ...level,
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
            <div className="pt-4">
              <button
                onClick={handleSaveLevel}
                className="bg-green-600 text-white px-4 py-2 rounded-xl shadow hover:bg-green-700 transition"
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

            <div className="flex items-center space-x-2">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  kycStatusColors[level.status]
                }`}
              >
                {kycStatusLabels[level.status]}
              </span>
            </div>

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
              <button className="bg-blue-600 text-white px-4 py-2 rounded-xl shadow hover:bg-blue-700 transition">
                Edit Level
              </button>
            </div>
          </>
        )}
      </div>

      {/* KYC Details List */}
      {!isNewRoute && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">Verification Steps</h3>
            <div className="flex gap-2">
              <button
                className="bg-green-600 text-white px-3 py-2 rounded-lg shadow hover:bg-green-700 text-sm"
                onClick={handleAddDetailClick}
              >
                + Add Step
              </button>
              <button
                className="bg-gray-200 px-3 py-2 rounded-lg text-sm"
                onClick={() => {
                  /* optional: reload */
                }}
              >
                Refresh
              </button>
            </div>
          </div>

          {levelDetails.length === 0 ? (
            <p className="text-gray-500">No steps defined for this level.</p>
          ) : (
            <div className="space-y-3">
              {levelDetails
                .sort((a, b) => a.sequence - b.sequence)
                .map((detail) => (
                  <div
                    key={detail.id}
                    className="bg-gray-50 rounded-xl p-4 shadow-sm hover:shadow-md transition"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold">
                          {detail.sequence}. {detail.step}
                        </h4>
                        <p className="text-gray-600">{detail.description}</p>
                      </div>
                      <div className="text-right">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            kycStatusColors[detail.status]
                          }`}
                        >
                          {kycStatusLabels[detail.status]}
                        </span>
                        <div className="mt-2 flex gap-2 justify-end">
                          <button
                            className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
                            onClick={() => handleEditDetailClick(detail)}
                          >
                            Edit
                          </button>
                          <button
                            className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm"
                            onClick={() => handleDeleteDetail(detail.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-3 text-sm">
                      <div>
                        <p className="text-gray-500">Type</p>
                        <p className="font-medium">
                          {kycDetailTypeLabels[detail.type]}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Attachments</p>
                        <p className="font-medium">
                          {detail.hasAttachments && detail.attachments
                            ? `${detail.attachments.length} file(s)`
                            : "None"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}

          {/* Inline detail editor */}
          {editingDetail && (
            <div className="bg-white rounded-xl p-4 shadow mt-4">
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

                {/* <div>
                  <label className="block text-sm text-gray-600">Status</label>
                  <select
                    className="border p-2 rounded w-full"
                    value={editingDetail.status ?? KYCStatus.NotSubmitted}
                    onChange={(e) =>
                      setEditingDetail({
                        ...editingDetail,
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
                </div> */}

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
      )}
    </div>
  );
};

export default KYCLevelDetailsPage;
