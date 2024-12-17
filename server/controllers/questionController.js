const questionModel = require("../models/questionModel")

const createQuestions = async (req, res) => {
  const { exam_id, question_text, options, correct_option } = req.body;
  console.log('req ',req.body);
  

  try {
    const newQuestion = await questionsModel.insertQuestion(exam_id, question_text, options, correct_option);
    if(!newQuestion){
        return res.status(500).json({
            error: 'Server Error',
            message: 'Could not create questions',
          });
    }
    res.status(201).json(newQuestion); // Return the created question
  } catch (error) {
    res.status(500).json({ message: 'Error creating question', error });
  }
}



const getQuestion =  async (req, res) => {

  const {exam_id} = req.params;


  try {
    const questions = await questionsModel.getQuestionsByExamId(exam_id);

    if(!questions){
return res.status(404).json({
    error: ' Not Found',
            message: 'Resource not Found',
})
    }
    res.status(200).json(questions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching questions', error });
  }
}

const UpdateQuestion = async (req,res) => {
  const {question_id} =req.params ;
  console.log('question_id',question_id);
  const { exam_id, question_text, options, correct_option } = req.body;
  try {
    const questions = await questionsModel.UpdateQuestions(question_id,exam_id, question_text, options, correct_option);

    if(!questions){
        return res.status(404).json({
            error: ' Not Found',
                    message: 'Resource not Found',
        })
            }

    res.status(200).json(questions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching questions', error });
  }
}

const DeleteQuestion =async (req,res) => {
  const {question_id} =req.params ;
  console.log('question_id',question_id);
  try {
    const questions = await questionsModel.DeleteQuestions(question_id);
    res.status(200).json(questions);
    if(!questions){
        return res.status(404).json({
            error: ' Not Found',
                    message: 'Resource not Found',
        })
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching questions', error });
  }
}

module.exports ={
    createQuestions,
    getQuestion,
    UpdateQuestion,
    DeleteQuestion
}