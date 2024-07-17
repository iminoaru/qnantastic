'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import useStore from '../../useStore';

interface Problem {
    problem_id: string;
    name: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    category: string;
    company: string;
    hints: string[];
    is_paid: boolean;
}

interface UserProblem {
    problem_id: string;
    user_id: string;
    is_bookmarked: boolean;
    status: 'not attempted' | 'attempted' | 'solved';
    notes: string | null;
}

interface CombinedProblem extends Problem {
    is_bookmarked: boolean;
    status: 'not attempted' | 'attempted' | 'solved';
}

interface Playlist {
    playlist_id: string;
    user_id: string;
    name: string;
    description: string;
}

const categories = ['Probability', 'Statistics', 'Maths', 'Calculus'];
const difficulties = ['Easy', 'Medium', 'Hard'];

const PlaylistProblemTable: React.FC<{ playlistId: string }> = ({ playlistId }) => {
    const [problems, setProblems] = useState<CombinedProblem[]>([]);
    const [filteredProblems, setFilteredProblems] = useState<CombinedProblem[]>([]);
    const [playlist, setPlaylist] = useState<Playlist | null>(null);
    const [filters, setFilters] = useState({
        difficulty: [] as string[],
        category: [] as string[]
    });
    const [sortField, setSortField] = useState<keyof CombinedProblem>('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [activeFilter, setActiveFilter] = useState<'difficulty' | 'category' | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const filterRef = useRef<HTMLDivElement>(null);

    const { userID, session, isPaidUser } = useStore();

    const fetchPlaylistDetails = useCallback(async () => {
        try {
            const response = await axios.get<Playlist>(`${process.env.NEXT_PUBLIC_BACKEND_URL}/playlists/${playlistId}`, {
                headers: { 'Authorization': `Bearer ${session}` }
            });
            setPlaylist(response.data);
        } catch (error) {
            console.error('Error fetching playlist details:', error);
            setError('Failed to fetch playlist details.');
        }
    }, [playlistId, session]);

    const fetchPlaylistProblems = useCallback(async () => {
        try {
            const problemsResponse = await axios.get<Problem[]>(`${process.env.NEXT_PUBLIC_BACKEND_URL}/playlists/get-problems/${playlistId}`, {
                headers: { 'Authorization': `Bearer ${session}` }
            });
            console.log(problemsResponse.data);

            if (session && userID) {
                const userProblemsResponse = await axios.get<UserProblem[]>(`${process.env.NEXT_PUBLIC_BACKEND_URL}/userproblems/get-user-problems`, {
                    headers: { 'Authorization': `Bearer ${session}` },
                    params: { user_id: userID }
                });

                const combinedProblems: CombinedProblem[] = problemsResponse.data.map(problem => {
                    const userProblem = userProblemsResponse.data.find(up => up.problem_id === problem.problem_id);
                    return {
                        ...problem,
                        is_bookmarked: userProblem?.is_bookmarked || false,
                        status: userProblem?.status || 'not attempted'
                    };
                });
                
                console.log("combinedProblems");
                console.log(combinedProblems);
                setProblems(combinedProblems);
                setFilteredProblems(combinedProblems);
            } else {
                const basicProblems: CombinedProblem[] = problemsResponse.data.map(problem => ({
                    ...problem,
                    is_bookmarked: false,
                    status: 'not attempted'
                }));
                
                console.log("biasicProblems")
                console.log(basicProblems);
                setProblems(basicProblems);
                setFilteredProblems(basicProblems);
            }
        } catch (error) {
            console.error('Error fetching playlist problems:', error);
            setError('Failed to fetch playlist problems.');
        } finally {
            setIsLoading(false);
        }
    }, [playlistId, session, userID]);

    useEffect(() => {
        fetchPlaylistDetails();
        fetchPlaylistProblems();
    }, [fetchPlaylistDetails, fetchPlaylistProblems]);

    const toggleBookmark = async (problem_id: string) => {
        if (!session) {
            alert("Please log in first.");
            return;
        }
        try {
            const problem = problems.find(p => p.problem_id === problem_id);
            if (!problem) return;

            const newBookmarkStatus = !problem.is_bookmarked;

            const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/userproblems/toggle-bookmark`, {
                problem_id,
                user_id: userID,
                is_bookmarked: newBookmarkStatus
            }, {
                headers: { 'Authorization': `Bearer ${session}` }
            });

            if (response.status === 200) {
                const updatedProblems = problems.map(p =>
                    p.problem_id === problem_id ? { ...p, is_bookmarked: newBookmarkStatus } : p
                );
                setProblems(updatedProblems);
                setFilteredProblems(prevFiltered =>
                    prevFiltered.map(p =>
                        p.problem_id === problem_id ? { ...p, is_bookmarked: newBookmarkStatus } : p
                    )
                );
            }
        } catch (error) {
            console.error('Error toggling bookmark:', error);
        }
    };

    const removeProblemFromPlaylist = async (problemId: string) => {
        if (playlist && playlist?.user_id !== userID) {
            alert("You don't have permission to modify this playlist.");
            return;
        }
        try {
            await axios.delete(`${process.env.NEXT_PUBLIC_BACKEND_URL}/playlists/${playlistId}/problems/${problemId}`, {
                headers: { 'Authorization': `Bearer ${session}` }
            });
            fetchPlaylistProblems();
        } catch (error) {
            console.error('Error removing problem from playlist:', error);
        }
    };

    
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
                setActiveFilter(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleSort = (field: keyof CombinedProblem) => {
        setSortOrder(sortField === field && sortOrder === 'asc' ? 'desc' : 'asc');
        setSortField(field);
    };

    const toggleFilter = (filter: 'difficulty' | 'category') => {
        setActiveFilter(activeFilter === filter ? null : filter);
    };

    const handleFilterChange = (field: 'difficulty' | 'category', value: string) => {
        setFilters(prevFilters => {
            const updatedFilter = prevFilters[field].includes(value)
                ? prevFilters[field].filter(item => item !== value)
                : [...prevFilters[field], value];
            return { ...prevFilters, [field]: updatedFilter };
        });
    };

    const difficultyColor = {
        Easy: 'bg-green-600',
        Medium: 'bg-yellow-600',
        Hard: 'bg-red-600'
    };

    const statusIcon = {
        'not attempted': '',
        'attempted': '❔',
        'solved': '✅'
    };

    const FilterDropdown: React.FC<{ options: string[], field: 'difficulty' | 'category' }> = ({ options, field }) => (
        <div className="absolute z-10 mt-1 w-56 rounded-md shadow-lg bg-neutral-800 ring-1 ring-black ring-opacity-5">
            <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                {options.map(option => (
                    <label key={option} className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-neutral-900 hover:text-white">
                        <input
                            type="checkbox"
                            className="form-checkbox h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
                            checked={filters[field].includes(option)}
                            onChange={() => handleFilterChange(field, option)}
                        />
                        <span className="ml-2">{option}</span>
                    </label>
                ))}
            </div>
        </div>
    );

    const SortableHeader: React.FC<{ field: keyof CombinedProblem, children: React.ReactNode, filterable?: boolean }> = ({ field, children, filterable }) => (
        <th className="p-3 text-left">
            <div className="flex items-center">
                <button
                    onClick={() => handleSort(field)}
                    className="flex items-center hover:text-blue-400 transition-colors duration-200"
                >
                    {children}
                    {sortField === field && (
                        <span className="ml-1">
                            {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                    )}
                </button>
                {filterable && (
                    <button
                        onClick={() => toggleFilter(field as 'difficulty' | 'category')}
                        className="ml-2 text-gray-400 hover:text-white transition-colors duration-200"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                        </svg>
                    </button>
                )}
            </div>
            {filterable && activeFilter === field && (
                <div ref={filterRef}>
                    <FilterDropdown options={field === 'difficulty' ? difficulties : categories} field={field as 'difficulty' | 'category'} />
                </div>
            )}
        </th>
    );

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredProblems.slice(indexOfFirstItem, indexOfLastItem);

    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

    const canModify = playlist && playlist?.user_id === userID;

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="p-4 bg-neutral-950 bg-grid-white/[0.05] min-h-screen text-white">
            <h2 className="text-2xl font-bold mb-4">{playlist?.name}</h2>
            <p className="mb-4">{playlist?.description}</p>
            {!canModify && <p className="mb-4 text-yellow-500">You are viewing this playlist in read-only mode.</p>}
            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Search problems..."
                    className="w-full p-3 bg-neutral-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="overflow-x-auto bg-neutral-800 rounded-lg shadow-lg">
                <table className="w-full table-auto border-collapse">
                    <thead>
                        <tr className="bg-neutral-900">
                            <th className="p-3 text-center">Status</th>
                            <SortableHeader field="name">Name</SortableHeader>
                            <SortableHeader field="difficulty" filterable>Difficulty</SortableHeader>
                            <SortableHeader field="category" filterable>Category</SortableHeader>
                            <th className="p-3 text-center">Bookmark</th>
                            {canModify && <th className="p-3 text-center">Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {currentItems.map((problem) => (
                            <tr key={problem.problem_id} className="border-t border-gray-700 hover:bg-neutral-900 transition-colors duration-200">
                                <td className="p-3 text-center">
                                    {statusIcon[problem.status]}
                                </td>
                                <td className="p-3">
                                    <a href={`/problems/${
                                        problem.problem_id}`} className="text-white hover:text-blue-400 transition-colors duration-200">
                                        {problem.name}
                                    </a>
                                </td>
                                <td className="p-3">
                                    <div className="flex justify-content-between items-center">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${difficultyColor[problem.difficulty]}`}>
                                            {problem.difficulty}
                                        </span>
                                    </div>
                                </td>
                                <td className="p-3">{problem.category}</td>
                                <td className="p-3 text-center">
                                    <button
                                        onClick={() => toggleBookmark(problem.problem_id)}
                                        className={`focus:outline-none ${problem.is_bookmarked ? 'text-yellow-500' : 'text-gray-400'} hover:text-yellow-400 transition-colors duration-200`}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6"
                                            fill={problem.is_bookmarked ? "currentColor" : "none"} viewBox="0 0 24 24"
                                            stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
                                        </svg>
                                    </button>
                                </td>
                                {canModify && (
                                    <td className="p-3 text-center">
                                        <button
                                            onClick={() => removeProblemFromPlaylist(problem.problem_id)}
                                            className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors duration-200"
                                        >
                                            Remove
                                        </button>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="mt-4 flex justify-center">
                {Array.from({length: Math.ceil(filteredProblems.length / itemsPerPage)}, (_, i) => (
                    <button
                        key={i}
                        onClick={() => paginate(i + 1)}
                        className={`mx-1 px-3 py-1 rounded ${currentPage === i + 1 ? 'bg-blue-500 text-white' : 'bg-neutral-900 text-gray-300'} hover:bg-blue-400 transition-colors duration-200`}
                    >
                        {i + 1}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default PlaylistProblemTable;