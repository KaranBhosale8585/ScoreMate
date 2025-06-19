"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const CreateExamPage = () => {
  const router = useRouter();

  const [exam, setExam] = useState({
    title: "",
    description: "",
    subject: "",
    date: "",
    duration: "",
    questions: [],
  });

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [question, setQuestion] = useState({
    type: "mcq",
    questionText: "",
    options: ["", "", "", ""],
    correctOption: "",
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("/api/auth/user", {
          withCredentials: true,
        });
        if (res.data.user?.role !== "examiner") {
          toast.error("Access denied: Examiner only");
          router.push("/");
        } else {
          setUser(res.data.user);
          console.log(res.data.user);
        }
      } catch (err) {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [router]);

  const handleQuestionChange = (e) =>
    setQuestion({ ...question, [e.target.name]: e.target.value });

  const handleOptionChange = (index, value) => {
    const newOptions = [...question.options];
    newOptions[index] = value;
    setQuestion({ ...question, options: newOptions });
  };

  const validateQuestion = () => {
    if (!question.questionText.trim()) return false;
    if (question.type === "mcq") {
      return (
        question.options.every((opt) => opt.trim() !== "") &&
        question.correctOption.trim() !== ""
      );
    }
    return true;
  };

  const addQuestion = () => {
    if (!validateQuestion()) {
      toast.error("Please fill all fields for the question.");
      return;
    }

    setExam((prev) => ({
      ...prev,
      questions: [...prev.questions, question],
    }));

    setQuestion({
      type: "mcq",
      questionText: "",
      options: ["", "", "", ""],
      correctOption: "",
    });

    toast.success("Question added!");
  };

  const validateExam = () => {
    const { title, subject, date, duration, description, questions } = exam;
    return (
      title.trim() &&
      subject.trim() &&
      description.trim() &&
      date &&
      duration &&
      questions.length > 0
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateExam()) {
      toast.error("Complete all fields and add at least one question.");
      return;
    }

    try {
      await axios.post("/api/createExam", exam, {
        withCredentials: true,
      });

      toast.success("Exam created successfully!");
      setExam({
        title: "",
        description: "",
        subject: "",
        date: "",
        duration: "",
        questions: [],
      });
    } catch (error) {
      console.error(error);
      toast.error("Failed to create exam.");
    }
  };

  if (loading) return <div className="text-center mt-10">Loading...</div>;

  return (
    <div className="bg-gray-100 text-black min-h-screen py-10 px-4">
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow">
        <h1 className="text-3xl font-bold mb-6 text-center">Create Exam</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Exam Details */}
          {["title", "subject", "description"].map((field, idx) => (
            <input
              key={idx}
              type={field === "description" ? "textarea" : "text"}
              placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
              className="w-full border p-2 rounded"
              value={exam[field]}
              onChange={(e) => setExam({ ...exam, [field]: e.target.value })}
            />
          ))}
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="date"
              className="w-full border p-2 rounded"
              value={exam.date}
              onChange={(e) => setExam({ ...exam, date: e.target.value })}
            />
            <input
              type="number"
              placeholder="Duration (mins)"
              className="w-full border p-2 rounded"
              value={exam.duration}
              onChange={(e) => setExam({ ...exam, duration: e.target.value })}
            />
          </div>

          {/* Question Section */}
          <div className="border-t pt-4 mt-6">
            <h2 className="text-xl font-semibold mb-2">Add Question</h2>
            <select
              name="type"
              className="w-full border p-2 rounded"
              value={question.type}
              onChange={handleQuestionChange}
            >
              <option value="mcq">MCQ</option>
              <option value="short">Short Answer</option>
              <option value="long">Long Answer</option>
            </select>
            <textarea
              name="questionText"
              placeholder="Question Text"
              className="w-full border p-2 rounded mt-2"
              value={question.questionText}
              onChange={handleQuestionChange}
            />
            {question.type === "mcq" && (
              <div className="space-y-2 mt-2">
                {question.options.map((opt, idx) => (
                  <input
                    key={idx}
                    type="text"
                    placeholder={`Option ${idx + 1}`}
                    className="w-full border p-2 rounded"
                    value={opt}
                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                  />
                ))}
                <input
                  type="text"
                  name="correctOption"
                  placeholder="Correct Option"
                  className="w-full border p-2 rounded"
                  value={question.correctOption}
                  onChange={handleQuestionChange}
                />
              </div>
            )}
            <button
              type="button"
              onClick={addQuestion}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Add Question
            </button>
          </div>

          {/* Preview */}
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-2">Preview Questions</h2>
            {exam.questions.length === 0 ? (
              <p className="text-gray-500">No questions added.</p>
            ) : (
              exam.questions.map((q, index) => (
                <div
                  key={index}
                  className="bg-gray-100 rounded p-3 mb-2 border-l-4 border-blue-600"
                >
                  <p className="font-medium">
                    {q.type.toUpperCase()}: {q.questionText}
                  </p>
                  {q.type === "mcq" && (
                    <ul className="list-disc ml-6">
                      {q.options.map((opt, idx) => (
                        <li key={idx}>{opt}</li>
                      ))}
                      <li className="text-green-700 font-semibold">
                        Answer: {q.correctOption}
                      </li>
                    </ul>
                  )}
                </div>
              ))
            )}
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 mt-4"
          >
            Submit Exam
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateExamPage;
