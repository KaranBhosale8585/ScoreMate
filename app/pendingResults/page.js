"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import toast from "react-hot-toast";

export default function ExaminerSubmissions() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const res = await axios.get("/api/getAllSubmissions", {
          withCredentials: true,
        });
        setSubmissions(res.data.submissions || []);
      } catch (error) {
        toast.error("Failed to load submissions.");
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, []);

  if (loading)
    return <p className="text-center text-black mt-10">Loading...</p>;

  return (
    <div className="max-w-6xl mx-auto mt-10 bg-white text-black p-4 md:p-6 rounded-xl shadow">
      <h2 className="text-2xl font-bold mb-6 text-center">All Submissions</h2>

      {submissions.length === 0 ? (
        <p className="text-center text-gray-600">No submissions found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full table-auto border-collapse text-sm md:text-base">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="p-3">Student</th>
                <th className="p-3">Email</th>
                <th className="p-3">Exam</th>
                <th className="p-3">Score</th>
                <th className="p-3">Reviewed</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((sub) => (
                <tr key={sub._id} className="border-t">
                  <td className="p-3">{sub.userId?.name}</td>
                  <td className="p-3">{sub.userId?.email}</td>
                  <td className="p-3">{sub.examId?.title}</td>
                  <td className="p-3">{sub.score}</td>
                  <td className="p-3">
                    {sub.isReviewed ? (
                      <span className="text-green-600 font-semibold">Yes</span>
                    ) : (
                      <span className="text-yellow-600 font-semibold">No</span>
                    )}
                  </td>
                  <td className="p-3">
                    <Link
                      href={`/review/${sub._id}`}
                      className="text-blue-600 hover:underline"
                    >
                      Review
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
