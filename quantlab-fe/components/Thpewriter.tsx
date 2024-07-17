"use client";
import { TypewriterEffectSmooth } from "./ui/typewriter-effect";
export function Typewriter() {
    const words = [
        {
            text: "Master",
        },
        {
            text: "Your",
        },
        {
            text: "Quant",
        },
        {
            text: "Finance",
        },
        {
            text: "with",
        },
        {
            text: "Quantlab.",
            className: "text-[#f90] dark:text-[#f90]",
        },
    ];
    return (
        <div className="flex flex-col items-center justify-center h-[40rem]  ">
            <h2 className="text-neutral-400 dark:text-neutral-200 text-xl ">
                Your Journey towards excellence starts here
            </h2>
            <TypewriterEffectSmooth words={words} />
            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 space-x-0 md:space-x-4">
                <button className="w-40 h-10 rounded-xl bg-black border dark:border-white border-transparent text-white text-sm">
                    Join now
                </button>
                <button className="w-40 h-10 rounded-xl bg-white text-black border border-black  text-sm">
                    Signup
                </button>
            </div>
        </div>
    );
}
