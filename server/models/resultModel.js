const { dbWrite } = require("../config/db");
const { paginate } = require("../utils/pagination");
const { calculateAndStoreTotalScore } = require("../utils/scoreUtils");

// CREATE: Insert results
async function createResult() {
  try {
    const results = await calculateAndStoreTotalScore();

    const rows = results.map((r) => ({
      student_id: r.student_id,
      exam_id: r.exam_id,
      total_score: r.correct_responses,
      max_score: r.max_score,
      completed_at: new Date(),
    }));

    if (rows.length === 0) return [];

    const inserted = await dbWrite("results")
      .insert(rows)
      .returning("*");

    return inserted;
  } catch (err) {
    console.error("Error creating result:", err);
  }
}

// READ: Fetch all results for student
async function getAllResults(student_id) {
  try {
    return await dbWrite("results")
      .where({ student_id });
  } catch (err) {
    console.error("Error fetching results:", err);
  }
}

// READ: Fetch single result
const getResultById = async (exam_id, student_id) => {
  try {
    const result = await dbWrite("results")
      .where({ exam_id, student_id })
      .first();

    return result || "No Result Found";
  } catch (err) {
    console.error("Error fetching result:", err);
  }
};

// UPDATE result
async function updateResult(result) {
  try {
    const { total_score, max_score, completed_at, exam_id, student_id } = result;

    const [updated] = await dbWrite("results")
      .where({ exam_id, student_id })
      .update({
        total_score,
        max_score,
        completed_at,
      })
      .returning("*");

    return updated;
  } catch (err) {
    console.error("Error updating result:", err);
  }
}

// DELETE result
async function deleteResult(exam_id) {
  try {
    const [deleted] = await dbWrite("results")
      .where({ exam_id })
      .del()
      .returning("*");

    return deleted;
  } catch (err) {
    console.error("Error deleting result:", err);
  }
}

// PAGINATED results by exam
const getPaginatedResultsByExam = async (exam_id, page, limit) => {
  let query = dbWrite("results")
    .where({ exam_id });

  if (page && limit) {
    query = paginate(query, page, limit);
  }

  return await query;
};

// Results dashboard for user
const getResultsByUsers = async (user_id) => {
  const rows = await dbWrite("exams as e")
    .leftJoin("results as r", function () {
      this.on("r.exam_id", "=", "e.exam_id")
        .andOn("r.student_id", "=", dbWrite.raw("?", [user_id]));
    })
    .leftJoin("questions as q", "q.exam_id", "e.exam_id")
    .where("e.status", "past")
    .groupBy(
      "e.exam_name",
      "e.exam_id",
      "e.duration",
      "e.end_time",
      "r.total_score",
      "r.max_score",
      "r.student_id",
      "e.status",
      "r.result_id",
      "r.exam_id"
    )
    .select(
      "e.exam_name",
      "e.exam_id",
      "e.duration",
      "e.end_time",
      "r.total_score",
      "r.max_score",
      "r.student_id",
      "e.status",
      "r.result_id"
    )
    .count("q.question_id as total_questions")
    .orderBy("e.end_time", "desc");

  const formatToReadableDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return rows.map((row) => {
    const percentage =
      row.max_score > 0
        ? (row.total_score / row.max_score) * 100
        : 0;

    return {
      exam_name: row.exam_name,
      total_score: row.total_score,
      max_score: row.max_score,
      duration: row.duration,
      Date: formatToReadableDate(row.end_time),
      percentage: Number(percentage),
      status: percentage >= 35 ? "Passed" : "Failed",
      isAttempted: row.result_id !== null,
      exam_id: row.exam_id,
      total_questions: parseInt(row.total_questions),
    };
  });
};

// Correct / incorrect answers
async function getCorrectIncorrect(student_id, exam_id) {
  try {
    const { rows } = await dbWrite.raw(
      `
      SELECT 
        r.student_id,
        q.question_id,
        q.question_text,
        q.options,
        q.category,
        q.question_type,

        CASE 
          WHEN q.question_type = 'multiple_choice' THEN r.selected_options
          WHEN q.question_type = 'text' THEN to_jsonb(r.text_answer)
          ELSE to_jsonb(r.selected_option)
        END AS selected_response,

        CASE 
          WHEN q.question_type = 'text' THEN NULL
          WHEN q.question_type = 'multiple_choice' THEN q.correct_options
          ELSE to_jsonb(q.correct_option)
        END AS correct_answer,

        CASE 
          WHEN q.question_type = 'text' THEN NULL
          WHEN q.question_type = 'multiple_choice'
            THEN (r.selected_options @> q.correct_options AND q.correct_options @> r.selected_options)::text
          ELSE (r.selected_option = q.correct_option)::text
        END AS result_status

      FROM responses r
      JOIN questions q ON r.question_id = q.question_id
      WHERE r.student_id = ?
      AND r.exam_id = ?
      `,
      [student_id, exam_id]
    );

    return rows;
  } catch (err) {
    console.error("Error fetching results:", err);
  }
}

module.exports = {
  createResult,
  getAllResults,
  getResultById,
  updateResult,
  deleteResult,
  getPaginatedResultsByExam,
  getResultsByUsers,
  getCorrectIncorrect,
};
