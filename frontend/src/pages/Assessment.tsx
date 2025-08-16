import { useState } from 'react';
import { Card, Button, Radio, Progress, message } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
// import Layout from '../components/Layout'; // Layout使用Outlet，不需要手动包装

interface Question {
  id: number;
  question: string;
  options: string[];
  correct: string;
}

interface AnswersState {
  [key: number]: string;
}

const Assessment: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [answers, setAnswers] = useState<AnswersState>({});
  const [showResult, setShowResult] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);

  // 模拟题目数据
  const questions: Question[] = [
    {
      id: 1,
      question: '什么是机器学习？',
      options: [
        'A. 一种让计算机自动学习的技术',
        'B. 一种编程语言',
        'C. 一种数据库',
        'D. 一种操作系统'
      ],
      correct: 'A'
    },
    {
      id: 2,
      question: '深度学习属于机器学习的哪个分支？',
      options: [
        'A. 监督学习',
        'B. 无监督学习',
        'C. 强化学习',
        'D. 神经网络'
      ],
      correct: 'D'
    },
    {
      id: 3,
      question: '以下哪个不是常见的机器学习算法？',
      options: [
        'A. 决策树',
        'B. 支持向量机',
        'C. K-means',
        'D. HTML'
      ],
      correct: 'D'
    }
  ];

  const handleAnswerChange = (value: string) => {
    setAnswers({
      ...answers,
      [currentQuestion]: value
    });
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      submitAssessment();
    }
  };

  const submitAssessment = () => {
    setLoading(true);
    
    // 计算分数
    let correctCount = 0;
    questions.forEach((question, index) => {
      if (answers[index] === question.correct) {
        correctCount++;
      }
    });
    
    const finalScore = Math.round((correctCount / questions.length) * 100);
    
    setTimeout(() => {
      setScore(finalScore);
      setShowResult(true);
      setLoading(false);
      message.success('评估完成！');
    }, 1000);
  };

  const resetAssessment = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setShowResult(false);
    setScore(0);
  };

  if (showResult) {
    return (
      <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
        <Card>
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <CheckCircleOutlined style={{ fontSize: '64px', color: '#52c41a', marginBottom: '24px' }} />
            <h2>评估完成！</h2>
            <div style={{ margin: '24px 0' }}>
              <Progress
                type="circle"
                percent={score}
                format={percent => `${percent}分`}
                size={120}
              />
            </div>
            <p style={{ fontSize: '16px', color: '#666', marginBottom: '32px' }}>
              您答对了 {Math.round(score * questions.length / 100)} 道题，共 {questions.length} 道题
            </p>
            <Button type="primary" size="large" onClick={resetAssessment}>
              重新评估
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
        <Card>
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3>知识评估</h3>
              <span style={{ color: '#666' }}>
                <ClockCircleOutlined style={{ marginRight: '8px' }} />
                第 {currentQuestion + 1} 题 / 共 {questions.length} 题
              </span>
            </div>
            <Progress 
              percent={Math.round(((currentQuestion + 1) / questions.length) * 100)} 
              showInfo={false}
            />
          </div>
          
          <div style={{ padding: '24px 0' }}>
            <h4 style={{ fontSize: '18px', marginBottom: '24px' }}>
              {questions[currentQuestion]?.question}
            </h4>
            
            <Radio.Group 
              value={answers[currentQuestion]} 
              onChange={(e) => handleAnswerChange(e.target.value)}
              style={{ width: '100%' }}
            >
              {questions[currentQuestion]?.options.map((option, index) => (
                <Radio 
                  key={index} 
                  value={option.charAt(0)} 
                  style={{ display: 'block', marginBottom: '12px', fontSize: '16px' }}
                >
                  {option}
                </Radio>
              ))}
            </Radio.Group>
          </div>
          
          <div style={{ textAlign: 'right', marginTop: '32px' }}>
            <Button 
              type="primary" 
              size="large"
              onClick={nextQuestion}
              disabled={!answers[currentQuestion]}
              loading={loading}
            >
              {currentQuestion === questions.length - 1 ? '提交评估' : '下一题'}
            </Button>
          </div>
        </Card>
    </div>
  );
};

export default Assessment;