"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  CheckCircle,
  X,
  Clock,
  Target,
  Trophy,
  Zap,
  BarChart3,
  RefreshCw,
  Play,
  Pause,
  RotateCcw,
  Star,
  BookOpen,
  Lightbulb,
  Award
} from "lucide-react";

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
  topic: string;
  timeLimit: number; // seconds
}

interface QuizResult {
  questionId: string;
  selectedAnswer: number;
  correct: boolean;
  timeSpent: number;
}

interface QuizSession {
  id: string;
  topic: string;
  difficulty: "easy" | "medium" | "hard";
  questions: QuizQuestion[];
  results: QuizResult[];
  startTime: Date;
  endTime?: Date;
  score: number;
  timeSpent: number;
}

export default function SmartQuizBuilder() {
  const [currentQuiz, setCurrentQuiz] = useState<QuizSession | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [quizSettings, setQuizSettings] = useState({
    topic: "JavaScript",
    difficulty: "medium" as "easy" | "medium" | "hard",
    questionCount: 5,
    timeLimit: 30
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [recentQuizzes, setRecentQuizzes] = useState<QuizSession[]>([]);

  // Sample quiz questions database
  const questionDatabase: QuizQuestion[] = [
    {
      id: "js-1",
      question: "What is the output of console.log(typeof null) in JavaScript?",
      options: ["null", "undefined", "object", "boolean"],
      correctAnswer: 2,
      explanation: "In JavaScript, typeof null returns 'object' due to a historical bug that was never fixed for backwards compatibility.",
      difficulty: "medium",
      topic: "JavaScript",
      timeLimit: 30
    },
    {
      id: "js-2",
      question: "Which method is used to add an element to the end of an array?",
      options: ["push()", "pop()", "shift()", "unshift()"],
      correctAnswer: 0,
      explanation: "The push() method adds one or more elements to the end of an array and returns the new length of the array.",
      difficulty: "easy",
      topic: "JavaScript",
      timeLimit: 20
    },
    {
      id: "react-1",
      question: "What is the correct way to update state in a functional React component?",
      options: ["state.count = 5", "setState({count: 5})", "setCount(5)", "updateState(5)"],
      correctAnswer: 2,
      explanation: "In functional components with hooks, you use the setter function (like setCount) returned by useState to update state.",
      difficulty: "medium",
      topic: "React",
      timeLimit: 25
    },
    {
      id: "node-1",
      question: "What does npm stand for?",
      options: ["Node Package Manager", "New Project Manager", "Network Protocol Manager", "Node Process Manager"],
      correctAnswer: 0,
      explanation: "npm stands for Node Package Manager, which is the default package manager for Node.js.",
      difficulty: "easy",
      topic: "Node.js",
      timeLimit: 15
    },
    {
      id: "sys-1",
      question: "What is the primary purpose of load balancing in system design?",
      options: ["Data storage", "Distribute traffic across servers", "Database optimization", "Code compilation"],
      correctAnswer: 1,
      explanation: "Load balancing distributes incoming network traffic across multiple servers to ensure no single server becomes overwhelmed.",
      difficulty: "hard",
      topic: "System Design",
      timeLimit: 45
    }
  ];

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft => timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0 && currentQuiz && !showExplanation) {
      // Time's up, auto-submit
      handleAnswerSubmit();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, currentQuiz, showExplanation]);

  const generateQuiz = async () => {
    setIsGenerating(true);
    
    // Filter questions based on settings
    let filteredQuestions = questionDatabase.filter(q => 
      q.topic.toLowerCase().includes(quizSettings.topic.toLowerCase()) ||
      quizSettings.topic.toLowerCase() === "mixed"
    );

    if (quizSettings.difficulty !== "mixed" as any) {
      filteredQuestions = filteredQuestions.filter(q => q.difficulty === quizSettings.difficulty);
    }

    // Randomly select questions
    const selectedQuestions = filteredQuestions
      .sort(() => Math.random() - 0.5)
      .slice(0, quizSettings.questionCount);

    const newQuiz: QuizSession = {
      id: Date.now().toString(),
      topic: quizSettings.topic,
      difficulty: quizSettings.difficulty,
      questions: selectedQuestions,
      results: [],
      startTime: new Date(),
      score: 0,
      timeSpent: 0
    };

    setCurrentQuiz(newQuiz);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setTimeLeft(quizSettings.timeLimit);
    setIsActive(true);
    setIsGenerating(false);
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (!showExplanation) {
      setSelectedAnswer(answerIndex);
    }
  };

  const handleAnswerSubmit = () => {
    if (currentQuiz) {
      const question = currentQuiz.questions[currentQuestion];
      const timeSpent = quizSettings.timeLimit - timeLeft;
      const isCorrect = selectedAnswer === question.correctAnswer;
      
      const result: QuizResult = {
        questionId: question.id,
        selectedAnswer: selectedAnswer ?? -1,
        correct: isCorrect,
        timeSpent
      };

      const updatedResults = [...currentQuiz.results, result];
      setCurrentQuiz(prev => prev ? { ...prev, results: updatedResults } : null);
      setShowExplanation(true);
      setIsActive(false);
    }
  };

  const nextQuestion = () => {
    if (currentQuiz) {
      if (currentQuestion < currentQuiz.questions.length - 1) {
        setCurrentQuestion(prev => prev + 1);
        setSelectedAnswer(null);
        setShowExplanation(false);
        setTimeLeft(quizSettings.timeLimit);
        setIsActive(true);
      } else {
        // Quiz completed
        finishQuiz();
      }
    }
  };

  const finishQuiz = () => {
    if (currentQuiz) {
      const score = Math.round((currentQuiz.results.filter(r => r.correct).length / currentQuiz.results.length) * 100);
      const totalTime = currentQuiz.results.reduce((sum, r) => sum + r.timeSpent, 0);
      
      const completedQuiz = {
        ...currentQuiz,
        endTime: new Date(),
        score,
        timeSpent: totalTime
      };

      setRecentQuizzes(prev => [completedQuiz, ...prev.slice(0, 4)]);
      setCurrentQuiz(completedQuiz);
      setIsActive(false);
    }
  };

  const resetQuiz = () => {
    setCurrentQuiz(null);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setTimeLeft(0);
    setIsActive(false);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "text-green-600 bg-green-100";
      case "medium": return "text-yellow-600 bg-yellow-100";
      case "hard": return "text-red-600 bg-red-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 70) return "text-blue-600";
    if (score >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  // Quiz completion screen
  if (currentQuiz && currentQuiz.endTime) {
    const correctAnswers = currentQuiz.results.filter(r => r.correct).length;
    const totalQuestions = currentQuiz.questions.length;
    
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-4xl mx-auto space-y-8"
      >
        {/* Results Header */}
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3 }}
            className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <Trophy className="w-12 h-12 text-white" />
          </motion.div>
          <h1 className="text-4xl font-bold text-neutral-900 mb-2">Quiz Complete!</h1>
          <p className="text-xl text-neutral-600">
            {currentQuiz.topic} • {currentQuiz.difficulty} difficulty
          </p>
        </div>

        {/* Score Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-8 text-center"
        >
          <div className={`text-6xl font-bold mb-4 ${getScoreColor(currentQuiz.score)}`}>
            {currentQuiz.score}%
          </div>
          <div className="text-2xl text-neutral-600 mb-6">
            {correctAnswers} out of {totalQuestions} correct
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-neutral-900">{Math.floor(currentQuiz.timeSpent / 60)}m {currentQuiz.timeSpent % 60}s</div>
              <div className="text-neutral-500">Total Time</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-neutral-900">
                {Math.round(currentQuiz.timeSpent / totalQuestions)}s
              </div>
              <div className="text-neutral-500">Avg per Question</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-neutral-900">
                {currentQuiz.score >= 90 ? "A" : currentQuiz.score >= 80 ? "B" : currentQuiz.score >= 70 ? "C" : "F"}
              </div>
              <div className="text-neutral-500">Grade</div>
            </div>
          </div>
        </motion.div>

        {/* Question Review */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-6"
        >
          <h2 className="text-xl font-semibold text-neutral-900 mb-4">Question Review</h2>
          <div className="space-y-4">
            {currentQuiz.questions.map((question, index) => {
              const result = currentQuiz.results[index];
              return (
                <div key={question.id} className="border border-neutral-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Question {index + 1}</span>
                    <div className="flex items-center gap-2">
                      {result.correct ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <X className="w-5 h-5 text-red-500" />
                      )}
                      <span className={`px-2 py-1 rounded-full text-xs ${getDifficultyColor(question.difficulty)}`}>
                        {question.difficulty}
                      </span>
                    </div>
                  </div>
                  <p className="text-neutral-700 mb-2">{question.question}</p>
                  <div className="text-sm text-neutral-500">
                    Your answer: {result.selectedAnswer >= 0 ? question.options[result.selectedAnswer] : "No answer"}
                    {!result.correct && (
                      <span className="ml-2 text-green-600">
                        • Correct: {question.options[question.correctAnswer]}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Actions */}
        <div className="flex justify-center gap-4">
          <button
            onClick={generateQuiz}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium rounded-xl transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-5 h-5" />
            Take Another Quiz
          </button>
          <button
            onClick={resetQuiz}
            className="px-6 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-medium rounded-xl transition-colors"
          >
            Back to Menu
          </button>
        </div>
      </motion.div>
    );
  }

  // Active quiz screen
  if (currentQuiz && !currentQuiz.endTime) {
    const question = currentQuiz.questions[currentQuestion];
    const progress = ((currentQuestion + 1) / currentQuiz.questions.length) * 100;

    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Quiz Progress */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-neutral-900">{currentQuiz.topic} Quiz</h2>
              <p className="text-neutral-600">Question {currentQuestion + 1} of {currentQuiz.questions.length}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-neutral-600">
                <Clock className="w-5 h-5" />
                <span className={`font-mono text-lg ${timeLeft <= 10 ? 'text-red-600' : ''}`}>
                  {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                </span>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm ${getDifficultyColor(question.difficulty)}`}>
                {question.difficulty}
              </span>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-neutral-200 rounded-full h-3">
            <motion.div
              className="h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Question */}
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="card p-8"
        >
          <h3 className="text-2xl font-semibold text-neutral-900 mb-8">
            {question.question}
          </h3>

          <div className="space-y-4">
            {question.options.map((option, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleAnswerSelect(index)}
                disabled={showExplanation}
                className={`w-full p-4 text-left border rounded-xl transition-all ${
                  selectedAnswer === index
                    ? "border-blue-500 bg-blue-50"
                    : "border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50"
                } ${
                  showExplanation
                    ? index === question.correctAnswer
                      ? "border-green-500 bg-green-50"
                      : selectedAnswer === index
                      ? "border-red-500 bg-red-50"
                      : ""
                    : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium ${
                    selectedAnswer === index
                      ? "border-blue-500 bg-blue-500 text-white"
                      : "border-neutral-300 text-neutral-600"
                  } ${
                    showExplanation
                      ? index === question.correctAnswer
                        ? "border-green-500 bg-green-500 text-white"
                        : selectedAnswer === index
                        ? "border-red-500 bg-red-500 text-white"
                        : ""
                      : ""
                  }`}>
                    {String.fromCharCode(65 + index)}
                  </div>
                  <span className="text-neutral-900">{option}</span>
                  {showExplanation && index === question.correctAnswer && (
                    <CheckCircle className="w-5 h-5 text-green-500 ml-auto" />
                  )}
                  {showExplanation && selectedAnswer === index && index !== question.correctAnswer && (
                    <X className="w-5 h-5 text-red-500 ml-auto" />
                  )}
                </div>
              </motion.button>
            ))}
          </div>

          {/* Explanation */}
          <AnimatePresence>
            {showExplanation && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg"
              >
                <div className="flex items-start gap-2">
                  <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900 mb-1">Explanation</h4>
                    <p className="text-blue-800">{question.explanation}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Button */}
          <div className="flex justify-center mt-8">
            {!showExplanation ? (
              <button
                onClick={handleAnswerSubmit}
                disabled={selectedAnswer === null}
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors"
              >
                Submit Answer
              </button>
            ) : (
              <button
                onClick={nextQuestion}
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium rounded-xl transition-colors"
              >
                {currentQuestion < currentQuiz.questions.length - 1 ? "Next Question" : "Finish Quiz"}
              </button>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  // Quiz setup screen
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-3 mb-4"
        >
          <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-neutral-900">Smart Quiz Builder</h1>
        </motion.div>
        <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
          Test your knowledge with AI-generated quizzes tailored to your learning goals and skill level.
        </p>
      </div>

      {/* Quiz Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card p-6"
      >
        <h2 className="text-xl font-semibold text-neutral-900 mb-4">Quiz Settings</h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Topic</label>
            <select
              value={quizSettings.topic}
              onChange={(e) => setQuizSettings(prev => ({ ...prev, topic: e.target.value }))}
              className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
            >
              <option value="JavaScript">JavaScript</option>
              <option value="React">React</option>
              <option value="Node.js">Node.js</option>
              <option value="System Design">System Design</option>
              <option value="Mixed">Mixed Topics</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Difficulty</label>
            <select
              value={quizSettings.difficulty}
              onChange={(e) => setQuizSettings(prev => ({ ...prev, difficulty: e.target.value as any }))}
              className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Number of Questions</label>
            <select
              value={quizSettings.questionCount}
              onChange={(e) => setQuizSettings(prev => ({ ...prev, questionCount: parseInt(e.target.value) }))}
              className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
            >
              <option value={5}>5 Questions</option>
              <option value={10}>10 Questions</option>
              <option value={15}>15 Questions</option>
              <option value={20}>20 Questions</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Time per Question</label>
            <select
              value={quizSettings.timeLimit}
              onChange={(e) => setQuizSettings(prev => ({ ...prev, timeLimit: parseInt(e.target.value) }))}
              className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
            >
              <option value={15}>15 seconds</option>
              <option value={30}>30 seconds</option>
              <option value={45}>45 seconds</option>
              <option value={60}>1 minute</option>
            </select>
          </div>
        </div>

        <div className="flex justify-center mt-6">
          <button
            onClick={generateQuiz}
            disabled={isGenerating}
            className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 text-white font-medium rounded-xl transition-colors flex items-center gap-3 text-lg"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-6 h-6 animate-spin" />
                Generating Quiz...
              </>
            ) : (
              <>
                <Play className="w-6 h-6" />
                Start Quiz
              </>
            )}
          </button>
        </div>
      </motion.div>

      {/* Recent Quizzes */}
      {recentQuizzes.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-6"
        >
          <h2 className="text-xl font-semibold text-neutral-900 mb-4">Recent Quizzes</h2>
          <div className="space-y-3">
            {recentQuizzes.map((quiz) => (
              <div key={quiz.id} className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
                <div>
                  <div className="font-medium text-neutral-900">{quiz.topic}</div>
                  <div className="text-sm text-neutral-600">
                    {quiz.questions.length} questions • {quiz.difficulty}
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-bold ${getScoreColor(quiz.score)}`}>
                    {quiz.score}%
                  </div>
                  <div className="text-sm text-neutral-500">
                    {Math.floor(quiz.timeSpent / 60)}m {quiz.timeSpent % 60}s
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
