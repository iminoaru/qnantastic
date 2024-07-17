'use client'

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { LightbulbIcon, CheckCircleIcon, XCircleIcon } from 'lucide-react';
import MarkdownLaTeXRenderer from "@/components/MarkdownLatexRenderer";
import { evaluate } from 'mathjs';
import useStore from '@/useStore'

interface Problem {
    problem_id: string;
    name: string;
    problem_text: string;
    hints: string;
    solution: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    category: string;
    company: string | null;
    is_paid: boolean;
    created_at: string;
    updated_at: string;
    subcategory: string | null;
    answer: string;
    unique_name: string;
}

export default function ProblemPage() {
    const router = useRouter();
    const { id: problem_id } = useParams();
    const [problem, setProblem] = useState<Problem | null>(null);
    const [showHint, setShowHint] = useState(false);
    const [userNotes, setUserNotes] = useState('');
    const [userAnswer, setUserAnswer] = useState('');
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    const [alertContent, setAlertContent] = useState({ title: '', description: '' });
    const [isProblemPaid, setIsProblemPaid] = useState(false);
    const { userID, session, isPaidUser, isLoading } = useStore();

    useEffect(() => {
        const fetchProblem = async () => {
            if (!problem_id) return;
            try {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/problems/${problem_id}`, {
                    headers: {
                        Authorization: `Bearer ${session}`,
                    },
                    params: { is_paid: isPaidUser }
                });
                
                if (response.data === null) {
                    setIsProblemPaid(true);
                    setAlertContent({
                        title: 'Premium Content',
                        description: 'Please go premium to access this question.'
                    });
                    setIsAlertOpen(true);
                } else {
                    setProblem(response.data[0]);
                }
            } catch (error) {
                console.error('Error fetching problem:', error);
                setAlertContent({
                    title: 'Error',
                    description: 'An error occurred while fetching the problem. Please try again.'
                });
                setIsAlertOpen(true);
            }
        };

        if (!isLoading) { //VERY IMPORTANT FOR MAKING CALL ONLY AFTER STATE IS CORRECTLY SET
            fetchProblem();
        }
    }, [problem_id, session, isPaidUser, isLoading]);

    const difficultyColor = {
        Easy: 'bg-green-600',
        Medium: 'bg-yellow-600',
        Hard: 'bg-red-600'
    };

    function simplifyMath(expression: string): number | string {
        try {
            const result = evaluate(expression);
            return result;
        } catch (error: any) {
            return `Error: ${error.message}`;
        }
    }

    const checkAnswer = async (answer: string, notes: string) => {
        if (!userID || !session) {
            alert('login first')
            return;
        }

        answer = answer.trim();
        answer = simplifyMath(answer).toString();
        console.log(answer);
        
        const result = answer === problem?.answer;

        try {
            await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/userproblems/submit-status`, {
                user_id: userID,
                problem_id: problem_id,
                answer: result,
                notes: notes
            }, {
                headers: {
                    Authorization: `Bearer ${session}`,
                },
            });

            setAlertContent({
                title: result ? 'Correct Answer!' : 'Incorrect Answer',
                description: result
                    ? 'Great job! You have solved this problem successfully.'
                    : 'Dont worry! Keep trying, you will get it next time.'
            });
            setIsAlertOpen(true);

            if (result) {
                setTimeout(() => router.push('/problems'), 2000);
            }
        } catch (error) {
            console.error('Submission failed:', error);
            
        }
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-screen bg-neutral-950 text-white">Loading user data...</div>;
    }

    if (isProblemPaid && !isPaidUser) {
        return (
            <div className="flex flex-col justify-center items-center h-screen bg-neutral-950 text-white">
                
                <h2 className="text-2xl font-bold mb-2">Premium Content</h2>
                <p className="text-center mb-4">This problem is available only for premium users.</p>
                <Button 
                    onClick={() => router.push('/pricing')} 
                    className="bg-yellow-500 hover:bg-yellow-600 text-black"
                >
                    Upgrade to Premium
                </Button>
            </div>
        );
    }

    if (!problem) {
        return <div className="flex justify-center items-center h-screen bg-neutral-950 text-white">Loading problem...</div>;
    }

    return (
        <div className="min-h-screen bg-neutral-950 text-white p-8">
            <Card className="mb-8 bg-neutral-900 border-gray-800">
                <CardHeader>
                    <CardTitle className="text-3xl font-bold">{problem.name}</CardTitle>
                    <div className="flex space-x-4 mt-2">
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${difficultyColor[problem.difficulty]}`}>
              {problem.difficulty}
            </span>
                        {problem.company && (
                            <span className="px-3 py-1 rounded-full text-sm font-semibold bg-blue-600">
                {problem.company}
              </span>
                        )}
                        <span className="px-3 py-1 rounded-full text-sm font-semibold bg-purple-600">
              {problem.category}
            </span>
                    </div>
                </CardHeader>
            </Card>

            <Tabs defaultValue="problem" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-8">
                    <TabsTrigger value="problem">Problem</TabsTrigger>
                    <TabsTrigger value="solution">Solution</TabsTrigger>
                </TabsList>
                <TabsContent value="problem">
                    <Card className="bg-neutral-900 border-gray-800 mb-8">
                        <CardHeader>
                            <CardTitle>Problem Description</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-300">{problem.problem_text}</p>
                        </CardContent>
                    </Card>

                    {!showHint ? (
                        <Button
                            onClick={() => setShowHint(true)}
                            className="mb-8 bg-blue-600 hover:bg-blue-700"
                        >
                            <LightbulbIcon className="mr-2 h-4 w-4" />
                            Reveal Hint
                        </Button>
                    ) : (
                        <Card className="bg-neutral-900 border-gray-800 mb-8">
                            <CardHeader>
                                <CardTitle>Hint</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-300">{problem.hints}</p>
                            </CardContent>
                        </Card>
                    )}

                    <Card className="bg-neutral-900 border-gray-800 mb-8">
                        <CardHeader>
                            <CardTitle>Your Notes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Textarea
                                className="w-full bg-neutral-800 text-white border-gray-700"
                                value={userNotes}
                                onChange={(e: any) => setUserNotes(e.target.value)}
                                placeholder="Write your notes here..."
                                rows={6}
                            />
                        </CardContent>
                    </Card>

                    <Card className="bg-neutral-900 border-gray-800 mb-8">
                        <CardHeader>
                            <CardTitle>Your Answer</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Textarea
                                className="w-full bg-neutral-800 text-white border-gray-700 mb-4"
                                value={userAnswer}
                                onChange={(e: any) => setUserAnswer(e.target.value)}
                                placeholder="Enter your answer here..."
                                rows={6}
                            />
                            {userAnswer.trim() !== '' && (
                                <Button
                                    onClick={() => checkAnswer(userAnswer, userNotes)}
                                    className="w-full bg-green-600 hover:bg-green-700"
                                >
                                    Submit Answer
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="solution">
                    <Card className="bg-neutral-900 border-gray-800">
                        <CardHeader>
                            <CardTitle>Solution</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <MarkdownLaTeXRenderer content={problem.solution}  />

                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
                <AlertDialogContent className="bg-neutral-900 border-gray-800">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-2xl">
                            {alertContent.title === 'Correct Answer!' ? (
                                <CheckCircleIcon className="inline-block mr-2 text-green-500" />
                            ) : (
                                <XCircleIcon className="inline-block mr-2 text-red-500" />
                            )}
                            {alertContent.title}
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-300">
                            {alertContent.description}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction className="bg-blue-600 hover:bg-blue-700">
                            Close
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}