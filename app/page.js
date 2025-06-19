"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { checkAuthRedirect } from "@/lib/checkAuthRedirect";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function UserProfile() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [exams, setExams] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const init = async () => {
      try {
        await checkAuthRedirect(router);

        const [resUser, resExams, resSubmissions] = await Promise.all([
          axios.get("/api/auth/user", { withCredentials: true }),
          axios.get("/api/getTest", { withCredentials: true }),
          axios.get("/api/getSubmissions", { withCredentials: true }),
        ]);

        setUser(resUser.data.user);
        setExams(resExams.data.exams || []);
        setSubmissions(resSubmissions.data.submissions || []);
      } catch (err) {
        const msg = err.response?.data?.message || "You are not authenticated.";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [router]);

  const handleInputChange = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async (e, examId) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "/api/submitExam",
        { examId, answers },
        { withCredentials: true }
      );
      toast.success("Exam submitted successfully!");
      setSubmissions((prev) => [...prev, res.data.submission]);
      setAnswers({});
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit exam.");
    }
  };

  if (loading) return <p className="text-center text-black">Loading...</p>;

  if (error) {
    return (
      <div className="text-center mt-10 text-black">
        <p className="text-red-500 font-semibold mb-4">{error}</p>
        <Link href="/login" className="text-blue-600 underline font-medium">
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white shadow-xl rounded-xl mt-10 text-black">
      <h2 className="text-3xl font-bold mb-6 text-center">
        Welcome, {user?.name}
      </h2>

      <div className="bg-gray-100 rounded-lg p-4 mb-10">
        <p>
          <span className="font-semibold">Email:</span> {user?.email}
        </p>
        <p>
          <span className="font-semibold">Role:</span> {user?.role}
        </p>
      </div>

      {exams.map((exam) => {
        const submission = submissions.find(
          (s) =>
            (typeof s.examId === "string" && s.examId === exam._id) ||
            s.examId?._id === exam._id
        );

        return (
          <div
            key={exam._id}
            className="mb-10 p-6 border rounded-lg shadow-sm bg-gray-50"
          >
            <h3 className="text-xl font-semibold text-blue-700">
              {exam.title}
            </h3>
            <p className="text-gray-700 mb-4">{exam.description}</p>

            {submission ? (
              <div className="space-y-2 text-sm">
                <p className="text-green-700 font-medium">
                  ✅ Exam Submitted Successfully
                </p>
                <p>
                  <span className="font-semibold">Score:</span>{" "}
                  <span className="text-blue-600 font-bold">
                    {submission.score}
                  </span>
                </p>

                {submission.isReviewed ? (
                  <Link
                    href={`/my-result/${exam._id}`}
                    className="inline-block mt-1 text-sm text-white bg-blue-600 px-4 py-1 rounded hover:bg-blue-700 transition"
                  >
                    View Result
                  </Link>
                ) : (
                  <p className="text-yellow-600 font-medium">
                    ⏳ Result Pending – Subjective answers under review
                  </p>
                )}
              </div>
            ) : (
              <form
                onSubmit={(e) => handleSubmit(e, exam._id)}
                className="space-y-6"
              >
                {exam.questions.map((q, index) => (
                  <div key={q._id}>
                    <label className="block font-medium mb-2">
                      Q{index + 1}: {q.questionText}
                    </label>

                    {q.type === "mcq" ? (
                      <div className="space-y-2">
                        {q.options.map((opt, i) => (
                          <label key={i} className="block">
                            <input
                              type="radio"
                              name={q._id}
                              value={i + 1}
                              onChange={() => handleInputChange(q._id, i + 1)}
                              className="mr-2"
                              required
                            />
                            {opt}
                          </label>
                        ))}
                      </div>
                    ) : (
                      <textarea
                        className="w-full border p-2 rounded"
                        rows={3}
                        placeholder="Write your answer..."
                        onChange={(e) =>
                          handleInputChange(q._id, e.target.value)
                        }
                        required
                      />
                    )}
                  </div>
                ))}

                <button
                  type="submit"
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                >
                  Submit Exam
                </button>
              </form>
            )}
          </div>
        );
      })}
    </div>
  );
}
