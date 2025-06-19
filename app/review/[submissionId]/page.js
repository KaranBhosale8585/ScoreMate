"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";

export default function ReviewSubmissionPage() {
  const { submissionId } = useParams();

  const [submission, setSubmission] = useState(null);
  const [scores, setScores] = useState({});
  const [feedback, setFeedback] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubmission = async () => {
      try {
        const res = await axios.get(`/api/getResult/${submissionId}`, {
          withCredentials: true,
        });
        setSubmission(res.data.submission);
      } catch (error) {
        toast.error("Failed to load submission.");
      } finally {
        setLoading(false);
      }
    };

    if (submissionId) fetchSubmission();
  }, [submissionId]);

  const handleScoreChange = (questionId, value) => {
    setScores((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleFeedbackChange = (questionId, value) => {
    setFeedback((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async () => {
    try {
      const res = await axios.put(
        "/api/manualScore",
        {
          submissionId,
          scores,
          feedback,
        },
        { withCredentials: true }
      );
      toast.success("Manual scoring submitted.");
    } catch (error) {
      console.error(error);
      toast.error("Failed to submit scores.");
    }
  };

  if (loading) {
    return <div className="text-center py-10 text-black">Loading...</div>;
  }

  if (!submission) {
    return (
      <div className="text-center text-red-600 mt-10">Submission not found</div>
    );
  }

  const { exam, answers } = submission;

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white rounded-xl shadow text-black">
      <h1 className="text-2xl font-bold text-center mb-6">
        Manual Review: {exam.title}
      </h1>

      {exam.questions.map((q, index) => (
        <div key={q._id} className="mb-6 p-4 border rounded bg-gray-50">
          <p className="font-semibold">
            Q{index + 1}: {q.questionText}
          </p>
          <p className="mt-2 text-sm text-gray-800">
            <span className="font-semibold">Answer:</span>{" "}
            {answers[q._id] || "Not answered"}
          </p>

          {q.type === "mcq" ? (
            <p className="text-sm text-green-600 mt-2">Auto evaluated (MCQ)</p>
          ) : (
            <>
              <label className="block mt-4 font-medium">Score:</label>
              <input
                type="number"
                className="w-full p-2 border rounded mb-2"
                placeholder="Enter score"
                value={scores[q._id] || ""}
                onChange={(e) => handleScoreChange(q._id, e.target.value)}
              />

              <label className="block font-medium">Feedback:</label>
              <textarea
                className="w-full p-2 border rounded"
                rows={2}
                placeholder="Add feedback"
                value={feedback[q._id] || ""}
                onChange={(e) => handleFeedbackChange(q._id, e.target.value)}
              />
            </>
          )}
        </div>
      ))}

      <button
        onClick={handleSubmit}
        className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
      >
        Submit Manual Scores
      </button>
    </div>
  );
}
