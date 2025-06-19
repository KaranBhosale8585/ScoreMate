"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

export default function StudentResultPage() {
  const { examId } = useParams();
  const [submission, setSubmission] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const resultRef = useRef(null);

  const loadPdfLibrary = () => {
    return new Promise((resolve, reject) => {
      if (typeof window.html2pdf !== "undefined") {
        resolve();
        return;
      }

      const script = document.createElement("script");
      script.src =
        "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.9.2/html2pdf.bundle.min.js";
      script.type = "text/javascript";
      script.onload = resolve;
      script.onerror = reject;
      document.body.appendChild(script);
    });
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      loadPdfLibrary().catch(() => {
        toast.error("Failed to load PDF library.");
      });
    }
  }, []);

  useEffect(() => {
    const fetchResultAndUser = async () => {
      try {
        const [resResult, resUser] = await Promise.all([
          axios.get(`/api/studentResult/${examId}`, {
            withCredentials: true,
          }),
          axios.get("/api/auth/user", {
            withCredentials: true,
          }),
        ]);

        setSubmission(resResult.data.submission);
        setUser(resUser.data.user);
      } catch (err) {
        toast.error("Failed to load data.");
      } finally {
        setLoading(false);
      }
    };

    if (examId) fetchResultAndUser();
  }, [examId]);

  const downloadPDF = () => {
    const element = resultRef.current;
    if (!element) {
      toast.error("Result not ready to download.");
      return;
    }

    if (typeof window.html2pdf === "undefined") {
      toast.warning("PDF library is still loading. Please try again later.");
      return;
    }

    try {
      window
        .html2pdf()
        .from(element)
        .set({
          margin: 0,
          filename: `${submission.exam.title}_Result.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: {
            scale: 1.5,
            useCORS: true,
            backgroundColor: "#fff",
          },
          jsPDF: {
            unit: "px",
            format: [794, 1123], // A4 in px
            orientation: "portrait",
          },
        })
        .save();
    } catch (error) {
      console.error("PDF generation failed:", error);
      toast.error("Something went wrong while downloading.");
    }
  };

  if (loading) return <p className="text-center text-black">Loading...</p>;
  if (!submission)
    return <p className="text-center text-red-600 mt-10">Result not found</p>;

  const { exam, answers, score, subjectiveScores, feedback, isReviewed } =
    submission;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-2xl rounded-xl mt-10 text-black">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            📝 Result Sheet - {exam.title}
          </h1>
          {!isReviewed && (
            <p className="text-yellow-600 font-medium mt-2">
              ⚠️ Subjective answers are still under review.
            </p>
          )}
        </div>
        <button
          onClick={downloadPDF}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          Download PDF
        </button>
      </div>

      {/* A4 Wrapper */}
      <div
        ref={resultRef}
        className="relative bg-white mx-auto p-6"
        style={{
          width: "794px",
          minHeight: "1123px",
          boxSizing: "border-box",
          position: "relative",
        }}
      >
        {/* Watermark */}
        <div
          className="absolute inset-0 flex justify-center items-center pointer-events-none z-0"
          style={{
            opacity: 0.06,
            fontSize: "4rem",
            fontWeight: "bold",
            transform: "rotate(-30deg)",
            color: "#000",
            whiteSpace: "nowrap",
          }}
        >
          ✅ Verified Result Sheet
        </div>

        {/* User Info */}
        <div className="relative z-10 mb-6 text-gray-700">
          <p>
            <span className="font-semibold">Name:</span> {user?.name}
          </p>
          <p>
            <span className="font-semibold">Email:</span> {user?.email}
          </p>
          <p>
            <span className="font-semibold">Role:</span> {user?.role}
          </p>
        </div>

        {/* Final Score */}
        <div className="relative z-10 bg-gray-50 p-4 rounded mb-6">
          <p className="text-xl font-semibold text-gray-700 mb-1">
            Final Score:{" "}
            <span className="text-green-600 text-2xl font-bold">{score}</span>
          </p>
        </div>

        {/* Questions */}
        <div className="relative z-10 space-y-6">
          {exam.questions.map((q, index) => (
            <div
              key={q._id}
              className="p-4 border border-gray-200 rounded shadow-sm bg-white"
            >
              <p className="font-semibold text-lg text-gray-800 mb-2">
                Q{index + 1}: {q.questionText}
              </p>
              <p className="text-sm text-gray-700 mb-1">
                <span className="font-medium">Your Answer:</span>{" "}
                {answers[q._id] || "Not answered"}
              </p>

              {q.type === "mcq" ? (
                <p className="text-sm text-green-600 font-medium">
                  ✅ Auto Evaluated (MCQ)
                </p>
              ) : (
                <div className="text-sm">
                  <p>
                    <span className="font-medium">Score:</span>{" "}
                    {subjectiveScores[q._id] !== undefined
                      ? subjectiveScores[q._id]
                      : "Pending"}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Feedback:</span>{" "}
                    {feedback[q._id] || "Not given"}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <Toaster position="top-right" />
    </div>
  );
}
