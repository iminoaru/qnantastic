"use client";
import React from "react";
import { BackgroundBeams } from "./ui/background-beams";
import {Typewriter} from "@/components/Thpewriter";

export function BGbeams() {
    return (
        <div className="h-[40rem] w-full rounded-md bg-neutral-950 relative flex flex-col items-center justify-center antialiased">
            <div className="max-w-2xl mx-auto p-4">
                {/*<h1 className="relative z-10 text-lg md:text-7xl  bg-clip-text text-neutral-400 text-gradient-to-b from-neutral-200 to-neutral-600  text-center font-sans font-bold">*/}
                {/*    Quantlab*/}
                {/*</h1>*/}
            </div>
            <Typewriter />

            <BackgroundBeams />

        </div>
    );
}
