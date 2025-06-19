"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Bar,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#00C49F", "#FFBB28", "#FF8042"];

export default function AnalyticsDashboard() {
  const [submissions, setSubmissions] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const calculateAnalytics = (data) => {
    const examScoresMap = {};
    const studentCountMap = {};
    const difficultyMap = { Easy: 0, Medium: 0, Hard: 0 };

    data.forEach((submission) => {
      const examTitle = submission.examId?.title;
      if (!examTitle) return;

      examScoresMap[examTitle] = examScoresMap[examTitle] || [];
      examScoresMap[examTitle].push(submission.score);

      studentCountMap[examTitle] = (studentCountMap[examTitle] || 0) + 1;

      Object.values(submission.feedback || {}).forEach((fb) => {
        const lower = fb.toLowerCase();
        if (lower.includes("easy")) difficultyMap.Easy++;
        else if (lower.includes("hard")) difficultyMap.Hard++;
        else difficultyMap.Medium++;
      });
    });

    const averageScores = Object.entries(examScoresMap).map(
      ([exam, scores]) => ({
        exam,
        avgScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
        students: studentCountMap[exam] || 0,
      })
    );

    const difficulty = Object.entries(difficultyMap).map(([name, value]) => ({
      name,
      value,
    }));

    return { averageScores, difficulty };
  };

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const res = await axios.get("/api/getAllSubmissions", {
          withCredentials: true,
        });
        const data = res.data.submissions || [];
        setSubmissions(data);
        setAnalytics(calculateAnalytics(data));
      } catch (error) {
        toast.error("Failed to load analytics.");
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, []);

  if (loading)
    return (
      <p className="text-center text-gray-800 mt-10">Loading analytics...</p>
    );

  if (!analytics)
    return (
      <div className="text-center text-gray-500 mt-10">
        No analytics data available.
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-white text-black shadow-md min-h-screen">
      <h1 className="text-2xl sm:text-3xl font-bold mb-8 text-center text-blue-800">
        📊 Examiner Analytics Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className="bg-gray-50 p-4 sm:p-6 rounded-xl shadow">
          <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-800">
            Average Scores & Student Count
          </h2>
          <div className="w-full h-[250px] sm:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.averageScores}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="exam" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="avgScore" fill="#6366F1" name="Average Score" />
                <Bar dataKey="students" fill="#10B981" name="Students" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="bg-gray-50 p-4 sm:p-6 rounded-xl shadow">
          <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-800">
            Question Difficulty (Feedback Based)
          </h2>
          <div className="w-full h-[250px] sm:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics.difficulty}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {analytics.difficulty.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="mt-10 text-center">
        <p className="text-base sm:text-lg font-medium text-gray-700">
          ✅ Total Submissions:{" "}
          <span className="text-blue-600 font-bold">{submissions.length}</span>
        </p>
      </div>
    </div>
  );
}
