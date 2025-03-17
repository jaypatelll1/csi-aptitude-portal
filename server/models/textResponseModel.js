const { query } = require("../config/db");

const TextResponse = {
    // Create a new text response
    create: async ({ question_id, response_id, marks_alloted, total_marks, comments, user_id, exam_id }) => {
        // Ensure response_id exists before inserting
        const responseCheck = await query("SELECT response_id FROM responses WHERE response_id = $1", [response_id]);
        if (responseCheck.rows.length === 0) {
            throw new Error("Invalid response_id. No such response exists.");
        }

        // Ensure user_id exists
        const userCheck = await query("SELECT user_id FROM users WHERE user_id = $1", [user_id]);
        if (userCheck.rows.length === 0) {
            throw new Error("Invalid user_id. No such user exists.");
        }

        // Ensure exam_id exists
        const examCheck = await query("SELECT exam_id FROM exams WHERE exam_id = $1", [exam_id]);
        if (examCheck.rows.length === 0) {
            throw new Error("Invalid exam_id. No such exam exists.");
        }

        const result = await query(
            `INSERT INTO text_response (question_id, response_id, marks_alloted, total_marks, comments, user_id, exam_id) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [question_id, response_id, marks_alloted, total_marks, comments, user_id, exam_id]
        );
        return result.rows[0];
    },

    // Get all responses
    findAll: async () => {
        const result = await query("SELECT * FROM text_response");
        return result.rows;
    },

    // Get a response by ID
    findById: async (id) => {
        const result = await query("SELECT * FROM text_response WHERE answer_id = $1", [id]);
        return result.rows[0] || null;
    },

    // Update a response (supports partial updates)
    update: async (id, updateFields) => {
        const fields = Object.keys(updateFields);
        if (fields.length === 0) {
            throw new Error("At least one field is required.");
        }

        // Ensure response_id exists before updating
        if (updateFields.response_id) {
            const responseCheck = await query("SELECT response_id FROM responses WHERE response_id = $1", [updateFields.response_id]);
            if (responseCheck.rows.length === 0) {
                throw new Error("Invalid response_id. No such response exists.");
            }
        }

        // Ensure user_id exists before updating
        if (updateFields.user_id) {
            const userCheck = await query("SELECT user_id FROM users WHERE user_id = $1", [updateFields.user_id]);
            if (userCheck.rows.length === 0) {
                throw new Error("Invalid user_id. No such user exists.");
            }
        }

        // Ensure exam_id exists before updating
        if (updateFields.exam_id) {
            const examCheck = await query("SELECT exam_id FROM exams WHERE exam_id = $1", [updateFields.exam_id]);
            if (examCheck.rows.length === 0) {
                throw new Error("Invalid exam_id. No such exam exists.");
            }
        }

        // Dynamically generate the SET clause for the update query
        const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(", ");
        const values = [...Object.values(updateFields), id];

        const result = await query(
            `UPDATE text_response SET ${setClause} WHERE answer_id = $${fields.length + 1} RETURNING *`,
            values
        );

        return result.rows[0];
    },

    // Delete a response
    delete: async (id) => {
        const result = await query("DELETE FROM text_response WHERE answer_id = $1 RETURNING *", [id]);
        return result.rows[0] || null;
    }
};

module.exports = TextResponse;
