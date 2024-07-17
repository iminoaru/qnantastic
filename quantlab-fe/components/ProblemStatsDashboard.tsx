
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import useStore from '@/useStore';
import axios from 'axios';

interface ProblemStats {
  easy_count: number;
  total_easy: number;
  medium_count: number;
  total_medium: number;
  hard_count: number;
  total_hard: number;
}

const CircularProgress: React.FC<{ percentage: number; color: string }> = ({ percentage, color }) => {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <svg width="100" height="100" viewBox="0 0 100 100">
      <circle
        cx="50"
        cy="50"
        r={radius}
        fill="none"
        stroke="#e6e6e6"
        strokeWidth="10"
      />
      <circle
        cx="50"
        cy="50"
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth="10"
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        transform="rotate(-90 50 50)"
      />
      <text x="50" y="50" textAnchor="middle" dy=".3em" fontSize="20" fill={color}>
        {percentage}%
      </text>
    </svg>
  );
};

const ProblemStatsDashboard: React.FC = () => {
  const [stats, setStats] = useState<ProblemStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  const { userID, session, isLoading } = useStore();

  useEffect(() => {
    const fetchStats = async () => {
      if (session && userID) {
        setIsLoadingStats(true);
        try {
          const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/userproblems/user-stats`, {
            headers: {
              'Authorization': `Bearer ${session}`,
            },
            params: { user_id: userID },
          });
          
          console.log(response.data);
          setStats(response.data);
        } catch (err) {
          setError('Error fetching problem stats');
          console.error(err);
        } finally {
          setIsLoadingStats(false);
        }
      }
    };

    if (!isLoading) {
      fetchStats();
    }
  }, [isLoading, session, userID]);

  if (isLoading || isLoadingStats) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!stats) {
    return <div>No stats available</div>;
  }

  const totalSolved = stats.easy_count + stats.medium_count + stats.hard_count;
  const totalProblems = stats.total_easy + stats.total_medium + stats.total_hard;
  const overallPercentage = Math.round((totalSolved / totalProblems) * 100);

  const difficulties = [
    { name: 'Easy', solved: stats.easy_count, total: stats.total_easy, color: '#00AF9B' },
    { name: 'Medium', solved: stats.medium_count, total: stats.total_medium, color: '#FFB800' },
    { name: 'Hard', solved: stats.hard_count, total: stats.total_hard, color: '#FF2D55' },
  ];

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <h2 className="text-2xl font-bold">Problem Solving Statistics</h2>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center mb-8">
          <CircularProgress percentage={overallPercentage} color="#3498db" />
          <div className="ml-4">
            <h3 className="text-xl font-semibold">Overall Progress</h3>
            <p className="text-lg">{totalSolved} / {totalProblems} solved</p>
          </div>
        </div>
        <div className="space-y-6">
          {difficulties.map((diff) => (
            <div key={diff.name} className="flex items-center">
              <div className="w-20 text-right mr-4">
                <h4 className="font-semibold">{diff.name}</h4>
                <p className="text-sm text-gray-600">{diff.solved}/{diff.total}</p>
              </div>
              <div className="flex-grow">
                <div className="h-6 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full"
                    style={{
                      width: `${(diff.solved / diff.total) * 100}%`,
                      backgroundColor: diff.color
                    }}
                  />
                </div>
              </div>
              <div className="w-16 ml-4 text-right">
                <p className="font-semibold">{Math.round((diff.solved / diff.total) * 100)}%</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProblemStatsDashboard;