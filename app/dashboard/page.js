"use client";

import { checkAuthRedirect } from "@/lib/checkAuthRedirect";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FaTrash, FaEdit, FaSave } from "react-icons/fa";
import { MdOutlineQuiz } from "react-icons/md";
import toast from "react-hot-toast";
import axios from "axios";

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [exams, setExams] = useState([]);
  const [editQuestionIndex, setEditQuestionIndex] = useState(null);
  const [editExamId, setEditExamId] = useState(null);
  const [editData, setEditData] = useState({
    questionText: "",
    type: "mcq",
    options: ["", "", "", ""],
    correctOption: "",
  });

  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);
      await checkAuthRedirect(router, "examiner");
      setLoading(false);
    };
    checkAuth();
  }, []);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await axios.get("/api/getExam", { withCredentials: true });
        setExams(res.data.exams || []);
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch exams.");
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, []);

  const handleDeleteExam = async (examId) => {
    try {
      await axios.delete(`/api/deleteExam/${examId}`, {
        withCredentials: true,
      });
      toast.success("Exam deleted successfully");
      setExams(exams.filter((exam) => exam._id !== examId));
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete exam");
    }
  };

  const handleDeleteQuestion = async (examId, questionIndex) => {
    try {
      const res = await axios.delete(
        `/api/deleteQue/${examId}/question/${questionIndex}`,
        {
          withCredentials: true,
        }
      );

      toast.success("Question deleted!");

      setExams((prev) =>
        prev.map((exam) =>
          exam._id === examId
            ? { ...exam, questions: res.data.updatedQuestions }
            : exam
        )
      );
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete question.");
    }
  };

  const handleEditQuestion = (examId, questionIndex, questionData) => {
    setEditExamId(examId);
    setEditQuestionIndex(questionIndex);
    setEditData({
      questionText: questionData.questionText,
      type: questionData.type,
      options: questionData.options || ["", "", "", ""],
      correctOption: questionData.correctOption || "",
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const handleOptionChange = (index, value) => {
    const updatedOptions = [...editData.options];
    updatedOptions[index] = value;
    setEditData((prev) => ({ ...prev, options: updatedOptions }));
  };

  const saveEditedQuestion = async () => {
    try {
      const res = await axios.put(
        `/api/editQue/${editExamId}/question/${editQuestionIndex}`,
        editData,
        { withCredentials: true }
      );

      toast.success("Question updated successfully");
      setExams((prev) =>
        prev.map((exam) =>
          exam._id === editExamId
            ? { ...exam, questions: res.data.updatedQuestions }
            : exam
        )
      );
      setEditQuestionIndex(null);
      setEditExamId(null);
      setEditData({
        questionText: "",
        type: "mcq",
        options: ["", "", "", ""],
        correctOption: "",
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to update question");
    }
  };

  if (loading) return <p className="text-center text-black">Loading...</p>;

  return (
    <div className="">
      <div className="min-h-screen bg-gray-100 text-black py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-center flex items-center justify-center gap-2">
            <MdOutlineQuiz className="text-blue-600" />
            My Exams
          </h1>

          {exams.length === 0 ? (
            <p className="text-center text-gray-500">No exams found.</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {exams.map((exam) => (
                <div
                  key={exam._id}
                  className="bg-white rounded-xl shadow-md p-6 space-y-3"
                >
                  <div className="flex justify-between border-b pb-2">
                    <div>
                      <h2 className="text-xl font-semibold text-blue-700">
                        {exam.title}
                      </h2>
                      <p className="text-sm text-gray-600">{exam.subject}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(exam.date).toLocaleDateString()} |{" "}
                        {exam.duration} mins
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteExam(exam._id)}
                      className="text-red-600 hover:text-red-800"
                      title="Delete Exam"
                    >
                      <FaTrash />
                    </button>
                  </div>

                  <p className="text-gray-700">{exam.description}</p>

                  <div>
                    <h3 className="font-semibold text-sm text-gray-700">
                      Questions:
                    </h3>
                    {exam.questions.map((q, index) => (
                      <div
                        key={index}
                        className="bg-gray-100 rounded p-3 mt-2 text-sm"
                      >
                        {editQuestionIndex === index &&
                        editExamId === exam._id ? (
                          <div className="space-y-2">
                            <textarea
                              name="questionText"
                              value={editData.questionText}
                              onChange={handleEditChange}
                              className="w-full p-2 border rounded"
                            />
                            {editData.type === "mcq" && (
                              <>
                                {editData.options.map((opt, i) => (
                                  <input
                                    key={i}
                                    type="text"
                                    value={opt}
                                    onChange={(e) =>
                                      handleOptionChange(i + 1, e.target.value)
                                    }
                                    className="w-full p-2 border rounded"
                                    placeholder={`Option ${i + 1}`}
                                  />
                                ))}
                                <input
                                  name="correctOption"
                                  value={editData.correctOption}
                                  onChange={handleEditChange}
                                  className="w-full p-2 border rounded"
                                  placeholder="Correct Option Index (0-3)"
                                />
                              </>
                            )}
                            <button
                              onClick={saveEditedQuestion}
                              className="bg-green-600 hover:bg-green-700 text-white text-sm px-3 py-1 rounded flex items-center gap-1"
                            >
                              <FaSave /> Save
                            </button>
                          </div>
                        ) : (
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">
                                {index + 1}. {q.questionText}
                              </p>
                              {q.type === "mcq" && (
                                <ul className="list-disc ml-5 text-gray-700">
                                  {q.options.map((opt, i) => (
                                    <li key={i}>{opt}</li>
                                  ))}
                                  <li className="text-green-600 font-medium">
                                    Correct: {q.options[q.correctOption-1]}
                                  </li>
                                </ul>
                              )}
                            </div>
                            <div className="flex gap-3 pt-1">
                              <button
                                onClick={() =>
                                  handleEditQuestion(exam._id, index, q)
                                }
                                className="text-blue-600 hover:text-blue-800"
                                title="Edit Question"
                              >
                                <FaEdit />
                              </button>
                              <button
                                onClick={() =>
                                  handleDeleteQuestion(exam._id, index)
                                }
                                className="text-red-600 hover:text-red-800"
                                title="Delete Question"
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
