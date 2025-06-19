import Exam from "@/models/Exam";

export const createExam = async (req, res) => {
  try {
    const { title, description, subject, date, duration, questions } = req.body;

    const exam = new Exam({
      title,
      description,
      subject,
      date,
      duration,
      questions,
      createdBy: req.user.id,
    });

    await exam.save();
    res.status(201).json({
      success: true,
      message: "Exam created successfully.",
      examId: exam._id,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: "Server error." });
  }
};
