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

interface Props {
  mode?: "create" | "edit";
}

const KYCLevelDetailsPage: React.FC<Props> = ({ mode }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const isNew = mode === "create";

  const [level, setLevel] = useState<KYCLevel | null>(null);
  const [levelDetails, setLevelDetails] = useState<KYCDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isNew) {
      setLevel({
        id: "",
        kycLevelId: "",
        code: "",
        description: "",
        status: KYCStatus.NotSubmitted,
        maxDepositAmount: null,
        maxWithdrawalAmount: null,
        duration: 0,
        timeUnit: TimeUnit.Day,
      });
      setLevelDetails([]);
      setLoading(false);
      return;
    }

    if (!id) {
      const fetchData = async () => {
        try {
          setLoading(true);
          const levelData = await kycLevelsApi.get(id);
          const detailsData = await kycDetailsApi.getByLevel(id);
          setLevel(levelData);
          setLevelDetails(detailsData);
        } catch (err: any) {
          console.error("Failed to fetch KYC Level details:", err);
          setError(err.message || "Error fetching data");
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [id]);

  async function handleSave() {
    if (!level) return;
    try {
      const created = await kycLevelsApi.create(level);
      console.log("Created:", created);
      navigate("/admin/kyc-levels"); // go back to list
    } catch (err: any) {
      console.error("Failed to save level:", err);
      setError(err.message || "Error saving level");
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

  return (
    <div className="p-6 space-y-6">
      {/* KYC Level Card or Form */}
      <div className="bg-white shadow rounded-2xl p-6 space-y-3">
        {isNew ? (
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
                    maxDepositAmount: Number(e.target.value),
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
                    maxWithdrawalAmount: Number(e.target.value),
                  })
                }
              />
            </div>
            <div className="pt-4">
              <button
                onClick={handleSave}
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
      {!isNew && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">Verification Steps</h3>
            <button
              className="bg-green-600 text-white px-3 py-2 rounded-lg shadow hover:bg-green-700 text-sm"
              onClick={() => {
                console.log("Add KYC Detail");
              }}
            >
              + Add Step
            </button>
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
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          kycStatusColors[detail.status]
                        }`}
                      >
                        {kycStatusLabels[detail.status]}
                      </span>
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

                    <div className="mt-3 flex gap-2">
                      <button className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm">
                        Edit
                      </button>
                      <button className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm">
                        Delete
                      </button>
                      <button className="px-3 py-1 bg-gray-200 rounded-lg hover:bg-gray-300 text-sm">
                        ↑
                      </button>
                      <button className="px-3 py-1 bg-gray-200 rounded-lg hover:bg-gray-300 text-sm">
                        ↓
                      </button>
                    </div>
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
