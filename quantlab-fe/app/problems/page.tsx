'use client'
import React from "react";
import ProblemTable from "@/components/questions/ProblemTable";
import ProblemStatsDashboard from "@/components/ProblemStatsDashboard";

export default function Home() {
    return (
        <>
            <main>

            
                <ProblemTable />
            
                <ProblemStatsDashboard />
            

            </main>
            
        </>
    );
}